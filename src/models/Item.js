const { DataTypes } = require('sequelize');
const sequelize     = require('../config/db');

const Item = sequelize.define('Item', {
  name:        { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price:       { type: DataTypes.FLOAT, allowNull: false },
  stock:       { type: DataTypes.INTEGER, defaultValue: 0 },
  category:    { type: DataTypes.STRING },
  imageUrl:    { type: DataTypes.STRING },
});

module.exports = Item;
