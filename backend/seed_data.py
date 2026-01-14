"""
Seed script with options for different seeding modes.
Usage: python seed_data.py [--mode=replace|update|fresh]
"""

import sys
import os
import argparse

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def parse_args():
    parser = argparse.ArgumentParser(description='Seed database with test data')
    parser.add_argument('--mode', choices=['replace', 'update', 'fresh'], default='replace',
                       help='replace=replace suppliers, update=add only new, fresh=wipe all data')
    return parser.parse_args()

def seed_database(mode='replace'):
    """Populate database with test data based on mode."""
    
    from app import create_app
    app = create_app()
    
    with app.app_context():
        from models import db
        from models.role import Role
        from models.user import User
        from models.supplier import Supplier
        
        print(f"🌱 Seeding database (mode: {mode})...")
        
        # FRESH MODE: Delete everything
        if mode == 'fresh':
            print("  → FRESH MODE: Deleting all data...")
            Supplier.query.delete()
            User.query.delete()
            Role.query.delete()
            db.session.commit()
            print("  ✅ All data deleted")
        
        # Ensure tables exist
        db.create_all()
        
        # Create roles
        admin_role = Role.query.filter_by(role_name='Admin').first()
        if not admin_role:
            admin_role = Role(role_name='Admin')
            db.session.add(admin_role)
        
        field_agent_role = Role.query.filter_by(role_name='Field Agent').first()
        if not field_agent_role:
            field_agent_role = Role(role_name='Field Agent')
            db.session.add(field_agent_role)
        
        db.session.commit()
        
        # Create/update users
        admin_user = User.query.filter_by(email='admin@example.com').first()
        if not admin_user:
            admin_user = User(email='admin@example.com', role_id=admin_role.id)
            admin_user.set_password('admin123')
            db.session.add(admin_user)
        else:
            admin_user.role_id = admin_role.id
            admin_user.set_password('admin123')
        
        agent_user = User.query.filter_by(email='agent@example.com').first()
        if not agent_user:
            agent_user = User(email='agent@example.com', role_id=field_agent_role.id)
            agent_user.set_password('agent123')
            db.session.add(agent_user)
        else:
            agent_user.role_id = field_agent_role.id
            agent_user.set_password('agent123')
        
        db.session.commit()
        
        # Handle suppliers based on mode
        suppliers_data = [
            {
                'name': 'Nairobi Central Hub',
                'supplier_id': 'SUP001',
                'latitude': -1.2921,
                'longitude': 36.8219,
                'mpesa_phone_number': '+254722123456',
                'contact_person': 'John Kamau',
                'contact_email': 'john@nairobi-hub.com',
                'address': '123 Kenyatta Avenue, Nairobi'
            },
            {
                'name': 'Westlands Distribution Center',
                'supplier_id': 'SUP002',
                'latitude': -1.2611,
                'longitude': 36.8028,
                'mpesa_phone_number': '+254722234567',
                'contact_person': 'Sarah Kipchoge',
                'contact_email': 'sarah@westlands.com',
                'address': '456 Westlands Road, Nairobi'
            },
            {
                'name': 'Karen Logistics Point',
                'supplier_id': 'SUP003',
                'latitude': -1.3089,
                'longitude': 36.7623,
                'mpesa_phone_number': '+254722345678',
                'contact_person': 'Peter Mwangi',
                'contact_email': 'peter@karen-logistics.com',
                'address': '789 Karen Road, Nairobi'
            },
            {
                'name': 'Upper Hill Operations',
                'supplier_id': 'SUP004',
                'latitude': -1.2856,
                'longitude': 36.7738,
                'mpesa_phone_number': '+254722456789',
                'contact_person': 'Grace Omondi',
                'contact_email': 'grace@upperhill.com',
                'address': '321 Upper Hill Road, Nairobi'
            },
            {
                'name': 'Kilimani Trading Hub',
                'supplier_id': 'SUP005',
                'latitude': -1.2966,
                'longitude': 36.8049,
                'mpesa_phone_number': '+254722567890',
                'contact_person': 'Michael Kiplagat',
                'contact_email': 'michael@kilimani.com',
                'address': '654 Kilimani Avenue, Nairobi'
            },
            {
                'name': 'Ruiru Mugutha Distribution',
                'supplier_id': 'SUP006',
                'latitude': -1.0850,
                'longitude': 36.9250,
                'mpesa_phone_number': '+254722678901',
                'contact_person': 'David Mwangi',
                'contact_email': 'david@ruiru-mugutha.com',
                'address': 'Near Tumaini Spire Academy, Mugutha, Ruiru'
            },
            {
                'name': 'Executive Building Mugutha',
                'supplier_id': 'SUP007',
                'latitude': -1.1231552725673162,
                'longitude': 36.963508053527995,
                'mpesa_phone_number': '+254722789012',
                'contact_person': 'Henry Kipchoge',
                'contact_email': 'henry@executive-mugutha.com',
                'address': 'Executive Building, Mugutha, Ruiru'
            }
        ]
        
        if mode == 'replace':
            print("  → REPLACE MODE: Replacing all suppliers...")
            # Delete all existing suppliers
            Supplier.query.delete()
            db.session.commit()
            
            # Add all new suppliers
            for supplier_data in suppliers_data:
                supplier = Supplier(**supplier_data)
                db.session.add(supplier)
            
            db.session.commit()
            print(f"  ✅ Replaced with {len(suppliers_data)} suppliers")
            
        elif mode == 'update':
            print("  → UPDATE MODE: Adding only new suppliers...")
            added_count = 0
            for supplier_data in suppliers_data:
                # Check if supplier exists
                existing = Supplier.query.filter_by(
                    supplier_id=supplier_data['supplier_id']
                ).first()
                
                if not existing:
                    supplier = Supplier(**supplier_data)
                    db.session.add(supplier)
                    added_count += 1
            
            db.session.commit()
            print(f"  ✅ Added {added_count} new suppliers")
            print(f"  ✅ Total suppliers now: {Supplier.query.count()}")
        
        print("\n✅ Seeding complete!")
        print(f"📊 Summary: {Role.query.count()} roles, {User.query.count()} users, {Supplier.query.count()} suppliers")


if __name__ == '__main__':
    args = parse_args()
    seed_database(args.mode)