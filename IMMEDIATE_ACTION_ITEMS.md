# Immediate Action Items - Next Steps for You

## 🚀 What You Can Do Right Now (Next 30 minutes)

### 1. Start Backend & Test Login ✨
```bash
# Terminal 1: Start Backend
cd /home/njagua/Phase5/backend
source venv/bin/activate
python3 app.py
# Should see: Running on http://localhost:5000

# Terminal 2: Start Frontend
cd /home/njagua/Phase5/frontend/Geo-vendor
npm start
# Should open http://localhost:3000 in browser
```

### 2. Test Login Flow
```
1. Go to http://localhost:3000
2. Enter: admin@example.com / admin123
3. Should redirect to /dashboard
4. Logout and try: agent@example.com / agent123
5. Should redirect to /verify
```

### 3. Test Supplier Loading
```
1. Login as agent@example.com / agent123
2. Go to /verify page
3. Check if "Select Supplier Hub" dropdown loads
4. If it loads, suppliers are being fetched from backend ✅
```

### 4. Check Backend Endpoints
```bash
# Test these in another terminal (with curl or Postman)

# Login endpoint
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Get suppliers (requires JWT token from login)
curl -X GET http://localhost:5000/api/suppliers \
  -H "Authorization: Bearer <YOUR_JWT_TOKEN>"
```

---

## 🔧 Backend Work Needed (Coordinate with Backend Team)

### HIGH PRIORITY - Implement These 2 Endpoints:

#### 1. Location Verification Endpoint
```python
# File: backend/routes/protected_routes.py

@protected_bp.route('/verify-location', methods=['POST'])
@role_required('Field Agent')
def verify_location(current_user):
    """
    Verify field agent location and process payment.
    
    Request body:
    {
        "user_lat": float,      # Agent's GPS latitude
        "user_lon": float,      # Agent's GPS longitude
        "supplier_id": int      # Target supplier ID
    }
    
    Response (Success):
    {
        "success": true,
        "distance": 15.3,       # Distance in meters
        "message": "Location verified. Payment processing..."
    }
    
    Response (Too far):
    {
        "success": false,
        "distance": 45.2,
        "message": "Too far from supplier. Must be within 20m."
    }
    """
    data = request.get_json()
    user_lat = data['user_lat']
    user_lon = data['user_lon']
    supplier_id = data['supplier_id']
    
    supplier = Supplier.query.get(supplier_id)
    if not supplier:
        return jsonify({'error': 'Supplier not found'}), 404
    
    # Calculate distance using Haversine
    distance = haversine(user_lat, user_lon, supplier.latitude, supplier.longitude)
    
    if distance > 20:  # 20 meters threshold
        return jsonify({
            'success': False,
            'distance': distance,
            'message': f'Too far. You are {distance:.1f}m away, need to be within 20m'
        }), 400
    
    # If here, distance is <= 20m
    # TODO: Trigger M-Pesa B2C payment here
    # TODO: Log transaction
    
    return jsonify({
        'success': True,
        'distance': distance,
        'message': f'Location verified at {distance:.1f}m. Processing payment...'
    }), 200
```

#### 2. Transaction Logs Endpoint
```python
# File: backend/routes/protected_routes.py

@protected_bp.route('/transactions-log', methods=['GET'])
@role_required('Admin')
def get_transactions_log(current_user):
    """
    Get all transactions for admin dashboard.
    
    Response:
    {
        "transactions": [
            {
                "id": 1,
                "supplier_id": 1,
                "supplier_name": "Hub A",
                "user_email": "agent@example.com",
                "amount": 5000,
                "status": "PAYMENT_SENT",  // or VERIFICATION_FAIL, PAYMENT_FAILED
                "distance": 15.3,
                "timestamp": "2026-01-09T15:30:00Z"
            },
            ...
        ],
        "count": 10
    }
    """
    # Fetch last 10 transactions
    transactions = TransactionLog.query.order_by(
        TransactionLog.timestamp.desc()
    ).limit(10).all()
    
    return jsonify({
        'transactions': [t.to_dict() for t in transactions],
        'count': len(transactions)
    }), 200
```

---

## 📝 Frontend Work (You Can Do)

### Task 1: Test Current Implementation (15 min)
- [ ] Backend running ✅
- [ ] Frontend running ✅
- [ ] Login works with seeded credentials ✅
- [ ] Suppliers load from backend ✅
- [ ] Role-based routing works ✅

### Task 2: Add Map Component (45 min)
```bash
npm install leaflet react-leaflet
```

Create `src/components/map/SupplierMap.jsx`:
```jsx
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

export const SupplierMap = ({ userLocation, supplier }) => {
  return (
    <MapContainer center={[userLocation.latitude, userLocation.longitude]} zoom={17} style={{ height: '400px' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {userLocation && (
        <Marker position={[userLocation.latitude, userLocation.longitude]}>
          <Popup>Your Location</Popup>
        </Marker>
      )}
      {supplier && (
        <Marker position={[supplier.latitude, supplier.longitude]}>
          <Popup>{supplier.name}</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};
```

Use in PaymentVerification.jsx:
```jsx
{location && selectedSupplier && (
  <SupplierMap 
    userLocation={location} 
    supplier={suppliers.find(s => s.id === parseInt(selectedSupplier))}
  />
)}
```

### Task 3: Complete Admin Dashboard (1 hour)
Update Dashboard.jsx to:
- [ ] Fetch real suppliers with GET /api/suppliers
- [ ] Display supplier list in table
- [ ] Show transaction logs once endpoint ready
- [ ] Add CRUD buttons (Edit/Delete suppliers)
- [ ] Format dates and numbers properly

---

## 🧪 Testing Flow (5-10 min)

1. **Login Test**
   - Admin: admin@example.com / admin123 → /dashboard
   - Agent: agent@example.com / agent123 → /verify

2. **Supplier Test**
   - On /verify page, dropdown should show suppliers from backend
   - If empty, check if backend has suppliers or seed data

3. **Location Test** (when you have GPS)
   - Select a supplier
   - Click "Get My Location"
   - Allow location access
   - See calculated distance

4. **Payment Test** (when backend endpoint ready)
   - Location verified (≤20m)
   - Enter amount
   - Click "Send Payment"
   - Should complete successfully

---

## 🚀 Deploy Checklist (For Later)

### Before Staging:
- [ ] Backend endpoints implemented
- [ ] All tests passing
- [ ] No console errors
- [ ] Proper error messages
- [ ] Loading states working

### Before Production:
- [ ] Environment variables set
- [ ] HTTPS enabled
- [ ] Security review
- [ ] Performance testing
- [ ] Mobile testing
- [ ] Backup plan ready

---

## 📞 Help & Questions

### If suppliers don't load:
1. Check backend is running: `ps aux | grep python`
2. Check backend console for errors
3. Verify database has suppliers (seed if needed)
4. Check network tab in browser DevTools

### If login fails:
1. Check backend logs
2. Verify database has users (should be seeded)
3. Try exact credentials: admin@example.com / admin123
4. Check JWT_SECRET_KEY in backend config

### If location verification fails:
1. Backend endpoint `/api/verify-location` not implemented yet
2. Check browser console for error details
3. Verify you're within 20m of supplier location (test with mock data)

---

## ✅ Success Criteria

You'll know everything is working when:
1. ✅ Login with seeded credentials works
2. ✅ Admin sees dashboard, Agent sees verify page
3. ✅ Suppliers load in dropdown
4. ✅ GPS location capture works
5. ✅ Distance calculation shows correct values
6. ✅ Payment button enables only after location verified

---

**Status**: 🟢 Ready for Testing
**Next Review**: After backend endpoint implementation
**Est. Time**: 2-3 hours total

Good luck! You've got this! 🚀
