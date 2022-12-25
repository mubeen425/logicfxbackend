const { DataTypes } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const { User } = require("./user");
const Joi = require("joi");

const Active_Trade = connection.define(
  "active_trade",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      references: {
        model: User,
        key: "id",
      },
    },
    crypto_name: {
      type: DataTypes.STRING,
    },
    crypto_symbol: {
      type: DataTypes.STRING,
    },
    crypto_purchase_price: {
      type: DataTypes.FLOAT,
    },
    investment: {
      type: DataTypes.FLOAT,
    },
    trade: {
      type: DataTypes.FLOAT,
    },
    admin_profit: {
      type: DataTypes.FLOAT,
    },
    purchase_units: {
      type: DataTypes.FLOAT,
    },
    invested_date: {
      type: DataTypes.DATE,
      defaultValue: moment().format("YYYY-MM-DD HH:mm"),
    },
    take_profit: {
      type: DataTypes.FLOAT,
    },
    stop_loss: {
      type: DataTypes.FLOAT,
    },
  },
  {
    tableName: "active_trade",
    timestamps: false,
  }
);

Active_Trade.belongsTo(User, {
  as: "user",
  foreignKey: "user_id",
});

function validateAT(req) {
  const schema = Joi.object({
    user_id: Joi.required(),
    crypto_name: Joi.string().required(),
    crypto_symbol: Joi.string().required(),
    crypto_purchase_price: Joi.number().required(),
    investment: Joi.number().required(),
    admin_profit: Joi.optional(),
    trade: Joi.optional(),
    purchase_units: Joi.optional(),
    take_profit: Joi.optional(),
    stop_loss: Joi.optional(),
  });

  return schema.validate(req);
}

module.exports = { Active_Trade, validateAT };
