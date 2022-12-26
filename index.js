const UpdateTrades = require("./startup/UpdatingTradesbackground");
const express = require("express");
const app = express();
require("./startup/routes")(app);
require("./startup/db")();
const config = require("config");

const port = process.env.Port || 4000;
app.listen(port, "192.168.8.101", () => {
  console.log("listening on port " + port);
});

setInterval(() => {
  console.log("in interval---");
  UpdateTrades();
}, 30000);
