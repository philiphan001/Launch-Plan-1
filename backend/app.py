from flask import Flask
from flask_cors import CORS
import os
import firebase_admin
from firebase_admin import credentials
from dotenv import load_dotenv
from db import db, init_db

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure database
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize Firebase Admin SDK
cred = credentials.Certificate({
    "type": os.environ.get('FIREBASE_TYPE'),
    "project_id": os.environ.get('FIREBASE_PROJECT_ID'),
    "private_key_id": os.environ.get('FIREBASE_PRIVATE_KEY_ID'),
    "private_key": os.environ.get('FIREBASE_PRIVATE_KEY').replace('\\n', '\n'),
    "client_email": os.environ.get('FIREBASE_CLIENT_EMAIL'),
    "client_id": os.environ.get('FIREBASE_CLIENT_ID'),
    "auth_uri": os.environ.get('FIREBASE_AUTH_URI'),
    "token_uri": os.environ.get('FIREBASE_TOKEN_URI'),
    "auth_provider_x509_cert_url": os.environ.get('FIREBASE_AUTH_PROVIDER_X509_CERT_URL'),
    "client_x509_cert_url": os.environ.get('FIREBASE_CLIENT_X509_CERT_URL')
})
firebase_admin.initialize_app(cred)

# Initialize database
init_db(app)

# Import and register blueprints
from routes.auth import auth_bp

app.register_blueprint(auth_bp, url_prefix='/api/auth')

# Add other routes/blueprints as needed
# from routes.your_module import your_blueprint
# app.register_blueprint(your_blueprint, url_prefix='/api/your_path')

if __name__ == '__main__':
    app.run(debug=os.environ.get('FLASK_DEBUG', 'False') == 'True', host='0.0.0.0', port=int(os.environ.get('PORT', 5000)))