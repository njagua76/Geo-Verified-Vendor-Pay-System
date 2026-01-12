# Frontend Quick Start & Testing Guide

## Project Status Overview

### ✅ Completed Components
1. **Authentication System** (F-A1)
   - Login form with validation
   - JWT token management
   - Auto-redirect based on role
   - Axios interceptors for auth headers

2. **Role-Based Routing** (F-A2)
   - ProtectedRoute component with role checking
   - Admin → Dashboard, Field Agent → Verify
   - Proper 401/403 error handling

3. **API Client Setup**
   - Centralized apiClient with interceptors
   - Supplier endpoints configured
   - Verification endpoints configured
   - Transaction log endpoints configured

4. **Location Verification** (F-R1)
   - GPS capture with error handling
   - Haversine distance calculation
   - 20m threshold validation (per requirements)
   - Real-time distance feedback

5. **Payment Status UI** (F-R3)
   - Dynamic status colors (success/error/loading)
   - Step-by-step flow (Select → Verify → Pay)
   - Loading states and spinners
   - Error message display

---

## Quick Start

### Prerequisites
```bash
# Frontend requirements already installed
cd /home/njagua/Phase5/frontend/Geo-vendor
npm install  # Already done

# Backend should be running
cd /home/njagua/Phase5/backend
source venv/bin/activate
python3 app.py  # Runs on http://localhost:5000
```

### Start Frontend
```bash
cd /home/njagua/Phase5/frontend/Geo-vendor
npm start
# Opens on http://localhost:3000
```

### Test with Seeded Data

**Test Credentials:**
```
Admin Account:
  Email: admin@example.com
  Password: admin123
  Access: /dashboard

Field Agent Account:
  Email: agent@example.com
  Password: agent123
  Access: /verify
```

---

## Testing Checklist

### 1. Authentication Flow
- [ ] Login with `admin@example.com / admin123`
- [ ] Should redirect to `/dashboard`
- [ ] Token should be in localStorage
- [ ] Logout should clear token and redirect to login

### 2. Field Agent Verification Flow
- [ ] Login with `agent@example.com / agent123`
- [ ] Should redirect to `/verify`
- [ ] Should see supplier list (if suppliers exist)
- [ ] Click "Get My Location"
- [ ] Check distance calculation
- [ ] If within 20m, show success message

### 3. API Integration
- [ ] Suppliers load from `GET /api/suppliers`
- [ ] Location verification calls `POST /api/verify-location`
- [ ] JWT token sent in Authorization header
- [ ] 403 error when wrong role accesses endpoint

### 4. Error Handling
- [ ] Invalid credentials show error
- [ ] 401 error clears token and redirects
- [ ] 403 error shows unauthorized message
- [ ] Network errors show user-friendly message

---

## Component Hierarchy

```
App.jsx (Router setup)
├── AuthProvider (JWT + Role management)
├── Login.jsx (Public route)
├── ProtectedRoute.jsx (Wrapper for protected routes)
│   ├── /dashboard → Dashboard.jsx (Admin only)
│   └── /verify → Verify.jsx (Field Agent only)
│       └── PaymentVerification.jsx
│           ├── GPS location capture
│           ├── Supplier selection
│           ├── Distance calculation (Haversine)
│           └── Payment processing
```

---

## Key Files & Their Purposes

| File | Purpose | Status |
|------|---------|--------|
| `src/context/AuthContext.jsx` | Token & role management | ✅ Complete |
| `src/api/apiClient.js` | Axios configuration + endpoints | ✅ Complete |
| `src/components/Auth/ProtectedRoute.jsx` | Route guard with role check | ✅ Complete |
| `src/pages/Login.jsx` | Login form with validation | ✅ Complete |
| `src/pages/Verify.jsx` | Field Agent verify page | ✅ Ready |
| `src/components/payment/PaymentVerification.jsx` | GPS + payment logic | ✅ Complete |
| `src/pages/Dashboard.jsx` | Admin dashboard | 🟡 Partial |

---

## What's Integrated with Backend

### Working Endpoints
```
✅ POST /api/auth/login
   - Sends email + password
   - Returns JWT token + user data
   
✅ GET /api/suppliers
   - Returns list of suppliers
   - Admin role required (via decorator)
   - Frontend filters by role

✅ GET /api/suppliers/<id>
   - Returns single supplier
   - Used for location verification
```

### To Be Implemented (Backend)
```
⚠️  POST /api/verify-location
   - Expected request: { user_lat, user_lon, supplier_id }
   - Expected response: { success, distance, message }
   - Should trigger M-Pesa integration

⚠️  GET /api/transactions-log
   - Expected response: [ { id, supplier_id, amount, status, timestamp } ]
   - For admin dashboard
```

---

## Frontend Remaining Work

### High Priority
1. **Test with actual backend**
   - Start backend: `cd backend && python3 app.py`
   - Start frontend: `cd frontend/Geo-vendor && npm start`
   - Test login flow
   - Test supplier loading

2. **Backend Endpoints** (Coordinate with backend team)
   - Implement `/api/verify-location`
   - Implement `/api/transactions-log`
   - Implement M-Pesa integration

### Medium Priority
1. **Map Visualization** (F-R2)
   ```bash
   npm install leaflet react-leaflet
   ```
   - Show user location marker
   - Show supplier location marker
   - Display distance on map

2. **Admin Dashboard Completion**
   - Fetch and display suppliers
   - Fetch and display transactions
   - CRUD operations for suppliers

### Low Priority
1. **UI Polish**
   - Add Tailwind animations
   - Better error messages
   - Loading skeleton screens

---

## Common Issues & Solutions

### "Cannot GET /api/suppliers"
**Cause**: Backend not running
**Solution**: Start backend with `python3 app.py` in backend folder

### "401 Unauthorized"
**Cause**: JWT token not sent or invalid
**Solution**: Ensure token is in localStorage and headers configured

### "403 Forbidden"
**Cause**: User role doesn't match required role
**Solution**: Check user role in /dashboard or /verify routes

### Location permission denied
**Cause**: Browser location permission not granted
**Solution**: Allow location access in browser settings

### Distance always shows 0
**Cause**: Latitude/longitude not properly formatted
**Solution**: Check supplier coordinates in database

---

## Environment Variables

**Frontend (.env)**
```
REACT_APP_API_URL=http://localhost:5000
```

**Backend (.env)**
```
FLASK_ENV=development
DATABASE_URL=postgresql://geo_user:9090@localhost:5432/geo_vendor_db
JWT_SECRET_KEY=bKKLf1fF301ro6ppomrh7iRljdz8QQPHY_gpNhJ6NOU
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

---

## Next Steps

1. **Run backend & test login**
2. **Check supplier list loads**
3. **Test GPS location capture**
4. **Test location verification** (once backend endpoint ready)
5. **Add map component** (Leaflet)
6. **Complete admin dashboard**
7. **Performance testing**
8. **Deployment to Vercel**

---

## Important Notes

- ✅ Frontend is ready for testing with backend
- ⚠️ Backend `/api/verify-location` endpoint needs implementation
- ⚠️ Backend `/api/transactions-log` endpoint needs implementation
- 📍 Distance threshold: 20 meters (per requirements)
- 🔐 JWT token automatically attached to all requests
- 🎯 Role-based routing prevents unauthorized access

**You're ready to start testing!** Just ensure the backend is running with seeded data.
