# E-Commerce API

A complete RESTful API for a small e-commerce platform built with **Node.js**, **Express**, **JWT authentication**, and **SQLite** (via Sequelize).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Reference](#api-reference)
  - [Authentication](#authentication)
  - [Users](#users)
  - [Items](#items)
  - [Cart](#cart)
  - [Orders](#orders)
- [Swagger UI](#swagger-ui)
- [Postman Collection](#postman-collection)
- [Admin Account](#admin-account)
- [Notes](#notes)

---

## Features

- User registration and login with JWT authentication
- Role-based access control (user / admin)
- Product catalogue with search and pagination
- Shopping cart management
- Order checkout and simulated payment flow
- Admin guards (last admin cannot be deleted)
- Interactive API docs via Swagger UI
- Postman collection for quick testing

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express |
| Database | SQLite (via Sequelize ORM) |
| Auth | JSON Web Tokens (jsonwebtoken) |
| Password hashing | bcryptjs |
| API Docs | swagger-jsdoc + swagger-ui-express |

---

## Project Structure

```
ecommerce-api/
├── data/
│   └── ecommerce.db              # SQLite database file (auto-created)
├── src/
│   ├── config/
│   │   └── db.js                 # Sequelize connection
│   ├── docs/
│   │   └── swagger.js            # OpenAPI 3.0 spec
│   ├── middleware/
│   │   └── auth.js               # JWT middleware
│   ├── models/
│   │   ├── index.js              # Model associations
│   │   ├── User.js
│   │   ├── Item.js
│   │   ├── Cart.js
│   │   ├── CartItem.js
│   │   ├── Order.js
│   │   └── OrderItem.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── items.js
│   │   ├── cart.js
│   │   └── orders.js
│   └── app.js
├── .env                          # Environment variables (not committed)
├── .env.example                  # Example environment variables
├── .gitignore
├── ecommerce-api.postman_collection.json
├── package.json
└── README.md
```

---

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd ecommerce-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port the server listens on | `3000` |
| `DB_PATH` | Path to the SQLite database file | `./data/ecommerce.db` |
| `JWT_SECRET` | Secret key for signing JWTs | — |
| `JWT_EXPIRES_IN` | JWT expiry duration | `7d` |

> **Important:** Set a strong, unique `JWT_SECRET` before deploying.

### 4. Start the server

```bash
npm run dev    # development (auto-restarts with nodemon)
npm start      # production
```

The database file and all tables are created automatically on first start.

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
DB_PATH=./data/ecommerce.db
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=7d
```

---

## Running the Server

```bash
# Development
npm run dev

# Production
npm start
```

Output on successful start:

```
Server running on port 3000
Swagger UI: http://localhost:3000/api-docs
```

---

## API Reference

All authenticated endpoints require an `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive a JWT |

**Register**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com","password":"secret123"}'
```

**Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"secret123"}'
# Response: { "token": "eyJ..." }
```

---

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | List all users |
| GET | `/api/users/:id` | User | Get a user by ID |
| PUT | `/api/users/:id` | Owner / Admin | Update a user |
| DELETE | `/api/users/:id` | Admin | Delete a user |

> Deleting the last admin account is blocked with a `400` error.

---

### Items

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/items` | Public | List items (filter, paginate) |
| GET | `/api/items/:id` | Public | Get a single item |
| POST | `/api/items` | Admin | Create an item |
| PUT | `/api/items/:id` | Admin | Update an item |
| DELETE | `/api/items/:id` | Admin | Delete an item |

**Query parameters for `GET /api/items`:**

| Param | Type | Description |
|---|---|---|
| `category` | string | Filter by category |
| `search` | string | Search by name (case-insensitive) |
| `page` | integer | Page number (default: 1) |
| `limit` | integer | Results per page (default: 20) |

```bash
# Filter by category
curl http://localhost:3000/api/items?category=Electronics

# Search by name
curl http://localhost:3000/api/items?search=headphones
```

---

### Cart

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/api/cart` | User | View cart |
| POST | `/api/cart` | User | Add or update item in cart |
| DELETE | `/api/cart/:itemId` | User | Remove item from cart |
| DELETE | `/api/cart` | User | Clear entire cart |

**Add item to cart**
```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"itemId": 1, "quantity": 2}'
```

---

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | User | Checkout (cart → order) |
| GET | `/api/orders` | User / Admin | List orders |
| GET | `/api/orders/:id` | Owner / Admin | Get order details |
| POST | `/api/orders/:id/pay` | Owner | Simulate payment |
| PUT | `/api/orders/:id/status` | Admin | Update order status |
| DELETE | `/api/orders/:id` | Owner / Admin | Cancel order |

**Full checkout flow**
```bash
# 1. Add item to cart
curl -X POST http://localhost:3000/api/cart \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"itemId": 1, "quantity": 2}'

# 2. Place order
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentMethod": "card",
    "shippingAddress": {
      "street": "1 Main St",
      "city": "New York",
      "zip": "10001",
      "country": "US"
    }
  }'

# 3. Pay
curl -X POST http://localhost:3000/api/orders/<ORDER_ID>/pay \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"transactionId": "TXN-ABC123"}'
```

**Order statuses:** `pending` → `paid` → `shipped` → `delivered` / `cancelled`

**Payment statuses:** `unpaid` → `paid` → `refunded`

> Only pending orders can be cancelled. Paid or shipped orders cannot be cancelled.

---

## Swagger UI

Interactive API documentation is available at:

```
http://localhost:3000/api-docs
```

To test authenticated endpoints:

1. Call `POST /api/auth/login` and copy the `token` from the response.
2. Click the **Authorize** button (🔒) at the top right.
3. Enter `Bearer <your-token>` and click **Authorize**.

---

## Postman Collection

Import `ecommerce-api.postman_collection.json` into Postman.

The collection uses **collection variables** that are automatically populated by test scripts:

| Variable | Set by |
|---|---|
| `token` | Register or Login request |
| `itemId` | Create Item request |
| `orderId` | Checkout request |

**Recommended test order:**
1. Register (or Login)
2. Create Item *(admin token required)*
3. Add Item to Cart
4. Checkout
5. Pay for Order

---

## Admin Account

Create an admin account by running the following script once:

```bash
node -e "
require('dotenv').config();
require('./src/models');
const { User } = require('./src/models');
const sequelize = require('./src/config/db');

sequelize.sync().then(async () => {
  await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'admin'
  });
  console.log('Admin created');
  await sequelize.close();
});
"
```

> The API enforces that **at least one admin account must exist at all times**. Attempting to delete the last admin returns a `400` error.

---

## Notes

- Passwords are hashed with **bcrypt** (10 salt rounds).
- JWTs expire after **7 days** by default (configurable via `.env`).
- Stock is decremented at checkout and is **not** automatically restored on cancellation.
- The payment flow is **simulated**. Replace the placeholder block in `src/routes/orders.js` with a real provider (Stripe, PayPal, etc.).
- The SQLite database is stored at `data/ecommerce.db` and is excluded from version control via `.gitignore`.
