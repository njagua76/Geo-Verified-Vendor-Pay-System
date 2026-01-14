#!/usr/bin/env python3
"""Simple script to initialize the database with suppliers."""
import sqlite3
import os

# Database path
db_path = os.path.join(os.path.dirname(__file__), 'data', 'geo_vendor.db')

# Ensure data directory exists
os.makedirs(os.path.dirname(db_path), exist_ok=True)

# Connect to database
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Create suppliers table
cursor.execute('''
CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    supplier_id TEXT UNIQUE NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    mpesa_phone_number TEXT,
    contact_person TEXT,
    contact_email TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

# Create transactions table
cursor.execute('''
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    transaction_id TEXT UNIQUE NOT NULL,
    supplier_id INTEGER,
    user_id INTEGER,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    distance REAL,
    latitude REAL,
    longitude REAL,
    mpesa_receipt TEXT,
    phone_number TEXT,
    result_desc TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
)
''')

# Create users table
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    role TEXT DEFAULT 'FieldAgent',
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
''')

print("Tables created!")

# Check if suppliers exist
cursor.execute('SELECT COUNT(*) FROM suppliers')
count = cursor.fetchone()[0]
print(f"Current suppliers: {count}")

# Add Executive Building if not exists
cursor.execute("SELECT * FROM suppliers WHERE supplier_id = 'SUP007'")
existing = cursor.fetchone()

if existing:
    print("Executive Building (SUP007) already exists!")
else:
    cursor.execute('''
        INSERT INTO suppliers (name, supplier_id, latitude, longitude, mpesa_phone_number, contact_person, contact_email, address)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        'Executive Building Mugutha',
        'SUP007',
        -1.1231552725673162,
        36.963508053527995,
        '+254722789012',
        'Henry Kipchoge',
        'henry@executive-mugutha.com',
        'Executive Building, Mugutha, Ruiru'
    ))
    conn.commit()
    print("Added Executive Building Mugutha (SUP007)")

# Add some test suppliers
test_suppliers = [
    ('NAI001', 'Nairobi Hardware', -1.286389, 36.817223, '+254700000001', 'John Doe', 'john@nairobi-hw.co.ke', 'Nairobi CBD'),
    ('MOM001', 'Mombasa Fisheries', -4.043477, 39.668205, '+254700000002', 'Ali Hassan', 'ali@mombasa-fish.co.ke', 'Mombasa Port'),
]

for sup_id, name, lat, lon, phone, person, email, addr in test_suppliers:
    cursor.execute("SELECT * FROM suppliers WHERE supplier_id = ?", (sup_id,))
    if not cursor.fetchone():
        cursor.execute('''
            INSERT INTO suppliers (name, supplier_id, latitude, longitude, mpesa_phone_number, contact_person, contact_email, address)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (name, sup_id, lat, lon, phone, person, email, addr))
        print(f"Added {name} ({sup_id})")

conn.commit()

# Show all suppliers
cursor.execute('SELECT supplier_id, name, latitude, longitude FROM suppliers ORDER BY supplier_id')
print("\nAll suppliers in database:")
for row in cursor.fetchall():
    print(f"  {row[0]}: {row[1]} ({row[2]}, {row[3]})")

# Close connection
conn.close()
print("\nDatabase initialization complete!")

