"""
Flask Application - Main entry point for the 
"""

from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from config import Config
from models import db
from routes.auth import auth_bp
from routes.protected_routes import protected_bp
from routes.suppliers import suppliers_bp
from routes.location_verification import location_bp
from routes.admin_routes import admin_bp
from routes.mpesa_callbacks import mpesa_callbacks_bp


def create_app():
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(Config)

    # Initialize database
    db.init_app(app)

    # Initialize migrations
    Migrate(app, db)

    # -------------------------------
    # CORS CONFIG - Allow all origins for development
    # -------------------------------
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)


    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(protected_bp, url_prefix="/api")
    app.register_blueprint(suppliers_bp, url_prefix="/api/suppliers")
    app.register_blueprint(location_bp, url_prefix="/api/location")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")
    app.register_blueprint(mpesa_callbacks_bp, url_prefix="/api/mpesa")

    # -------------------------------
    # Health Check
    # -------------------------------
    @app.route("/")
    def index():
        return {
            "message": "Geo-Verified Vendor Pay API is up and running",
            "status": "active",
            "version": "1.0.0"
        }

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False
    )

