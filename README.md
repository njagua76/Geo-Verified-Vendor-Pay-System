# Geo-Verified Vendor Pay System

> Enforce location-verified, role-secured supply chain payments via M-Pesa B2C

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.10+-green.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org)
[![Flask](https://img.shields.io/badge/Flask-3.x-lightgrey.svg)](https://flask.palletsprojects.com)

## 📋 Overview

The **Geo-Verified Vendor Pay System** ensures strict compliance in supply chain payments by enforcing that vendor disbursements via **M-Pesa B2C** are executed only after a field agent's physical location is verified to be within **≤20 meters** of the official supplier hub. Security is enforced using **JWT-based Role-Based Access Control (RBAC)**, separating Field Agent (payment execution) and Administrator (monitoring) functions.

### Key Features

- **🔒 JWT-Based Authentication**: Secure login with role-embedded tokens (1-hour expiry)
- **📍 GPS Location Verification**: Haversine-based distance validation (≤20m threshold)
- **💳 M-Pesa B2C Integration**: Automated payments via Safaricom Daraja API with OAuth token caching
- **🛡️ Role-Based Access Control**: Separate permissions for Field Agents and Administrators
- **📊 Transaction Logging**: Full audit trail (verification → payment → response) stored in PostgreSQL
- **🗺️ Interactive Map**: Real-time Leaflet map showing user location and supplier hubs
- **⚡ Real-Time Feedback**: UI state management (Loading, Success, Failure) with color-coded banners
- **🎨 Responsive Design**: Tailwind CSS for mobile-first, accessible interfaces
- **☁️ Cloud-Native Deployment**: Backend on Render, Frontend on Vercel, managed PostgreSQL

---

## 🏗️ Architecture

### Technical Stack

| Component | Technology | Role |
|-----------|-----------|------|
| **Backend API** | Python (Flask) | Business logic, M-Pesa integration, JWT/RBAC, Haversine calculation |
| **Database** | PostgreSQL | Persistent storage for users, roles, suppliers, transaction logs |
| **Frontend UI** | React | User interface, location capture, JWT management, dynamic routing |
| **Styling** | Tailwind CSS | Utility-first responsive styling |
| **Map Library** | Leaflet | Interactive geolocation visualization |
| **Payment Gateway** | Safaricom Daraja API | M-Pesa B2C disbursements |
| **Deployment** | Render + Vercel | Scalable, HTTPS-enforced hosting with CI/CD |

### System Flow

1. **Authentication**: User logs in → Backend validates credentials → Issues JWT with role claim
2. **Field Agent Flow**: 
   - Captures GPS location via browser API
   - Submits location + supplier ID to backend
   - Backend validates JWT, role, coordinates → Haversine distance check
   - If ≤20m → Triggers Daraja B2C payment → Logs transaction
3. **Administrator Flow**:
   - Accesses dashboard → Fetches last 10 transaction logs
   - Views color-coded table (status, supplier, agent, distance, timestamp)

---

## 🔧 Backend Design

### Overview
Flask REST API enforcing location-verified, role-secured M-Pesa B2C payments. Guarantees disbursements only when field agents are within ≤20 meters of supplier hubs.

### Tech Stack
- **Runtime**: Python 3.10+
- **Framework**: Flask 3.x
- **ORM**: SQLAlchemy 2.x
- **Database**: PostgreSQL 14+
- **Authentication**: PyJWT
- **Password Hashing**: werkzeug.security (Bcrypt)
- **HTTP Client**: requests (Daraja API)
- **CORS**: Flask-CORS
- **Server**: Gunicorn (production)

### Directory Structure
```
backend/
├── app.py                    # Flask app entry point, routes
├── config.py                 # Config from env vars (JWT_SECRET, DB_URL, etc.)
├── requirements.txt          # Python dependencies
├── models/
│   ├── __init__.py
│   ├── user.py               # User model (id, email, password_hash, role_id)
│   ├── role.py               # Role model (id, role_name)
│   ├── supplier.py           # Supplier model (id, supplier_id, name, mpesa_phone, lat, lon)
│   └── transaction_log.py    # TransactionLog model (status, distance, payloads)
├── decorators/
│   ├── __init__.py
│   └── auth.py               # @role_required decorator, JWT validation
├── services/
│   ├── __init__.py
│   ├── auth_service.py       # Login, password verification, JWT issuance
│   ├── location_service.py   # Haversine calculation
│   ├── daraja_service.py     # OAuth token caching, B2C payment request
│   └── log_service.py        # Transaction log CRUD
├── routes/
│   ├── __init__.py
│   ├── auth.py               # POST /login
│   ├── verify.py             # POST /verify-location (Field Agent)
│   ├── suppliers.py          # CRUD /suppliers (Admin)
│   └── logs.py               # GET /transactions-log (Admin)
├── validators/
│   ├── __init__.py
│   └── input_validator.py    # Coordinate ranges, required fields
├── utils/
│   ├── __init__.py
│   └── haversine.py          # Haversine distance function
├── migrations/               # Alembic migrations (optional for MVP)
│   └── versions/
├── tests/
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_haversine.py
│   ├── test_verify.py
│   └── test_logs.py
└── README.md
```

### API Endpoints

#### Authentication
**POST /login**
```json
// Request
{ "email": "agent@example.com", "password": "secret" }

// Response (200)
{ "token": "<JWT>", "role_name": "Field Agent" }

// Error (401)
{ "code": 401, "message": "Invalid credentials" }
```

#### Location Verification & Payment (Field Agent)
**POST /verify-location**
```json
// Headers
Authorization: Bearer <JWT>

// Request
{ "supplier_id": "SUP001", "user_lat": -1.286389, "user_lon": 36.817223 }

// Response (200)
{ "status": "PAYMENT_SENT", "distance_meters": 15.3, "message": "Payment successful" }

// Errors
400: Validation errors (invalid coords, missing fields)
403: RBAC failure (wrong role)
```

#### Supplier Management (Admin)
**POST /suppliers**
```json
// Request
{
  "supplier_id": "SUP001",
  "name": "Supplier Hub A",
  "mpesa_phone_number": "254712345678",
  "lat": -1.286389,
  "lon": 36.817223
}

// Response (201)
{ "id": 1, "supplier_id": "SUP001", ... }
```

**GET /suppliers**
```json
// Response (200)
[
  { "id": 1, "supplier_id": "SUP001", "name": "Supplier Hub A", ... }
]
```

#### Transaction Logs (Admin)
**GET /transactions-log**
```json
// Response (200)
[
  {
    "id": 1,
    "agent_user_id": 2,
    "supplier_id": 1,
    "status": "PAYMENT_SENT",
    "distance_meters": 15.3,
    "created_at": "2025-12-15T10:30:00Z"
  }
]
```

#### Health Check
**GET /health**
```json
{ "status": "ok" }
```

### Database Schema

**roles**
- `id` (PK), `role_name` (unique: "Field Agent", "Administrator")

**users**
- `id` (PK), `email` (unique), `password_hash`, `role_id` (FK), `is_active`, `created_at`, `updated_at`

**suppliers**
- `id` (PK), `supplier_id` (unique), `name`, `mpesa_phone_number`, `lat`, `lon`, `is_active`, `created_at`, `updated_at`

**transactions_log**
- `id` (PK), `agent_user_id` (FK), `supplier_id` (FK), `status`, `distance_meters`, `request_payload` (jsonb), `response_payload` (jsonb), `error_message`, `daraja_conversation_id`, `daraja_transaction_id`, `created_at`, `updated_at`

**Constraints**
- `lat` ∈ [-90, 90], `lon` ∈ [-180, 180]
- `status` ∈ {VERIFICATION_OK, VERIFICATION_FAIL, PAYMENT_SENT, PAYMENT_FAILED}

### Environment Variables
```bash
JWT_SECRET=<your-jwt-secret>
DATABASE_URL=postgresql://user:password@host:5432/dbname
DARAJA_CONSUMER_KEY=<daraja-consumer-key>
DARAJA_CONSUMER_SECRET=<daraja-consumer-secret>
SECURITY_CREDENTIAL=<daraja-security-credential>
QUEUE_TIMEOUT_URL=https://yourdomain.com/queue-timeout
RESULT_URL=https://yourdomain.com/result
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Haversine Algorithm
```python
from math import radians, sin, cos, sqrt, atan2

def haversine(lat1, lon1, lat2, lon2):
    R = 6371000  # Earth radius in meters
    φ1, φ2 = radians(lat1), radians(lat2)
    Δφ = radians(lat2 - lat1)
    Δλ = radians(lon2 - lon1)
    a = sin(Δφ/2)**2 + cos(φ1) * cos(φ2) * sin(Δλ/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    return R * c
```

### Setup & Run (Local)

#### Install dependencies
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

#### Configure environment
```bash
cp .env.example .env
# Edit .env with your values
```

#### Initialize database
```bash
flask db upgrade  # if using Alembic
# OR run seed script
python seed_db.py
```

#### Run development server
```bash
flask run --host=0.0.0.0 --port=5000
```

#### Run tests
```bash
pytest tests/
```

### Deployment (Render)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn app:app`
- **Environment Variables**: Set all secrets via Render dashboard
- **Database**: Create managed PostgreSQL, copy `DATABASE_URL`
- **CORS**: Add Vercel frontend URL to `CORS_ALLOWED_ORIGINS`

---

## 🎨 Frontend Design

### Overview
React SPA providing location-verified payment UI for field agents and a transaction monitoring dashboard for administrators. Role-based routing enforces access control client-side, backed by JWT validation on the API.

### Tech Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5.x
- **Framework**: React 18.x
- **Routing**: react-router-dom 6.x
- **HTTP Client**: axios
- **Styling**: Tailwind CSS 3.x + Shadcn UI
- **UI Components**: Shadcn UI (40+ primitives)
- **Map Library**: Leaflet (vanilla JS integration)
- **Geolocation**: Browser `navigator.geolocation` API
- **JWT Decoding**: jwt-decode
- **Build Tool**: Vite 5.x

### Directory Structure
```
frontend/
├── README.md                          # Project documentation
├── eslint.config.js                   # ESLint configuration
├── index.html                         # HTML entry point
├── tailwind.config.ts                 # Tailwind CSS configuration with design tokens
├── vite.config.ts                     # Vite build configuration
├── public/
│   ├── favicon.ico                    # App favicon
│   ├── placeholder.svg                # Placeholder image
│   └── robots.txt                     # SEO robots configuration
├── src/
│   ├── App.tsx                        # Root component with routing setup
│   ├── main.tsx                       # React entry point
│   ├── index.css                      # Global styles & CSS variables (design system)
│   ├── vite-env.d.ts                  # Vite type declarations
│   ├── lib/
│   │   └── utils.ts                   # Utility functions (cn for classnames)
│   ├── types/
│   │   └── auth.ts                    # TypeScript types for authentication
│   ├── hooks/
│   │   ├── use-mobile.tsx             # Mobile detection hook
│   │   └── use-toast.ts               # Toast notification hook
│   ├── context/
│   │   └── AuthContext.tsx            # Authentication state management
│   ├── data/
│   │   └── mockData.ts                # Mock suppliers & transactions data
│   ├── pages/
│   │   ├── Index.tsx                  # Landing/Login page
│   │   ├── Login.tsx                  # Login page wrapper
│   │   ├── Dashboard.tsx              # Admin transaction dashboard
│   │   ├── Verify.tsx                 # Field agent payment verification
│   │   └── NotFound.tsx               # 404 page
│   └── components/
│       ├── NavLink.tsx                # Navigation link component
│       ├── guards/
│       │   └── ProtectedRoute.tsx     # Role-based route protection
│       ├── layout/
│       │   └── Header.tsx             # App header with user info
│       ├── auth/
│       │   └── LoginForm.tsx          # Login form with role selection
│       ├── map/
│       │   └── LocationMap.tsx        # Vanilla Leaflet map for geo-verification
│       ├── dashboard/
│       │   └── TransactionDashboard.tsx # Admin stats & transaction table
│       ├── payment/
│       │   └── PaymentVerification.tsx  # Geo-verified payment flow
│       └── ui/                        # Shadcn UI component library
│           ├── accordion.tsx
│           ├── alert.tsx
│           ├── alert-dialog.tsx
│           ├── button.tsx
│           ├── card.tsx
│           ├── badge.tsx
│           ├── table.tsx
│           ├── toast.tsx
│           ├── toaster.tsx
│           └── ... (40+ UI primitives)
├── .env                               # VITE_API_URL
├── .env.example
├── package.json
├── tsconfig.json
├── tsconfig.app.json
└── tsconfig.node.json
```

### Pages & Routing

#### Login (`/login`)
- Unauthenticated users land here
- Form: email, password
- On success: store JWT, redirect by role

#### Verify Location (`/verify`) — Field Agent
- Protected by `ProtectedRoute` (requires `role_name: "Field Agent"`)
- Features:
  - GPS capture button
  - Leaflet map showing user + supplier markers
  - Payment verification button (disabled until GPS acquired)
  - Status banners: Loading (JWT), Loading (GPS), Loading (API), Success, Failure

#### Dashboard (`/dashboard`) — Administrator
- Protected by `ProtectedRoute` (requires `role_name: "Administrator"`)
- Features:
  - Fetch last 10 transactions from `/transactions-log`
  - Responsive table: status, supplier, agent, distance, timestamp
  - Color-coded: Green (success), Red (failure)

#### Not Found (`/404`)
### Route Guards (RBAC)
```typescript
// components/guards/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';
import { AuthToken } from '@/types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'Field Agent' | 'Administrator';
}

function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" />;

  const decoded = jwtDecode<AuthToken>(token);
  if (decoded.exp * 1000 < Date.now()) {
    localStorage.removeItem('token');
    return <Navigate to="/login" />;
  }

  if (requiredRole && decoded.role_name !== requiredRole) {
    return <Navigate to="/login" />;
### API Integration (Axios)
```typescript
// lib/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
### Geolocation Hook
```typescript
// hooks/use-geolocation.ts
import { useState } from 'react';

interface Location {
  lat: number;
  lon: number;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return { location, error, loading, getLocation };
};
```   (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return { location, error, loading, getLocation };
};
```

### UI States & Feedback
### Environment Variables
```bash
# .env
VITE_API_URL=https://your-backend.onrender.com
```

**Note**: Vite uses `VITE_` prefix instead of `REACT_APP_`. Access via `import.meta.env.VITE_API_URL`.*Loading (GPS)**: Spinner + "Acquiring location..." message
- **Loading (API)**: Spinner + "Verifying payment..." message
- **Success (Green)**: "Payment Sent Successfully! Distance: 15.3m"
- **Failure (Red)**: "Verification Failed: Distance 35m exceeds threshold"

**Dashboard States**
- **Loading**: Skeleton rows or spinner
- **Success**: Table with color-coded status cells
- **Error**: "Failed to fetch transaction logs"

### Environment Variables
```bash
REACT_APP_API_URL=https://your-backend.onrender.com
```

### Setup & Run (Local)

#### Install dependencies
```bash
cd frontend
npm install
```

#### Configure environment
```bash
cp .env.example .env
# Edit .env with your backend URL
```

#### Run development server
### Tailwind Configuration
### Deployment (Vercel)
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: Add `VITE_API_URL` in Vercel dashboard
- **CORS**: Ensure backend allows Vercel domain
- **TypeScript**: Automatic type checking during build
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
#### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with VITE_API_URL pointing to backend
npm run dev
```*Environment Variables**: Add `REACT_APP_API_URL` in Vercel dashboard
- **CORS**: Ensure backend allows Vercel domain

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+
- Safaricom Daraja API credentials

### Quick Start

#### 1. Clone Repository
```bash
git clone https://github.com/yourusername/geo-verified-vendor-pay.git
cd geo-verified-vendor-pay
```

#### 2. Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your credentials
flask db upgrade
python seed_db.py
flask run
```

#### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm run dev
```

#### 4. Access Application
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

---

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

---

## 🔐 Security

- **JWT Expiry**: 1 hour (configurable)
- **Password Hashing**: Bcrypt via werkzeug.security
- **HTTPS**: Enforced by hosting providers
- **Secrets Management**: Environment variables only (never committed)
- **RBAC**: Enforced on all protected routes (backend + frontend)
- **Input Validation**: Coordinate bounds, required fields, 400 errors

---

## 📊 Database Migrations

```bash
cd backend
flask db init
flask db migrate -m "Initial migration"
flask db upgrade
```

---

## 🛠️ Troubleshooting

### Common Issues

**401 on protected routes**
- JWT expired or invalid
- Solution: Clear localStorage and re-login

**403 on verify endpoint**
- User role is not "Field Agent"
- Solution: Check JWT role claim

**Geolocation denied**
- Browser permission not granted
- Solution: Enable location in browser settings

**CORS errors**
- Backend not allowing frontend origin
- Solution: Add Vercel URL to `CORS_ALLOWED_ORIGINS`

**Daraja API failures**
- Invalid credentials or expired token
- Solution: Verify env vars, check token cache logic

---

## 📈 Future Enhancements

- Token refresh endpoints (short-lived access + refresh tokens)
- Webhook handling for Daraja callbacks
- Offline mode with deferred verification
- Role management UI
- Password reset flows
- Metrics/observability (Prometheus, DataDog)
- Multi-hub geofencing with polygons
- Real-time updates via WebSockets
- Dark mode toggle

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 👥 Contributors

- **Your Team** - Initial work

---

## 🙏 Acknowledgments

- Safaricom Daraja API documentation
- Flask & React communities
- Leaflet mapping library

---

## 📧 Support

For issues and questions, please open an issue on GitHub or contact the development team.
