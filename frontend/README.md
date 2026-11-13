# EstateHub Frontend (Vite + React + TypeScript + Tailwind CSS)

EstateHub is a modern, responsive web application for real estate listing and property management, paired with the FastAPI backend.

## Tech Stack
- **Framework**: Vite + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Plus Jakarta Sans Typography
- **Icons**: Lucide React
- **Routing**: React Router v7
- **HTTP Client**: Axios with JWT automatic bearer injection & refresh token rotation
- **State & Alerts**: React Context with responsive animated toast notifications

---

## Quick Start

### 1. Start the Backend API (FastAPI)
In a terminal window:
```bash
cd backend
source .venv/bin/activate
# Seed database with sample properties, leases, bookings and vendors
python seed.py
# Start Uvicorn server on port 8000
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
API Documentation will be available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### 2. Start the Frontend (Vite)
In another terminal window:
```bash
cd frontend
npm run dev
```
Open **http://localhost:5173** in your browser.

---

## Ready-to-Use Demo Accounts (1-Click Login in UI)

You can click the **Demo: Tenant / Owner / Admin** pills in the top navigation bar or the modal presets to sign in immediately:

| Role | Email | Password | Access Capabilities |
|------|-------|----------|---------------------|
| **Property Owner** | `owner@estatehub.com` | `Password123!` | Portfolio KPIs, Add/Edit Listings, Confirm Bookings, Draft Leases, Assign Vendors |
| **Tenant** | `tenant@estatehub.com` | `Password123!` | Explore Homes, Schedule Visits, Review Leases, Pay Rent (Razorpay), Raise Maintenance Tickets |
| **Administrator** | `admin@estatehub.com` | `Password123!` | System-wide Analytics, User Management, Vendor Onboarding, Global Property Oversight |

---

## Connected Features & Endpoints

- **Marketplace & Filters**:
  - Filter by City (Mumbai, Bengaluru, Delhi, Pune, Hyderabad, Chennai)
  - Filter by Property Type (Apartment, Villa, House, Studio, Commercial, Plot)
  - Price Range, Bedroom count, Search keywords, and Sorting
  - Interactive photo gallery for every property
- **Bookings Lifecycle**:
  - Tenant schedules visit/booking date with custom note (`POST /api/v1/bookings`)
  - Landlord confirms or declines requests (`PUT /api/v1/bookings/{id}/status`)
- **Lease Agreements**:
  - Landlord generates digital lease agreements (`POST /api/v1/leases`)
  - Status lifecycle (Pending -> Active -> Terminated)
- **Razorpay Payments**:
  - Rent, Security Deposit, and Booking Fee orders (`POST /api/v1/payments/create-order`)
  - Signature verification (`POST /api/v1/payments/verify`)
  - Built-in transaction simulator for testing without live keys
- **Maintenance Tickets**:
  - Tenants report issues with priority levels (Low, Medium, High, Urgent)
  - Landlords dispatch approved technicians and update repair status
- **Vendor Directory**:
  - Admin adds and manages plumbing, electrical, HVAC, and cleaning contractors
- **Notifications**:
  - Real-time unread badge counter and dropdown tray with mark-all-read
