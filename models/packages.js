const { DataTypes,Sequelize } = require("sequelize");
const connection = require("../utils/connection");
const moment = require("moment");
const { User } = require("./user");
const Joi = require("joi");

const Package = connection.define('package', {
 id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    },
  name: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.TEXT,
  },
  price: {
    type: DataTypes.FLOAT,
  },
  roi:{
    type: DataTypes.STRING,
  },
  image: {
    type: DataTypes.STRING,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
  },
}, {
  tableName: 'package',
  timestamps: false,
});

function validateAT(req) {
    const schema = Joi.object({
    name: Joi.required(),
    price: Joi.required(),
    roi: Joi.required(),
    image: Joi.optional(),
    description: Joi.optional(),
});
  
    return schema.validate(req);
}

module.exports = {Package,validateAT};
