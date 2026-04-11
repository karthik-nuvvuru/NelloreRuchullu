# NelloreRuchullu API Reference

> Complete API documentation for the NelloreRuchullu backend. Base URL: `/api/v1`

**Swagger UI:** `http://localhost:8000/docs`
**ReDoc:** `http://localhost:8000/redoc`
**Health Check:** `GET /health`

---

## Table of Contents

- [Authentication (`/api/v1/auth`)](#authentication-apiv1auth)
- [Users (`/api/v1/users`)](#users-apiv1users)
- [Menu (`/api/v1/menu`)](#menu-apiv1menu)
- [Cart (`/api/v1/cart`)](#cart-apiv1cart)
- [Orders (`/api/v1/orders`)](#orders-apiv1orders)
- [Payments (`/api/v1/payments`)](#payments-apiv1payments)
- [Coupons (`/api/v1/coupons`)](#coupons-apiv1coupons)
- [Reviews (`/api/v1/reviews`)](#reviews-apiv1reviews)
- [Delivery (`/api/v1/delivery`)](#delivery-apiv1delivery)
- [Analytics (`/api/v1/analytics`)](#analytics-apiv1analytics)
- [Uploads (`/api/v1/uploads`)](#uploads-apiv1uploads)
- [WebSocket (`/api/v1/ws`)](#websocket-apiv1ws)

---

## Authentication (`/api/v1/auth`)

All auth endpoints are public (no JWT required) unless noted.

### `POST /auth/register` — Register a new user

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+919988776655"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Valid email address |
| `password` | string | Yes | 8–128 characters |
| `first_name` | string | Yes | First name |
| `last_name` | string | Yes | Last name |
| `phone` | string | No | Phone number |

**Response `201`:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "phone": "+919988776655",
  "first_name": "John",
  "last_name": "Doe",
  "role": "customer",
  "access_token": "jwt-token",
  "refresh_token": "refresh-token",
  "token_type": "Bearer",
  "expires_in": 900
}
```

---

### `POST /auth/login` — Login with email/phone + password

**Request:**
```json
{
  "email_or_phone": "user@example.com",
  "password": "SecurePass123"
}
```

**Response `200`:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "phone": "+919988776655",
  "first_name": "John",
  "last_name": "Doe",
  "role": "customer",
  "access_token": "jwt-token",
  "refresh_token": "refresh-token",
  "token_type": "Bearer",
  "expires_in": 900
}
```

---

### `POST /auth/otp/send` — Send OTP to phone

**Request:**
```json
{
  "phone": "+919988776655"
}
```

**Response `200`:**
```json
{
  "message": "OTP sent successfully",
  "expires_at": "2026-04-11T12:00:00Z"
}
```

---

### `POST /auth/otp/verify` — Verify OTP and login

**Request:**
```json
{
  "phone": "+919988776655",
  "code": "123456"
}
```

**Response `200`:**
```json
{
  "user_id": "uuid",
  "email": null,
  "phone": "+919988776655",
  "first_name": "John",
  "last_name": "Doe",
  "role": "customer",
  "access_token": "jwt-token",
  "refresh_token": "refresh-token",
  "token_type": "Bearer",
  "expires_in": 900
}
```

---

### `POST /auth/refresh` — Refresh access token

**Request:**
```json
{
  "refresh_token": "refresh-token-string"
}
```

**Response `200`:**
```json
{
  "access_token": "new-jwt-token",
  "refresh_token": "new-refresh-token",
  "token_type": "Bearer",
  "expires_in": 900
}
```

---

### `POST /auth/logout` — Logout (invalidate refresh token)

**Auth:** Required (Bearer JWT)

**Request:**
```json
{
  "refresh_token": "refresh-token-string"
}
```

**Response `200`:**
```json
{
  "message": "Logged out successfully"
}
```

---

### `POST /auth/password/reset` — Change password

**Auth:** Required (Bearer JWT)

**Request:**
```json
{
  "old_password": "OldPass123",
  "new_password": "NewPass456"
}
```

**Response `200`:**
```json
{
  "message": "Password changed successfully"
}
```

---

## Users (`/api/v1/users`)

### `GET /users/me` — Get current user profile

**Auth:** Required (Bearer JWT)

**Response `200`:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "phone": "+919988776655",
  "first_name": "John",
  "last_name": "Doe",
  "full_name": "John Doe",
  "role": "customer",
  "status": "active",
  "avatar_url": "https://...",
  "is_verified": true,
  "created_at": "2026-04-11T12:00:00Z"
}
```

---

### `PUT /users/me` — Update current user profile

**Auth:** Required (Bearer JWT)

**Request:**
```json
{
  "first_name": "Jane",
  "last_name": "Doe",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

All fields optional. At least one must be provided.

**Response `200`:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "phone": "+919988776655",
  "first_name": "Jane",
  "last_name": "Doe",
  "full_name": "Jane Doe",
  "role": "customer",
  "status": "active",
  "avatar_url": "https://example.com/avatar.jpg",
  "is_verified": true,
  "created_at": "2026-04-11T12:00:00Z"
}
```

---

### `GET /users/addresses` — List user's addresses

**Auth:** Required (Bearer JWT)

**Response `200`:**
```json
{
  "addresses": [
    {
      "id": "uuid",
      "address_line1": "123 Main St",
      "address_line2": "Apt 4B",
      "city": "Nellore",
      "state": "Andhra Pradesh",
      "country": "India",
      "pincode": "524001",
      "landmark": "Near Bus Stand",
      "latitude": 14.4239,
      "longitude": 79.9403,
      "address_type": "home",
      "is_default": true,
      "created_at": "2026-04-11T12:00:00Z"
    }
  ]
}
```

---

### `POST /users/addresses` — Create a new address

**Auth:** Required (Bearer JWT)

**Request:**
```json
{
  "address_line1": "456 Food Street",
  "address_line2": "Floor 2",
  "city": "Nellore",
  "state": "Andhra Pradesh",
  "country": "India",
  "pincode": "524001",
  "landmark": "Near Temple",
  "latitude": 14.4239,
  "longitude": 79.9403,
  "address_type": "work",
  "is_default": false
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `address_line1` | string | Yes | Street address |
| `city` | string | Yes | City name |
| `state` | string | Yes | State name |
| `country` | string | No | Default: `"India"` |
| `pincode` | string | Yes | 6-digit pincode |
| `address_type` | string | No | `home` \| `work` \| `other` |
| `is_default` | boolean | No | Default: `false` |
| `latitude` | float | No | GPS latitude |
| `longitude` | float | No | GPS longitude |

**Response `201`:**
```json
{
  "id": "uuid",
  "address_line1": "456 Food Street",
  "address_line2": "Floor 2",
  "city": "Nellore",
  "state": "Andhra Pradesh",
  "country": "India",
  "pincode": "524001",
  "landmark": "Near Temple",
  "latitude": 14.4239,
  "longitude": 79.9403,
  "address_type": "work",
  "is_default": false,
  "created_at": "2026-04-11T12:00:00Z"
}
```

---

### `PUT /users/addresses/{address_id}` — Update an address

**Auth:** Required (Bearer JWT)

Same fields as `POST /users/addresses`. All fields optional.

**Response `200`:**
```json
{
  "id": "uuid",
  "address_line1": "789 New Street",
  ...
}
```

---

### `DELETE /users/addresses/{address_id}` — Delete an address (soft delete)

**Auth:** Required (Bearer JWT)

**Response `200`:**
```json
{
  "message": "Address deleted successfully"
}
```

---

### `GET /users` — List all users (Admin only)

**Auth:** Required (Bearer JWT, role: `admin`)

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `per_page` | int | 20 | Items per page (max 100) |
| `role` | string | - | Filter by role |
| `status` | string | - | Filter by status |

**Response `200`:**
```json
{
  "users": [...],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

---

### `PUT /users/{user_id}/role` — Change a user's role (Admin only)

**Auth:** Required (Bearer JWT, role: `admin`)

**Request:**
```json
{
  "role": "vendor"
}
```

Valid roles: `admin`, `vendor`, `customer`, `delivery`

**Response `200`:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "vendor",
  "message": "User role updated successfully"
}
```

---

## Menu (`/api/v1/menu`)

### `GET /menu` — List menu items

**Auth:** None (public)

**Query Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `category_id` | UUID | Filter by category |
| `category_name` | string | Filter by category name |
| `search` | string | Search by name/description |
| `is_vegetarian` | boolean | Filter veg/non-veg |
| `min_price` | float | Minimum price filter |
| `max_price` | float | Maximum price filter |
| `page` | int | Page number (default: 1) |
| `per_page` | int | Items per page (default: 20, max: 100) |

**Response `200`:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Chicken 65",
      "description": "Spicy deep-fried chicken",
      "price": "249.00",
      "category_id": "uuid",
      "image_url": "https://images.unsplash.com/...",
      "is_vegetarian": false,
      "is_available": true,
      "stock": null,
      "preparation_time_minutes": 20,
      "category": {
        "id": "uuid",
        "name": "Starters",
        "description": "Appetizers and starters",
        "image_url": "https://images.unsplash.com/...",
        "sort_order": 1,
        "is_active": true,
        "created_at": "2026-04-11T12:00:00Z"
      },
      "created_at": "2026-04-11T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 24,
    "total_pages": 2
  }
}
```

---

### `GET /menu/categories` — List all categories

**Auth:** None (public)

**Response `200`:**
```json
{
  "categories": [
    {
      "id": "uuid",
      "name": "Starters",
      "description": "Appetizers and starters",
      "image_url": "https://images.unsplash.com/...",
      "sort_order": 1,
      "is_active": true,
      "created_at": "2026-04-11T12:00:00Z"
    }
  ]
}
```

---

### `GET /menu/{item_id}` — Get single menu item

**Auth:** None (public)

**Response `200`:** Single `MenuItemResponse` object (same as in list)

**Response `404`:**
```json
{
  "detail": "Menu item not found"
}
```

---

### `POST /menu` — Create menu item (Admin/Vendor)

**Auth:** Required (Bearer JWT, role: `admin` or `vendor`)

**Request:**
```json
{
  "name": "Prawn Masala",
  "description": "Spicy prawn curry",
  "price": "399.00",
  "category_id": "uuid",
  "image_url": "https://images.unsplash.com/...",
  "is_vegetarian": false,
  "is_available": true,
  "stock": 50,
  "preparation_time_minutes": 30
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Item name (max 200 chars) |
| `price` | decimal | Yes | Price (> 0) |
| `description` | string | No | Description (max 1000 chars) |
| `category_id` | UUID | No | Category reference |
| `image_url` | string | No | Image URL (max 500 chars) |
| `is_vegetarian` | boolean | No | Default: `false` |
| `is_available` | boolean | No | Default: `true` |
| `stock` | int | No | Stock quantity |
| `preparation_time_minutes` | int | No | Prep time in minutes |

**Response `201`:**
```json
{
  "id": "uuid",
  "name": "Prawn Masala",
  ...
}
```

---

### `PUT /menu/{item_id}` — Update menu item (Admin/Vendor)

**Auth:** Required (Bearer JWT, role: `admin` or `vendor`)

All fields from `POST /menu` are optional.

**Response `200`:**
```json
{
  "id": "uuid",
  "name": "Updated Item Name",
  ...
}
```

---

### `DELETE /menu/{item_id}` — Delete menu item (Admin only)

**Auth:** Required (Bearer JWT, role: `admin`)

Soft-delete: sets `is_deleted: true`

**Response `200`:**
```json
{
  "message": "Menu item deleted successfully"
}
```

---

### `POST /menu/categories` — Create category (Admin only)

**Auth:** Required (Bearer JWT, role: `admin`)

**Request:**
```json
{
  "name": "Desserts",
  "description": "Sweet endings",
  "image_url": "https://images.unsplash.com/...",
  "sort_order": 5
}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "name": "Desserts",
  "description": "Sweet endings",
  "image_url": "https://images.unsplash.com/...",
  "sort_order": 5,
  "is_active": true,
  "created_at": "2026-04-11T12:00:00Z"
}
```

---

### `PUT /menu/categories/{cat_id}` — Update category (Admin only)

**Auth:** Required (Bearer JWT, role: `admin`)

All fields optional.

**Response `200`:**
```json
{
  "id": "uuid",
  "name": "Updated Category",
  ...
}
```

---

### `DELETE /menu/categories/{cat_id}` — Delete category (Admin only)

**Auth:** Required (Bearer JWT, role: `admin`)

**Response `200`:**
```json
{
  "message": "Category deleted successfully"
}
```

---

## Cart (`/api/v1/cart`)

### `GET /cart` — Get current user's cart

**Auth:** Required (Bearer JWT)

**Response `200`:**
```json
{
  "id": "uuid",
  "items": [
    {
      "id": "uuid",
      "menu_item_id": "uuid",
      "name": "Chicken 65",
      "quantity": 2,
      "unit_price": "249.00",
      "total_price": "498.00",
      "special_instructions": "Extra spicy",
      "created_at": "2026-04-11T12:00:00Z"
    }
  ],
  "subtotal": "498.00",
  "tax": "44.82",
  "total": "542.82",
  "item_count": 2,
  "created_at": "2026-04-11T12:00:00Z"
}
```

---

### `POST /cart/items` — Add item to cart

**Auth:** Required (Bearer JWT)

**Request:**
```json
{
  "menu_item_id": "uuid",
  "quantity": 2,
  "special_instructions": "No onions"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `menu_item_id` | UUID | Yes | Menu item to add |
| `quantity` | int | No | Default: 1 (min: 1, max: 50) |
| `special_instructions` | string | No | Max 500 chars |

**Response `200`:**
```json
{
  "id": "uuid",
  "items": [...],
  "subtotal": "747.00",
  "tax": "67.23",
  "total": "814.23",
  "item_count": 3
}
```

---

### `PUT /cart/items/{item_id}` — Update cart item quantity

**Auth:** Required (Bearer JWT)

**Request:**
```json
{
  "quantity": 3
}
```

Set `quantity: 0` to remove the item.

**Response `200`:**
```json
{
  "id": "uuid",
  "items": [...],
  "subtotal": "747.00",
  ...
}
```

---

### `DELETE /cart/items/{item_id}` — Remove item from cart

**Auth:** Required (Bearer JWT)

**Response `200`:**
```json
{
  "message": "Item removed from cart"
}
```

---

### `DELETE /cart` — Clear entire cart

**Auth:** Required (Bearer JWT)

**Response `200`:**
```json
{
  "message": "Cart cleared successfully"
}
```

---

## Orders (`/api/v1/orders`)

### `POST /orders` — Create a new order

**Auth:** Required (Bearer JWT)

**Request:**
```json
{
  "address_id": "uuid",
  "payment_method": "online",
  "notes": "Leave at door",
  "coupon_code": "SAVE10"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `address_id` | UUID | Yes | Delivery address |
| `payment_method` | string | Yes | `online` or `cod` |
| `notes` | string | No | Special instructions |
| `coupon_code` | string | No | Coupon code to apply |

**Response `201`:**
```json
{
  "id": "uuid",
  "order_number": "NR-2026-00001",
  "status": "PENDING",
  "subtotal": "498.00",
  "tax": "44.82",
  "discount_amount": "49.80",
  "total_amount": "543.02",
  "delivery_fee": "50.00",
  "payment_method": "online",
  "coupon_code": "SAVE10",
  "items": [
    {
      "id": "uuid",
      "menu_item_id": "uuid",
      "name": "Chicken 65",
      "quantity": 2,
      "unit_price": "249.00",
      "total_price": "498.00"
    }
  ],
  "created_at": "2026-04-11T12:00:00Z"
}
```

---

### `GET /orders/my` — List current user's orders

**Auth:** Required (Bearer JWT)

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | int | 1 | Page number |
| `per_page` | int | 20 | Items per page |
| `status` | string | - | Filter by status |

**Response `200`:**
```json
{
  "orders": [
    {
      "id": "uuid",
      "order_number": "NR-2026-00001",
      "status": "PENDING",
      "total_amount": "543.02",
      "item_count": 2,
      "created_at": "2026-04-11T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 5,
    "total_pages": 1
  }
}
```

---

### `GET /orders` — List all orders (Admin/Vendor)

**Auth:** Required (Bearer JWT, role: `admin` or `vendor`)

Same query params as `/orders/my` plus `user_id` filter.

**Response `200`:**
```json
{
  "orders": [...],
  "pagination": {...}
}
```

---

### `GET /orders/{order_id}` — Get order details

**Auth:** Required (Bearer JWT, must be order owner or admin/vendor)

**Response `200`:**
```json
{
  "id": "uuid",
  "order_number": "NR-2026-00001",
  "status": "PREPARING",
  "subtotal": "498.00",
  "tax": "44.82",
  "discount_amount": "49.80",
  "total_amount": "543.02",
  "delivery_fee": "50.00",
  "delivery_address_id": "uuid",
  "delivery_partner_id": "uuid",
  "notes": "Leave at door",
  "coupon_code": "SAVE10",
  "items": [...],
  "created_at": "2026-04-11T12:00:00Z"
}
```

---

### `POST /orders/{order_id}/cancel` — Cancel an order

**Auth:** Required (Bearer JWT, must be order owner)

**Request:**
```json
{
  "reason": "Changed my mind"
}
```

**Response `200`:**
```json
{
  "id": "uuid",
  "order_number": "NR-2026-00001",
  "status": "CANCELLED",
  "cancelled_at": "2026-04-11T12:30:00Z",
  "cancelled_reason": "Changed my mind"
}
```

---

### `POST /orders/{order_id}/status` — Update order status (Admin/Vendor)

**Auth:** Required (Bearer JWT, role: `admin` or `vendor`)

**Request:**
```json
{
  "status": "CONFIRMED"
}
```

Valid statuses: `PENDING`, `CONFIRMED`, `PREPARING`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`

**Response `200`:**
```json
{
  "id": "uuid",
  "order_number": "NR-2026-00001",
  "status": "CONFIRMED",
  "message": "Order status updated"
}
```

---

## Payments (`/api/v1/payments`)

### `POST /payments/create` — Create a Razorpay payment order

**Auth:** Required (Bearer JWT)

**Request:**
```json
{
  "order_id": "uuid"
}
```

**Response `200`:**
```json
{
  "order_id": "uuid",
  "razorpay_order_id": "order_abc123",
  "amount": 54302,
  "currency": "INR",
  "receipt": "NR-2026-00001"
}
```

---

### `POST /payments/verify` — Verify payment signature

**Auth:** Required (Bearer JWT)

**Request:**
```json
{
  "order_id": "uuid",
  "razorpay_order_id": "order_abc123",
  "razorpay_payment_id": "pay_abc123",
  "razorpay_signature": "signature-string"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Payment verified successfully"
}
```

---

### `POST /payments/webhook` — Razorpay webhook (no auth)

**Note:** Uses `RAZORPAY_WEBHOOK_SECRET` for signature verification.

**Razorpay sends:** `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`

**Response `200`:**
```json
{
  "received": true
}
```

---

### `GET /payments/{order_id}` — Get payment for an order

**Auth:** Required (Bearer JWT)

**Response `200`:**
```json
{
  "id": "uuid",
  "order_id": "uuid",
  "user_id": "uuid",
  "amount": "543.02",
  "currency": "INR",
  "status": "SUCCEEDED",
  "payment_method": "online",
  "razorpay_order_id": "order_abc123",
  "razorpay_payment_id": "pay_abc123",
  "created_at": "2026-04-11T12:00:00Z"
}
```

---

## Coupons (`/api/v1/coupons`)

### `GET /coupons/validate/{code}` — Validate a coupon code

**Auth:** None (public)

**Response `200`:**
```json
{
  "valid": true,
  "message": "Coupon is valid",
  "code": "SAVE10",
  "discount_type": "PERCENTAGE",
  "discount_value": "10.00",
  "discounted_amount": "49.80"
}
```

**Invalid coupon `200`:**
```json
{
  "valid": false,
  "message": "Coupon has expired",
  "code": "EXPIRED",
  "discount_type": null,
  "discount_value": null,
  "discounted_amount": null
}
```

---

### `POST /coupons/apply/{code}` — Apply coupon to cart

**Auth:** Required (Bearer JWT)

Same response as `GET /coupons/validate/{code}`.

---

### `POST /coupons` — Create a coupon (Admin only)

**Auth:** Required (Bearer JWT, role: `admin`)

**Request:**
```json
{
  "code": "SAVE20",
  "description": "20% off on orders above 500",
  "discount_type": "PERCENTAGE",
  "discount_value": "20.00",
  "min_order_amount": "500.00",
  "max_discount": "100.00",
  "usage_limit": 100,
  "valid_from": "2026-04-01T00:00:00Z",
  "valid_until": "2026-04-30T23:59:59Z",
  "is_active": true
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | 3–50 chars, unique |
| `discount_type` | string | Yes | `PERCENTAGE` or `FIXED` |
| `discount_value` | decimal | Yes | Discount amount |
| `min_order_amount` | decimal | No | Default: 0 |
| `max_discount` | decimal | No | Cap for percentage discounts |
| `usage_limit` | int | No | Max total uses |
| `valid_from` | datetime | Yes | Start validity |
| `valid_until` | datetime | Yes | End validity |

**Response `201`:**
```json
{
  "id": "uuid",
  "code": "SAVE20",
  ...
}
```

---

### `GET /coupons` — List all coupons (Admin only)

**Auth:** Required (Bearer JWT, role: `admin`)

**Query Parameters:** `page`, `per_page`, `is_active`

**Response `200`:**
```json
{
  "coupons": [...],
  "pagination": {...}
}
```

---

### `PUT /coupons/{coupon_id}` — Update a coupon (Admin only)

**Auth:** Required (Bearer JWT, role: `admin`)

All fields from `POST /coupons` optional.

**Response `200`:**
```json
{
  "id": "uuid",
  "code": "SAVE20",
  ...
}
```

---

### `DELETE /coupons/{coupon_id}` — Delete a coupon (Admin only)

**Auth:** Required (Bearer JWT, role: `admin`)

**Response `200`:**
```json
{
  "message": "Coupon deleted successfully"
}
```

---

## Reviews (`/api/v1/reviews`)

### `POST /reviews` — Create a review

**Auth:** Required (Bearer JWT)

**Request:**
```json
{
  "order_id": "uuid",
  "menu_item_id": "uuid",
  "rating": 5,
  "comment": "Amazing taste, highly recommended!"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `order_id` | UUID | Yes | Order being reviewed |
| `menu_item_id` | UUID | No | Specific item being reviewed |
| `rating` | int | Yes | 1–5 stars |
| `comment` | string | No | Max 1000 chars |

**Response `201`:**
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "menu_item_id": "uuid",
  "order_id": "uuid",
  "rating": 5,
  "comment": "Amazing taste, highly recommended!",
  "user_name": "John D.",
  "created_at": "2026-04-11T12:00:00Z"
}
```

---

### `GET /reviews/item/{item_id}` — List reviews for a menu item

**Auth:** None (public)

**Query Parameters:** `page`, `per_page`

**Response `200`:**
```json
{
  "reviews": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "menu_item_id": "uuid",
      "order_id": "uuid",
      "rating": 5,
      "comment": "Amazing taste!",
      "user_name": "John D.",
      "created_at": "2026-04-11T12:00:00Z"
    }
  ],
  "pagination": {...},
  "average_rating": 4.5,
  "total_reviews": 12
}
```

---

### `GET /reviews/my` — List current user's reviews

**Auth:** Required (Bearer JWT)

**Response `200`:**
```json
{
  "reviews": [...]
}
```

---

## Delivery (`/api/v1/delivery`)

### `GET /delivery/track/{order_id}` — Track delivery for an order

**Auth:** Required (Bearer JWT)

**Response `200`:**
```json
{
  "id": "uuid",
  "order_id": "uuid",
  "delivery_partner_id": "uuid",
  "status": "IN_TRANSIT",
  "current_latitude": 14.4250,
  "current_longitude": 79.9410,
  "picked_up_at": "2026-04-11T12:30:00Z",
  "delivered_at": null,
  "estimated_time_minutes": 15,
  "created_at": "2026-04-11T12:00:00Z"
}
```

---

### `POST /delivery/assign/{order_id}` — Assign delivery partner

**Auth:** Required (Bearer JWT, role: `admin` or `vendor`)

**Request:**
```json
{
  "delivery_partner_id": "uuid"
}
```

**Response `200`:**
```json
{
  "id": "uuid",
  "order_id": "uuid",
  "delivery_partner_id": "uuid",
  "status": "ASSIGNED",
  "message": "Delivery partner assigned"
}
```

---

### `POST /delivery/{delivery_id}/status` — Update delivery status

**Auth:** Required (Bearer JWT, role: `admin`, `vendor`, or `delivery`)

**Request:**
```json
{
  "status": "PICKED_UP"
}
```

Valid statuses: `UNASSIGNED`, `ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`

**Response `200`:**
```json
{
  "id": "uuid",
  "status": "PICKED_UP",
  "picked_up_at": "2026-04-11T12:30:00Z"
}
```

---

### `GET /delivery/available` — List available delivery partners

**Auth:** Required (Bearer JWT, role: `admin` or `vendor`)

**Response `200`:**
```json
{
  "delivery_partners": [
    {
      "id": "uuid",
      "first_name": "Delivery",
      "last_name": "Partner 1",
      "phone": "+919988776658",
      "status": "active"
    }
  ]
}
```

---

## Analytics (`/api/v1/analytics`) — Admin Only

### `GET /analytics/overview` — Dashboard overview stats

**Auth:** Required (Bearer JWT, role: `admin`)

**Response `200`:**
```json
{
  "total_orders": 1234,
  "total_revenue": "₹1,23,456",
  "total_users": 567,
  "active_orders": 12,
  "pending_orders": 3,
  "completed_orders_today": 45,
  "revenue_today": "₹12,345"
}
```

---

### `GET /analytics/popular-items` — Top items by quantity ordered

**Auth:** Required (Bearer JWT, role: `admin`)

**Query Parameters:** `limit` (default: 10, max: 50)

**Response `200`:**
```json
{
  "items": [
    {
      "id": "uuid",
      "name": "Chicken 65",
      "category": "Starters",
      "quantity_ordered": 234,
      "revenue": "₹58,266"
    }
  ]
}
```

---

### `GET /analytics/order-volume` — Daily order count and revenue

**Auth:** Required (Bearer JWT, role: `admin`)

**Query Parameters:** `days` (default: 30, max: 365)

**Response `200`:**
```json
{
  "data": [
    {
      "date": "2026-04-11",
      "order_count": 45,
      "revenue": "₹12,345"
    }
  ]
}
```

---

## Uploads (`/api/v1/uploads`)

### `POST /uploads/image` — Upload an image

**Auth:** Required (Bearer JWT, role: `admin` or `vendor`)

**Request:** `multipart/form-data` with field `file`

**Constraints:**
- Max size: 5MB
- Allowed formats: `jpg`, `jpeg`, `png`, `gif`, `webp`

**Response `201`:**
```json
{
  "url": "/uploads/abc123.jpg",
  "filename": "abc123.jpg"
}
```

**Static files** are served at `/uploads/*` (configured in `main.py`).

---

## WebSocket (`/api/v1/ws`)

### `WS /ws/ws/orders/{order_id}` — Real-time order tracking

**Auth:** Query param `?token=<jwt>`

Connects to receive real-time order status updates.

**Client → Server:**
```json
{
  "type": "ping"
}
```

**Server → Client (order update):**
```json
{
  "type": "order_update",
  "order_id": "uuid",
  "status": "PREPARING",
  "timestamp": "2026-04-11T12:00:00Z",
  "message": "Your order is being prepared",
  "eta": 25
}
```

**Server → Client (pong):**
```json
{
  "type": "pong",
  "timestamp": "2026-04-11T12:00:00Z"
}
```

---

### `WS /ws/ws/admin/orders` — Kitchen monitoring feed (Admin/Vendor)

**Auth:** Query param `?token=<jwt>` (admin or vendor role)

Receives all order updates for kitchen monitoring.

---

## User Roles

| Role | Description |
|------|-------------|
| `admin` | Full system access, analytics, user management |
| `vendor` | Menu management, order processing |
| `delivery` | Delivery tracking, order pickup/delivery |
| `customer` | Browsing, ordering, profile management |

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

Common HTTP status codes:

| Code | Meaning |
|------|---------|
| `400` | Bad Request — invalid input data |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — insufficient permissions |
| `404` | Not Found — resource doesn't exist |
| `409` | Conflict — duplicate resource (e.g., existing email) |
| `422` | Unprocessable Entity — validation error |
| `500` | Internal Server Error |

---

## Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/auth/login` | 10 requests/hour |
| `/auth/otp/send` | 5 requests/hour |
| All other endpoints | 30 requests/minute |

---

*Generated from FastAPI routes at `backend/app/routes/` and schemas at `backend/app/schemas/`.*
