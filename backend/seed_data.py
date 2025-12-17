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
        # Step 4: Verify Data
        # ═══════════════════════════════════════════════════════════
        
        print("\n📊 Database Summary:")
        print(f"  Total Roles: {Role.query.count()}")
        print(f"  Total Users: {User.query.count()}")
        
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