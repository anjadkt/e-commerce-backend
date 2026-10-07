# 🛒 E-Commerce Backend REST API

A scalable, feature-based **E-Commerce REST API** built with **Node.js, Express.js, TypeScript, MongoDB & Mongoose**, featuring **JWT Authentication**, role-based access control (Admin / Customer), **unlimited-depth category hierarchies**, **recursive category product filtering**, and **atomic order stock management**.

---

## 📁 Feature-Based Folder Structure

```
e-commerce-backend/
├── src/
│   ├── config/
│   │   ├── env.ts                   # Type-safe environment variable schema (Zod)
│   │   └── database.ts              # MongoDB Mongoose connection and lifecycle
│   ├── middleware/
│   │   ├── auth.middleware.ts       # JWT authentication & role-based authorization
│   │   ├── error.middleware.ts      # Centralized error handler & 404 handler
│   │   └── validate.middleware.ts   # Generic Zod request validator (body, query, params)
│   ├── modules/
│   │   ├── auth/                    # Module 1A: Authentication
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validation.ts
│   │   ├── user/                    # Module 1B: User Management
│   │   │   ├── user.controller.ts
│   │   │   ├── user.model.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.validation.ts
│   │   ├── category/                # Module 2: Multi-Level Categories (Unlimited Depth)
│   │   │   ├── category.controller.ts
│   │   │   ├── category.model.ts
│   │   │   ├── category.routes.ts
│   │   │   ├── category.service.ts
│   │   │   └── category.validation.ts
│   │   ├── product/                 # Module 3: Product Management
│   │   │   ├── product.controller.ts
│   │   │   ├── product.model.ts
│   │   │   ├── product.routes.ts
│   │   │   ├── product.service.ts
│   │   │   └── product.validation.ts
│   │   └── order/                   # Module 4: Order Management & Stock Control
│   │       ├── order.controller.ts
│   │       ├── order.model.ts
│   │       ├── order.routes.ts
│   │       ├── order.service.ts
│   │       └── order.validation.ts
│   ├── routes/
│   │   └── index.ts                 # Aggregates /api/v1 routes
│   ├── scripts/
│   │   └── seed.ts                  # Database seeder with sample tree & products
│   ├── types/
│   │   └── express.d.ts             # Express Request user augmentation
│   ├── utils/
│   │   ├── api-response.ts          # Standard JSON response structure
│   │   ├── app-error.ts             # Custom HTTP error classes
│   │   └── async-handler.ts         # Async express error catcher wrapper
│   ├── app.ts                       # Express app configuration & middleware
│   └── server.ts                    # Server startup and graceful shutdown
├── docker-compose.yml               # Optional MongoDB container
├── tsconfig.json                    # TypeScript compiler config
├── package.json
└── .env
```

---

## 🚀 Quick Start

### 1. Configure Environment Variables
Verify or update `.env` in the root folder:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce_db
JWT_SECRET=supersecret_jwt_key_ecommerce_2026_change_in_production
JWT_EXPIRES_IN=7d
```

> **Note:** If running MongoDB locally, make sure MongoDB is running or run `docker compose up -d` to start the provided MongoDB container. You can also use a MongoDB Atlas connection string.

### 2. Seed Database (Optional but Recommended)
Populates initial sample users, the multi-level category tree, products, and a sample order:
```bash
npm run seed
```

**Pre-seeded Credentials:**
- **Admin:** `admin@example.com` / `adminPassword123`
- **Customer:** `customer@example.com` / `customerPassword123`

### 3. Start Development Server
```bash
npm run dev
```

The server starts at `http://localhost:5000/api/v1`.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## 📡 API Reference Overview

### 1. Health Check
- `GET /api/v1/health` — Service health check

---

### 2. Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register customer account |
| `POST` | `/api/v1/auth/login` | Public | Login with email and password |
| `GET` | `/api/v1/auth/me` | Authenticated | Get currently authenticated user |

---

### 3. User Management (`/api/v1/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/users/profile` | Authenticated | Get current user's profile |
| `PATCH` | `/api/v1/users/profile` | Authenticated | Update current user's profile |
| `GET` | `/api/v1/users` | Admin | List all users (pagination, search, role, status) |
| `GET` | `/api/v1/users/:id` | Admin | Get single user by ID |
| `PATCH` | `/api/v1/users/:id/status` | Admin | Activate or deactivate user |

---

### 4. Multi-Level Category Management (`/api/v1/categories`)
- **Arbitrary Depth Hierarchy**: Supports unlimited nested levels.
- **Tree API**: Returns full recursive nested JSON tree structure.
- **Circular Reference Prevention**: Prevents setting an existing category as its own parent or moving a parent inside one of its descendants.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/categories/tree` | Public | Returns complete hierarchical category tree |
| `GET` | `/api/v1/categories` | Public | List categories (flat list with optional `?parent=` filter) |
| `GET` | `/api/v1/categories/:id` | Public | Get category details with parent info |
| `POST` | `/api/v1/categories` | Admin | Create category (optional `parent` ID) |
| `PATCH` | `/api/v1/categories/:id` | Admin | Update category (validates circular references) |
| `DELETE` | `/api/v1/categories/:id` | Admin | Delete category (safely blocks if subcategories exist) |

#### Category Tree Structure Example:
```
Electronics
├── Mobiles
│   ├── Android Phones
│   │   ├── Samsung
│   │   └── OnePlus
│   └── iPhones
└── Computers
    ├── Laptops
    └── Desktops
```

---

### 5. Product Management (`/api/v1/products`)
- **Recursive Category Filtering**: Filtering by `?category=<Electronics_ID>` automatically returns products belonging to `Electronics`, `Mobiles`, `Android Phones`, `Samsung`, `OnePlus`, `iPhones`, `Computers`, `Laptops`, and `Desktops`.
- **Search, Price Range & Pagination**: `?search=Samsung&minPrice=100&maxPrice=1500&sortBy=price&sortOrder=asc&page=1&limit=10`.
- **Backend Price Integrity**: Sale price cannot exceed regular price.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/products` | Public | List products with search, recursive category filter, price, sort & pagination |
| `GET` | `/api/v1/products/:id` | Public | Get product by ID |
| `POST` | `/api/v1/products` | Admin | Create product |
| `PATCH` | `/api/v1/products/:id` | Admin | Update product |
| `DELETE` | `/api/v1/products/:id` | Admin | Delete product |

---

### 6. Order Management (`/api/v1/orders`)
- **Stock Validation & Atomic Decrement**: Validates stock and reduces stock upon order creation. If race condition occurs, atomically rolls back.
- **Backend Calculated Totals**: Product prices are taken directly from backend product records.
- **Stock Restoration on Cancel**: When an order status is updated to `Cancelled`, reserved stock is automatically returned.
- **Status Workflow**: `Pending` → `Confirmed` → `Processing` → `Shipped` → `Delivered` / `Cancelled`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/orders` | Customer | Place order (validates stock, calculates totals, decrements stock) |
| `GET` | `/api/v1/orders/my-orders` | Customer | View customer's own orders |
| `GET` | `/api/v1/orders/:id` | Customer / Admin | Get order details |
| `GET` | `/api/v1/orders` | Admin | View all orders across users |
| `PATCH` | `/api/v1/orders/:id/status` | Admin | Update order status (auto-restores stock on Cancelled) |
