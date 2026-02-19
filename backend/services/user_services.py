from models import db, User
from service_error import ServiceError

model = User

class UserServices:
    @staticmethod
    def get_all():
        return model.query.all()

    @staticmethod
    def get_by_id(user_id):
        user = model.query.get(user_id)
        if not user:
            return ServiceError("User not found", 404)
        return user

    @staticmethod
    def create(data):
        new_user = model(**data)
        db.session.add(new_user)
        db.session.commit()
        return new_user

    @staticmethod
    def update_user(data):
        user = model.query.get(data['id'])
        if not user:
            return ServiceError("User not found", 404)
        for key in data:
            setattr(user, key, data[key])
        db.session.commit()
        return user

    @staticmethod
    def delete(user_id):
        user = model.query.get(user_id)
        if not user:
            return ServiceError("User not found", 404)
        db.session.delete(user)
        db.session.commit()
        return {"message": "User deleted successfully"}