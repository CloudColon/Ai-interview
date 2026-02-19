from flask import request
from flask_restful import Resource, marshal
from flask_security import current_user
from flask_security.decorators import roles_required
from services.jobdescription_services import JobDescriptionServices
from .marshal_fields import job_description_fields

service = JobDescriptionServices
marshal_fields = job_description_fields


# ─── /api/jobs ────────────────────────────────────────────────────
class JobDescriptionListResource(Resource):

    def get(self):
        items = service.get_all()
        return marshal(items, marshal_fields), 200

    @roles_required('admin')
    def post(self):
        data = request.get_json()
        missing = [f for f in ['title', 'description'] if not data.get(f)]
        if missing:
            return {"error": f"Missing fields: {', '.join(missing)}"}, 400
        data['created_by'] = current_user.id
        item = service.create(data)
        return marshal(item, marshal_fields), 201


# ─── /api/jobs/:id ────────────────────────────────────────────────
class JobDescriptionResource(Resource):

    def get(self, id):
        item = service.get_by_id(id)
        if not item:
            return {"message": "Not Found"}, 404
        return marshal(item, marshal_fields), 200

    @roles_required('admin')
    def put(self, id):
        item = service.get_by_id(id)
        if not item:
            return {"message": "Not Found"}, 404
        data = request.get_json()
        missing = [f for f in ['title', 'description'] if not data.get(f)]
        if missing:
            return {"error": f"Missing fields: {', '.join(missing)}"}, 400
        data['id'] = id
        item = service.update(data)
        return marshal(item, marshal_fields), 200

    @roles_required('admin')
    def patch(self, id):
        item = service.get_by_id(id)
        if not item:
            return {"message": "Not Found"}, 404
        data = request.get_json()
        data['id'] = id
        item = service.update(data)
        return marshal(item, marshal_fields), 200

    @roles_required('admin')
    def delete(self, id):
        item = service.get_by_id(id)
        if not item:
            return {"message": "Not Found"}, 404
        message = service.delete(id)
        return message, 200