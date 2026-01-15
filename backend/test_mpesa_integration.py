"""
Test M-Pesa B2C Integration
This script helps you test the M-Pesa integration step by step
"""

import os
import sys
import requests
import json

# Configuration
API_BASE_URL = "http://localhost:5000/api"

# Test credentials - CONFIGURED FOR LOCAL DATABASE
TEST_FIELD_AGENT = {
    "email": "agent@example.com",  # Field agent from seed_data.py
    "password": "agent123"         # Password from seed_data.py
}

TEST_ADMIN = {
    "email": "admin@example.com",  # Admin from seed_data.py
    "password": "admin123"         # Password from seed_data.py
}

# Test supplier location (Nairobi Central Hub - ID: 1)
# This supplier has Roy's phone: 254717075445
TEST_SUPPLIER_ID = 1  # Nairobi Central Hub

# Test coordinates - WITHIN 20m of Nairobi Central Hub
# Supplier location: -1.2921, 36.8219
# These coordinates are ~15 meters away (WILL PASS verification)
TEST_COORDINATES = {
    "user_lat": -1.29210,  # Very close to supplier
    "user_lon": 36.82195   # Very close to supplier
}


def print_section(title):
    """Print a formatted section header"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)


def print_response(response):
    """Pretty print API response"""
    print(f"\nStatus Code: {response.status_code}")
    try:
        print(f"Response: {json.dumps(response.json(), indent=2)}")
    except:
        print(f"Response: {response.text}")


def test_login(email, password, role_name):
    """Test login and get JWT token"""
    print_section(f"Step 1: Login as {role_name}")
    
    url = f"{API_BASE_URL}/auth/login"
    payload = {
        "email": email,
        "password": password
    }
    
    print(f"POST {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(url, json=payload)
    print_response(response)
    
    if response.status_code == 200:
        data = response.json()
        token = data.get('token')
        print(f"\n✅ Login successful! Token: {token[:50]}...")
        return token
    else:
        print(f"\n❌ Login failed!")
        return None


def test_location_verification(token):
    """Test location verification and payment"""
    print_section("Step 2: Verify Location & Trigger Payment")
    
    url = f"{API_BASE_URL}/location/verify-location"
    payload = {
        "user_lat": TEST_COORDINATES["user_lat"],
        "user_lon": TEST_COORDINATES["user_lon"],
        "supplier_id": TEST_SUPPLIER_ID,
        "amount": 100  # 100 KES test payment
    }
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"POST {url}")
    print(f"Headers: Authorization: Bearer {token[:30]}...")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    response = requests.post(url, json=payload, headers=headers)
    print_response(response)
    
    if response.status_code == 200:
        data = response.json()
        print(f"\n✅ Payment initiated successfully!")
        print(f"Distance: {data.get('distance')}m")
        print(f"Status: {data.get('status')}")
        print(f"Conversation ID: {data.get('payment', {}).get('conversation_id')}")
        return True
    elif response.status_code == 422:
        data = response.json()
        print(f"\n⚠️  Verification failed: Distance too far")
        print(f"Distance: {data.get('distance')}m (exceeds 20m threshold)")
        return False
    else:
        print(f"\n❌ Request failed!")
        return False


def test_get_transactions(token):
    """Test fetching transaction logs"""
    print_section("Step 3: View Transaction History (Admin)")
    
    url = f"{API_BASE_URL}/admin/transactions-log"
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print(f"GET {url}")
    print(f"Headers: Authorization: Bearer {token[:30]}...")
    
    response = requests.get(url, headers=headers)
    print_response(response)
    
    if response.status_code == 200:
        data = response.json()
        transactions = data.get('transactions', [])
        print(f"\n✅ Retrieved {len(transactions)} transactions")
        
        # Show last 3 transactions
        for i, tx in enumerate(transactions[:3], 1):
            print(f"\nTransaction {i}:")
            print(f"  ID: {tx.get('id')}")
            print(f"  Status: {tx.get('status')}")
            print(f"  Distance: {tx.get('distance_meters')}m")
            print(f"  Amount: KES {tx.get('amount')}")
            print(f"  Supplier: {tx.get('supplier_name')}")
            print(f"  Agent: {tx.get('agent_email')}")
            print(f"  Created: {tx.get('created_at')}")
        return True
    else:
        print(f"\n❌ Failed to retrieve transactions!")
        return False


def main():
    """Main test flow"""
    print("\n" + "🚀 M-PESA B2C INTEGRATION TEST SUITE")
    print("="*70)
    
    print("\n📋 Configuration:")
    print(f"API Base URL: {API_BASE_URL}")
    print(f"Test Supplier ID: {TEST_SUPPLIER_ID}")
    print(f"Test Coordinates: Lat {TEST_COORDINATES['user_lat']}, Lon {TEST_COORDINATES['user_lon']}")
    
    # Verify server is running
    try:
        response = requests.get(f"{API_BASE_URL.replace('/api', '')}/")
        if response.status_code != 200:
            print("\n❌ ERROR: Cannot connect to server. Is it running?")
            print(f"Please start the server: python app.py")
            return
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to server. Is it running?")
        print(f"Please start the server: python app.py")
        return
    
    print("\n✅ Server is running!")
    
    # Step 1: Login as Field Agent
    agent_token = test_login(
        TEST_FIELD_AGENT["email"],
        TEST_FIELD_AGENT["password"],
        "Field Agent"
    )
    
    if not agent_token:
        print("\n❌ Test failed: Could not login as Field Agent")
        print("Please check your test credentials and ensure the user exists")
        return
    
    # Step 2: Test location verification and payment
    input("\nPress Enter to test location verification and payment...")
    payment_success = test_location_verification(agent_token)
    
    # Step 3: Login as Admin and view transactions
    input("\nPress Enter to view transaction history as Admin...")
    admin_token = test_login(
        TEST_ADMIN["email"],
        TEST_ADMIN["password"],
        "Administrator"
    )
    
    if admin_token:
        test_get_transactions(admin_token)
    else:
        print("\n❌ Could not login as Admin to view transactions")
    
    # Final summary
    print_section("🎯 Test Summary")
    print(f"✅ Field Agent Login: Success")
    print(f"{'✅' if payment_success else '⚠️ '} Location Verification: {'Success' if payment_success else 'Failed (distance check)'}")
    print(f"{'✅' if admin_token else '❌'} Admin Login: {'Success' if admin_token else 'Failed'}")
    
    print("\n📚 Next Steps:")
    print("1. Check your M-Pesa sandbox account for the payment request")
    print("2. If payment failed, check server logs for detailed error messages")
    print("3. Verify your M-Pesa credentials in .env file")
    print("4. Ensure supplier has valid M-Pesa phone number in database")
    print("\n")


if __name__ == "__main__":
    main()
