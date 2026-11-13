# EstateHub - Real Estate Listing & Property Management System

A full-stack property management platform featuring real estate listings, tenant bookings, automated lease agreements, online rent payments, vendor maintenance ticketing, and multi-role dashboards (Owner, Tenant, Admin).

---

## Tech Stack

* **Backend**: FastAPI 0.115, Python 3.11+, SQLAlchemy 2.0 (AsyncIO), Alembic, Pydantic v2
* **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios
* **Database**: PostgreSQL (production) or SQLite (zero-setup local dev)
* **Auth**: JWT Authentication with role-based access control (Admin, Owner, Tenant)
* **Payments**: Razorpay Integration (Order Creation & Verification)
* **Deployment Ready**: Dockerfile, `docker-compose.yml`, and `render.yaml` (Render Blueprint)

---

## Project Structure

```
├── backend/
│   ├── app/                 # FastAPI application (routes, models, services, schemas)
│   ├── alembic/             # Database migration scripts
│   ├── seed.py              # Initial database seed script (demo users, listings, leases)
│   ├── Dockerfile           # Backend container build
│   ├── render.yaml          # Render deployment blueprint (Web + PostgreSQL)
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Backend environment variables template
├── frontend/
│   ├── src/                 # React frontend source code (pages, components, api, context)
│   ├── vite.config.ts       # Vite config with backend proxy
│   ├── package.json         # Frontend dependencies
│   └── .env.example         # Frontend environment variables template
├── docker-compose.yml       # Local PostgreSQL + Backend container orchestration
└── .gitignore               # Root gitignore protecting secrets, dependencies, and DB files
```

---

## Quickstart (Local Development)

### 1. Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# By default, DATABASE_URL uses SQLite (sqlite+aiosqlite:///./realestate.db) for instant run

# Populate demo data (users, listings, bookings, leases)
python seed.py

# Start FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

* API Docs (Swagger): `http://localhost:8000/docs`
* API Alternative (ReDoc): `http://localhost:8000/redoc`

---

### 2. Frontend Setup

In a new terminal:

```bash
cd frontend

# Install npm dependencies
npm install

# Start Vite development server
npm run dev
```

* Open frontend: `http://localhost:5173`

---

## Demo Accounts

The database comes pre-seeded with these demo users (Password: `Password123!`):

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Owner** | `owner@estatehub.com` | `Password123!` | Vikram Malhotra (Manages properties, leases, bookings) |
| **Owner 2** | `pooja@singhania.com` | `Password123!` | Pooja Singhania (Multiple luxury listings) |
| **Tenant** | `tenant@estatehub.com` | `Password123!` | Aanya Sharma (Active lease, rent payments) |
| **Admin** | `admin@estatehub.com` | `Password123!` | System Administrator (Full platform oversight) |

*(You can also use the one-click "Demo Login" button in the sign-in modal)*

---

## Running with Docker Compose

To run PostgreSQL and the Backend in isolated containers:

```bash
docker compose up -d --build
```

---

## Deployment Guide

* **Backend**:
  * **Render**: Connect the repository and select **Blueprint** to deploy using `backend/render.yaml`.
  * **Railway / Fly.io / VPS**: Deploy using `backend/Dockerfile` with PostgreSQL.
* **Frontend**:
  * Deploy on **Vercel**, **Netlify**, or **Cloudflare Pages**.
  * Set environment variable: `VITE_API_BASE_URL=https://your-backend-url.com/api/v1`
  * Add your frontend URL to the backend's `CORS_ORIGINS` environment variable.
