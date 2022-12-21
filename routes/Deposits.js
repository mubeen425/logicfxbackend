const express = require("express");
const { Deposit, validateD } = require("../models/deposit");
const { Wallet } = require("../models/wallet");
const { User } = require("../models/user");
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const router = express.Router();
router.use(IsAdminOrUser);
router.get("/", async (req, res) => {
  try {
    const getAllRequests = await Deposit.findAll();
    if (!getAllRequests)
      return res.status(404).send("no deposit and requests found");
    return res.send(getAllRequests);
  } catch (error) {
    return res.send(error.message);
  }
});

router.get("/:user_id", async (req, res) => {
  try {
    const getAllRequestsByUserId = await Deposit.findAll({
      where: { user_id: req.params.user_id },
    });
    if (!getAllRequestsByUserId)
      return res.status(404).send("no deposit and requests found");
    return res.send(getAllRequestsByUserId);
  } catch (error) {
    return res.send(error.message);
  }
});

router.post("/", async (req, res) => {
  try {
    const { error } = validateD(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const checkIfUser = await User.findOne({ where: { id: req.body.user_id } });
    if (!checkIfUser)
      return res.status(500).send("internal server error could not server");

    await Deposit.create(req.body);

    return res.send("Request Sent successfully");
  } catch (error) {
    return res.send(error.message);
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!req.body.status)
      return res.status(400).send("status or status description not provided.");

    const depositRequest = await Deposit.findOne({
      where: { id: req.params.id },
    });

    if (!depositRequest) return res.status(404).send("request not found.");

    depositRequest.status = req.body.status;
    depositRequest.status_description = req.body.status_description
      ? req.body.status_description
      : "reason not specified";

    const userWallet = await Wallet.findOne({
      where: { user_id: req.body.user_id },
    });
    if (!userWallet) return res.status(404).send("Wallet not found");

    if (req.body.status === "approved") {
      userWallet.balance += parseFloat(depositRequest.amount);
      await userWallet.save();
    }
    await depositRequest.save();

    return res.status(200).send("updated");
  } catch (error) {
    return res.send(error.message);
  }
});

module.exports = router;
