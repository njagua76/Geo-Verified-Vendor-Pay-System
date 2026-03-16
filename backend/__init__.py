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
    from .config import Config
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)

    # Register routes
    from .routes.admin_routes import admin_bp
    app.register_blueprint(admin_bp, url_prefix="/api")

    # Register models so Flask-Migrate sees them
    from .models.transaction_log import TransactionLog  # file must be named transaction_log.py

    return app




