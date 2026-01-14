"""Add Executive Building (SUP007) to the database."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from models import db, Supplier

app = create_app()

with app.app_context():
    # Check if Executive Building already exists
    existing = Supplier.query.filter_by(supplier_id='SUP007').first()
    
    if existing:
        print(f"Executive Building already exists!")
        print(f"  Name: {existing.name}")
        print(f"  Coordinates: {existing.latitude}, {existing.longitude}")
    else:
        # Add Executive Building with your coordinates
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
        print(f"Added Executive Building Mugutha (SUP007)")
        print(f"  Coordinates: {supplier.latitude}, {supplier.longitude}")
    
    # List all suppliers
    suppliers = Supplier.query.all()
    print(f"\nAll suppliers in database:")
    for s in suppliers:
        print(f"  {s.supplier_id}: {s.name} ({s.latitude}, {s.longitude})")

