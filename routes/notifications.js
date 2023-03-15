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

    const checkNotification = await Notifications.findAll();
    if (!checkNotification.length > 0)
      return res.status(404).send("Notifications Not Found.");

    checkNotification.forEach((noti) => {
      if (noti.status) {
        let st = noti.status.split(",");
        let exist = false;
        st.forEach((t) => {
          if (parseInt(t) === parseInt(req.params.id)) {
            exist = true;
          }
        });
        if (!exist) {
          st.push(`${req.params.id}`);
        }
        noti.status = st.toString();
      } else {
        noti.status = `${req.params.id}`;
      }
      noti.save();
    });
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
