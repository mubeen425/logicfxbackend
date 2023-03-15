const { DataTypes } = require("sequelize");
const connection = require("../utils/connection");
const Joi = require("joi");
const CoinMarket = connection.define(
  "coin_market",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: false,
    },
    name: DataTypes.STRING,
    symbol: DataTypes.STRING,
    price: DataTypes.FLOAT,
    volume_24h: DataTypes.FLOAT,
    volume_change_24h: DataTypes.FLOAT,
    percent_change_1h: DataTypes.FLOAT,
    percent_change_24h: DataTypes.FLOAT,
    percent_change_7d: DataTypes.FLOAT,
    percent_change_30d: DataTypes.FLOAT,
    market_cap: DataTypes.FLOAT,
    max_supply: DataTypes.FLOAT,
    circulating_supply: DataTypes.FLOAT,
    total_supply: DataTypes.FLOAT,
    allow:{
      type:DataTypes.BOOLEAN,
      defaultValue:true,
    }
  },
  {
    tableName: "coin_market",
    timestamps: false,
  }
);

module.exports = CoinMarket;
