from flask import request
from flask_restful import Resource, marshal
from flask_security import current_user
from flask_security.decorators import roles_required
from services.session_services import SessionServices
from .marshal_fields import session_fields

service = SessionServices
marshal_fields = session_fields


# ─── /api/sessions ────────────────────────────────────────────────
class SessionListResource(Resource):

    @roles_required('admin')
    def get(self):
        items = service.get_all()
        return marshal(items, marshal_fields), 200

    def post(self):
        data = request.get_json()
        if not data.get('job_description_id'):
            return {"error": "job_description_id is required"}, 400
        data['user_id'] = current_user.id
        data['status'] = 'pending'
        item = service.create(data)
        return marshal(item, marshal_fields), 201


# ─── /api/sessions/:id ────────────────────────────────────────────
class SessionResource(Resource):

    def get(self, id):
        item = service.get_by_id(id)
        if not item:
            return {"message": "Not Found"}, 404
        if not current_user.has_role('admin') and current_user.id != item.user_id:
            return {"message": "Not Authorised"}, 401
        item.feedbacks = item.feedbacks.all()   # lazy=dynamic fix
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
        if not current_user.has_role('admin'):
            return {"message": "Not Authorised"}, 401
        message = service.delete(id)
        return message, 200


# ─── /api/sessions/:id/start ──────────────────────────────────────
class SessionStartResource(Resource):

    def post(self, id):
        item = service.get_by_id(id)
        if not item:
            return {"message": "Not Found"}, 404
        if not current_user.has_role('admin') and current_user.id != item.user_id:
            return {"message": "Not Authorised"}, 401
        if item.status != 'pending':
            return {"message": f"Session is already {item.status}"}, 400
        item = service.update({'id': id, 'status': 'ongoing'})
        return marshal(item, marshal_fields), 200


# ─── /api/sessions/:id/end ────────────────────────────────────────
class SessionEndResource(Resource):

    def post(self, id):
        item = service.get_by_id(id)
        if not item:
            return {"message": "Not Found"}, 404
        if not current_user.has_role('admin') and current_user.id != item.user_id:
            return {"message": "Not Authorised"}, 401
        if item.status != 'ongoing':
            return {"message": "Session is not ongoing"}, 400
        item = service.update({'id': id, 'status': 'completed'})
        return marshal(item, marshal_fields), 200


# ─── /api/users/:user_id/sessions ─────────────────────────────────
class UserSessionResource(Resource):

    def get(self, user_id):
        if not current_user.has_role('admin') and current_user.id != user_id:
            return {"message": "Not Authorised"}, 401
        items = service.get_by_user(user_id)
        return marshal(items, marshal_fields), 200