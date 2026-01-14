"""
Flask Application - Run this file from the backend directory.
Usage: python run_app.py
"""
import sys
import os

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from datetime import timedelta

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)

# Database configuration (SQLite for development)
db_path = os.path.join(os.path.dirname(__file__), 'data', 'geo_vendor.db')
os.makedirs(os.path.dirname(db_path), exist_ok=True)
app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{db_path}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = 'dev-secret-key-CHANGE-IN-PRODUCTION'
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)

# Initialize extensions
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# CORS
CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

# ===============================
# Database Models
# ===============================

class Supplier(db.Model):
    """Supplier database model"""
    __tablename__ = 'suppliers'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    supplier_id = db.Column(db.String(50), unique=True, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    mpesa_phone_number = db.Column(db.String(20), nullable=False)
    contact_person = db.Column(db.String(100))
    contact_email = db.Column(db.String(100))
    address = db.Column(db.String(200))
    created_at = db.Column(db.DateTime)
    updated_at = db.Column(db.DateTime)
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'supplier_id': self.supplier_id,
            'latitude': self.latitude,
            'longitude': self.longitude,
            'mpesa_phone_number': self.mpesa_phone_number,
            'contact_person': self.contact_person,
            'contact_email': self.contact_email,
            'address': self.address
        }

# ===============================
# Routes
# ===============================

@app.route("/")
def index():
    return {
        "message": "Geo-Verified Vendor Pay API is up and running",
        "status": "active",
        "version": "1.0.0"
    }

@app.route("/api/suppliers", methods=['GET'])
def get_suppliers():
    """Get all suppliers"""
    suppliers = Supplier.query.all()
    return {
        'suppliers': [s.to_dict() for s in suppliers],
        'count': len(suppliers)
    }

@app.route("/api/suppliers/<supplier_id>", methods=['GET'])
def get_supplier(supplier_id):
    """Get a single supplier by supplier_id"""
    supplier = Supplier.query.filter_by(supplier_id=supplier_id).first()
    if not supplier:
        return {'error': 'Supplier not found'}, 404
    return {'supplier': supplier.to_dict()}

# ===============================
# Create tables and seed data
# ===============================

def init_db():
    """Initialize database with tables and seed data"""
    with app.app_context():
        db.create_all()
        
        # Check if suppliers exist
        if Supplier.query.count() == 0:
            # Add Executive Building
            exec_building = Supplier(
                name='Executive Building Mugutha',
                supplier_id='SUP007',
                latitude=-1.1231552725673162,
                longitude=36.963508053527995,
                mpesa_phone_number='+254722789012',
                contact_person='Henry Kipchoge',
                contact_email='henry@executive-mugutha.com',
                address='Executive Building, Mugutha, Ruiru'
            )
            db.session.add(exec_building)
            
            # Add test suppliers
            suppliers_data = [
                ('NAI001', 'Nairobi Hardware', -1.286389, 36.817223, '+254700000001', 'John Doe', 'john@nairobi-hw.co.ke', 'Nairobi CBD'),
                ('MOM001', 'Mombasa Fisheries', -4.043477, 39.668205, '+254700000002', 'Ali Hassan', 'ali@mombasa-fish.co.ke', 'Mombasa Port'),
            ]
            for sup_id, name, lat, lon, phone, person, email, addr in suppliers_data:
                s = Supplier(
                    supplier_id=sup_id,
                    name=name,
                    latitude=lat,
                    longitude=lon,
                    mpesa_phone_number=phone,
                    contact_person=person,
                    contact_email=email,
                    address=addr
                )
                db.session.add(s)
            
            db.session.commit()
            print("Database initialized with seed data!")
        else:
            print("Database already has data.")

if __name__ == "__main__":
    # Initialize database on first run
    init_db()
    
    print("\n" + "="*50)
    print("🏪 Suppliers in database:")
    with app.app_context():
        for s in Supplier.query.all():
            print(f"   {s.supplier_id}: {s.name} ({s.latitude}, {s.longitude})")
    print("="*50 + "\n")
    
    print("🚀 Starting Geo-Vendor API Server...")
    print("📍 Server running at: http://localhost:5000")
    print("📋 API Endpoints:")
    print("   GET  /              - Health check")
    print("   GET  /api/suppliers - List all suppliers")
    print("   GET  /api/suppliers/<id> - Get supplier by ID")
    print("\n")
    
    app.run(host="0.0.0.0", port=5000, debug=True)

