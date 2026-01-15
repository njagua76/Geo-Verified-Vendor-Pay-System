#!/usr/bin/env python3
"""Update supplier phone number"""

from app import create_app, db
from models.supplier import Supplier

app = create_app()

with app.app_context():
    # Update Nairobi Central Hub (supplier_id 1)
    supplier = Supplier.query.get(1)
    if supplier:
        supplier.mpesa_phone_number = '254717075445'
        db.session.commit()
        print(f'✅ Updated {supplier.name} with phone: {supplier.mpesa_phone_number}')
    else:
        print('❌ Supplier not found')
