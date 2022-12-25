const connection = require("../utils/connection");
const { DataTypes } = require("sequelize");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const User = connection.define(
  "user",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_name: {
      type: DataTypes.STRING,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          arg: true,
          msg: "Username must not be empty",
        },
        notNull: { msg: "first name is required" },
      },
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          arg: true,
          msg: "Username must not be empty",
        },
        notNull: { msg: "lastName is required" },
      },
    },
    email: {
      type: DataTypes.STRING,
    },
    password: {
      type: DataTypes.STRING,
    },
    avatar: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    is_email_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_admin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    is_active_user: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: moment().format("YYYY-MM-DD HH:mm"),
    },
  },
  {
    tableName: "user",
    timestamps: false,
  }
);

User.prototype.generateJwtToken = function () {
  return jwt.sign(
    {
      id: this.id,
      username: this.user_name,
      email: this.email,
      avatar: this.avatar,
      is_admin: this.is_admin,
      is_active: this.is_active_user,
      is_email_verified: this.is_email_verified,
    },
    "privateKey"
    // { expiresIn: "1d" }
  );
};

function validate(req) {
  const schema = Joi.object({
    user_name: Joi.string().required().min(5).max(255),
    first_name: Joi.string().required(),
    last_name: Joi.string().required(),
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string()
      .min(5)
      .max(255)
      .required()
      .regex(
        RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")
      )
      .message(
        "Password must contain at least one uppercase one lowercase one special character and one number "
      ),
    is_email_verified: Joi.boolean(),
  });

  return schema.validate(req);
}

module.exports = { User, validate };
