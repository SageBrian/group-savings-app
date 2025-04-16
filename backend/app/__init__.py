from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
#from flask_migrate import migrate
from flask_cors import CORS
from datetime import timedelta
from app.models import db 
import os
import logging


# Initialize extensions

jwt = JWTManager()


def create_app():
    app = Flask(__name__, instance_relative_config=True)
    
    # Enable CORS
    CORS(app, resources={r"/*": {"origins": "*"}})
    
    # Setup logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    # Configuration
    # Default to SQLite if PostgreSQL is not available
    database_url = 'sqlite:///' + os.path.join(app.instance_path, 'savingcircle.db')
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', '89c082f4918c48ff8a03fca91305dd0d')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'
    
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    

    @jwt.invalid_token_loader
    def invalid_token_callback(error_string):
        return jsonify({
            "message": "Invalid token",
            "msg": error_string
        }),401

    @jwt.unauthorized_loader
    def missing_token_callback(error_string):
        return jsonify({
            "message": "Authorization token is missing",
            "msg": error_string
        }),401
    
    # Import and register blueprints
    from .  import routes
    app.register_blueprint(routes.api_bp)
    
    # Create tables
    with app.app_context():
        try:
            db.create_all()
            logger.info("Database tables created successfully")
        except Exception as e:
            logger.error(f"Error creating database tables: {e}")
            raise
    
    return app