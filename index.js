const UpdateTrades = require("./startup/UpdatingTradesbackground");
const express = require("express");
const app = express();
app.set("view engine", "pug");
require("./startup/routes")(app);
require("./startup/db")();

const port = process.env.Port || 4000;
app.listen(port, () => {
  console.log("listening on port " + port);
});

// setInterval(() => {
//   console.log("in interval---");
//   UpdateTrades();
// }, 30000);
