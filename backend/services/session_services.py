from models import Session, db
from service_error import ServiceError

model = Session

class SessionServices:
    @staticmethod
    def get_all():
        return model.query.all()

    @staticmethod
    def get_by_id(session_id):
        session = model.query.get(session_id)
        if not session:
            return ServiceError("Session not found", 404)
        return session

    @staticmethod
    def create(data):
        new_session = model(**data)
        db.session.add(new_session)
        db.session.commit()
        return new_session

    @staticmethod
    def update_session(data):
        session = model.query.get(data['id'])
        if not session:
            return ServiceError("Session not found", 404)
        for key in data:
            setattr(session, key, data[key])
        db.session.commit()
        return session

    @staticmethod
    def delete(session_id):
        session = model.query.get(session_id)
        if not session:
            return ServiceError("Session not found", 404)
        db.session.delete(session)
        db.session.commit()
        return {"message": "Session deleted successfully"}