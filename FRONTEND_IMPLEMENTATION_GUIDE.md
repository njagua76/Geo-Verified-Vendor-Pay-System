# Frontend Implementation Guide - Geo-Verified Vendor Pay System

## Backend API Summary

### Test Credentials (Pre-seeded)
```
Admin:
  Email: admin@example.com
  Password: admin123
  Role: Admin

Field Agent:
  Email: agent@example.com
  Password: agent123
  Role: Field Agent
```

### Available Backend Endpoints

#### 1. Authentication
```
POST /api/auth/login
  Request: { email, password }
  Response: { token, user: { id, email, role_name } }
  Status: 200 Success, 401 Unauthorized, 400 Bad Request
```

#### 2. Suppliers (Admin only - @role_required('Admin'))
```
GET /api/suppliers
  Response: { suppliers: [], count: number }
  
GET /api/suppliers/<id>
  Response: { supplier: { id, name, supplier_id, latitude, longitude, mpesa_phone_number, ... } }
  
POST /api/suppliers
  Request: { name, supplier_id, latitude, longitude, mpesa_phone_number, contact_person?, contact_email?, address? }
  Response: { message, supplier: {...} }
  
PUT /api/suppliers/<id>
  Request: { name?, latitude?, longitude?, mpesa_phone_number?, ... }
  Response: { message, supplier: {...} }
  
DELETE /api/suppliers/<id>
  Response: { message }
```

#### 3. Protected Routes (for testing role access)
```
GET /api/admin/dashboard (@role_required('Admin'))
  Response: { message, user, data: { total_users, total_suppliers, total_transactions } }
  
GET /api/agent/verify (@role_required('Field Agent'))
  Response: { message, user, pending_verifications }
  
GET /api/profile (@role_required('Admin'))
  Response: { message, profile }
```

#### 4. Location Verification (To be implemented)
```
POST /api/verify-location (@role_required('Field Agent'))
  Request: { user_lat, user_lon, supplier_id }
  Response: { success, message, distance, payment_status }
  Status: 200 Success, 403 Forbidden, 400 Bad Request
```

---

## Frontend Architecture & Implementation Plan

### Phase 1: Authentication & Routing ✅ (Mostly Done)
- [x] Login form with validation
- [x] JWT token management (localStorage)
- [x] AuthContext for state management
- [x] Role-based routing (ProtectedRoute component)
- [x] Auto-redirect based on role (Admin → Dashboard, Field Agent → Verify)
- [x] Axios interceptors for JWT attachment

**Status**: Ready to test with backend

### Phase 2: API Integration
- [ ] Update API endpoints to match backend URLs
- [ ] Fetch suppliers from GET /api/suppliers
- [ ] Implement error handling for 401/403 responses
- [ ] Add loading states for async operations

### Phase 3: Location Verification (Field Agent)
- [ ] GPS location capture (navigator.geolocation)
- [ ] Haversine distance calculation (20m threshold)
- [ ] POST /api/verify-location integration
- [ ] Real-time distance feedback to user

### Phase 4: Map Display
- [ ] Integrate Leaflet.js for map visualization
- [ ] Show user's current location (marker)
- [ ] Show supplier hub location (marker)
- [ ] Display distance between user and supplier

### Phase 5: Admin Dashboard
- [ ] Fetch transaction logs from backend
- [ ] Display supplier list with manage options
- [ ] Display transaction history with status colors
- [ ] Real-time statistics (total transactions, success rate, etc.)

---

## Current Frontend Structure

```
frontend/Geo-vendor/src/
├── pages/
│   ├── Login.jsx              ✅ Ready (needs API endpoint update)
│   ├── Verify.jsx             🟡 Partial (GPS needs work)
│   ├── Dashboard.jsx          🟡 Partial (needs real API calls)
│   └── Landing.jsx
├── components/
│   ├── Auth/
│   │   └── ProtectedRoute.jsx ✅ Ready
│   ├── Admin/
│   │   ├── Dashboard.jsx      🟡 Needs completion
│   │   ├── Suppliers.jsx      ⚠️  Not implemented
│   │   ├── Transactions.jsx   ⚠️  Not implemented
│   │   └── Users.jsx          ⚠️  Not implemented
│   ├── FieldAgent/
│   │   ├── Dashboard.jsx      🟡 Partial
│   │   ├── Profile.jsx        ⚠️  Not implemented
│   │   └── Verify.jsx         🟡 Partial (GPS needs work)
│   ├── payment/
│   │   └── PaymentVerification.jsx 🟡 Partial (API calls needed)
│   ├── layout/
│   │   └── Header.jsx         ✅ Ready
│   └── Sidebar/
│       └── Navbar.jsx         ✅ Ready
├── context/
│   └── AuthContext.jsx        ✅ Ready
├── api/
│   ├── apiClient.js           ✅ Ready (configured)
│   └── auth.jsx               ⚠️  Check if needed
└── data/
    ├── dummyData.js
    └── fakedata.js
```

---

## Step-by-Step Implementation Tasks

### Task 1: Verify Login Works with Backend
```jsx
// Test in Login.jsx - Already uses correct endpoint
POST /api/auth/login
Expected response: { token: "jwt...", user: { id, email, role_name } }
```

### Task 2: Update API Endpoints
Replace hardcoded URLs with proper backend endpoints:

**PaymentVerification.jsx:**
```jsx
// OLD: GET /api/suppliers
// NEW: GET /api/suppliers (with Authorization header)

// Add new endpoint for location verification:
POST /api/verify-location
  Payload: { user_lat, user_lon, supplier_id }
  Returns: { success, distance, message }
```

**Dashboard.jsx:**
```jsx
// Fetch suppliers for admin
GET /api/suppliers

// Fetch transaction logs (when endpoint is ready)
GET /api/transactions-log

// Dashboard stats
GET /api/admin/dashboard
```

### Task 3: Implement Location Verification
```jsx
// In PaymentVerification.jsx
const verifyLocation = async (userLat, userLon, supplierId) => {
  const response = await axios.post('/api/verify-location', {
    user_lat: userLat,
    user_lon: userLon,
    supplier_id: supplierId
  });
  // response.data: { success, distance, message, payment_status }
};
```

### Task 4: Add Leaflet Map Integration
```bash
npm install leaflet react-leaflet
```

Create MapComponent.jsx:
```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

// Display user location and supplier location
// Show distance between them
```

### Task 5: Complete Admin Dashboard
```jsx
// Display suppliers
// Display transactions (when logs endpoint ready)
// Show statistics
// Manage suppliers (create, edit, delete)
```

---

## API Integration Checklist

- [ ] Test login with `admin@example.com / admin123`
- [ ] Test login with `agent@example.com / agent123`
- [ ] Verify JWT is stored and sent with requests
- [ ] Test `GET /api/suppliers` returns list
- [ ] Test location verification flow (when backend endpoint ready)
- [ ] Test role-based access (403 on unauthorized routes)
- [ ] Test error handling (400, 401, 403, 500)

---

## Development Quick Start

```bash
# Start backend
cd backend
source venv/bin/activate
python3 app.py

# Seed test data (if needed)
python3 seed_data.py

# In another terminal - Start frontend
cd frontend/Geo-vendor
npm start
```

**Test User Credentials:**
- Admin: `admin@example.com` / `admin123`
- Field Agent: `agent@example.com` / `agent123`

---

## Notes on Backend Implementation

### Missing Endpoints (Need to implement in backend)

1. **Location Verification Endpoint**
   ```python
   @app.route('/api/verify-location', methods=['POST'])
   @role_required('Field Agent')
   def verify_location():
       # Haversine calculation
       # Check distance <= 20m
       # Trigger M-Pesa payment if verified
       # Log transaction
   ```

2. **Transaction Logs Endpoint**
   ```python
   @app.route('/api/transactions-log', methods=['GET'])
   @role_required('Admin')
   def get_transactions():
       # Return last 10 transactions with status
   ```

3. **User Management Endpoint**
   ```python
   @app.route('/api/users', methods=['GET'])
   @role_required('Admin')
   def get_users():
       # Return all users
   ```

These would be in the backend but appear to be not yet fully implemented. Check with backend team or implement them.

---

## Frontend Priorities

1. **HIGH**: Fix API endpoints to use real backend URLs
2. **HIGH**: Complete location verification flow
3. **HIGH**: Implement proper error handling & loading states
4. **MEDIUM**: Add map visualization
5. **MEDIUM**: Complete admin dashboard
6. **LOW**: Polish UI/UX with Tailwind

