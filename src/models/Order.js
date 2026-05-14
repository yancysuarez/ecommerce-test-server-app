const { DataTypes } = require('sequelize');
const sequelize     = require('../config/db');

const Order = sequelize.define('Order', {
  total:         { type: DataTypes.FLOAT,  allowNull: false },
  status:        { type: DataTypes.STRING, defaultValue: 'pending' },
  paymentMethod: { type: DataTypes.STRING, defaultValue: 'card' },
  paymentStatus: { type: DataTypes.STRING, defaultValue: 'unpaid' },
  transactionId: { type: DataTypes.STRING },
  paidAt:        { type: DataTypes.DATE },
  street:        { type: DataTypes.STRING },
  city:          { type: DataTypes.STRING },
  zip:           { type: DataTypes.STRING },
  country:       { type: DataTypes.STRING },
});

module.exports = Order;
