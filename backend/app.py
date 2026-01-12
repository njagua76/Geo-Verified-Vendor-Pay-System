"""
Flask Application - Main entry point for the backend.
"""

from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from config import Config
from models import db
from routes.auth import auth_bp
from routes.protected_routes import protected_bp
from routes.suppliers import suppliers_bp


def create_app():
    app = Flask(__name__)

    # Load configuration
    app.config.from_object(Config)

    # Initialize database
    db.init_app(app)

    # Initialize migrations
    Migrate(app, db)

    # -------------------------------
    # ✅ CORS CONFIG (From Config)
    # -------------------------------
    CORS(
        app,
        origins=app.config.get('ALLOWED_ORIGINS', [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5000",
            "http://127.0.0.1:5000"
        ]),
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        max_age=86400
    )

    # -------------------------------
    # Register Blueprints
    # -------------------------------
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(protected_bp, url_prefix="/api")
    app.register_blueprint(suppliers_bp, url_prefix="/api/suppliers")

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
