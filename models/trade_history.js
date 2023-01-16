const { DataTypes } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const { User } = require("./user");
const Joi = require("joi");

const Trade_History = connection.define(
  "trade_history",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    trade_id: {
      type: DataTypes.INTEGER,
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
    crypto_sale_price: {
      type: DataTypes.FLOAT,
    },
    investment: {
      type: DataTypes.FLOAT,
    },
    open_trade: {
      type: DataTypes.FLOAT,
    },
    close_trade: {
      type: DataTypes.FLOAT,
    },
    partial_user_value: {
      type: DataTypes.FLOAT,
    },
    trade_type: {
      type: DataTypes.STRING,
    },

    open_admin_profit: {
      type: DataTypes.FLOAT,
    },
    close_admin_profit: {
      type: DataTypes.FLOAT,
    },
    purchase_units: {
      type: DataTypes.FLOAT,
    },
    actual_profit: {
      type: DataTypes.FLOAT,
    },
    actual_loss: {
      type: DataTypes.FLOAT,
    },
    open_at: {
      type: DataTypes.STRING,
    },
    closed_at: {
      type: DataTypes.DATE,
      defaultValue: moment().format("YYYY-MM-DD HH:mm"),
    },
  },
  {
    tableName: "trade_history",
    timestamps: false,
  }
);

Trade_History.belongsTo(User, {
  as: "user",
  foreignKey: "user_id",
});

// Trade_History.belongsTo(Active_Trade, {
//   as: "active_trade",
//   foreignKey: "trade_id",
// });

// function validateAT(req) {
//   const schema = Joi.object({
//     user_id: Joi.required(),
//     crypto_name: Joi.string().required(),
//     crypto_symbol: Joi.string().required(),
//     crypto_purchase_price: Joi.required(),
//     investment: Joi.required(),
//     admin_profit: Joi.string(),
//     trade: Joi.string(),
//     purchase_units: Joi.string(),
//     take_profit: Joi.string(),
//     stop_loss: Joi.string(),
//   });

//   return schema.validate(req);
// }

module.exports = Trade_History;
