const router                     = require('express').Router();
const { Cart, CartItem, Item }   = require('../models');
const auth                       = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Shopping cart management
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: View the current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart contents and total
 */
router.get('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({
      where: { UserId: req.user.id },
      include: [{ model: CartItem, include: [{ model: Item, attributes: ['name', 'imageUrl'] }] }],
    });
    if (!cart) return res.json({ items: [], total: 0 });
    const total = cart.CartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({ items: cart.CartItems, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/cart:
 *   post:
 *     summary: Add or update an item in the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [itemId, quantity]
 *             properties:
 *               itemId:   { type: integer }
 *               quantity: { type: integer, example: 2 }
 *     responses:
 *       200:
 *         description: Updated cart
 *       400:
 *         description: Insufficient stock
 *       404:
 *         description: Item not found
 */
router.post('/', auth, async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const product = await Item.findByPk(itemId);
    if (!product) return res.status(404).json({ message: 'Item not found' });
    if (product.stock < quantity)
      return res.status(400).json({ message: 'Insufficient stock' });

    const [cart] = await Cart.findOrCreate({ where: { UserId: req.user.id } });

    const existing = await CartItem.findOne({ where: { CartId: cart.id, ItemId: itemId } });
    if (existing) {
      await existing.update({ quantity, price: product.price });
    } else {
      await CartItem.create({ CartId: cart.id, ItemId: itemId, quantity, price: product.price });
    }

    const updated = await Cart.findOne({
      where: { id: cart.id },
      include: [{ model: CartItem, include: [{ model: Item, attributes: ['name', 'imageUrl'] }] }],
    });
    const total = updated.CartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    res.json({ items: updated.CartItems, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/cart/{itemId}:
 *   delete:
 *     summary: Remove a single item from the cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: itemId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Item removed
 *       404:
 *         description: Cart not found
 */
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { UserId: req.user.id } });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    await CartItem.destroy({ where: { CartId: cart.id, ItemId: req.params.itemId } });
    res.json({ message: 'Item removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/cart:
 *   delete:
 *     summary: Clear the entire cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared
 */
router.delete('/', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ where: { UserId: req.user.id } });
    if (cart) {
      await CartItem.destroy({ where: { CartId: cart.id } });
      await cart.destroy();
    }
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
