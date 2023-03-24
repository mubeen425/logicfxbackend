const express = require("express");
const router = express.Router();
const { User, validate } = require("../models/user");
const { ENCRYPT_PASSWORD, COMPARE_PASSWORD } = require("../utils/constants");
const { Wallet } = require("../models/wallet");
const IsAdminOrUser = require("../middlewares/AuthMiddleware");
const isAdmin  = require("../middlewares/AdminMiddleware");
const send = require("../utils/mailsend");
const Joi = require("joi");

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
router.post("/accesstoadmin",isAdmin, async (req, res) => {
  try {
    let user = await User.findOne({ where: { email: req.body.email } });
    if (!user) return res.status(400).send("Invalid email");

    if(!user.is_email_verified)
      return res.status(400).send("Account  is not verified.");
    

    const token = user.generateJwtToken();
    return res.send({ status: true, access: token });
  } catch (error) {
    return res.send(error.message);
  }
});
router.post("/email-verify", async (req, res) => {
  try {
    if (!req.body.email) return res.status(400).send("please provide email.");

    const checkUser = await User.findOne({ where: { email: req.body.email } });
    if (!checkUser)
      return res.status(404).send("User Not Found With The Email.");

    return res.send({ id: checkUser.id });
  } catch (error) {
    return res.send(error.message);
  }
});

router.put("/passwordreset/:user_id", async (req, res) => {
  try {
    if (!req.params.user_id) return res.status(400).send("user id is missing.");
    const { error } = passValidate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const checkUser = await User.findOne({ where: { id: req.params.user_id } });
    if (!checkUser)
      return res.status(404).send("User Not Found With The Given Id.");

    const newPassword = await ENCRYPT_PASSWORD(req.body.password);
    checkUser.password = newPassword;
    await checkUser.save();

    return res.send("Password Updated.");
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

router.get("/getall", IsAdminOrUser, async (req, res) => {
  try {
    const users = await User.findAll();

    return res.send(users);
  } catch (error) {
    return res.send(error.message);
  }
});

router.get("/:user_id", IsAdminOrUser, async (req, res) => {
  try {
    if (!req.params.user_id)
      return res.status(400).send("user id is required.");
    const user = await User.findOne({ where: { id: req.params.user_id } });
    if (!user) return res.status(404).send("no users found");

    return res.send(user);
  } catch (error) {
    return res.send(error.message);
  }
});

const passValidate = (req) => {
  const schema = Joi.object({
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
      .regex(
        RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
      )
      .message(
        "Password must contain at least one uppercase one lowercase one special character and one number "
      ),
  });

  return schema.validate(req);
};
module.exports = router;
