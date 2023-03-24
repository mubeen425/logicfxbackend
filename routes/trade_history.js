const express = require("express");
const router = express.Router();
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const Trade_History = require("../models/trade_history");
router.use(IsAdminOrUser);

router.get("/admincommission", async (req, res) => {
  try {
    const tradeHistory = await Trade_History.findAll();
    let totalCommission = 0;
    for (const trade of tradeHistory) {
      totalCommission += trade.open_admin_profit + trade.close_admin_profit;
    }
    return res.send({ totalCommission });
  } catch (error) {
    return res.status(500).send(error.message);
  }
});


router.get("/getall", async (req, res) => {
  try {
    if (!req.params.user_id) return res.status(400).send("id required");
    const findHistoryUserId = await Trade_History.findAll();
    return res.send(findHistoryUserId);
  } catch (error) {
    return res.send(error.message);
  }
});


router.get("/:user_id", async (req, res) => {
  try {
    if (!req.params.user_id) return res.status(400).send("id required");
    const findHistoryUserId = await Trade_History.findAll({
      where: { user_id: req.params.user_id },
    });
    return res.send(findHistoryUserId);
  } catch (error) {
    return res.send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!req.params.user_id) return res.status(400).send("id required");
    const findHistoryUserId = await Trade_History.findOne({
      where: { id: req.params.id },
    });
    if (!findHistoryUserId) return res.status(404).send("History not found");
    await findHistoryUserId.destroy();
    return res.send("deleted successfully");
  } catch (error) {
    return res.send(error.message);
  }
});
module.exports = router;
