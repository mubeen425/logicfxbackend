require("express-async-errors");
const express = require("express");
const { Op } = require("sequelize");
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const { Notifications, validateN } = require("../models/notifications");
const router = express.Router();

router.use(IsAdminOrUser);

router.get("/", async (req, res) => {
  try {
    const notifications = await Notifications.findAll();
    if (!notifications.length > 0)
      return res.send({ message: "No Notification Record Found." });

    return res.status(200).send(notifications);
  } catch (error) {
    return res.send({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { error } = validateN(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    await Notifications.create(req.body);
    return res.send("Notification Added.");
  } catch (error) {
    return res.send(error.message);
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!req.params.id)
      return res.status(400).send("Please Provide Id To Update The Record.");
    if (!req.body.status)
      return res.status(400).send("Please Provide Status To Update.");

    const checkNotification = await Notifications.findOne({
      where: { id: req.params.id },
    });
    if (!checkNotification)
      return res.status(404).send("Notification Not Found.");

    checkNotification.status = req.body.status;
    await checkNotification.save();

    return res.send("status updated.");
  } catch (error) {
    return res.send(error.message);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const checkIfExist = await Notifications.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!checkIfExist) return res.status(404).send("not found");

    await checkIfExist.destroy();
    return res.send("deleted successfuly");
  } catch (error) {
    return res.send(error.message);
  }
});

module.exports = router;
