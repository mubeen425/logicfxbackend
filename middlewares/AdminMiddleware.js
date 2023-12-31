const jwt = require("jsonwebtoken");
const config=require("config");
module.exports = function (req, res, next) {
  if (!req.header("x-auth-token"))
    return res.status(404).send("authentication token required");
  try {
    const decodetoken = jwt.verify(req.header("x-auth-token"), config.get("jwtPrivateKey"));
    req.user = decodetoken;
    if (decodetoken.is_admin) {
      next();
    } else {
      return res.status(400).send("Invalid Token.");
    }
  } catch (error) {
    return res.status(400).send("Invalid token");
  }
};
