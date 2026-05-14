const router   = require('express').Router();
const { Op }   = require('sequelize');
const { Item } = require('../models');
const auth     = require('../middleware/auth');

const isAdmin = (req, res, next) =>
  req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Admin only' });

/**
 * @swagger
 * tags:
 *   name: Items
 *   description: Product catalogue
 */

/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: List items (public, filterable)
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200:
 *         description: Array of items
 */
router.get('/', async (req, res) => {
  const { category, search, page = 1, limit = 20 } = req.query;
  const where = {};
  if (category) where.category = category;
  if (search)   where.name = { [Op.like]: `%${search}%` };

  const items = await Item.findAll({
    where,
    offset: (page - 1) * Number(limit),
    limit:  Number(limit),
  });
  res.json(items);
});

/**
 * @swagger
 * /api/items/{id}:
 *   get:
 *     summary: Get a single item (public)
 *     tags: [Items]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Item object
 *       404:
 *         description: Item not found
 */
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/items:
 *   post:
 *     summary: Create an item (admin only)
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name:        { type: string, example: Wireless Headphones }
 *               description: { type: string }
 *               price:       { type: number, example: 49.99 }
 *               stock:       { type: integer, example: 100 }
 *               category:    { type: string, example: Electronics }
 *               imageUrl:    { type: string }
 *     responses:
 *       201:
 *         description: Item created
 */
router.post('/', auth, isAdmin, async (req, res) => {
  try {
    const item = await Item.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   put:
 *     summary: Update an item (admin only)
 *     tags: [Items]
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
 *     responses:
 *       200:
 *         description: Item updated
 *       404:
 *         description: Item not found
 */
router.put('/:id', auth, isAdmin, async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    await item.update(req.body);
    res.json(item);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/items/{id}:
 *   delete:
 *     summary: Delete an item (admin only)
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Item deleted
 *       404:
 *         description: Item not found
 */
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    await Item.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
