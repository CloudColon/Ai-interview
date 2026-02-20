from models import db, Feedback
from services.service_error import ServiceError

model = Feedback

class FeedbackServices:
    @staticmethod
    def get_all():
        return model.query.all()

    @staticmethod
    def get_by_id(feedback_id):
        feedback = model.query.get(feedback_id)
        if not feedback:
            return ServiceError("Feedback not found", 404)
        return feedback

    @staticmethod
    def create(data):
        new_feedback = model(**data)
        db.session.add(new_feedback)
        db.session.commit()
        return new_feedback

    @staticmethod
    def update_feedback(data):
        feedback = model.query.get(data['id'])
        if not feedback:
            return ServiceError("Feedback not found", 404)
        for key in data:
            setattr(feedback, key, data[key])
        db.session.commit()
        return feedback

    @staticmethod
    def delete(feedback_id):
        feedback = model.query.get(feedback_id)
        if not feedback:
            return ServiceError("Feedback not found", 404)
        db.session.delete(feedback)
        db.session.commit()
        return {"message": "Feedback deleted successfully"}