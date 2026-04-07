# NelloreRuchullu 🍛

A full-stack food delivery application featuring authentic Nellore-style Andhra cuisine, built with FastAPI, Next.js, and PostgreSQL.

## Features

- **User Authentication**: Registration, login, OTP support
- **Menu Browsing**: Category filtering, vegetarian options, search
- **Cart Management**: Add items, quantity adjustment, persistence
- **Order Processing**: Checkout flow, order tracking, history
- **Admin Dashboard**: Menu management, analytics

## Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | FastAPI + Python 3.11 |
| Frontend | Next.js 15 + React + TypeScript |
| Database | PostgreSQL |
| Cache | Redis |
| Styling | TailwindCSS |
| Testing | Playwright + Pytest |
| Containerization | Docker Compose |

## Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### 1. Clone and Setup

```bash
git clone https://github.com/your-org/NelloreRuchullu.git
cd NelloreRuchullu
```

### 2. Environment Variables

Create `.env` files as needed. The `docker-compose.yml` uses default values for development.

### 3. Start with Docker

```bash
docker compose up -d
```

Services will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/api/v1/docs

### 4. Seed Database (Optional)

```bash
docker compose exec backend python /app/seed_data.py
```

This populates the database with sample menu items and categories.

## Project Structure

```
NelloreRuchullu/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── routes/       # API endpoints
│   │   ├── models/       # SQLAlchemy models
│   │   ├── services/      # Business logic
│   │   └── schemas/       # Pydantic schemas
│   └── requirements.txt
├── web/                  # Next.js frontend
│   ├── src/
│   │   ├── app/          # Pages and layouts
│   │   ├── components/    # React components
│   │   ├── hooks/        # Custom hooks
│   │   └── lib/           # Utilities
│   └── package.json
├── scripts/              # Utility scripts
│   └── seed_data.py      # Database seeder
├── tests/                # Test files
│   ├── e2e/              # Playwright tests
│   └── demo/             # Demo assets
└── docker-compose.yml     # Production compose
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/otp/send` - Send OTP
- `POST /api/v1/auth/otp/verify` - Verify OTP
- `POST /api/v1/auth/refresh` - Refresh access token

### Menu
- `GET /api/v1/menu` - List menu items (with filters)
- `GET /api/v1/menu/categories` - List categories
- `GET /api/v1/menu/{item_id}` - Get single item

### Cart & Orders
- `GET /api/v1/cart` - Get cart
- `POST /api/v1/cart/items` - Add to cart
- `DELETE /api/v1/cart` - Clear cart
- `POST /api/v1/orders` - Create order
- `GET /api/v1/orders/my` - Get user orders

## Running Tests

```bash
# Run all Playwright tests
cd web && npx playwright test

# Run specific test file
npx playwright test tests/e2e/02-auth.spec.ts

# Generate HTML report
npx playwright show-report
```

## Development

### Backend (Local)

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend (Local)

```bash
cd web
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/nelloreruchullu
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_WS_URL=ws://localhost:8000/api/v1
```

## License

MIT License - See LICENSE file for details.
