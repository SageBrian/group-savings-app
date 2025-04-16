from datetime import datetime
from flask_migrate import migrate
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    avatar = db.Column(db.String(255), nullable=True)
    
    # Relationships
    groups = db.relationship('GroupMember', back_populates='user')
    contributions = db.relationship('Contribution', back_populates='user')
    withdrawals = db.relationship('WithdrawalRequest', foreign_keys='WithdrawalRequest.user_id', back_populates='user')
    processed_withdrawals = db.relationship('WithdrawalRequest', foreign_keys='WithdrawalRequest.processed_by', back_populates='processor')

class SavingsGroup(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=True)
    target_amount = db.Column(db.Float, nullable=False)
    current_amount = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Relationships
    members = db.relationship('GroupMember', back_populates='group')
    contributions = db.relationship('Contribution', back_populates='group')
    withdrawals = db.relationship('WithdrawalRequest', back_populates='group')

class GroupMember(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('savings_group.id'), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='groups')
    group = db.relationship('SavingsGroup', back_populates='members')

class Contribution(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    amount = db.Column(db.Float, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    group_id = db.Column(db.Integer, db.ForeignKey('savings_group.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
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
    
    # Relationships with explicit foreign keys
    user = db.relationship('User', foreign_keys=[user_id], back_populates='withdrawals')
    group = db.relationship('SavingsGroup', back_populates='withdrawals')
    processor = db.relationship('User', foreign_keys=[processed_by], back_populates='processed_withdrawals')



if __name__ == '__main__':
    app = Flask(__name__)
    app.run(debug=True)