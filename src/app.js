const express     = require('express');
const dotenv      = require('dotenv');
const swaggerUi   = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

dotenv.config();

const sequelize = require('./config/db');
require('./models'); // register models and associations

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

sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Swagger UI: http://localhost:${PORT}/api-docs`);
  });
}).catch(err => {
  console.error('Database sync failed:', err.message);
  process.exit(1);
});
