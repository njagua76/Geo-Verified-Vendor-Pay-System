"""
Seed script to populate database with test data.

Creates:
- Admin and Field Agent roles
- Test users with known passwords for testing
"""

from app import create_app
from models import db
from models.role import Role
from models.user import User
from models.supplier import Supplier


def seed_database():
    """Populate database with initial test data."""
    
    app = create_app()
    
    with app.app_context():
        print("🌱 Seeding database...")
        
        # ═══════════════════════════════════════════════════════════
        # Step 1: Clear existing data (optional - for clean slate)
        # ═══════════════════════════════════════════════════════════
        
        print("  → Clearing existing data...")
        User.query.delete()
        Role.query.delete()
        db.session.commit()
        
        # ═══════════════════════════════════════════════════════════
        # Step 2: Create Roles
        # ═══════════════════════════════════════════════════════════
        
        print("  → Creating roles...")
        
        admin_role = Role(role_name='Admin')
        field_agent_role = Role(role_name='Field Agent')
        
        db.session.add(admin_role)
        db.session.add(field_agent_role)
        db.session.commit()
        
        print(f"    ✅ Created role: {admin_role.role_name} (ID: {admin_role.id})")
        print(f"    ✅ Created role: {field_agent_role.role_name} (ID: {field_agent_role.id})")
        
        # ═══════════════════════════════════════════════════════════
        # Step 3: Create Test Users
        # ═══════════════════════════════════════════════════════════
        
        print("  → Creating test users...")
        
        # Admin user
        admin_user = User(
            email='admin@example.com',
            role_id=admin_role.id
        )
        admin_user.set_password('admin123')  # Password will be hashed
        db.session.add(admin_user)
        
        # Field Agent user
        agent_user = User(
            email='agent@example.com',
            role_id=field_agent_role.id
        )
        agent_user.set_password('agent123')  # Password will be hashed
        db.session.add(agent_user)
        
        db.session.commit()
        
        print(f"    ✅ Created user: {admin_user.email} (Role: {admin_user.role.role_name})")
        print(f"    ✅ Created user: {agent_user.email} (Role: {agent_user.role.role_name})")
        
        # ═══════════════════════════════════════════════════════════
        # Step 4: Create Test Suppliers
        # ═══════════════════════════════════════════════════════════
        
        print("  → Creating test suppliers...")
        
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
            }
        ]
        
        for supplier_data in suppliers_data:
            supplier = Supplier(**supplier_data)
            db.session.add(supplier)
        
        db.session.commit()
        
        for supplier in Supplier.query.all():
            print(f"    ✅ Created supplier: {supplier.name} ({supplier.supplier_id})")
        
        # ═══════════════════════════════════════════════════════════
        # Step 5: Verify Data
        # ═══════════════════════════════════════════════════════════
        
        print("\n📊 Database Summary:")
        print(f"  Total Roles: {Role.query.count()}")
        print(f"  Total Users: {User.query.count()}")
        print(f"  Total Suppliers: {Supplier.query.count()}")
        
        print("\n✅ Seeding completed successfully!")
        print("\n🔐 Test Credentials:")
        print("  Admin Login:")
        print("    Email: admin@example.com")
        print("    Password: admin123")
        print("\n  Field Agent Login:")
        print("    Email: agent@example.com")
        print("    Password: agent123")


if __name__ == '__main__':
    seed_database()