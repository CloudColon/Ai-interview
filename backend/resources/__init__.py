from flask_restful import Api
from flask import Blueprint

from resources.auth_resources import auth_bp
from resources.user_resources import UserListResource, UserResource
from resources.jobdescription_resources import JobDescriptionListResource, JobDescriptionResource
from resources.session_resources import (
    SessionListResource,
    SessionResource,
    SessionStartResource,
    SessionEndResource,
    UserSessionResource
)
from resources.feedback_resources import (
    FeedbackListResource,
    FeedbackResource,
    SessionFeedbackResource
)

api_bp = Blueprint('api', __name__, url_prefix='/api')
api = Api(api_bp)

# ─── User ─────────────────────────────────────────────────────────
api.add_resource(UserListResource, '/users')
api.add_resource(UserResource,     '/users/<int:id>')

# ─── Job Description ──────────────────────────────────────────────
api.add_resource(JobDescriptionListResource, '/jobs')
api.add_resource(JobDescriptionResource,     '/jobs/<int:id>')

# ─── Session ──────────────────────────────────────────────────────
api.add_resource(SessionListResource,  '/sessions')
api.add_resource(SessionResource,      '/sessions/<int:id>')
api.add_resource(SessionStartResource, '/sessions/<int:id>/start')
api.add_resource(SessionEndResource,   '/sessions/<int:id>/end')
api.add_resource(UserSessionResource,  '/users/<int:user_id>/sessions')

# ─── Feedback ─────────────────────────────────────────────────────
api.add_resource(FeedbackListResource,    '/feedbacks')
api.add_resource(FeedbackResource,        '/feedbacks/<int:id>')
api.add_resource(SessionFeedbackResource, '/sessions/<int:session_id>/feedbacks')


