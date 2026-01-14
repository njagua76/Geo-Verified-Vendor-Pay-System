"""Quick script to seed the database with test data."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, Supplier

app = create_app()

with app.app_context():
    # Check if data directory exists
    data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'backend', 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    # Create tables
    db.create_all()
    print("Tables created!")
    
    # Check if suppliers exist
    existing = Supplier.query.first()
    if existing:
        print(f"Suppliers already exist: {Supplier.query.count()}")
    else:
        # Add Executive Building (SUP007) with coordinates
        supplier = Supplier(
            name='Executive Building Mugutha',
            supplier_id='SUP007',
            latitude=-1.1231552725673162,
            longitude=36.963508053527995,
            mpesa_phone_number='+254722789012',
            contact_person='Henry Kipchoge',
            contact_email='henry@executive-mugutha.com',
            address='Executive Building, Mugutha, Ruiru'
        )
        db.session.add(supplier)
        db.session.commit()
        print(f"Added Executive Building with coordinates: {supplier.latitude}, {supplier.longitude}")
    
    # List all suppliers
    suppliers = Supplier.query.all()
    print(f"\nTotal suppliers: {len(suppliers)}")
    for s in suppliers:
        print(f"  {s.supplier_id}: {s.name} ({s.latitude}, {s.longitude})")

