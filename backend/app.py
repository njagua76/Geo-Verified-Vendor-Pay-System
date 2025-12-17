"""
Flask Application - Main entry point for the backend.

This file creates and configures the Flask application,
initializes the database, and registers all routes.
"""
from flask import Flask
from flask_cors import CORS
from config import Config
from models import db
from routes.auth import auth_bp
from routes.protected_routes import protected_bp

def create_app():
    """Application factory function"""
    app = Flask(__name__)

    #Load config from config
    app.config.from_object(Config)
    
    #intialise SQLAlchemy with this app
    db.init_app(app)

    #Enable CORS for all routes
    #Allows frontend to call the API
    #restrinct specific origins
    CORS(app)

    #Register Blueprints
    #All routes in auth_bp are now accessible

    app.register_blueprint(auth_bp)
    app.register_blueprint(protected_bp)
    #REGISTER FUTURE BLUEPRINTS HERE

    #create database tables
    with app.app_context():
        db.create_all()
        print("Database tables created successfully")

    #Define root route
    @app.route('/')
    def index():
        #we do a health check here to confirm the app is running
        return{
            'message': 'Geo-Verified Vendor Pay API is up and running',
            'status': 'active and running',
            'version': '1.0.0 well... kinda'
        }
    
    return app

if __name__ == '__main__':
    """Runs the flask application only when python app.py and not when imported by other modules

      Development server settings:
    - debug=True: Auto-reload on code changes, detailed error pages
    - port=5000: Default Flask port
    - host='0.0.0.0': Accept connections from any IP (for Docker, VMs)
    
    """

    #create the app
    app = create_app()

    #run the development server 
    app.run(
        debug=True, 
        host='0.0.0.0',
        port=5000
    )
