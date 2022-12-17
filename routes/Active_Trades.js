const express = require("express");
const { Active_Trade, validateAT } = require("../models/active_trades");
const { Wallet } = require("../models/wallet");
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const Trade_History = require("../models/trade_history");

const router = express.Router();

router.use(IsAdminOrUser);

router.get("/:user_id", async (req, res) => {
  try {
    if (!req.params.user_id) return res.status(400).send("User id is required");
    const getTrades = await Active_Trade.findAll({
      where: { user_id: req.params.user_id },
    });
    if (!getTrades.length > 0)
      return res.status(404).send("NO Active Trades Found");

    return res.send(getTrades);
  } catch (error) {
    return res.send(error.message);
  }
});

router.post("/", async (req, res) => {
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
    if (req.body.investment > checkWallet.balance)
      return res.status(400).send("Wallet balance is lower than your balance.");

    req.body.trade = req.body.investment * 0.985;
    req.body.admin_profit = req.body.investment * 0.015;
    req.body.purchase_units =
      req.body.trade / parseFloat(req.body.crypto_purchase_price);
    checkWallet.balance -= req.body.investment;

    await Active_Trade.create(req.body);
    await checkWallet.save();

    return res.send("Trade opened");
  } catch (error) {
    return res.send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
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
      crypto_purchase_price: trade.crypto_purchase_price,
      crypto_sale_price: sale_price,
      investment: trade.investment,
      open_trade: trade.trade,
      purchase_units: trade.purchase_units,
      open_at: trade.invested_at,
    };

    profloss += trade.trade;
    let adminProfit = profloss * 0.015;
    profloss -= adminProfit;
    if (profloss > 0) {
      let actualprof = profloss - trade.trade;
      history.actual_profit = actualprof;
      history.actual_loss = 0;
    } else if (profloss < 0) {
      let actualloss = profloss - trade.trade;
      history.actual_loss = actualloss;
      history.actual_profit = 0;
    }
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

module.exports = router;
