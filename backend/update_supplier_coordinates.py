"""
Script to update supplier coordinates in the database.

Run this to update the Executive Building Mugutha (SUP007) coordinates
to match the actual GPS location.
"""

import sys
import os

# Add parent directory to path for relative imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.app import create_app
from backend.models import db
from backend.models.supplier import Supplier


def update_supplier_coordinates():
    """Update supplier coordinates to match actual GPS location."""
    
    app = create_app()
    
    with app.app_context():
        print("🔄 Updating supplier coordinates...")
        
        # Find the supplier
        supplier = Supplier.query.filter_by(supplier_id='SUP007').first()
        
        if not supplier:
            print("❌ Supplier SUP007 not found!")
            return
        
        print(f"  Found supplier: {supplier.name}")
        print(f"  Current coordinates: {supplier.latitude}, {supplier.longitude}")
        
        # Update coordinates to match user's GPS location
        # User's exact GPS: -1.1231552725673162, 36.963508053527995
        supplier.latitude = -1.1231552725673162
        supplier.longitude = 36.963508053527995
        
        db.session.commit()
        
        print(f"  ✅ Updated coordinates: {supplier.latitude}, {supplier.longitude}")
        
        # Verify the change
        refreshed_supplier = Supplier.query.filter_by(supplier_id='SUP007').first()
        print(f"\n📍 Verified coordinates: {refreshed_supplier.latitude}, {refreshed_supplier.longitude}")


if __name__ == '__main__':
    update_supplier_coordinates()

