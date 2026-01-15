# M-Pesa B2C Integration Testing Guide

This guide will help you test the M-Pesa B2C payment integration step-by-step.

## 📋 Prerequisites

1. **M-Pesa Sandbox Account**: You have your Consumer Key and Consumer Secret
2. **Database**: PostgreSQL or SQLite with tables created
3. **Test Users**: At least one Field Agent and one Admin user in the database
4. **Test Supplier**: At least one supplier with a valid M-Pesa phone number

---

## 🔧 Step 1: Verify Configuration

### Check .env file
```bash
cat .env
```

Ensure these variables are set:
```env
MPESA_CONSUMER_KEY=RKTkC4t1q7jmrU2YGQH8XzGK0tILHj4IIfaiMomLm0fY9hSO
MPESA_CONSUMER_SECRET=pMEInQDTj6h09Z3x8oX47R2Ckyvp4oyk7PieXAGr19M9GxdfTvEvJzBJtLykwhqw
MPESA_ENVIRONMENT=sandbox
MPESA_SHORTCODE=600998
MPESA_INITIATOR_NAME=testapi
MPESA_SECURITY_CREDENTIAL=Safaricom999!*!
PAYMENT_AMOUNT=100
```

---

## 🚀 Step 2: Start the Server

```bash
# Activate virtual environment
source .venv/bin/activate  # or venv/bin/activate

# Install dependencies (if not done yet)
pip install -r requirements.txt

# Run the Flask app
python app.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
```

---

## 🧪 Step 3: Run Automated Tests

```bash
# In a new terminal (keep the server running in the first terminal)
python test_mpesa_integration.py
```

**Before running, update these values in `test_mpesa_integration.py`:**

```python
TEST_FIELD_AGENT = {
    "email": "agent@test.com",     # Your actual field agent email
    "password": "password123"       # Your actual password
}

TEST_ADMIN = {
    "email": "admin@test.com",      # Your actual admin email
    "password": "password123"       # Your actual password
}

TEST_SUPPLIER_ID = 1  # Your actual supplier ID from database

TEST_COORDINATES = {
    "user_lat": -1.286389,  # Within 20m of your test supplier
    "user_lon": 36.817223   # Within 20m of your test supplier
}
```

---

## 🔍 Step 4: Manual Testing with cURL/Postman

### Test 1: Login as Field Agent

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@test.com",
    "password": "password123"
  }'
```

**Expected Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "role_name": "Field Agent",
  "user": {
    "id": 1,
    "email": "agent@test.com"
  }
}
```

**Save the token for next requests!**

---

### Test 2: Verify Location & Trigger Payment

```bash
# Replace <TOKEN> with the JWT from login
# Replace coordinates and supplier_id with your test data

curl -X POST http://localhost:5000/api/location/verify-location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{
    "user_lat": -1.286389,
    "user_lon": 36.817223,
    "supplier_id": 1,
    "amount": 100
  }'
```

**Expected Response (Success):**
```json
{
  "verified": true,
  "distance": 15.23,
  "status": "PAYMENT_SENT",
  "message": "Location verified and payment sent successfully!",
  "payment": {
    "amount": 100,
    "currency": "KES",
    "recipient": "254712345678",
    "conversation_id": "AG_20250115_xxxx",
    "transaction_id": 1
  },
  "supplier": {
    "id": 1,
    "name": "Test Supplier",
    "supplier_id": "SUP001"
  }
}
```

**Expected Response (Distance Failed):**
```json
{
  "verified": false,
  "distance": 35.67,
  "status": "VERIFICATION_FAIL",
  "message": "Distance 35.67m exceeds 20m limit"
}
```

---

### Test 3: View Transaction History (Admin)

```bash
# First, login as Admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "password123"
  }'

# Then, get transactions
curl -X GET http://localhost:5000/api/admin/transactions-log \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Expected Response:**
```json
{
  "transactions": [
    {
      "id": 1,
      "status": "PAYMENT_SENT",
      "distance_meters": 15.23,
      "amount": 100,
      "phone_number": "254712345678",
      "supplier_name": "Test Supplier",
      "agent_email": "agent@test.com",
      "created_at": "2025-01-15T10:30:00",
      "mpesa_checkout_id": "AG_20250115_xxxx"
    }
  ],
  "total": 1
}
```

---

## 📊 Step 5: Check M-Pesa Sandbox

1. **Login to Daraja Portal**: https://developer.safaricom.co.ke/
2. **Go to "My Apps"** → Select your app
3. **Check "Test Credentials"** section
4. **View API Logs** to see your B2C requests

### What to Look For:
- ✅ **200 Response**: Payment request accepted
- ✅ **ResponseCode: 0**: Success
- ❌ **401 Unauthorized**: Check your Consumer Key/Secret
- ❌ **400 Bad Request**: Check your payload format
- ❌ **500 Internal Error**: M-Pesa service issue (retry later)

---

## 🐛 Troubleshooting

### Problem: "Failed to obtain M-Pesa access token"

**Solution:**
1. Verify Consumer Key and Secret in .env
2. Check if you're using the correct environment (sandbox vs production)
3. Test OAuth token generation:

```bash
curl -X GET 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials' \
  -H 'Authorization: Basic <BASE64_ENCODED_KEY:SECRET>'
```

---

### Problem: "Payment request failed with ResponseCode: 400"

**Possible causes:**
1. **Invalid phone number format** - Must be `254XXXXXXXXX` (no +, no spaces)
2. **Invalid shortcode** - Use `600998` for sandbox
3. **Invalid security credential** - Use `Safaricom999!*!` for sandbox
4. **Invalid initiator name** - Use `testapi` for sandbox

**Fix:**
```bash
# Verify supplier phone number in database
sqlite3 data/geo_vendor.db "SELECT id, name, mpesa_phone_number FROM suppliers;"

# Update if needed
sqlite3 data/geo_vendor.db "UPDATE suppliers SET mpesa_phone_number='254712345678' WHERE id=1;"
```

---

### Problem: "Transaction not found in logs"

**Check database directly:**
```bash
# For SQLite
sqlite3 data/geo_vendor.db "SELECT * FROM transactions_log ORDER BY created_at DESC LIMIT 5;"

# For PostgreSQL
psql $DATABASE_URL -c "SELECT * FROM transactions_log ORDER BY created_at DESC LIMIT 5;"
```

---

### Problem: Server logs show errors

**Enable detailed logging:**

In `app.py`, add:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Check logs:**
```bash
# Logs will print to console where you ran `python app.py`
# Look for:
# ✅ Success indicators
# ❌ Error messages
# 📡 M-Pesa API responses
```

---

## 📱 Step 6: Testing with Real Phone Numbers (Sandbox)

In M-Pesa sandbox, you can use **test phone numbers**:

### Test Numbers Provided by Safaricom:
```
254708374149
254712345678
254711222333
```

### Update your test supplier:
```sql
UPDATE suppliers 
SET mpesa_phone_number = '254708374149' 
WHERE id = 1;
```

**Note**: In sandbox, money doesn't actually transfer. You'll see successful responses, but no real money moves.

---

## 🎯 Expected Flow Summary

1. **Field Agent logs in** → Receives JWT token
2. **Field Agent sends location** → Backend calculates distance
3. **If distance ≤ 20m:**
   - ✅ Create transaction log (status: VERIFICATION_OK)
   - 💳 Call M-Pesa B2C API
   - 📝 Update transaction (status: PAYMENT_SENT or PAYMENT_FAILED)
   - 📱 Supplier receives money (in production)
4. **If distance > 20m:**
   - ❌ Create transaction log (status: VERIFICATION_FAIL)
   - Return 422 error
5. **Admin views dashboard** → Sees all transaction logs

---

## 📈 Next Steps

### For Production Deployment:

1. **Get Production Credentials**:
   - Apply for production app on Daraja Portal
   - Get production Consumer Key/Secret
   - Get production shortcode and initiator credentials
   - Generate production security credential using Safaricom's certificate

2. **Update .env**:
   ```env
   MPESA_ENVIRONMENT=production
   MPESA_CONSUMER_KEY=<production_key>
   MPESA_CONSUMER_SECRET=<production_secret>
   MPESA_SHORTCODE=<your_production_shortcode>
   MPESA_SECURITY_CREDENTIAL=<encrypted_password>
   ```

3. **Set up Callback URLs**:
   - Deploy your app to a public URL (Render, Heroku, etc.)
   - Update callback URLs in .env:
     ```env
     MPESA_B2C_QUEUE_TIMEOUT_URL=https://yourdomain.com/api/mpesa/b2c/timeout
     MPESA_B2C_RESULT_URL=https://yourdomain.com/api/mpesa/b2c/result
     ```

4. **Test thoroughly in sandbox before going live!**

---

## 📚 Additional Resources

- [Safaricom Daraja API Docs](https://developer.safaricom.co.ke/Documentation)
- [B2C API Reference](https://developer.safaricom.co.ke/APIs/BusinessToCustomer)
- [Sandbox Test Credentials](https://developer.safaricom.co.ke/test_credentials)

---

## ✅ Testing Checklist

- [ ] M-Pesa credentials configured in .env
- [ ] Server starts without errors
- [ ] Field Agent can login
- [ ] Admin can login
- [ ] Test supplier has valid M-Pesa phone number
- [ ] Location verification works (distance calculation)
- [ ] Payment initiated successfully (check logs)
- [ ] Transaction appears in admin dashboard
- [ ] Callback endpoints registered and accessible

---

**Good luck with testing! 🚀**
