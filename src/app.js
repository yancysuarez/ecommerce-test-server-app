const express     = require('express');
const dotenv      = require('dotenv');
const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

dotenv.config();

// Fail fast if required JWT env vars are missing or invalid.
const jwt = require('jsonwebtoken');
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is required but not set');
  process.exit(1);
}
try {
  jwt.sign({}, 'validation-key', { expiresIn: process.env.JWT_EXPIRES_IN });
} catch (err) {
  if (!err.message?.includes('expiresIn')) throw err;
  console.error(`JWT_EXPIRES_IN="${process.env.JWT_EXPIRES_IN}" is invalid. Use a value like "7d", "24h", or "30s".`);
  process.exit(1);
}

const sequelize = require('./config/db');
require('./models'); // register models and associations
const seed      = require('./seed');

const app = express();
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'E-Commerce API Docs',
  swaggerOptions: { persistAuthorization: true },
}));

app.use('/api/auth',   require('./routes/auth'));
app.use('/api/users',  require('./routes/users'));
app.use('/api/items',  require('./routes/items'));
app.use('/api/cart',   require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));

const PORT = process.env.PORT || 3000;

sequelize.sync().then(async () => {
  await seed();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
  });
}).catch(err => {
  console.error('Database sync failed:', err);
  process.exit(1);
});
