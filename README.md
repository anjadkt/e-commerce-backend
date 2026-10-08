# 🛒 E-Commerce Backend REST API

A scalable, feature-based **E-Commerce REST API** built with **Node.js, Express.js, TypeScript, MongoDB & Mongoose**, featuring **JWT Authentication**, role-based access control (Admin / Customer), **unlimited-depth category hierarchies**, **recursive category product filtering**, and **atomic order stock management**.

---

## 📁 Feature-Based Folder Structure

```
e-commerce-backend/
├── src/
│   ├── config/
│   │   ├── env.ts                   # environment variable
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
│   │   │   ├── auth.validation.ts
│   │   │   └── cookies.ts
│   │   ├── user/                    # Module 1B: User Management
│   │   │   ├── user.controller.ts
│   │   │   ├── user.mapper.ts       # Admin response DTO mapper
│   │   │   ├── user.model.ts
│   │   │   ├── user.routes.ts
│   │   │   ├── user.service.ts
│   │   │   └── user.validation.ts
│   │   ├── category/                # Module 2: Multi-Level Categories
│   │   │   ├── category.controller.ts
│   │   │   ├── category.model.ts
│   │   │   ├── category.routes.ts
│   │   │   ├── category.service.ts
│   │   │   ├── category.utils.ts    # Tree builder, slugify & descendant helpers
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
│   ├── scripts/
│   │   └── seed.ts                  # Database seeder with sample tree & products
│   ├── types/
│   │   └── express.d.ts             # Express Request user augmentation
│   ├── utils/
│   │   ├── api-response.ts          # Standard JSON response structure
│   │   ├── app-error.ts             # Custom HTTP error classes
│   │   └── async-handler.ts         # Async express error catcher wrapper
│   ├── routes.ts                    # Aggregates /api/v1 routes
│   ├── app.ts                       # Express app configuration & middleware
│   └── server.ts                    # Server startup
├── Dockerfile                       # Multi-stage production Dockerfile
├── docker-compose.yml               # Docker Compose setup (MongoDB + Backend API)
├── tsconfig.json                    # TypeScript compiler config
├── package.json
└── .env
```

---

## 🚀 Getting Started

### 1. Environment Configuration

Create or verify `.env` in the project root:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ecommerce_db
CLIENT_URL=http://localhost:3000
ACCESS_TOKEN_SECRET=supersecret_access_token_key_ecommerce_2026
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=supersecret_refresh_token_key_ecommerce_2026
REFRESH_TOKEN_EXPIRES_IN=7d
SALT_ROUNDS=10
```

> **Note:** For local Docker Compose execution, `MONGODB_URI` can point to `mongodb://mongodb:27017/ecommerce_db` or a remote MongoDB Atlas connection string.

---

### Option A: Run with Docker

Run both the **Node.js API** and **MongoDB** together with a single command:

#### 1. Start Containers
```bash
docker compose up --build
```

#### 2. Seed Database
In a new terminal window:
```bash
docker compose exec api npm run seed
```

#### 3. Stop Containers
```bash
docker compose down
```

The API will be available at: `http://localhost:5000/api/v1`.

---

### Option B: Run Locally with Node.js & npm

Run the API directly on your host machine for development:

#### 1. Start MongoDB
Ensure MongoDB is running locally, on Atlas, or start just MongoDB via Docker:
```bash
docker compose up -d mongodb
```

#### 2. Install Dependencies
```bash
npm install
```

#### 3. Seed Database
```bash
npm run seed
```

#### 4. Start Development Server
```bash
npm run dev
```

The server starts at `http://localhost:5000/api/v1`.

#### 5. Build & Run for Production 
```bash
npm run build
npm start
```

---

### 🔑 Seeded Credentials
When you run `npm run seed`:
- **Admin Account:** `admin@example.com` / `admin123`
- **Customer Account:** `customer@example.com` / `customer123`

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
