const config = require("config");
const { Sequelize } = require("sequelize");
const { DATABASE, USERNAME, PASSWORD, HOST, PORT } = config.get("DEVELOPMENT");

module.exports = new Sequelize(DATABASE, USERNAME, PASSWORD, {
  host: HOST,
  dialect: "mysql",
  logging: false,
  port: PORT,
});
