from flask import request
from flask_restful import Resource, marshal
from flask_security import current_user
from flask_security.decorators import roles_required
from services.feedback_services import FeedbackServices 
from .marshal_fields import feedback_fields

parser_fields = ['question', 'answer', 'ai_feedback', 'score', 'category']
service = FeedbackServices
marshal_fields = feedback_fields


# ─── /api/feedback ────────────────────────────────────────────────
class FeedbackListResource(Resource):

    @roles_required('admin')
    def get(self):
        items = service.get_all()
        return marshal(items, marshal_fields), 200

    def post(self):
        data = request.get_json()
        missing = [f for f in ['session_id', 'question', 'answer'] if not data.get(f)]
        if missing:
            return {"error": f"Missing fields: {', '.join(missing)}"}, 400
        data['user_id'] = current_user.id
        item = service.create(data)
        return marshal(item, marshal_fields), 201


# ─── /api/feedback/:id ────────────────────────────────────────────
class FeedbackResource(Resource):

    def get(self, id):
        item = service.get_by_id(id)
        if not current_user.has_role('admin') and current_user.id != item.user_id:
            return {"message": "Not Authorised"}, 401
        return marshal(item, marshal_fields), 200

    def put(self, id):
        item = service.get_by_id(id)
        if not item:
            return {"message": "Not Found"}, 404
        if not current_user.has_role('admin') and current_user.id != item.user_id:
            return {"message": "Not Authorised"}, 401
        data = request.get_json()
        update_data = {k: data[k] for k in parser_fields if k in data}
        update_data['id'] = id
        item = service.update(update_data)
        return marshal(item, marshal_fields), 200

    def patch(self, id):
        item = service.get_by_id(id)
        if not item:
            return {"message": "Not Found"}, 404
        if not current_user.has_role('admin') and current_user.id != item.user_id:
            return {"message": "Not Authorised"}, 401
        data = request.get_json()
        data['id'] = id
        item = service.update(data)
        return marshal(item, marshal_fields), 200

    def delete(self, id):
        item = service.get_by_id(id)
        if not item:
            return {"message": "Not Found"}, 404
        if not current_user.has_role('admin') and current_user.id != item.user_id:
            return {"message": "Not Authorised"}, 401
        message = service.delete(id)
        return message, 200


# ─── /api/session/:session_id/feedbacks ───────────────────────────
class SessionFeedbackResource(Resource):

    def get(self, session_id):
        if not current_user.has_role('admin') and current_user.id != session_id:
            return {"message": "Not Authorised"}, 401
        items = service.get_by_session(session_id)
        return marshal(items, marshal_fields), 200