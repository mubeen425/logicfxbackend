const { DataTypes, Sequelize } = require('sequelize');
const connection = require('../utils/connection');
const { Package } = require('./packages');
const { User } = require('./user');

const Purchase = connection.define('purchase', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  package_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Package,
      key: 'id',
    },
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: "id",
    },
  },
  payment_method: {
    type: DataTypes.STRING,
    defaultValue:"wallet"
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
}, {
  tableName: 'purchase',
  timestamps: false,
});


Purchase.belongsTo(User, {
    as: "user",
    foreignKey: "user_id",
});

Purchase.belongsTo(Package, {
    as: "package",
    foreignKey: "package_id",
});

function validateAT(req) {
    const schema = Joi.object({
        package_id: Joi.number().required(),
        user_id: Joi.number().required(),  
});

    return schema.validate(req);
}



module.exports ={ Purchase,validateAT};
