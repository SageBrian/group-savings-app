
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, jwt_required, create_access_token, get_jwt_identity
from flask_cors import CORS
from datetime import datetime, timedelta
import os
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres:password@localhost/savingcircle')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JWT_SECRET_KEY'] = os.environ.get('JWT_SECRET_KEY', 'super-secret-key-change-in-production')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)

# Initialize extensions
db = SQLAlchemy(app)
jwt = JWTManager(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    avatar = db.Column(db.String(255), nullable=True)
    
    groups = db.relationship('GroupMember', back_populates='user')
    contributions = db.relationship('Contribution', back_populates='user')
    withdrawals = db.relationship('WithdrawalRequest', back_populates='user')

class SavingsGroup(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    target_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    members = db.relationship('GroupMember', back_populates='group')
    contributions = db.relationship('Contribution', back_populates='group')
    withdrawals = db.relationship('WithdrawalRequest', back_populates='group')

class GroupMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('savings_group.id'), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', back_populates='groups')
    group = db.relationship('SavingsGroup', back_populates='members')

class Contribution(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('savings_group.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', back_populates='contributions')
    group = db.relationship('SavingsGroup', back_populates='contributions')

class WithdrawalRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    reason = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('savings_group.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    processed_at = db.Column(db.DateTime, nullable=True)
    processed_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
    
    user = db.relationship('User', foreign_keys=[user_id], back_populates='withdrawals')
    group = db.relationship('SavingsGroup', back_populates='withdrawals')
    processor = db.relationship('User', foreign_keys=[processed_by])

# API Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=data['email']).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 409
    
    # Create new user
    hashed_password = generate_password_hash(data['password'])
    new_user = User(
        name=data['name'],
        email=data['email'],
        password=hashed_password,
        avatar=data.get('avatar')
    )
    
    db.session.add(new_user)
    db.session.commit()
    
    # Generate access token
    access_token = create_access_token(identity=new_user.id)
    
    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "avatar": new_user.avatar
        },
        "token": access_token
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    
    user = User.query.filter_by(email=data['email']).first()
    if not user or not check_password_hash(user.password, data['password']):
        return jsonify({"error": "Invalid email or password"}), 401
    
    access_token = create_access_token(identity=user.id)
    
    return jsonify({
        "message": "Login successful",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "avatar": user.avatar
        },
        "token": access_token
    }), 200

@app.route('/api/groups', methods=['GET'])
@jwt_required()
def get_groups():
    user_id = get_jwt_identity()
    
    memberships = GroupMember.query.filter_by(user_id=user_id).all()
    groups = []
    
    for membership in memberships:
        group = membership.group
        groups.append({
            "id": group.id,
            "name": group.name,
            "description": group.description,
            "target_amount": group.target_amount,
            "current_amount": group.current_amount,
            "created_at": group.created_at.isoformat(),
            "is_admin": membership.is_admin,
            "members_count": len(group.members)
        })
    
    return jsonify({"groups": groups})

@app.route('/api/groups', methods=['POST'])
@jwt_required()
def create_group():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    new_group = SavingsGroup(
        name=data['name'],
        description=data.get('description', ''),
        target_amount=float(data['target_amount']),
        created_by=user_id
    )
    
    db.session.add(new_group)
    db.session.flush()  # Get the group ID
    
    # Add creator as admin member
    member = GroupMember(
        user_id=user_id,
        group_id=new_group.id,
        is_admin=True
    )
    
    db.session.add(member)
    db.session.commit()
    
    return jsonify({
        "message": "Group created successfully",
        "group": {
            "id": new_group.id,
            "name": new_group.name,
            "description": new_group.description,
            "target_amount": new_group.target_amount,
            "current_amount": new_group.current_amount,
            "created_at": new_group.created_at.isoformat()
        }
    }), 201

@app.route('/api/groups/<int:group_id>', methods=['GET'])
@jwt_required()
def get_group(group_id):
    user_id = get_jwt_identity()
    
    # Check if user is a member of the group
    membership = GroupMember.query.filter_by(user_id=user_id, group_id=group_id).first()
    if not membership:
        return jsonify({"error": "Not authorized to view this group"}), 403
    
    group = SavingsGroup.query.get_or_404(group_id)
    
    # Get members
    members = []
    for member in group.members:
        members.append({
            "id": member.user.id,
            "name": member.user.name,
            "email": member.user.email,
            "avatar": member.user.avatar,
            "is_admin": member.is_admin,
            "joined_at": member.joined_at.isoformat()
        })
    
    # Get recent contributions
    contributions = []
    for contribution in Contribution.query.filter_by(group_id=group_id).order_by(Contribution.created_at.desc()).limit(5).all():
        contributions.append({
            "id": contribution.id,
            "amount": contribution.amount,
            "user": {
                "id": contribution.user.id,
                "name": contribution.user.name,
                "avatar": contribution.user.avatar
            },
            "created_at": contribution.created_at.isoformat()
        })
    
    # Get recent withdrawal requests
    withdrawals = []
    for withdrawal in WithdrawalRequest.query.filter_by(group_id=group_id).order_by(WithdrawalRequest.created_at.desc()).limit(5).all():
        withdrawals.append({
            "id": withdrawal.id,
            "amount": withdrawal.amount,
            "reason": withdrawal.reason,
            "status": withdrawal.status,
            "user": {
                "id": withdrawal.user.id,
                "name": withdrawal.user.name,
                "avatar": withdrawal.user.avatar
            },
            "created_at": withdrawal.created_at.isoformat(),
            "processed_at": withdrawal.processed_at.isoformat() if withdrawal.processed_at else None
        })
    
    return jsonify({
        "group": {
            "id": group.id,
            "name": group.name,
            "description": group.description,
            "target_amount": group.target_amount,
            "current_amount": group.current_amount,
            "created_at": group.created_at.isoformat(),
            "members": members,
            "contributions": contributions,
            "withdrawals": withdrawals,
            "is_admin": membership.is_admin
        }
    })

@app.route('/api/groups/<int:group_id>/join', methods=['POST'])
@jwt_required()
def join_group(group_id):
    user_id = get_jwt_identity()
    
    # Check if user is already a member
    existing_membership = GroupMember.query.filter_by(user_id=user_id, group_id=group_id).first()
    if existing_membership:
        return jsonify({"error": "Already a member of this group"}), 400
    
    # Check if group exists
    group = SavingsGroup.query.get_or_404(group_id)
    
    # Add user as member
    member = GroupMember(
        user_id=user_id,
        group_id=group_id,
        is_admin=False
    )
    
    db.session.add(member)
    db.session.commit()
    
    return jsonify({
        "message": "Successfully joined the group",
        "group": {
            "id": group.id,
            "name": group.name
        }
    }), 200

@app.route('/api/groups/<int:group_id>/contribute', methods=['POST'])
@jwt_required()
def contribute(group_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Check if user is a member of the group
    membership = GroupMember.query.filter_by(user_id=user_id, group_id=group_id).first()
    if not membership:
        return jsonify({"error": "Not a member of this group"}), 403
    
    amount = float(data['amount'])
    if amount <= 0:
        return jsonify({"error": "Contribution amount must be greater than zero"}), 400
    
    # Create contribution
    contribution = Contribution(
        amount=amount,
        user_id=user_id,
        group_id=group_id
    )
    
    # Update group's current amount
    group = SavingsGroup.query.get(group_id)
    group.current_amount += amount
    
    db.session.add(contribution)
    db.session.commit()
    
    return jsonify({
        "message": "Contribution successful",
        "contribution": {
            "id": contribution.id,
            "amount": contribution.amount,
            "created_at": contribution.created_at.isoformat()
        },
        "group": {
            "id": group.id,
            "current_amount": group.current_amount
        }
    }), 201

@app.route('/api/groups/<int:group_id>/withdraw', methods=['POST'])
@jwt_required()
def request_withdrawal(group_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Check if user is a member of the group
    membership = GroupMember.query.filter_by(user_id=user_id, group_id=group_id).first()
    if not membership:
        return jsonify({"error": "Not a member of this group"}), 403
    
    amount = float(data['amount'])
    if amount <= 0:
        return jsonify({"error": "Withdrawal amount must be greater than zero"}), 400
    
    group = SavingsGroup.query.get(group_id)
    if amount > group.current_amount:
        return jsonify({"error": "Withdrawal amount exceeds group's current amount"}), 400
    
    # Create withdrawal request
    withdrawal = WithdrawalRequest(
        amount=amount,
        reason=data.get('reason', ''),
        user_id=user_id,
        group_id=group_id
    )
    
    db.session.add(withdrawal)
    db.session.commit()
    
    return jsonify({
        "message": "Withdrawal request submitted",
        "withdrawal": {
            "id": withdrawal.id,
            "amount": withdrawal.amount,
            "reason": withdrawal.reason,
            "status": withdrawal.status,
            "created_at": withdrawal.created_at.isoformat()
        }
    }), 201

@app.route('/api/withdrawals/<int:withdrawal_id>/process', methods=['POST'])
@jwt_required()
def process_withdrawal(withdrawal_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    withdrawal = WithdrawalRequest.query.get_or_404(withdrawal_id)
    
    # Check if user is an admin of the group
    membership = GroupMember.query.filter_by(user_id=user_id, group_id=withdrawal.group_id, is_admin=True).first()
    if not membership:
        return jsonify({"error": "Not authorized to process withdrawals"}), 403
    
    status = data['status']  # 'approved' or 'rejected'
    if status not in ['approved', 'rejected']:
        return jsonify({"error": "Invalid status value"}), 400
    
    withdrawal.status = status
    withdrawal.processed_at = datetime.utcnow()
    withdrawal.processed_by = user_id
    
    # If approved, update group's current amount
    if status == 'approved':
        group = SavingsGroup.query.get(withdrawal.group_id)
        group.current_amount -= withdrawal.amount
    
    db.session.commit()
    
    return jsonify({
        "message": f"Withdrawal request {status}",
        "withdrawal": {
            "id": withdrawal.id,
            "status": withdrawal.status,
            "processed_at": withdrawal.processed_at.isoformat()
        }
    }), 200

@app.route('/api/discover', methods=['GET'])
@jwt_required()
def discover_groups():
    user_id = get_jwt_identity()
    
    # Get groups the user is not a member of
    user_groups = [m.group_id for m in GroupMember.query.filter_by(user_id=user_id).all()]
    
    groups = SavingsGroup.query.filter(~SavingsGroup.id.in_(user_groups) if user_groups else True).all()
    
    results = []
    for group in groups:
        results.append({
            "id": group.id,
            "name": group.name,
            "description": group.description,
            "target_amount": group.target_amount,
            "current_amount": group.current_amount,
            "created_at": group.created_at.isoformat(),
            "members_count": len(group.members)
        })
    
    return jsonify({"groups": results})

@app.route('/api/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    
    return jsonify({
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "avatar": user.avatar,
            "created_at": user.created_at.isoformat()
        }
    })

@app.route('/api/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get_or_404(user_id)
    data = request.get_json()
    
    user.name = data.get('name', user.name)
    
    # If updating email, check if it's unique
    new_email = data.get('email')
    if new_email and new_email != user.email:
        existing_user = User.query.filter_by(email=new_email).first()
        if existing_user:
            return jsonify({"error": "Email already in use"}), 409
        user.email = new_email
    
    # Update password if provided
    new_password = data.get('password')
    if new_password:
        user.password = generate_password_hash(new_password)
    
    # Update avatar if provided
    new_avatar = data.get('avatar')
    if new_avatar:
        user.avatar = new_avatar
    
    db.session.commit()
    
    return jsonify({
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "avatar": user.avatar
        }
    })

# Create database tables
@app.before_first_request
def create_tables():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)
