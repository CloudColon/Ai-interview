from flask import Blueprint, request, jsonify
from flask_security.utils import verify_password, hash_password
from flask_security import current_user
from flask import current_app
from models import User, db

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


# ─── LOGIN ────────────────────────────────────────────────────────

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'Invalid email or password'}), 401

    if not verify_password(password, user.password):
        return jsonify({'error': 'Invalid email or password'}), 401

    if not user.active:
        return jsonify({'error': 'Account is disabled'}), 403

    return jsonify({
        "id":       user.id,
        "email":    user.email,
        "username": user.username,
        "roles":    [role.name for role in user.roles],
        "token":    user.get_auth_token()
    }), 200


# ─── REGISTER ─────────────────────────────────────────────────────

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email    = data.get('email')
    username = data.get('username')
    password = data.get('password')

    # validation
    if not email or not username or not password:
        return jsonify({'error': 'Email, username and password are required'}), 400

    datastore = current_app.extensions['security'].datastore

    # duplicate check
    if datastore.find_user(email=email):
        return jsonify({'error': 'Email already registered'}), 409

    try:
        user = datastore.create_user(
            email=email,
            username=username,
            password=hash_password(password),
            active=True
        )
        db.session.commit()
        return jsonify({'message': 'User registered successfully', 'id': user.id}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


# ─── LOGOUT ───────────────────────────────────────────────────────

@auth_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({'message': 'Logged out successfully'}), 200


# ─── ME (get current logged in user) ──────────────────────────────

@auth_bp.route('/me', methods=['GET'])
def me():
    if not current_user.is_authenticated:
        return jsonify({'error': 'Not authenticated'}), 401
    return jsonify({
        "id":       current_user.id,
        "email":    current_user.email,
        "username": current_user.username,
        "roles":    [role.name for role in current_user.roles],
    }), 200