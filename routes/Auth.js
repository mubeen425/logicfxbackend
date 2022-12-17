const express = require("express");
const router = express.Router();
const { User, validate } = require("../models/user");
const { ENCRYPT_PASSWORD, COMPARE_PASSWORD } = require("../utils/constants");
const { Wallet } = require("../models/wallet");

router.post("/register", async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let checkUsername = await User.findOne({
      where: { user_name: req.body.user_name },
    });
    if (checkUsername)
      return res.status(400).send("User Name is already taken.");

    let user = await User.findOne({ where: { email: req.body.email } });
    if (user)
      return res.status(400).send("User already registered with this gmail.");

    req.body.password = await ENCRYPT_PASSWORD(req.body.password);
    createUser = await User.create(req.body);

    await Wallet.create({ user_id: createUser.id });

    const token = createUser.generateJwtToken();
    res.header("x-auth-token", token).send({ status: true });
  } catch (error) {
    return res.send(error.message);
  }
});

router.post("/login", async (req, res) => {
  try {
    let user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return res.status(400).send("Invalid email or password.");

    const validPassword = await COMPARE_PASSWORD(
      req.body.password,
      user.password
    );
    if (!validPassword)
      return res.status(400).send("Invalid email or password.");

    const token = user.generateJwtToken();
    return res.send({ status: true, access: token });
  } catch (error) {
    return res.send(error.message);
  }
});

module.exports = router;
