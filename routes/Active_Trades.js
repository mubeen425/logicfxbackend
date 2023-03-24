const express = require("express");
const moment = require("moment");
const { Active_Trade, validateAT } = require("../models/active_trades");
const { Wallet } = require("../models/wallet");
const Trade_History = require("../models/trade_history");
const { User } = require("../models/user");
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const router = express.Router();

const Joi = require("joi");

// router.use(IsAdminOrUser);

router.get("/getall", IsAdminOrUser, async (req, res) => {
  try {
    const getTrades = await Active_Trade.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: [
            "user_name",
            "first_name",
            "last_name",
            "email",
            "contact",
          ],
        },
      ],
      order: [['invested_date', 'DESC']]
    });

    return res.send(getTrades);
  } catch (error) {
    return res.send({ message: error.message });
  }
});

router.get("/:user_id", IsAdminOrUser, async (req, res) => {
  try {
    if (!req.params.user_id) return res.status(400).send("User id is required");
    const getTrades = await Active_Trade.findAll({
      where: { user_id: req.params.user_id },
    });

    return res.send(getTrades);
  } catch (error) {
    return res.send({ message: error.message });
  }
});

router.post("/", IsAdminOrUser, async (req, res) => {
  try {
    const { error } = validateAT(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const checkWallet = await Wallet.findOne({
      where: { user_id: req.body.user_id },
    });
    if (!checkWallet)
      return res
        .status(404)
        .send("Wallet missing, report your problem to admin.");

    req.body.investment = parseFloat(req.body.investment);

    if (req.body.investment > checkWallet.balance || req.body.investment <= 0)
      return res
        .status(400)
        .send("Investment must not be zero or greater then wallet balance.");

    req.body.trade = req.body.investment * 0.985;
    req.body.admin_profit = req.body.investment * 0.015;
    req.body.purchase_units =
      req.body.trade / parseFloat(req.body.crypto_purchase_price);
    checkWallet.balance -= req.body.investment;

    console.log(req.body);
    await Active_Trade.create(req.body);
    await checkWallet.save();

    return res.send("Trade opened");
  } catch (error) {
    return res.send(error.message);
  }
});

router.post("/partial", IsAdminOrUser, async (req, res) => {
  try {
    const { error } = partialTradeValidate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    const trade = await Active_Trade.findOne({
      where: { id: req.body.trade_id },
    });

    const { partial_trade_close_amount } = req.body;

    if (
      parseFloat(partial_trade_close_amount) >= trade.trade ||
      parseFloat(partial_trade_close_amount) <= 0
    )
      return res.status(400).send("Invalid partial trade close amount.");

    if (!trade) return res.status(404).send("Trade not Found");
    const wallet = await Wallet.findOne({ where: { user_id: trade.user_id } });

    let sale_price = parseFloat(req.body.crypto_sale_price);
    const remainingTrade = trade.trade - parseFloat(partial_trade_close_amount);
    const remain_units =
      trade.purchase_units - remainingTrade / trade.crypto_purchase_price;
    console.log(remain_units);

    let history = {
      trade_id: trade.id,
      user_id: trade.user_id,
      crypto_name: trade.crypto_name,
      crypto_symbol: trade.crypto_symbol,
      crypto_purchase_price: trade.crypto_purchase_price,
      crypto_sale_price: sale_price,
      investment: trade.investment,
      open_trade: trade.trade,
      partial_user_value: parseFloat(partial_trade_close_amount),
      purchase_units: remainingTrade / trade.crypto_purchase_price,
      open_at: moment(trade.invested_date).format("YYYY-MM-DD HH:mm"),
      trade_type: req.body.trade_type,
    };

    let profloss =
      (sale_price - trade.crypto_purchase_price) *
      (partial_trade_close_amount / trade.crypto_purchase_price);

    profloss += partial_trade_close_amount;

    let actualprofloss = profloss - partial_trade_close_amount;
    if (actualprofloss > 0) {
      history.actual_profit = actualprofloss;
      history.actual_loss = 0;
    } else if (actualprofloss < 0) {
      history.actual_loss = actualprofloss;
      history.actual_profit = 0;
    }
    let adminProfit = profloss * 0.015;
    profloss -= adminProfit;
    wallet.balance += profloss;
    history.close_trade = profloss;
    history.open_admin_profit = trade.admin_profit;
    history.close_admin_profit = adminProfit;

    await Trade_History.create(history);
    trade.trade = remainingTrade;
    trade.purchase_units -= remain_units;
    await wallet.save();
    await trade.save();

    return res.send("Trade Closed Partially");
  } catch (error) {
    return res.send(error.message);
  }
});

router.put("/:id", IsAdminOrUser, async (req, res) => {
  try {
    if (!req.params.id) return res.status(400).send("Id is required.");
    const { error } = validatetradeupdate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const checkTrade = await Active_Trade.findOne({
      where: { id: req.params.id },
    });
    if (!checkTrade)
      return res.status(404).send("No Trade Found With This ID.");

    checkTrade.take_profit = parseFloat(req.body.take_profit);
    checkTrade.stop_loss = parseFloat(req.body.stop_loss);

    checkTrade.save();
    return res.send("Updated");
  } catch (error) {
    return res.send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    // console.log(req.body.crypto_sale_price);

    if (!req.params.id || !req.body.crypto_sale_price)
      return res.status(400).send("Trede id or sale price is missing.");
    const trade = await Active_Trade.findOne({ where: { id: req.params.id } });
    if (!trade) return res.status(404).send("Trade not Found");
    const wallet = await Wallet.findOne({ where: { user_id: trade.user_id } });

    let sale_price = parseFloat(req.body.crypto_sale_price);
    let profloss =
      (sale_price - trade.crypto_purchase_price) * trade.purchase_units;
    let history = {
      trade_id: trade.id,
      user_id: trade.user_id,
      crypto_name: trade.crypto_name,
      crypto_symbol: trade.crypto_symbol,
      crypto_purchase_price: trade.crypto_purchase_price,
      crypto_sale_price: sale_price,
      investment: trade.investment,
      open_trade: trade.trade,
      purchase_units: trade.purchase_units,
      open_at: moment(trade.invested_date).format("YYYY-MM-DD HH:mm"),
    };
    profloss += trade.trade;

    let actualprofloss = profloss - trade.trade;
    if (actualprofloss > 0) {
      history.actual_profit = actualprofloss;
      history.actual_loss = 0;
      console.log("inprof");
    } else if (actualprofloss < 0) {
      history.actual_loss = actualprofloss;
      history.actual_profit = 0;
    }
    let adminProfit = profloss * 0.015;
    profloss -= adminProfit;
    wallet.balance += profloss;
    history.close_trade = profloss;
    history.open_admin_profit = trade.admin_profit;
    history.close_admin_profit = adminProfit;

    await Trade_History.create(history);
    await wallet.save();
    await trade.destroy();

    return res.send("Trade Closed");
  } catch (error) {
    return res.send(error.message);
  }
});

router.delete("/:crypto_name/:user_id", async (req, res) => {
  try {
    // console.log(req.body.crypto_sale_price);

    if (!req.params.id || !req.body.crypto_sale_price)
      return res.status(400).send("Trede id or sale price is missing.");
    const trades = await Active_Trade.findAll({ where: { user_id: req.params.user_id,crypto_name:req.params.crypto_name }});
    if (!trades.length>0) return res.status(404).send("Trades not Found");
    const wallet = await Wallet.findOne({ where: { user_id: req.params.user_id } });

    for (const trade of trades) {
    let sale_price = parseFloat(req.body.crypto_sale_price);
    let profloss =
      (sale_price - trade.crypto_purchase_price) * trade.purchase_units;
    let history = {
      trade_id: trade.id,
      user_id: trade.user_id,
      crypto_name: trade.crypto_name,
      crypto_symbol: trade.crypto_symbol,
      crypto_purchase_price: trade.crypto_purchase_price,
      crypto_sale_price: sale_price,
      investment: trade.investment,
      open_trade: trade.trade,
      purchase_units: trade.purchase_units,
      open_at: moment(trade.invested_date).format("YYYY-MM-DD HH:mm"),
    };
    profloss += trade.trade;

    let actualprofloss = profloss - trade.trade;
    if (actualprofloss > 0) {
      history.actual_profit = actualprofloss;
      history.actual_loss = 0;
      console.log("inprof");
    } else if (actualprofloss < 0) {
      history.actual_loss = actualprofloss;
      history.actual_profit = 0;
    }
    let adminProfit = profloss * 0.015;
    profloss -= adminProfit;
    wallet.balance += profloss;
    history.close_trade = profloss;
    history.open_admin_profit = trade.admin_profit;
    history.close_admin_profit = adminProfit;
    await Trade_History.create(history);
  }
    await wallet.save();
    await Active_Trade.destroy(trades);

    return res.send("Trade Closed");
  } catch (error) {
    return res.send(error.message);
  }
});


const partialTradeValidate = (req) => {
  const schema = Joi.object({
    user_id: Joi.number().required(),
    trade_id: Joi.number().required(),
    partial_trade_close_amount: Joi.required(),
    crypto_sale_price: Joi.number().required(),
    trade_type: Joi.string().required(),
  });

  return schema.validate(req);
};

const validatetradeupdate = (req) => {
  const schema = Joi.object({
    take_profit: Joi.number().required(),
    stop_loss: Joi.number().required(),
  });

  return schema.validate(req);
};

module.exports = router;
