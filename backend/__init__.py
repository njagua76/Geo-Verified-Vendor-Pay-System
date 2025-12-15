import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv

load_dotenv()

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
        "DATABASE_URL", "postgresql://user:password@localhost/dbname"
    )
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.getenv("SECRET_KEY", "supersecretkey")

    CORS(app)
    db.init_app(app)

    # Use a relative import for routes so Python finds it correctly
    from .routes.admin_routes import admin_bp
    app.register_blueprint(admin_bp, url_prefix="/api")

    return app
