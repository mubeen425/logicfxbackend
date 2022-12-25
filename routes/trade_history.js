const express = require("express");
const router = express.Router();
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const Trade_History = require("../models/trade_history");
router.use(IsAdminOrUser);
router.get("/:user_id", async (req, res) => {
  try {
    if (!req.params.user_id) return res.status(400).send("id required");
    const findHistoryUserId = await Trade_History.findAll({
      where: { user_id: req.params.user_id },
    });
    if (!findHistoryUserId.length > 0)
      return res.send({ message: "History not found" });
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
