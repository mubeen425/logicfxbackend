const { DataTypes } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const Joi = require("joi");

const Notifications = connection.define(
  "notifications",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    content: {
      type: DataTypes.TEXT,
    },
    status: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: moment().format("YYYY-MM-DD HH:mm"),
    },
  },
  {
    tableName: "notifications",
    timestamps: false,
  }
);

function validateN(req) {
  const schema = Joi.object({
    content: Joi.string().required(),
  });

  return schema.validate(req);
}

module.exports = { Notifications, validateN };
