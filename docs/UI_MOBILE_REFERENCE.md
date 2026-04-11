# NelloreRuchullu UI & Mobile Reference

> Structural overview of all web frontend pages and mobile app screens.

---

## Table of Contents

- [Web Frontend (`web/`)](#web-frontend-web)
  - [Pages & Routes](#pages--routes)
  - [Navigation](#navigation)
  - [Key Components](#key-components)
  - [Hooks & State](#hooks--state)
- [Mobile App (`NelloreRuchullu/`)](#mobile-app-nelloreruchullu)
  - [Screen Structure](#screen-structure)
  - [Tab Navigation](#tab-navigation)
  - [Components](#components)
  - [State & Data](#state--data)

---

# Web Frontend (`web/`)

**Framework:** Next.js 15 + React + TypeScript
**Styling:** TailwindCSS
**State:** Zustand
**Base URL:** `http://localhost:3000`

---

## Pages & Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/app/page.tsx` | Landing page — hero banner, category grid, popular items, about section |
| `/menu` | `src/app/menu/page.tsx` | Menu listing with filters (category, veg/non-veg, search, price range) |
| `/menu/[id]` | `src/app/menu/[id]/page.tsx` | Single menu item detail with add-to-cart |
| `/cart` | `src/app/cart/page.tsx` | Cart with promo code, bill summary, checkout button |
| `/checkout` | `src/app/checkout/page.tsx` | Checkout — address selection, payment method (COD/Razorpay), order summary |
| `/checkout/success` | `src/app/checkout/success/page.tsx` | Order confirmation after successful payment |
| `/orders` | `src/app/orders/page.tsx` | User's order history (paginated) |
| `/orders/[id]` | `src/app/orders/[id]/page.tsx` | Order detail with status tracking |
| `/auth/login` | `src/app/auth/login/page.tsx` | Login (email+password or OTP modes) |
| `/auth/register` | `src/app/auth/register/page.tsx` | Registration with name, email, phone, password |
| `/dashboard` | `src/app/dashboard/page.tsx` | Admin dashboard — stats cards, charts, recent orders |
| `/dashboard/menu` | `src/app/dashboard/menu/page.tsx` | Admin menu management — add/edit/delete items |
| `/dashboard/users` | `src/app/dashboard/users/page.tsx` | Admin user management — view users, change roles |

---

## Navigation

**Root layout** (`src/app/layout.tsx`): Wraps all pages with `Header` + `Footer` + `ErrorBoundary`

**Header** (`src/components/Header.tsx`):
- Sticky top navigation bar
- Logo (left) → Nav links (center) → Auth controls + Cart icon (right)
- Mobile: hamburger menu with slide-in drawer
- Cart icon shows badge with item count

**Footer** (`src/components/Footer.tsx`):
- Static footer: quick links, support info, contact, copyright

---

## Key Components

| Component | File | Purpose |
|----------|------|---------|
| `Header` | `src/components/Header.tsx` | Top nav bar with logo, links, cart badge, auth controls |
| `Footer` | `src/components/Footer.tsx` | Static page footer |
| `ErrorBoundary` | `src/components/ErrorBoundary.tsx` | Global error wrapper for React errors |
| `SkeletonLoader` | `src/components/SkeletonLoader.tsx` | Loading skeleton for async content |
| `MenuPageContent` | `src/app/menu/MenuPageContent.tsx` | Shared menu listing used by `/menu` |
| `CartPageContent` | `src/app/cart/CartPageContent.tsx` | Cart contents with promo code support |
| `CheckoutPageContent` | `src/app/checkout/CheckoutPageContent.tsx` | Full checkout flow |
| `SuccessPageContent` | `src/app/checkout/success/SuccessPageContent.tsx` | Order confirmation |

---

## Hooks & State

| Hook | File | Purpose |
|------|------|---------|
| `useAuth` | `src/hooks/useAuth.ts` | Auth state (login, logout, register, token checks) |
| `useCart` | `src/hooks/useCart.ts` | Cart operations (add, update, remove, clear) |
| `useApi` | `src/hooks/useApi.ts` | Typed API call wrapper with error handling |
| `useWebSocket` | `src/hooks/useWebSocket.ts` | WebSocket for real-time order updates |

**Zustand Store** (`src/lib/store.ts`):
- `authStore` — user info, token, login/logout actions
- `cartStore` — cart items, total, item count

**API Client** (`src/lib/api.ts`): `apiFetch<T>()` with auth injection, retry, 401 redirect

**Auth helpers** (`src/lib/auth.ts`): `saveAuth`, `getToken`, `getUser`, `isLoggedIn`, `isAdmin`, `clearAuth`

**Types** (`src/types/index.ts`): `User`, `MenuItem`, `CartItem`, `Order`, `OrderStatus`, `ApiResponse<T>`, etc.

---

# Mobile App (`NelloreRuchullu/`)

**Framework:** Expo SDK 51 + React Native 0.74.5
**Routing:** `expo-router` (file-based)
**State:** Zustand
**Styling:** NativeWind (TailwindCSS for RN)
**API Base:** `http://localhost:8000/api/v1`

---

## Screen Structure

### Pre-Auth Screens (Stack)

| Screen | File | Purpose |
|--------|------|---------|
| Splash | `app/splash.tsx` | App launch splash screen |
| Onboarding | `app/onboarding.tsx` | First-time user onboarding (3 slides) |
| Login | `app/login.tsx` | Email/password or OTP login |
| Register | `app/register.tsx` | User registration |

### Authenticated Screens (Tab Navigator)

See [Tab Navigation](#tab-navigation) below.

### Post-Auth Stack Screens

| Screen | File | Purpose |
|--------|------|---------|
| Restaurant Detail | `app/restaurant/[id].tsx` | Restaurant menu with items, add-to-cart |
| Checkout | `app/checkout.tsx` | Delivery address, payment method, place order |
| Order Tracking | `app/track/[id].tsx` | Real-time order status (WebSocket) |
| Notifications | `app/notifications.tsx` | Push notification history |

---

## Tab Navigation

**Layout file:** `app/(tabs)/_layout.tsx`
**Type:** Bottom tab bar with 5 tabs

| Tab | Icon | Screen | File | Purpose |
|-----|------|--------|------|---------|
| Home | 🏠 | Home | `app/(tabs)/index.tsx` | Offers carousel, categories, Nellore specials, restaurant list |
| Search | 🔍 | Search | `app/(tabs)/search.tsx` | Search restaurants and dishes |
| Cart | 🛒 | Cart | `app/(tabs)/cart.tsx` | Cart items, promo code, bill summary, checkout |
| Orders | 📋 | Orders | `app/(tabs)/orders.tsx` | Order history and tracking |
| Profile | 👤 | Profile | `app/(tabs)/profile.tsx` | User profile, language toggle, logout |

---

## Components

**File:** `src/components/index.tsx`

| Component | Description |
|-----------|-------------|
| `Badge` | Colored label (e.g., veg/non-veg badge, offer tags) |
| `Button` | Primary/secondary/ghost/outline variants |
| `FoodCard` | Menu item card — image, name, veg badge, price, add button |
| `RestaurantCard` | Restaurant card — image, rating, delivery time, offer |
| `OfferCard` | Gradient promo card with title, description, code |
| `CartItemComponent` | Cart item with quantity +/- controls |
| `SearchBar` | Text input with search icon |
| `CategoryChip` | Selectable category pill (emoji + label) |
| `QuantitySelector` | +/- quantity stepper |
| `EmptyState` | Empty state — emoji, title, subtitle, action button |
| `Skeleton` | Loading placeholder animation |
| `SectionHeader` | Section title with optional "See All" link |

**Theme** (`src/theme/index.ts`): Colors, spacing, typography constants.

---

## State & Data

| File | Purpose |
|------|---------|
| `src/store/index.ts` | Zustand stores: `useCartStore`, `useUserStore`, `useOrderStore` |
| `src/lib/api.ts` | API client: `authApi`, `menuApi`, `orderApi`, `cartApi`, `addressApi`, `couponApi`, `deliveryApi`, `restaurantApi`, `notificationApi` |
| `src/hooks/useApi.ts` | API call hook for orders, addresses, coupons |
| `src/hooks/useMealDB.ts` | MealDB API integration (live dish data) |
| `src/data/mockData.ts` | Mock restaurants, categories, popular items, translations |
| `src/utils/index.ts` | Utility functions |

---

## API Integration (Mobile)

The mobile app connects to the backend via `src/lib/api.ts`:

```typescript
apiFetch(endpoint, { token, method, body, params })
```

Key API modules:
- `authApi` — login, register, OTP
- `menuApi` — get restaurants, get menu items
- `orderApi` — create, list, get, cancel
- `cartApi` — get, add items, update, remove
- `addressApi` — CRUD for addresses
- `couponApi` — validate, apply
- `deliveryApi` — track order

**Mobile environment variable:**
```
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
```

**Note:** For production, update `NelloreRuchullu/.env` with:
```
EXPO_PUBLIC_API_URL=https://your-api-domain.com/api/v1
```

---

## Localization

The mobile app supports **English** and **Telugu** languages.

Translations are stored in `src/data/mockData.ts` under the `translations` object.

Language toggle is available on the **Profile** tab screen.

---

## Web Frontend vs Mobile App Comparison

| Feature | Web | Mobile |
|---------|-----|--------|
| Framework | Next.js 15 | Expo SDK 51 |
| Routing | Pages Router | expo-router (file-based) |
| Auth flow | Email + Password, OTP | Email + Password, OTP |
| Cart | Persistent (localStorage) | Persistent (Zustand + AsyncStorage) |
| Payments | Razorpay (online), COD | Razorpay (online), COD |
| Order tracking | WebSocket | WebSocket |
| Admin panel | Yes (web only) | No |
| Language toggle | No | English / Telugu |
| Navigation | Header + Footer | Bottom tabs + Stack |

---

*Generated from source files at `web/src/` and `NelloreRuchullu/src/`.*
