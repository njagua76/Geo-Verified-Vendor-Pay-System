from backend.app import create_app
from backend.models import db
from backend.models.role import Role
from backend.models.user import User
from backend.models.supplier import Supplier

def seed_database():
    print("🌱 Seeding database...")

    # Clear existing data
    print("  → Clearing existing data...")
    db.session.query(User).delete()
    db.session.query(Role).delete()
    db.session.query(Supplier).delete()
    db.session.commit()

    # Create roles
    print("  → Creating roles...")
    admin_role = Role(role_name="Admin")
    field_agent_role = Role(role_name="Field Agent")
    db.session.add_all([admin_role, field_agent_role])
    db.session.commit()

    # Create users
    print("  → Creating test users...")
    admin_user = User(email="admin@example.com", role_id=admin_role.id)
    admin_user.set_password("admin123")

    agent_user = User(email="agent@example.com", role_id=field_agent_role.id)
    agent_user.set_password("agent123")

    db.session.add_all([admin_user, agent_user])
    db.session.commit()

    # Create suppliers
    print("  → Creating suppliers...")
    suppliers_data = [
        {"name": "Nairobi Central Hub", "supplier_id": "SUP001", "latitude": -1.2921, "longitude": 36.8219,
         "mpesa_phone_number": "+254722123456", "contact_person": "John Kamau", "contact_email": "john@nairobi-hub.com",
         "address": "123 Kenyatta Avenue, Nairobi"},
        {"name": "Westlands Distribution Center", "supplier_id": "SUP002", "latitude": -1.2611, "longitude": 36.8028,
         "mpesa_phone_number": "+254722234567", "contact_person": "Sarah Kipchoge", "contact_email": "sarah@westlands.com",
         "address": "456 Westlands Road, Nairobi"},
        {"name": "Karen Logistics Point", "supplier_id": "SUP003", "latitude": -1.3089, "longitude": 36.7623,
         "mpesa_phone_number": "+254722345678", "contact_person": "Peter Mwangi", "contact_email": "peter@karen-logistics.com",
         "address": "789 Karen Road, Nairobi"},
        {"name": "Upper Hill Operations", "supplier_id": "SUP004", "latitude": -1.2856, "longitude": 36.7738,
         "mpesa_phone_number": "+254722456789", "contact_person": "Grace Omondi", "contact_email": "grace@upperhill.com",
         "address": "321 Upper Hill Road, Nairobi"},
        {"name": "Kilimani Trading Hub", "supplier_id": "SUP005", "latitude": -1.2966, "longitude": 36.8049,
         "mpesa_phone_number": "+254722567890", "contact_person": "Michael Kiplagat", "contact_email": "michael@kilimani.com",
         "address": "654 Kilimani Avenue, Nairobi"},
        {"name": "Ruiru Mugutha Distribution", "supplier_id": "SUP006", "latitude": -1.0850, "longitude": 36.9250,
         "mpesa_phone_number": "+254722678901", "contact_person": "David Mwangi", "contact_email": "david@ruiru-mugutha.com",
         "address": "Near Tumaini Spire Academy, Mugutha, Ruiru"},
        {"name": "Executive Building Mugutha", "supplier_id": "SUP007", "latitude": -1.1231552725673162,
         "longitude": 36.963508053527995, "mpesa_phone_number": "+254722789012", "contact_person": "Henry Kipchoge",
         "contact_email": "henry@executive-mugutha.com", "address": "Executive Building, Mugutha, Ruiru"},
    ]

    for data in suppliers_data:
        db.session.add(Supplier(**data))
    db.session.commit()

    print("\n📊 Database Summary:")
    print(f"  Roles: {Role.query.count()}")
    print(f"  Users: {User.query.count()}")
    print(f"  Suppliers: {Supplier.query.count()}")
    print("\n✅ Seeding completed successfully!")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():  # ✅ activate app context
        seed_database()
