const UpdateTrades = require("./startup/UpdatingTradesbackground");
const express = require("express");
const app = express();
app.set("view engine", "pug");
const { trans } = require("./utils/mailsend");
require("./startup/routes")(app);
require("./startup/db")();
const port = process.env.Port || 4000;
app.listen(port, () => {
  console.log("listening on port " + port);
});

trans.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

setInterval(() => {
  console.log("in interval---");
  UpdateTrades();
}, 30000);
