# 🚀 M-Pesa B2C Integration - Quick Reference

## 📞 Key Endpoints

### Authentication
```bash
POST /api/auth/login
{"email": "agent@test.com", "password": "pass123"}
→ {"token": "JWT...", "role_name": "Field Agent"}
```

### Location Verification + Payment
```bash
POST /api/location/verify-location
Headers: Authorization: Bearer JWT...
{
  "user_lat": -1.286389,
  "user_lon": 36.817223,
  "supplier_id": 1,
  "amount": 100
}
→ {"verified": true, "status": "PAYMENT_SENT", "distance": 15.2, ...}
```

### View Transactions (Admin)
```bash
GET /api/admin/transactions-log
Headers: Authorization: Bearer JWT...
→ {"transactions": [...], "total": 10}
```

---

## 🔑 M-Pesa Sandbox Credentials

```env
Consumer Key: RKTkC4t1q7jmrU2YGQH8XzGK0tILHj4IIfaiMomLm0fY9hSO
Consumer Secret: pMEInQDTj6h09Z3x8oX47R2Ckyvp4oyk7PieXAGr19M9GxdfTvEvJzBJtLykwhqw
Environment: sandbox
Shortcode: 600998
Initiator Name: testapi
Security Credential: Safaricom999!*!
```

**Test Phone Numbers:**
- 254708374149
- 254712345678
- 254711222333

---

## 🎯 Quick Start Commands

### Start Server
```bash
./start.sh  # Interactive menu
# OR
python app.py
```

### Run Tests
```bash
python test_mpesa_integration.py
```

### Check Database
```bash
sqlite3 data/geo_vendor.db "SELECT * FROM transactions_log LIMIT 5;"
```

---

## 📊 Transaction Status Flow

```
VERIFICATION_OK → PAYMENT_SENT → PAYMENT_SUCCESS
                               ↓
                         PAYMENT_FAILED
```

**Status Codes:**
- `VERIFICATION_OK` - Location verified (≤20m)
- `VERIFICATION_FAIL` - Location failed (>20m)
- `PAYMENT_SENT` - M-Pesa accepted request
- `PAYMENT_FAILED` - M-Pesa rejected
- `PAYMENT_SUCCESS` - Callback confirmed completion

---

## 🐛 Common Issues

### "Failed to get access token"
→ Check Consumer Key/Secret in .env

### "ResponseCode: 400"
→ Phone number must be 254XXXXXXXXX (no +, no spaces)
→ Use sandbox shortcode: 600998

### "Transaction not found"
→ Check database: `SELECT * FROM transactions_log;`

### "Distance exceeds 20m"
→ Update test coordinates to be near supplier location

---

## 📱 Test Flow

1. **Login**: `POST /api/auth/login`
2. **Verify**: `POST /api/location/verify-location`
3. **Check logs**: `GET /api/admin/transactions-log`

---

## 🔐 .env Required Variables

```env
# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_EXPIRATION_HOURS=24

# M-Pesa
MPESA_CONSUMER_KEY=...
MPESA_CONSUMER_SECRET=...
MPESA_ENVIRONMENT=sandbox
MPESA_SHORTCODE=600998
MPESA_INITIATOR_NAME=testapi
MPESA_SECURITY_CREDENTIAL=Safaricom999!*!
PAYMENT_AMOUNT=100
```

---

## 📚 File Structure

```
backend/
├── app.py                          # Main Flask app
├── config.py                       # Configuration
├── requirements.txt                # Dependencies
├── .env                            # Credentials (DO NOT COMMIT!)
├── services/
│   └── mpesa_service.py            # B2C payment logic
├── routes/
│   ├── location_verification.py   # Location + payment
│   ├── mpesa_callbacks.py          # M-Pesa callbacks
│   └── admin_routes.py             # Transaction logs
└── models/
    ├── transaction_log.py          # Transaction model
    └── supplier.py                 # Supplier model
```

---

## 🎓 Key Functions

### Initiate Payment
```python
from services.mpesa_service import initiate_vendor_payment

result = initiate_vendor_payment(
    phone_number='254712345678',
    amount=100,
    supplier_id=1,
    agent_id=5,
    remarks='Payment for delivery'
)
```

### Calculate Distance
```python
from utils.geoutils import haversine_distance

distance = haversine_distance(
    user_lat=-1.286389,
    user_lon=36.817223,
    supplier_lat=-1.286390,
    supplier_lon=36.817220
)
# Returns distance in meters
```

---

## ✅ Testing Checklist

- [ ] Server starts without errors
- [ ] Field Agent can login
- [ ] Location verification calculates distance
- [ ] Payment initiates (check logs)
- [ ] Transaction appears in database
- [ ] Admin can view transactions
- [ ] M-Pesa sandbox shows API call

---

## 🚀 Deployment

### Production Changes:
1. Update MPESA_ENVIRONMENT=production
2. Get production credentials from Daraja Portal
3. Deploy to public URL (Render/Heroku)
4. Update callback URLs
5. Generate production security credential
6. Test with small amounts first!

---

## 📞 Support Resources

- 📖 [Full Testing Guide](MPESA_TESTING_GUIDE.md)
- 📝 [Implementation Summary](IMPLEMENTATION_SUMMARY.md)
- 🌐 [Daraja API Docs](https://developer.safaricom.co.ke/)
- 🔗 [B2C API Reference](https://developer.safaricom.co.ke/APIs/BusinessToCustomer)

---

## 💡 Tips

1. **Always check server logs** for detailed error messages
2. **Use test phone numbers** provided by Safaricom
3. **Verify supplier coordinates** are accurate
4. **Test distance calculation** before deploying
5. **Monitor transaction status** in database

---

**Last Updated:** January 15, 2026
**Version:** 1.0.0
