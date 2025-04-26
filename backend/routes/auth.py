from flask import Blueprint, request, jsonify
from firebase_admin import auth
import jwt
import datetime
import uuid
from functools import wraps
from models.user import User
from db import db

# Create blueprint
auth_bp = Blueprint('auth', __name__)

# Secret key for JWT
JWT_SECRET = 'your-secret-key'  # In production, use an environment variable

# JWT session expiration (24 hours)
JWT_EXPIRATION = 86400  # seconds

# Store active sessions
active_sessions = {}

# Middleware to check if request has valid auth token
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check if token is in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]  # Remove "Bearer " prefix
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401
        
        try:
            # Decode token
            data = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
            
            # Check if session exists and is valid
            session_id = data.get('session_id')
            if session_id not in active_sessions:
                return jsonify({'message': 'Invalid or expired token'}), 401
            
            # Retrieve user from database
            current_user = User.query.filter_by(firebase_uid=data['firebase_uid']).first()
            if not current_user:
                return jsonify({'message': 'User not found'}), 404
                
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
            
        return f(current_user, *args, **kwargs)
    
    return decorated

# Firebase login route
@auth_bp.route('/firebase-login', methods=['POST'])
def firebase_login():
    """Verify Firebase ID token and create session"""
    data = request.get_json()
    
    if not data or 'firebase_token' not in data:
        return jsonify({'message': 'Firebase token is required'}), 400
    
    try:
        # Verify Firebase token
        firebase_token = data['firebase_token']
        decoded_token = auth.verify_id_token(firebase_token)
        
        # Extract user info
        firebase_uid = decoded_token['uid']
        email = decoded_token.get('email', '')
        name = decoded_token.get('name', '')
        
        # Check if user exists in our database
        user = User.query.filter_by(firebase_uid=firebase_uid).first()
        
        if not user:
            # Create new user if doesn't exist
            user = User(
                firebase_uid=firebase_uid,
                email=email,
                name=name,
                created_at=datetime.datetime.utcnow()
            )
            db.session.add(user)
            db.session.commit()
        
        # Create session ID
        session_id = str(uuid.uuid4())
        
        # Create JWT token for our backend
        token_payload = {
            'firebase_uid': firebase_uid,
            'session_id': session_id,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(seconds=JWT_EXPIRATION)
        }
        session_token = jwt.encode(token_payload, JWT_SECRET, algorithm='HS256')
        
        # Store session
        active_sessions[session_id] = {
            'firebase_uid': firebase_uid,
            'created_at': datetime.datetime.utcnow()
        }
        
        return jsonify({
            'session_token': session_token,
            'user_id': user.id,
            'message': 'Login successful'
        })
        
    except auth.InvalidIdTokenError:
        return jsonify({'message': 'Invalid Firebase token'}), 401
    except Exception as e:
        return jsonify({'message': f'Authentication error: {str(e)}'}), 500

# Logout route
@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout(current_user):
    """Log out user by invalidating session"""
    token = request.headers['Authorization'][7:]  # Remove "Bearer " prefix
    
    try:
        # Decode token without verification to get session ID
        data = jwt.decode(token, options={"verify_signature": False})
        session_id = data.get('session_id')
        
        # Remove session
        if session_id in active_sessions:
            del active_sessions[session_id]
        
        return jsonify({'message': 'Logged out successfully'})
    except Exception as e:
        return jsonify({'message': f'Logout error: {str(e)}'}), 500

# Get current user info
@auth_bp.route('/user', methods=['GET'])
@token_required
def get_user(current_user):
    """Get current user information"""
    return jsonify({
        'id': current_user.id,
        'email': current_user.email,
        'name': current_user.name,
        'created_at': current_user.created_at.isoformat() if current_user.created_at else None
    })

# Update user info
@auth_bp.route('/user', methods=['PUT'])
@token_required
def update_user(current_user):
    """Update user information"""
    data = request.get_json()
    
    if 'name' in data:
        current_user.name = data['name']
    
    if 'email' in data and data['email'] != current_user.email:
        # Check if email is already taken
        existing_user = User.query.filter_by(email=data['email']).first()
        if existing_user and existing_user.id != current_user.id:
            return jsonify({'message': 'Email already in use'}), 400
        current_user.email = data['email']
    
    # Add any other fields you want to allow updating
    
    db.session.commit()
    
    return jsonify({
        'id': current_user.id,
        'email': current_user.email,
        'name': current_user.name,
        'created_at': current_user.created_at.isoformat() if current_user.created_at else None,
        'message': 'User updated successfully'
    })

# Clean up expired sessions (you can call this periodically)
def cleanup_expired_sessions():
    """Remove expired sessions"""
    current_time = datetime.datetime.utcnow()
    expired_sessions = []
    
    for session_id, session_data in active_sessions.items():
        session_time = session_data.get('created_at')
        if (current_time - session_time).total_seconds() > JWT_EXPIRATION:
            expired_sessions.append(session_id)
    
    for session_id in expired_sessions:
        del active_sessions[session_id]
    
    return len(expired_sessions)