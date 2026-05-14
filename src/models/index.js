const User      = require('./User');
const Item      = require('./Item');
const Cart      = require('./Cart');
const CartItem  = require('./CartItem');
const Order     = require('./Order');
const OrderItem = require('./OrderItem');

// Cart associations
User.hasOne(Cart,      { foreignKey: 'UserId' });
Cart.belongsTo(User,   { foreignKey: 'UserId' });
Cart.hasMany(CartItem, { foreignKey: 'CartId' });
CartItem.belongsTo(Cart, { foreignKey: 'CartId' });
CartItem.belongsTo(Item, { foreignKey: 'ItemId' });
Item.hasMany(CartItem,   { foreignKey: 'ItemId' });

// Order associations
User.hasMany(Order,       { foreignKey: 'UserId' });
Order.belongsTo(User,     { foreignKey: 'UserId' });
Order.hasMany(OrderItem,  { foreignKey: 'OrderId' });
OrderItem.belongsTo(Order, { foreignKey: 'OrderId' });
OrderItem.belongsTo(Item,  { foreignKey: 'ItemId' });

module.exports = { User, Item, Cart, CartItem, Order, OrderItem };
