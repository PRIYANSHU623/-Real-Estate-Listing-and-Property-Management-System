# Keystone Property OS — React Frontend

This frontend is built in React and uses JSON data shaped around the supplied FastAPI backend.

## Frontend stack
- React 18
- Vite
- JavaScript
- Plain CSS
- JSON data (`src/data/mockData.json`)

## Backend contract
The JSON file contains the FastAPI base URL and `/api/v1` routes:
- /admin
- /analytics
- /auth
- /bookings
- /leases
- /maintenance
- /notifications
- /payments
- /properties
- /tenants
- /users
- /vendors

The current UI is fully interactive using local React state. To connect it to the FastAPI backend, replace the local handlers with fetch calls against `mockData.api.baseUrl`.

## Run
```bash
npm install
npm run dev
```

Build:
```bash
npm run build
```

The design follows the supplied Keystone screenshots: dark navy glass panels, teal/cyan accents, dashboard stats, property cards, payment ledger, leases table, maintenance kanban, and working CRUD-style UI interactions.
