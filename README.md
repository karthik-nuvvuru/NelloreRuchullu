# NelloreRuchullu 🍛

A full-stack food delivery application featuring authentic Nellore-style Andhra cuisine.

**Live Demo:** https://nelloreruchullu.com

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                         NGINX (Port 80/443)                  │
│            Reverse Proxy + SSL Termination                  │
└───────────────────────┬──────────────────────┬──────────────┘
                        │                      │
                        ▼                      ▼
          ┌─────────────────────┐   ┌─────────────────────┐
          │  Next.js Web (3000) │   │  FastAPI Backend    │
          │  - React Frontend  │   │  (8000)             │
          │  - TailwindCSS     │   │  - REST API         │
          │  - Playwright E2E  │   │  - WebSocket        │
          └─────────────────────┘   └──────────┬──────────┘
                                                 │
                            ┌────────────────────┼────────────────────┐
                            ▼                    ▼                    ▼
                    ┌────────────┐     ┌────────────┐     ┌────────────┐
                    │ PostgreSQL │     │   Redis    │     │  Celery    │
                    │  (5432)    │     │  (6379)    │     │  Worker    │
                    └────────────┘     └────────────┘     └────────────┘
```

---

## Features

- **User Authentication** — Registration, login, OTP support, JWT refresh tokens
- **Menu Browsing** — Category filtering, vegetarian options, search, price range
- **Cart Management** — Add items, quantity adjustment, promo codes, persistent cart
- **Order Processing** — Checkout, Razorpay online payment, order tracking
- **Admin Dashboard** — Menu management, user management, analytics, order volume
- **Real-time Tracking** — WebSocket-based order status updates
- **Delivery Management** — Assign partners, track delivery status

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend API | FastAPI + Python 3.12 |
| Frontend | Next.js 15 + React 19 + TypeScript |
| Mobile App | Expo SDK 51 + React Native 0.74 |
| Database | PostgreSQL 16 (async SQLAlchemy 2.0) |
| Cache/Queue | Redis 7 + Celery |
| Styling | TailwindCSS (web), NativeWind (mobile) |
| Payments | Razorpay |
| SMS/OTP | Twilio |
| E-mail | SMTP (Gmail) |
| Testing | Playwright (E2E), Pytest (backend) |
| Containerization | Docker Compose |

---

## Project Structure

```
NelloreRuchullu/
├── backend/                    # FastAPI application
│   ├── app/
│   │   ├── routes/           # API endpoint definitions
│   │   │   ├── auth.py       # POST /auth/*
│   │   │   ├── users.py      # GET/PUT /users/*
│   │   │   ├── menu.py       # GET/POST /menu/*
│   │   │   ├── cart.py       # GET/POST/PUT/DELETE /cart/*
│   │   │   ├── orders.py     # GET/POST /orders/*
│   │   │   ├── payments.py   # POST /payments/*
│   │   │   ├── coupons.py    # GET/POST /coupons/*
│   │   │   ├── reviews.py    # GET/POST /reviews/*
│   │   │   ├── delivery.py   # GET/POST /delivery/*
│   │   │   ├── analytics.py  # GET /analytics/*
│   │   │   ├── ws.py         # WebSocket endpoints
│   │   │   └── upload.py     # Image upload
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Business logic layer
│   │   ├── core/             # Security (JWT), Redis, WebSocket manager
│   │   ├── main.py           # FastAPI app entry point
│   │   └── database.py        # Async SQLAlchemy engine
│   ├── alembic/              # Database migrations
│   │   └── versions/
│   │       └── 0001_initial_migration.py  # Creates all tables
│   ├── Dockerfile            # Production multi-stage build
│   ├── Dockerfile.dev      # Development with hot reload
│   ├── requirements.txt
│   └── pytest.ini
│
├── web/                      # Next.js frontend
│   ├── src/
│   │   ├── app/             # Pages (App Router)
│   │   │   ├── page.tsx              # Landing page
│   │   │   ├── layout.tsx            # Root layout (Header+Footer)
│   │   │   ├── menu/                 # Menu pages
│   │   │   ├── cart/                 # Cart page
│   │   │   ├── checkout/             # Checkout + success pages
│   │   │   ├── orders/               # Order history + detail
│   │   │   ├── auth/                 # Login + register
│   │   │   └── dashboard/            # Admin pages
│   │   ├── components/       # Header, Footer, ErrorBoundary, etc.
│   │   ├── hooks/            # useAuth, useCart, useApi, useWebSocket
│   │   ├── lib/              # apiFetch, auth helpers, Zustand store
│   │   └── types/            # TypeScript interfaces
│   ├── playwright.config.ts  # E2E test configuration
│   ├── Dockerfile           # Production multi-stage build
│   └── package.json
│
├── NelloreRuchullu/          # Expo mobile app
│   ├── app/                 # expo-router screens
│   │   ├── _layout.tsx              # Root navigator
│   │   ├── splash.tsx               # Splash screen
│   │   ├── onboarding.tsx           # Onboarding
│   │   ├── login.tsx                # Login
│   │   ├── register.tsx              # Register
│   │   ├── checkout.tsx             # Checkout
│   │   ├── notifications.tsx        # Notifications
│   │   ├── (tabs)/                  # Bottom tab navigator
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx             # Home tab
│   │   │   ├── search.tsx           # Search tab
│   │   │   ├── cart.tsx             # Cart tab
│   │   │   ├── orders.tsx           # Orders tab
│   │   │   └── profile.tsx          # Profile tab
│   │   ├── restaurant/[id].tsx      # Restaurant detail
│   │   └── track/[id].tsx           # Order tracking
│   ├── src/
│   │   ├── components/      # UI component library
│   │   ├── hooks/           # useApi, useMealDB
│   │   ├── lib/             # apiFetch client
│   │   ├── store/           # Zustand stores
│   │   ├── data/            # Mock data + translations
│   │   ├── theme/           # Theme constants
│   │   └── utils/           # Utilities
│   ├── playwright.config.ts  # Mobile E2E test config
│   └── package.json
│
├── docs/                    # Documentation
│   ├── API_REFERENCE.md     # Complete API documentation
│   └── UI_MOBILE_REFERENCE.md  # Web & mobile structure guide
│
├── infra/nginx/             # NGINX configuration
│   └── nginx.conf
│
├── docker-compose.yml       # Production compose
├── docker-compose.dev.yml   # Development compose
├── Dockerfile.e2e           # E2E test runner image
└── tsconfig.json            # Monorepo root (project references)
```

---

## Services & Ports

| Service | Container | Port | URL |
|---------|-----------|------|-----|
| Frontend | `nellore_frontend` | 3000 | http://localhost:3000 |
| Backend API | `nellore_backend` | 8000 | http://localhost:8000 |
| API Docs (Swagger) | `nellore_backend` | 8000 | http://localhost:8000/docs |
| ReDoc | `nellore_backend` | 8000 | http://localhost:8000/redoc |
| NGINX | `nellore_nginx` | 80 | http://localhost:80 |
| PostgreSQL | `nellore_postgres` | 5432 | localhost:5432 |
| Redis | `nellore_redis` | 6379 | localhost:6379 |

---

## Quick Start (Docker)

### 1. Clone

```bash
git clone https://github.com/your-org/NelloreRuchullu.git
cd NelloreRuchullu
```

### 2. Start the stack

```bash
docker compose up -d
```

Wait for services to be healthy:

```bash
docker compose ps
```

### 3. Verify

```bash
curl http://localhost:8000/health
# → {"status":"healthy","version":"1.0.0","environment":"production"}

curl http://localhost:3000
# → HTML page
```

### 4. Seed database (first time only)

```bash
docker compose exec backend python -m app.scripts.seed
```

Seed data includes: 5 users, 6 categories, 24 menu items.

### 5. Default credentials

| Email | Password | Role |
|-------|----------|------|
| `testuser@example.com` | `password123` | customer |
| `admin@example.com` | `password123` | admin |
| `vendor@example.com` | `password123` | vendor |

---

## Environment Variables

### Backend (`backend/.env`)

```bash
# Database
DATABASE_URL=postgresql+asyncpg://nelloreruchullu:nelloreruchullu_secret_2024@postgres:5432/nelloreruchullu

# Redis
REDIS_URL=redis://redis:6379/0

# Security
SECRET_KEY=change-this-in-production-use-openssl-rand-hex-32
ENVIRONMENT=production
DEBUG=false

# App
APP_NAME=NelloreRuchullu API
VERSION=1.0.0
API_PREFIX=/api/v1

# Razorpay (get from https://dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_XXXXXX
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxxxxxxxxxxxx

# Email (SMTP/Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=xxxxxxxxxxxxxxx

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxx
TWILIO_FROM_NUMBER=+91XXXXXXXXXX

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

### Web Frontend (`web/.env`)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1
NEXT_PUBLIC_CDN_URL=http://localhost:8000
NEXTAUTH_SECRET=change-this-use-openssl-rand-hex-32
NEXTAUTH_URL=http://localhost:3000
```

### Mobile App (`NelloreRuchullu/.env`)

```bash
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## Production Credentials Checklist

| Variable | Required | How to Get |
|----------|----------|-----------|
| `SECRET_KEY` | Yes | `openssl rand -hex 32` |
| `POSTGRES_PASSWORD` | Yes | Strong random password |
| `RAZORPAY_KEY_ID` | Yes (for payments) | Razorpay Dashboard |
| `RAZORPAY_KEY_SECRET` | Yes (for payments) | Razorpay Dashboard |
| `RAZORPAY_WEBHOOK_SECRET` | Yes (for webhooks) | Razorpay Dashboard → Webhooks |
| `SMTP_PASSWORD` | Yes (for emails) | Gmail App Password |
| `TWILIO_ACCOUNT_SID` | Yes (for SMS OTP) | Twilio Console |
| `TWILIO_AUTH_TOKEN` | Yes (for SMS OTP) | Twilio Console |
| `NEXTAUTH_SECRET` | Yes | `openssl rand -hex 32` |

---

## Local Development

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations + seed
alembic upgrade head
python -m app.scripts.seed

# Start with hot reload
uvicorn app.main:app --reload --port 8000
```

### Web Frontend

```bash
cd web
npm install
npm run dev
# → http://localhost:3000
```

### Mobile App

```bash
cd NelloreRuchullu
npm install
npx expo start
# → Press i for iOS simulator, a for Android, w for web
```

---

## Running Tests

### Backend Pytest

```bash
docker compose exec backend pytest tests/ -v

# Or locally:
cd backend && python -m pytest tests/ -v
```

### Web Playwright E2E Tests (in Docker)

```bash
docker compose run --rm playwright sh -c "cd web && npx playwright test tests/e2e/ --reporter=list"
```

### Mobile Playwright E2E Tests (from host)

```bash
cd NelloreRuchullu
DOCKER=1 npx playwright test --reporter=list
```

### Run a specific test file

```bash
docker compose run --rm playwright sh -c "cd web && npx playwright test tests/e2e/auth.spec.ts --reporter=list"
```

### View HTML test report

```bash
open web/tests/report/index.html
```

---

## Database Migrations

```bash
# Run migrations
docker compose exec backend alembic upgrade head

# Check current migration
docker compose exec backend alembic current

# Migration history
docker compose exec backend alembic history

# Rollback
docker compose exec backend alembic downgrade base

# Re-create all tables (fresh start)
docker compose exec backend alembic downgrade base
docker compose exec backend alembic upgrade head
```

---

## Building for Production

### 1. Update environment variables

Set all credentials in `backend/.env` and `web/.env`.

### 2. GitHub Container Registry (if using CI)

Images are pushed to `ghcr.io/<owner>/nelloreruchullu-*` on push to `main` via `.github/workflows/ci.yml`.

```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_ACTOR --password-stdin

# Pull images
docker pull ghcr.io/your-org/nelloreruchullu-backend:latest
docker pull ghcr.io/your-org/nelloreruchullu-web:latest
```

### 3. Deploy with Docker Compose (VPS)

```bash
# On your server:
git clone https://github.com/your-org/NelloreRuchullu.git
cd NelloreRuchullu

# Set credentials
cp .env.example .env  # Edit with real values

# Start
docker compose up -d --build
```

### 4. SSL/HTTPS (NGINX)

Uncomment the SSL volume mounts in `docker-compose.yml`:

```yaml
volumes:
  - /etc/letsencrypt:/etc/letsencrypt:ro
  - ./infra/nginx/ssl:/etc/nginx/ssl:ro
```

And update `infra/nginx/nginx.conf` with your certificate paths.

---

## Documentation

| Document | Path | Description |
|---------|------|-------------|
| API Reference | `docs/API_REFERENCE.md` | All REST endpoints with schemas |
| UI/Mobile Reference | `docs/UI_MOBILE_REFERENCE.md` | All pages, components, and screens |
| Backend routes | `backend/app/routes/` | FastAPI route definitions |
| Backend schemas | `backend/app/schemas/` | Pydantic request/response models |
| Swagger UI | http://localhost:8000/docs | Interactive API documentation |

---

## License

MIT License — See LICENSE file for details.
