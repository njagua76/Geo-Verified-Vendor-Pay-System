import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()
migrate = Migrate()

def create_app():
    app = Flask(__name__)
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        "DATABASE_URL", "postgresql://user:password@localhost/dbname"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "supersecretkey")

    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)
    db.init_app(app)
    migrate.init_app(app, db)

    # Register routes
    from .routes.auth import auth_bp
    from .routes.admin_routes import admin_bp
    from .routes.protected_routes import protected_bp
    from .routes.suppliers import suppliers_bp
    from .routes.location_verification import location_bp
    
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(protected_bp, url_prefix="/api")
    app.register_blueprint(suppliers_bp, url_prefix="/api/suppliers")
    app.register_blueprint(location_bp, url_prefix="/api/location")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # Register models so Flask-Migrate sees them
    from .models.transaction_log import TransactionLog  # file must be named transaction_log.py

    return app




