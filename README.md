# Ecommerce Backend — NestJS + TypeORM + PostgreSQL

Single-vendor ecommerce backend built with **NestJS 11**, **TypeORM**, and **PostgreSQL**. Supports multi-gateway payments, admin dashboard, full cart/order/review/wishlist lifecycle, coupon engine, and Cloudinary image uploads.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema & Relationships](#database-schema--relationships)
- [Authentication & Authorization Flow](#authentication--authorization-flow)
- [API Reference](#api-reference)
  - [Auth](#1-auth)
  - [Users](#2-users-admin)
  - [Categories](#3-categories)
  - [Products](#4-products)
  - [Cart](#5-cart)
  - [Orders](#6-orders)
  - [Payments](#7-payments)
  - [Reviews](#8-reviews)
  - [Coupons](#9-coupons)
  - [Wishlist](#10-wishlist)
  - [Upload](#11-upload)
  - [Dashboard](#12-dashboard-admin)
- [Global Response Format](#global-response-format)
- [Error Handling](#error-handling)
- [Order Lifecycle](#order-lifecycle)
- [Payment Flow](#payment-flow)
- [Admin Seeding](#admin-seeding)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│              (React / Next.js / Any Client)                  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / HTTPS
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                     NestJS Application                        │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │  Controllers  │  │   Services   │  │   TypeORM Repos  │    │
│  │  (Routes)     │─▶│  (Business)  │─▶│  (Data Access)   │    │
│  └──────────────┘  └──────────────┘  └────────┬─────────┘    │
│                                                │              │
│  ┌─────────────────────────────────────────────┘              │
│  │  Guards: JwtAuthGuard (global), RolesGuard                 │
│  │  Interceptors: TransformInterceptor (wraps responses)     │
│  │  Filters: HttpExceptionFilter (catches errors)            │
│  └───────────────────────────────────────────────────────────┘
└──────────────────────────┬───────────────────────────────────┘
                           │ TypeORM
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                        │
│  12 tables: users, products, categories, product_images,     │
│  orders, order_items, payments, reviews, cart, wishlist,     │
│  addresses, coupons                                           │
└──────────────────────────────────────────────────────────────┘
```

### Application Layers

| Layer | Location | Responsibility |
|---|---|---|
| **Module** | `src/*/*.module.ts` | Dependency injection, imports, exports |
| **Controller** | `src/*/*.controller.ts` | Route definitions, HTTP verb mapping, Swagger docs |
| **Service** | `src/*/*.service.ts` | Business logic, validation, exception throwing |
| **Entity** | `src/entities/*.entity.ts` | TypeORM model definition, column types, relations |
| **DTO** | `src/*/dto/*.dto.ts` | Input validation (class-validator) + Swagger schemas |
| **Guard** | `src/common/guards/*.ts` | JWT auth (global), role-based access |
| **Interceptor** | `src/common/interceptors/*.ts` | Standardized JSON response format |
| **Filter** | `src/common/filters/*.ts` | Global exception catch + formatted error output |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| **NestJS 11** | Node.js framework (controllers, services, modules) |
| **TypeORM 0.3** | ORM for PostgreSQL — entities, repositories, query builder |
| **PostgreSQL** | Relational database (`pg` driver) |
| **Passport + JWT** | Authentication (access + refresh tokens) |
| **bcrypt** | Password hashing |
| **class-validator / class-transformer** | DTO validation & transformation |
| **Swagger** | Auto-generated API docs at `/api/docs` |
| **Helmet** | HTTP security headers |
| **Throttler** | Rate limiting (100 req/60s) |
| **Multer** | File upload handling |
| **Cloudinary** | Cloud image storage (optional) |
| **Redis (ioredis)** | Caching layer (available) |
| **Stripe / SSLCommerz / bKash / Nagad** | Payment gateway integrations |

---

## Getting Started

```bash
# 1. Clone and install
cd backend
npm install

# 2. Start PostgreSQL (Docker or local)
docker run -d --name postgres -e POSTGRES_PASSWORD=674 -e POSTGRES_DB=ecommerce -p 5432:5432 postgres:16

# 3. Configure .env (see below)

# 4. Run with auto-sync (TypeORM synchronize: true — tables created automatically)
npm run start:dev

# 5. Open API docs
open http://localhost:5000/api/docs
```

> **Warning**: `synchronize: true` in `typeorm.config.ts` auto-creates/alters tables. Disable in production and use migrations.

---

## Environment Variables

```env
PORT=5000

DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=674
DATABASE_NAME=ecommerce

JWT_SECRET=super-secret-jwt-key
JWT_REFRESH_SECRET=super-secret-refresh-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

FRONTEND_URL=http://localhost:3000

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

STRIPE_SECRET_KEY=your-stripe-secret
STRIPE_WEBHOOK_SECRET=your-webhook-secret
SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-store-password
BKASH_APP_KEY=your-app-key
BKASH_APP_SECRET=your-app-secret
NAGAD_MERCHANT_ID=your-merchant-id
NAGAD_MERCHANT_KEY=your-merchant-key

ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
ADMIN_NAME=Admin
```

---

## Database Schema & Relationships

### Entity Relationship Diagram

```
users ──┬── addresses      (1:N via userId)
         ├── orders         (1:N via userId)
         ├── reviews        (1:N via userId)
         ├── wishlist       (1:N via userId)
         └── cart           (1:N via userId)

categories ──┬── categories (self-ref: parentId → id, for nesting)
             └── products   (1:N via categoryId)

products ──┬── product_images (1:N via productId, cascade delete)
           ├── reviews        (1:N via productId, cascade delete)
           ├── order_items    (1:N via productId)
           ├── cart           (1:N via productId)
           └── wishlist       (1:N via productId)

orders ──┬── order_items  (1:N via orderId, cascade)
         └── payments     (1:1 via orderId)
```

### Tables Overview

| Table | Primary Columns | Relations |
|---|---|---|
| **users** | id, name, email, password, role, phone, avatar, isActive, refreshToken | → addresses, orders, reviews, wishlist, cart |
| **addresses** | id, type(shipping/billing), name, phone, street, city, state, zip, country, isDefault, userId | → users (M:1) |
| **categories** | id, name, slug(unique), description, image, isActive, parentId | self-ref parent/children, → products |
| **products** | id, name, slug(unique), description, price, discountPrice, stock, sku(unique), isActive, isFeatured, categoryId | → category (M:1), → product_images, reviews, order_items |
| **product_images** | id, url, publicId, isPrimary, productId | → products (M:1, cascade) |
| **orders** | id, orderNumber(unique), subtotal, shipping, discount, total, status, paymentStatus, userId, shippingAddress(jsonb), billingAddress, deliveryMethod, paymentMethod | → user (M:1), → order_items, → payment (1:1) |
| **order_items** | id, quantity, price, orderId, productId | → order (M:1, cascade), → product (M:1) |
| **payments** | id, amount, method(stripe/sslcommerz/bkash/nagad), status, transactionId, orderId | → order (1:1) |
| **reviews** | id, rating, comment, isApproved, userId, productId | → user (M:1), → product (M:1, cascade) |
| **cart** | id, quantity, userId, productId (unique pair) | → user (M:1), → product (M:1) |
| **wishlist** | id, userId, productId (unique pair) | → user (M:1), → product (M:1) |
| **coupons** | id, code(unique), type(percentage/fixed), value, minOrder, maxUses, usedCount, isActive, expiresAt | standalone |

---

## Authentication & Authorization Flow

```
┌──────────┐     POST /api/auth/register      ┌──────────┐
│          │──────────────────────────────────▶│          │
│  Client  │     POST /api/auth/login          │  NestJS  │
│          │◀─────────────────────────────────│  Server  │
│ (Browser)│     Sets cookies:                 │          │
│          │     - access_token (httpOnly, 15m)│          │
│          │     - refresh_token (httpOnly, 7d)│          │
└──────────┘                                   └──────────┘
```

### Token Strategy

1. **Register / Login** — server returns `accessToken` + `refreshToken` as **httpOnly cookies** + user object in body.
2. **Access Token** (JWT, 15 min) — auto-sent via cookie on every request. Validated globally by `JwtAuthGuard`.
3. **Refresh Token** (JWT, 7 days) — used at `POST /api/auth/refresh` to get new tokens. Stored hashed in `users.refreshToken` for rotation.
4. **Logout** — clears cookies + nullifies `refreshToken` in DB.

### Guards (applied globally)

| Guard | Decorator to bypass | Effect |
|---|---|---|
| `JwtAuthGuard` (global) | `@Public()` | Requires valid JWT unless marked public |
| `RolesGuard` (global) | `@Roles(UserRole.ADMIN)` | Restricts to specific roles |

### Role System

| Role | Enum Value | Access |
|---|---|---|
| Customer | `customer` (default) | Own profile, cart, orders, reviews, wishlist |
| Admin | `admin` | All admin endpoints: manage products, categories, users, orders, coupons, dashboard |

### Auth DTOs

| DTO | Fields | Description |
|---|---|---|
| `RegisterDto` | name, email, password, phone? | User registration |
| `LoginDto` | email, password | User login |
| `ForgotPasswordDto` | email | Request password reset |
| `ResetPasswordDto` | token, password | Reset password with token |
| `VerifyEmailDto` | token | Verify email address |
| `UpdateProfileDto` | name?, phone?, avatar? | Update own profile |

---

## API Reference

All endpoints are prefixed with `/api`. Example: `POST /api/auth/login`.

### 1. Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user (sets cookies) |
| POST | `/api/auth/login` | Public | Login (sets cookies) |
| POST | `/api/auth/refresh` | Public | Refresh tokens (reads cookie) |
| POST | `/api/auth/logout` | Bearer | Logout, clear cookies |
| POST | `/api/auth/forgot-password` | Public | Request password reset |
| POST | `/api/auth/reset-password` | Public | Reset password |
| POST | `/api/auth/verify-email` | Public | Verify email |
| GET | `/api/auth/profile` | Bearer | Get current user profile |
| PATCH | `/api/auth/profile` | Bearer | Update current user profile |

### 2. Users (Admin)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/users` | Admin | List all users (paginated) |
| GET | `/api/users/stats` | Admin | User statistics |
| GET | `/api/users/:id` | Admin | Get user by ID |
| PATCH | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |

### 3. Categories

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/categories` | Public | All categories |
| GET | `/api/categories/dropdown` | Public | Category dropdown (id, name, slug) |
| GET | `/api/categories/nested` | Public | Hierarchical nested categories |
| GET | `/api/categories/:id` | Public | By ID |
| GET | `/api/categories/slug/:slug` | Public | By slug |
| POST | `/api/categories` | Admin | Create category |
| PATCH | `/api/categories/:id` | Admin | Update category |
| DELETE | `/api/categories/:id` | Admin | Delete (fails if has children) |
| PATCH | `/api/categories/:id/banner` | Admin | Update banner image |

### 4. Products

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/products` | Public | Published products (paginated, filterable) |
| GET | `/api/products/featured` | Public | Featured products (max 8) |
| GET | `/api/products/:id` | Public | By ID |
| GET | `/api/products/slug/:slug` | Public | By slug |
| POST | `/api/products` | Admin | Create product |
| PATCH | `/api/products/:id` | Admin | Update product |
| DELETE | `/api/products/:id` | Admin | Delete product |
| PATCH | `/api/products/:id/toggle-active` | Admin | Toggle active status |
| POST | `/api/products/:id/images` | Admin | Upload images (multipart, max 10) |
| DELETE | `/api/products/images/:imageId` | Admin | Delete image |
| PATCH | `/api/products/:id/images/:imageId/primary` | Admin | Set primary image |

**Product Query Parameters** (`GET /api/products`):

| Param | Type | Description |
|---|---|---|
| search | string | Search by product name (LIKE) |
| categoryId | string | Filter by category |
| minPrice | number | Minimum price |
| maxPrice | number | Maximum price |
| isFeatured | boolean | Featured filter |
| sort | string | e.g. `price:ASC`, `createdAt:DESC` |
| page | number | Default 1 |
| limit | number | Default 10, max 100 |

### 5. Cart

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/cart` | Bearer | Get user's cart (with subtotal) |
| POST | `/api/cart` | Bearer | Add item (productId, quantity) |
| PATCH | `/api/cart/:productId` | Bearer | Update quantity |
| DELETE | `/api/cart/:productId` | Bearer | Remove item |
| DELETE | `/api/cart` | Bearer | Clear cart |
| POST | `/api/cart/apply-coupon` | Bearer | Apply coupon code |

### 6. Orders

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | Bearer | Place order (from cart items) |
| GET | `/api/orders/my-orders` | Bearer | Current user's orders |
| GET | `/api/orders` | Admin | All orders (paginated, filterable by status) |
| GET | `/api/orders/stats` | Admin | Order statistics |
| GET | `/api/orders/:id` | Bearer | Order by ID |
| PATCH | `/api/orders/:id/status` | Admin | Update order status |
| PATCH | `/api/orders/:id/cancel` | Bearer | Cancel own order (if pending/confirmed) |

**Order creation flow:**
1. Validates each product exists, is active, and has sufficient stock
2. Deducts stock from each product
3. Validates coupon if provided (expiry, usage limits, min order)
4. Creates `Order` with generated order number (`ORD-{timestamp}-{random}`)
5. Creates `OrderItem` records
6. Clears the user's cart

### 7. Payments

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/payments/:orderId` | Bearer | Create & initiate payment |
| POST | `/api/payments/:paymentId/confirm` | Bearer | Confirm payment manually |
| GET | `/api/payments/order/:orderId` | Bearer | Get payment by order |
| POST | `/api/payments/stripe/webhook` | Public | Stripe webhook |
| POST | `/api/payments/sslcommerz/success` | Public | SSLCommerz callback |
| POST | `/api/payments/bkash/webhook` | Public | bKash webhook |
| POST | `/api/payments/nagad/webhook` | Public | Nagad webhook |

Supported payment methods: `stripe`, `sslcommerz`, `bkash`, `nagad`.

### 8. Reviews

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/reviews/product/:productId` | Public | Product reviews (approved only) |
| GET | `/api/reviews` | Admin | All reviews |
| POST | `/api/reviews` | Bearer | Create review (one per user/product) |
| PATCH | `/api/reviews/:id` | Bearer | Update own review |
| DELETE | `/api/reviews/:id` | Bearer | Delete own review |
| PATCH | `/api/reviews/:id/approve` | Admin | Approve review |
| PATCH | `/api/reviews/:id/hide` | Admin | Hide review |

### 9. Coupons

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/coupons` | Admin | All coupons |
| GET | `/api/coupons/:id` | Admin | By ID |
| GET | `/api/coupons/code/:code` | Public | By code |
| POST | `/api/coupons` | Admin | Create coupon |
| PATCH | `/api/coupons/:id` | Admin | Update coupon |
| DELETE | `/api/coupons/:id` | Admin | Delete coupon |
| POST | `/api/coupons/validate` | Public | Validate coupon against order total |

Coupon types: `percentage` (discount %), `fixed` (flat amount).

### 10. Wishlist

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/wishlist` | Bearer | User's wishlist |
| POST | `/api/wishlist/:productId` | Bearer | Add product |
| DELETE | `/api/wishlist/:productId` | Bearer | Remove product |

### 11. Upload

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/upload/single` | Admin | Upload single image |
| POST | `/api/upload/multiple` | Admin | Upload up to 10 images |
| DELETE | `/api/upload` | Admin | Delete image by publicId |

Files saved to `./uploads/` directory, served statically at `/uploads/{filename}`.

### 12. Dashboard (Admin)

| Method | Path | Description |
|---|---|---|
| GET | `/api/dashboard/stats` | Revenue, orders, customers, products, low-stock counts |
| GET | `/api/dashboard/monthly-sales/:year` | Monthly revenue breakdown |
| GET | `/api/dashboard/best-selling` | Top 5 best-selling products |
| GET | `/api/dashboard/recent-orders` | Last 5 orders |
| GET | `/api/dashboard/top-customers` | Top 5 customers by spend |
| GET | `/api/dashboard/revenue-overview` | Today, this week, this month revenue |

---

## Global Response Format

### Success (TransformInterceptor)

```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2026-06-30T12:00:00.000Z"
}
```

### Paginated Success

```json
{
  "success": true,
  "data": {
    "data": [ ... ],
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  },
  "timestamp": "2026-06-30T12:00:00.000Z"
}
```

### Error (HttpExceptionFilter)

```json
{
  "statusCode": 404,
  "message": "Product not found",
  "timestamp": "2026-06-30T12:00:00.000Z",
  "path": "/api/products/some-id"
}
```

---

## Error Handling

| Status | When |
|---|---|
| `400 Bad Request` | Validation errors, insufficient stock, expired coupon, invalid reset token |
| `401 Unauthorized` | Missing/invalid JWT, inactive account, wrong credentials |
| `403 Forbidden` | No role permission, not own resource |
| `404 Not Found` | Entity not found by ID/slug |
| `409 Conflict` | Duplicate slug/SKU/email/code, category has children, already in wishlist, duplicate review |

---

## Order Lifecycle

```
Pending ──▶ Confirmed ──▶ Processing ──▶ Packed ──▶ Shipped ──▶ Delivered
   │                                                               │
   └── Cancelled ◀─────────────────────────────────────────────────┘
        (by user if PENDING or CONFIRMED only)
        (by admin any time — restores stock)
```

- **Order placed** → status `PENDING`, stock deducted
- **Payment confirmed** → status `CONFIRMED`, paymentStatus `PAID`
- **Cancelled** → stock restored via `restockOrderItems()`
- **Delivered** → revenue counted in dashboard stats

---

## Payment Flow

```
1. User places order → Order created (PENDING)
2. User calls POST /api/payments/:orderId with method
3. Server creates Payment record, initiates gateway:
   - Stripe: creates Checkout Session → returns URL
   - SSLCommerz: calls gateway API → returns GatewayPageURL
   - bKash: gets token → returns token for frontend
   - Nagad: calls initialize API → returns callback URL
4. User completes payment on gateway page
5. Gateway calls webhook/callback → confirmPayment()
   - Sets Payment status = COMPLETED
   - Updates Order: paymentStatus = PAID, status = CONFIRMED
6. Fallback: Admin can call POST /api/payments/:id/confirm manually
```

---

## Admin Seeding

On first startup, the `SeedService` (registered via `OnApplicationBootstrap`) creates an admin user:

| Field | Default Value |
|---|---|
| Email | `admin@example.com` (configurable via `ADMIN_EMAIL`) |
| Password | `admin123` (configurable via `ADMIN_PASSWORD`) |
| Name | `Admin` (configurable via `ADMIN_NAME`) |

Skips if admin email already exists.

---

## Project Structure

```
src/
├── main.ts                     # Bootstrap, middleware, Swagger, CORS
├── app.module.ts               # Root module (imports all features)
├── auth/                       # Register, login, refresh, profile, password reset
├── users/                      # Admin user management
├── categories/                 # Category CRUD + nested + dropdown
├── products/                   # Product CRUD, query, images, slug lookup
├── cart/                       # Cart CRUD, coupon application
├── orders/                     # Order creation, listing, status updates, cancel
├── payments/                   # Multi-gateway payment initiation + webhooks
├── reviews/                    # Review CRUD, admin approve/hide
├── coupons/                    # Coupon CRUD, validation
├── wishlist/                   # Wishlist add/remove/list
├── upload/                     # Single/multiple file upload + delete
├── dashboard/                  # Admin dashboard stats
├── entities/                   # All TypeORM entity definitions (12 entities)
├── common/                     # Global guards, interceptors, filters, decorators, pipes
│   ├── guards/                 # JwtAuthGuard, RolesGuard, JwtRefreshGuard
│   ├── interceptors/           # TransformInterceptor
│   ├── filters/                # HttpExceptionFilter
│   ├── decorators/             # @Public, @Roles, @CurrentUser
│   ├── pipes/                  # ValidationPipe
│   └── dto/                    # PaginationDto
├── config/                     # App and TypeORM config
└── database/                   # SeedService (auto-creates admin)
```
