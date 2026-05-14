const router                                      = require('express').Router();
const { Order, OrderItem, Cart, CartItem, Item, User } = require('../models');
const auth                                        = require('../middleware/auth');

const isAdmin = (req, res, next) =>
  req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Admin only' });

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Checkout, order tracking, and payments
 */

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Checkout — convert cart to an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               paymentMethod:   { type: string, enum: [card, paypal, cod], default: card }
 *               shippingAddress:
 *                 type: object
 *                 properties:
 *                   street:  { type: string }
 *                   city:    { type: string }
 *                   zip:     { type: string }
 *                   country: { type: string }
 *     responses:
 *       201:
 *         description: Order created
 *       400:
 *         description: Cart is empty or insufficient stock
 */
router.post('/', auth, async (req, res) => {
  try {
    const { shippingAddress = {}, paymentMethod = 'card' } = req.body;
    const cart = await Cart.findOne({
      where: { UserId: req.user.id },
      include: [{ model: CartItem, include: [Item] }],
    });
    if (!cart || cart.CartItems.length === 0)
      return res.status(400).json({ message: 'Cart is empty' });

    let total = 0;
    const orderItemsData = [];
    for (const entry of cart.CartItems) {
      const product = entry.Item;
      if (product.stock < entry.quantity)
        return res.status(400).json({ message: `Not enough stock for ${product.name}` });
      product.stock -= entry.quantity;
      await product.save();
      orderItemsData.push({ name: product.name, ItemId: product.id, quantity: entry.quantity, price: entry.price });
      total += entry.price * entry.quantity;
    }

    const order = await Order.create({
      UserId: req.user.id,
      total,
      paymentMethod,
      street:  shippingAddress.street,
      city:    shippingAddress.city,
      zip:     shippingAddress.zip,
      country: shippingAddress.country,
    });

    for (const oi of orderItemsData) {
      await OrderItem.create({ ...oi, OrderId: order.id });
    }

    await CartItem.destroy({ where: { CartId: cart.id } });
    await cart.destroy();

    const result = await Order.findByPk(order.id, { include: [OrderItem] });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: List orders (own orders for users, all orders for admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of orders
 */
router.get('/', auth, async (req, res) => {
  try {
    const where = req.user.role === 'admin' ? {} : { UserId: req.user.id };
    const orders = await Order.findAll({
      where,
      include: [{ model: User, attributes: ['name', 'email'] }, OrderItem],
      order: [['createdAt', 'DESC']],
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get a single order (owner or admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order object
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Order not found
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['name', 'email'] }, OrderItem],
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.UserId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/orders/{id}/pay:
 *   post:
 *     summary: Simulate payment for an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId: { type: string, example: TXN-ABC123 }
 *     responses:
 *       200:
 *         description: Payment successful
 *       400:
 *         description: Order already paid
 *       403:
 *         description: Forbidden
 */
router.post('/:id/pay', auth, async (req, res) => {
  try {
    const { transactionId } = req.body;
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.UserId !== req.user.id)
      return res.status(403).json({ message: 'Forbidden' });
    if (order.paymentStatus === 'paid')
      return res.status(400).json({ message: 'Order already paid' });

    // --- Replace with real payment gateway (Stripe, PayPal, etc.) ---
    const paymentSuccess = true; // Simulated approval
    // ----------------------------------------------------------------

    if (!paymentSuccess)
      return res.status(402).json({ message: 'Payment failed' });

    order.paymentStatus  = 'paid';
    order.transactionId  = transactionId || `TXN-${Date.now()}`;
    order.paidAt         = new Date();
    order.status         = 'paid';
    await order.save();

    res.json({ message: 'Payment successful', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     summary: Update order status (admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status: { type: string, enum: [pending, paid, shipped, delivered, cancelled] }
 *     responses:
 *       200:
 *         description: Order updated
 *       403:
 *         description: Admin only
 */
router.put('/:id/status', auth, isAdmin, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    order.status = req.body.status;
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/orders/{id}:
 *   delete:
 *     summary: Cancel an order (owner or admin — pending orders only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order cancelled
 *       400:
 *         description: Cannot cancel a paid or shipped order
 *       403:
 *         description: Forbidden
 */
router.delete('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.UserId !== req.user.id && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Forbidden' });
    if (!['pending', 'cancelled'].includes(order.status))
      return res.status(400).json({ message: 'Cannot cancel a paid or shipped order' });
    await order.destroy();
    res.json({ message: 'Order cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
