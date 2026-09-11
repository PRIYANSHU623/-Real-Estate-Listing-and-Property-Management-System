# Real Estate Listing & Property Management API

A FastAPI-based backend for a real estate listing and property management platform. This application provides comprehensive APIs for managing properties, bookings, leases, payments (via Razorpay), maintenance requests, and analytics.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Docker Deployment](#docker-deployment)
- [Project Structure](#project-structure)

## Features

- 🏢 Property Management
- 📅 Booking & Lease Management
- 💰 Payment Processing (Razorpay Integration)
- 🔧 Maintenance Request Tracking
- 🔐 JWT Authentication & Authorization
- 📊 Analytics Dashboard
- 🔔 Notifications System
- ⚡ Async/Await Support
- 🧪 Comprehensive Test Suite
- 🐳 Docker Support

## Tech Stack

- **Framework**: FastAPI 0.115.6
- **Server**: Uvicorn 0.34.0
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT with bcrypt
- **Validation**: Pydantic 2.10.5
- **Database Migrations**: Alembic 1.14.1
- **Payment Gateway**: Razorpay
- **Testing**: pytest & pytest-asyncio

## Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.11+
- PostgreSQL 12+
- pip (Python package manager)
- git

### Optional

- Docker & Docker Compose (for containerized deployment)
- Virtual environment manager (venv, virtualenv, or poetry)

## Installation

### 1. Clone the Repository

```bash
cd backend
```

### 2. Create a Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

## Configuration

### Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Application Settings
APP_NAME=Real Estate Listing & Property Management API
APP_ENV=development
DEBUG=True
API_V1_PREFIX=/api/v1

# Database Configuration
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/realestate

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Razorpay Configuration (optional)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:5173
```

**Important**: Change the `JWT_SECRET_KEY` to a strong random string in production. You can generate one using:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Database Setup

### 1. Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE realestate;
```

### 2. Run Database Migrations

```bash
# From the backend directory
alembic upgrade head
```

### 3. Create Initial Schema (if needed)

```bash
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## Running the Application

### Option 1: Development Server

```bash
# Make sure virtual environment is activated
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Run the application
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

### Option 2: Production Server

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Documentation

Once the application is running, access the interactive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

The API is organized into the following endpoints:

- `/api/v1/admin` - Admin operations
- `/api/v1/analytics` - Analytics data
- `/api/v1/auth` - Authentication (login, register, refresh tokens)
- `/api/v1/bookings` - Property bookings
- `/api/v1/leases` - Lease management
- `/api/v1/maintenance` - Maintenance requests
- `/api/v1/notifications` - Notification management
- `/api/v1/payments` - Payment processing
- `/api/v1/properties` - Property management
- `/api/v1/tenants` - Tenant management
- `/api/v1/users` - User management
- `/api/v1/vendors` - Vendor management

## Testing

### Run All Tests

```bash
pytest
```

### Run Tests with Coverage

```bash
pytest --cov=app tests/
```

### Run Specific Test File

```bash
pytest tests/test_auth.py
```

### Run Tests in Verbose Mode

```bash
pytest -v
```

Test files are located in the `tests/` directory and include:

- `test_auth.py` - Authentication tests
- `test_users.py` - User management tests
- `test_properties.py` - Property management tests
- `test_bookings.py` - Booking tests
- `test_payments.py` - Payment processing tests
- `test_maintenance.py` - Maintenance request tests
- `test_analytics.py` - Analytics tests

## Docker Deployment

### Build Docker Image

```bash
docker build -t realestate-api .
```

### Run with Docker

```bash
docker run -p 8000:8000 \
  -e DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/realestate \
  -e JWT_SECRET_KEY=your-secret-key \
  realestate-api
```

### Using Docker Compose

Create a `docker-compose.yml` file (if not already present):

```yaml
version: '3.8'

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: realestate
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: .
    ports:
      - "8000:8000"
    depends_on:
      - db
    environment:
      DATABASE_URL: postgresql+asyncpg://postgres:postgres@db:5432/realestate
      JWT_SECRET_KEY: your-secret-key
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000

volumes:
  postgres_data:
```

Then run:

```bash
docker-compose up -d
```

## Project Structure

```
backend/
├── app/
│   ├── api/                    # API routes
│   │   ├── router.py          # Main router
│   │   └── v1/                # API v1 endpoints
│   │       ├── admin.py
│   │       ├── auth.py
│   │       ├── bookings.py
│   │       ├── leases.py
│   │       ├── maintenance.py
│   │       ├── notifications.py
│   │       ├── payments.py
│   │       ├── properties.py
│   │       ├── tenants.py
│   │       ├── users.py
│   │       ├── vendors.py
│   │       └── analytics.py
│   ├── core/                  # Core configuration & utilities
│   │   ├── config.py          # Configuration settings
│   │   ├── constants.py       # Application constants
│   │   ├── dependencies.py    # Dependency injection
│   │   ├── exceptions.py      # Custom exceptions
│   │   └── security.py        # Security utilities
│   ├── db/                    # Database configuration
│   │   ├── base.py           # SQLAlchemy base models
│   │   ├── database.py       # Database setup
│   │   └── session.py        # Database sessions
│   ├── models/                # SQLAlchemy ORM models
│   ├── schemas/               # Pydantic schemas for validation
│   ├── services/              # Business logic services
│   ├── integrations/          # External integrations (Razorpay, etc.)
│   ├── utils/                 # Utility functions
│   └── main.py               # FastAPI application entry point
├── alembic/                   # Database migration files
├── tests/                     # Test suite
├── requirements.txt           # Python dependencies
├── Dockerfile                 # Docker configuration
├── pytest.ini                 # Pytest configuration
├── alembic.ini               # Alembic configuration
└── render.yaml               # Render.com deployment config
```

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | Real Estate Listing & Property Management API | Application name |
| `APP_ENV` | development | Environment (development/production/staging) |
| `DEBUG` | True | Enable debug mode |
| `API_V1_PREFIX` | /api/v1 | API v1 route prefix |
| `DATABASE_URL` | postgresql+asyncpg://postgres:postgres@localhost:5432/realestate | PostgreSQL connection URL |
| `JWT_SECRET_KEY` | change-me-to-a-long-random-string | Secret key for JWT signing |
| `JWT_ALGORITHM` | HS256 | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 30 | Access token expiration time |
| `REFRESH_TOKEN_EXPIRE_DAYS` | 7 | Refresh token expiration time |
| `RAZORPAY_KEY_ID` | - | Razorpay API key ID |
| `RAZORPAY_KEY_SECRET` | - | Razorpay API secret |
| `RAZORPAY_WEBHOOK_SECRET` | - | Razorpay webhook secret |
| `CORS_ORIGINS` | http://localhost:3000,http://localhost:5173 | Comma-separated CORS origins |

## Troubleshooting

### Database Connection Error

- Ensure PostgreSQL is running: `sudo service postgresql status`
- Check DATABASE_URL in `.env` file
- Verify database credentials

### Port Already in Use

```bash
# Find process using port 8000
lsof -i :8000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>
```

### Virtual Environment Issues

```bash
# Deactivate current environment
deactivate

# Remove and recreate
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

## Development Tips

### Code Quality

```bash
# Run linting
pip install flake8 black
black app/
flake8 app/
```

### Database Migrations

```bash
# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback last migration
alembic downgrade -1
```

## Support & Contributing

For issues or contributions, please follow the project's contribution guidelines.

## License

[Add your license information here]
