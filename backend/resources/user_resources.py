from flask import jsonify, request
from flask_restful import Resource, marshal, reqparse
from .marshal_fields import user_fields
from services import UserServices
from flask_security import current_user
from flask_security.decorators import roles_required

parser = reqparse.RequestParser()
parser.add_argument('username', type=str, required=True, help='Username is required')
parser.add_argument('email',    type=str, required=True, help='Email is required')
parser.add_argument('password', type=str, required=True, help='Password is required')

patch_parser = reqparse.RequestParser()
patch_parser.add_argument('username', type=str)
patch_parser.add_argument('email',    type=str)
patch_parser.add_argument('password', type=str)

marshal_fields = user_fields
service = UserServices


# ─── /api/users/:id ───────────────────────────────────────────────

class UserResource(Resource):
    def get(self, id):
        item = service.get_by_id(id)
        return marshal(item, marshal_fields), 200

    def put(self, id):
        item = service.get_by_id(id)
        if not item:
            return {"message": "Not Found"}, 404
        if not current_user.has_role('admin') and current_user.id != id:
            return {"message": "Not Authorised"}, 401
        args = parser.parse_args()
        update_data = {k: v for k, v in args.items() if v is not None}
        update_data['id'] = id
        item = service.update_user(update_data)
        return marshal(item, marshal_fields), 200

    def patch(self, id):
        if not current_user.has_role('admin') and current_user.id != id:
            return {"message": "Not Authorised"}, 401
        item = service.get_by_id(id)
        if not item:
            return {"message": "Not Found"}, 404
        data = request.get_json()
        data['id'] = id
        item = service.update_user(data)
        return marshal(item, marshal_fields), 200

    def delete(self, id):
        if not current_user.has_role('admin') and current_user.id != id:
            return {"message": "Not Authorised"}, 401
        item = service.get_by_id(id)
        if not item:
            return {"message": "Not Found"}, 404
        message = service.delete(id)
        return message, 200


# ─── /api/users ───────────────────────────────────────────────────
class UserListResource(Resource):

    @roles_required('admin')
    def get(self):
        items = service.get_all()
        return marshal(items, marshal_fields), 200

    @roles_required('admin')
    def post(self):
        args = parser.parse_args()
        item = service.create(args)
        return marshal(item, marshal_fields), 201
