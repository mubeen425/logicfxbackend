const express = require("express");
const app = express();
require("./startup/routes")(app);
require("./startup/db")();

const port = process.env.Port || 4000;
app.listen(port, () => console.log("listening on port " + port));
