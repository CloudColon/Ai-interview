from extensions import db
from datetime import datetime, timezone
from flask_security import UserMixin, RoleMixin

class BaseModel(db.Model):
    __abstract__ = True
    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))


# ---------- Role (required by Flask-Security) ----------
class Role(BaseModel, RoleMixin):
    __tablename__ = 'role'
    name        = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255))

# Junction table for User <-> Role (required by Flask-Security)
user_roles = db.Table(
    'user_roles',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'))
)


# ---------- User ----------
class User(BaseModel, UserMixin):
    __tablename__ = 'user'
    email               = db.Column(db.String(255), unique=True, nullable=False)
    username            = db.Column(db.String(100), unique=True, nullable=False)
    password            = db.Column(db.String(255), nullable=False)
    active              = db.Column(db.Boolean, default=True)
    fs_uniquifier       = db.Column(db.String(64), unique=True, nullable=False)  # required by Flask-Security

    roles       = db.relationship('Role', secondary=user_roles, backref=db.backref('users', lazy='dynamic'))
    sessions    = db.relationship('Session', backref='user', lazy='dynamic')
    feedbacks   = db.relationship('Feedback', backref='user', lazy='dynamic')

    def __repr__(self):
        return f'<User {self.username}>'


# ---------- Job Description ----------
class JobDescription(BaseModel):
    __tablename__ = 'job_description'
    title       = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=False)
    skills      = db.Column(db.Text)               # comma-separated or JSON string
    experience  = db.Column(db.String(100))        # e.g. "2-4 years"
    created_by  = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    sessions    = db.relationship('Session', backref='job_description', lazy='dynamic')

    def __repr__(self):
        return f'<JobDescription {self.title}>'


# ---------- Session ----------
class Session(BaseModel):
    __tablename__ = 'session'

    STATUS_CHOICES = ('pending', 'ongoing', 'completed', 'cancelled')

    user_id            = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    job_description_id = db.Column(db.Integer, db.ForeignKey('job_description.id'), nullable=True)
    status             = db.Column(db.String(20), default='pending')   # pending | ongoing | completed | cancelled
    started_at         = db.Column(db.DateTime(timezone=True), nullable=True)
    ended_at           = db.Column(db.DateTime(timezone=True), nullable=True)
    transcript         = db.Column(db.Text, nullable=True)             # full Q&A transcript
    score              = db.Column(db.Float, nullable=True)            # overall AI score (0-100)

    feedbacks = db.relationship('Feedback', backref='session', lazy='dynamic')

    def __repr__(self):
        return f'<Session {self.id} - {self.status}>'


# ---------- Feedback ----------
class Feedback(BaseModel):
    __tablename__ = 'feedback'

    session_id  = db.Column(db.Integer, db.ForeignKey('session.id'), nullable=False)
    user_id     = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    question    = db.Column(db.Text, nullable=True)     # the interview question asked
    answer      = db.Column(db.Text, nullable=True)     # candidate's answer
    ai_feedback = db.Column(db.Text, nullable=True)     # AI-generated feedback on the answer
    score       = db.Column(db.Float, nullable=True)    # per-question score (0-10)
    category    = db.Column(db.String(100), nullable=True)  # e.g. "technical", "behavioural"

    def __repr__(self):
        return f'<Feedback session={self.session_id} score={self.score}>'