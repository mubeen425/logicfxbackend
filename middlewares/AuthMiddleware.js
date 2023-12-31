const jwt = require("jsonwebtoken");
const config=require("config")
module.exports = function (req, res, next) {
  if (!req.header("x-auth-token"))
    return res.status(400).send("authentication token required");
  try {
    const decodetoken = jwt.verify(req.header("x-auth-token"), config.get("jwtPrivateKey"));
    req.user = decodetoken;
    console.log(decodetoken);
    if (decodetoken.is_admin || decodetoken.is_active) {
      next();
    } else {
      return res.status(400).send("Invalid Token");
    }
  } catch (error) {
    return res.status(400).send("invalid token");
  }
};
