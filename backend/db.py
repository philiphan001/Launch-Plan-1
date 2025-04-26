from flask_sqlalchemy import SQLAlchemy

# Initialize SQLAlchemy
db = SQLAlchemy()

def init_db(app):
    """Initialize the database with the Flask app"""
    db.init_app(app)
    
    # Import models to ensure they're registered with SQLAlchemy
    from models.user import User
    
    # Create tables if they don't exist
    with app.app_context():
        db.create_all()