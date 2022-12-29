const express = require("express");
const router = express.Router();
const { User, validate } = require("../models/user");
const { ENCRYPT_PASSWORD, COMPARE_PASSWORD } = require("../utils/constants");
const { Wallet } = require("../models/wallet");
const send = require("../utils/mailsend");
const config = require("config");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(config.get("SENDGRID_API_KEY"));

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

    return res.send({
      status: true,
    });
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

// router.get("/verify/:token", async (req, res) => {
//   try {
//     if (!req.params.token) return res.send("Token is missing.");

//     const userDecode = jwt.verify(
//       req.params.token,
//       config.get("jwtPrivateKey")
//     );

//     userDecode.is_email_verified = true;

//     let user = await User.findOne({ where: { email: userDecode.email } });
//     if (user) {
//       if (!user.is_email_verified) {
//         user.is_email_verified = true;
//         await user.save();
//       }
//       return res.status(400).send("<h1>Already Verified.</h1>");
//     } else {
//       createUser = await User.create(userDecode);
//       await Wallet.create({ user_id: createUser.id });
//     }

//     return res.render("emailconfirm", {
//       title: "Verified.",
//       status: "Email Verified.",
//     });
//   } catch (error) {
//     console.log(error.message);
//     return res.render("emailconfirm", {
//       title: "Expired",
//       status: "Token expired",
//     });
//   }
// });

module.exports = router;
