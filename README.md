# EstateHub

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white" alt="Python 3.11+" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/PostgreSQL-Production-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker Ready" />
</p>

<p align="center">
  <strong>Real Estate Listing & Property Management System</strong>
</p>

A full-stack property management platform for modern real estate operations, combining property discovery, bookings, lease management, rent payments, vendor coordination, and role-based dashboards in one system.

## Overview

EstateHub is designed for a property ecosystem that includes:

- property owners and managers overseeing listings and occupancy
- tenants browsing homes and scheduling visits
- administrators monitoring platform-wide activity
- vendors handling maintenance and service requests
- automated workflows for payments, leasing, and approvals

It includes a FastAPI backend, a React + TypeScript frontend, optional PostgreSQL production support, SQLite for zero-setup local development, JWT-based access control, and Razorpay payment integration.

## Core Features

- 🏠 Property listings with search, filtering, and showcase cards
- 📅 Booking and visit scheduling for tenants
- 📝 Lease agreement generation and lifecycle tracking
- 💸 Online rent and security payment workflows via Razorpay
- 🔧 Maintenance ticketing and vendor assignment
- 👥 Multi-role user access for Admin, Owner, and Tenant
- 📊 Dashboards with analytics and operational visibility
- 🔐 JWT authentication with role-based authorization
- 🐳 Dockerized setup with deployment-ready configuration

## Tech Stack

### Backend
- FastAPI 0.115
- Python 3.11+
- SQLAlchemy 2.0 with AsyncIO
- Alembic for migrations
- Pydantic v2

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide Icons
- Axios

### Data & Auth
- PostgreSQL for production
- SQLite for local/dev simplicity
- JWT Authentication with role-based access control

### Payments & Deployment
- Razorpay Integration (order creation and verification)
- Dockerfile and docker-compose support
- Render blueprint via `render.yaml`

## Repository Structure

```text
.
├── backend/
│   ├── app/                 # FastAPI application (routes, models, services, schemas)
│   ├── alembic/             # Database migration scripts
│   ├── seed.py              # Demo data seeding for users, listings, bookings, leases
│   ├── Dockerfile           # Backend container build
│   ├── render.yaml          # Render deployment blueprint (Web + PostgreSQL)
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Backend environment variables template
├── frontend/
│   ├── src/                 # React frontend source code
│   ├── vite.config.ts       # Vite config with backend proxy
│   ├── package.json         # Frontend dependencies
│   └── .env.example         # Frontend environment variables template
├── docker-compose.yml       # Local PostgreSQL + backend container orchestration
├── README.md                # Project documentation
├── .gitignore               # Project secrets and local environment exclusions
└── LICENSE                  # Project license (if present in the repository)
```

## Demo Accounts

The application comes with pre-seeded demo accounts. Default password for all demo users is `Password123!`.

| Role | Email | Description |
| :--- | :--- | :--- |
| **Owner** | `owner@estatehub.com` | Manages properties, leases, and bookings |
| **Owner 2** | `pooja@singhania.com` | Handles multiple luxury listings |
| **Tenant** | `tenant@estatehub.com` | Browses properties and manages rent/maintenance |
| **Admin** | `admin@estatehub.com` | Full platform oversight and admin controls |

You can also use the built-in “Demo Login” option in the sign-in modal for quick access.

## Quickstart

### 1) Backend Setup

```bash
cd backend

# Create a virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Default local setup uses SQLite: sqlite+aiosqlite:///./realestate.db

# Seed demo data
python seed.py

# Start the API server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Access the API docs here:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### 2) Frontend Setup

In a separate terminal:

```bash
cd frontend

# Install dependencies
npm install

# Start the Vite dev server
npm run dev
```

Then open:
- Frontend: `http://localhost:5173`

## Docker Compose

To run PostgreSQL and the backend in containers:

```bash
docker compose up -d --build
```

This uses the repository-level `docker-compose.yml` for local orchestration and service setup.

## Deployment

### Backend
- Render: deploy using `backend/render.yaml` via the Render Blueprint flow
- Railway, Fly.io, or VPS: deploy `backend/Dockerfile` with PostgreSQL support

### Frontend
- Vercel, Netlify, or Cloudflare Pages
- Set the frontend environment variable:

```bash
VITE_API_BASE_URL=https://your-backend-url.com/api/v1
```

Also add your frontend URL to the backend `CORS_ORIGINS` environment variable.

## Project Notes

This project is structured to balance ease of local startup with production readiness. It supports SQLite for quick local onboarding and PostgreSQL for deployment-oriented environments, while keeping the API layer, authorization, and payment integrations aligned with a modern real estate SaaS workflow.

## Contributing

Contributions, bug reports, and feature ideas are welcome. For changes, open an issue or create a pull request with a clear summary of the updates.

## License

This repository includes licensing information as part of the project configuration. Please check the root or package-level files for the exact license details in your local copy.

---

<p align="center">
  Built for property owners, tenants, admins, and modern real-estate operations.
</p>
