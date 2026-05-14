const { DataTypes } = require('sequelize');
const sequelize     = require('../config/db');

const CartItem = sequelize.define('CartItem', {
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price:    { type: DataTypes.FLOAT,   allowNull: false },
});

module.exports = CartItem;
