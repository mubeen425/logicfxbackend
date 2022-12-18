const express = require("express");
const app = express();
require("./startup/routes")(app);
require("./startup/db")();

const port = process.env.Port || 4000;
app.listen(port, "192.168.2.102", () =>
  console.log("listening on port " + port)
);
