const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title:       'E-Commerce API',
      version:     '1.0.0',
      description: 'REST API for a Node.js e-commerce platform',
    },
    servers: [{ url: 'http://localhost:3000' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type:         'http',
          scheme:       'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id:       { type: 'string', example: '664a1f2e8c9d4e001c8b4567' },
            name:      { type: 'string', example: 'Alice' },
            email:     { type: 'string', example: 'alice@example.com' },
            role:      { type: 'string', enum: ['user', 'admin'], example: 'user' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Item: {
          type: 'object',
          properties: {
            _id:         { type: 'string' },
            name:        { type: 'string', example: 'Wireless Headphones' },
            description: { type: 'string' },
            price:       { type: 'number', example: 49.99 },
            stock:       { type: 'integer', example: 100 },
            category:    { type: 'string', example: 'Electronics' },
            imageUrl:    { type: 'string' },
          },
        },
        CartItem: {
          type: 'object',
          properties: {
            item:     { $ref: '#/components/schemas/Item' },
            quantity: { type: 'integer', example: 2 },
            price:    { type: 'number', example: 49.99 },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id:    { type: 'string' },
            user:   { $ref: '#/components/schemas/User' },
            items:  { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
            total:  { type: 'number', example: 99.98 },
            status: { type: 'string', enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] },
            payment: {
              type: 'object',
              properties: {
                method:        { type: 'string', enum: ['card', 'paypal', 'cod'] },
                status:        { type: 'string', enum: ['unpaid', 'paid', 'refunded'] },
                transactionId: { type: 'string' },
                paidAt:        { type: 'string', format: 'date-time' },
              },
            },
            shippingAddress: {
              type: 'object',
              properties: {
                street:  { type: 'string' },
                city:    { type: 'string' },
                zip:     { type: 'string' },
                country: { type: 'string' },
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

module.exports = swaggerJsdoc(options);
