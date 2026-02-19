from models import JobDescription, db
from service_error import ServiceError  

model = JobDescription

class JobDescriptionServices:
    @staticmethod
    def get_all():
        return model.query.all()

    @staticmethod
    def get_by_id(job_description_id):
        job_description = model.query.get(job_description_id)
        if not job_description:
            return ServiceError("Job Description not found", 404)
        return job_description

    @staticmethod
    def create(data):
        new_job_description = model(**data)
        db.session.add(new_job_description)
        db.session.commit()
        return new_job_description

    @staticmethod
    def update_job_description(data):
        job_description = model.query.get(data['id'])
        if not job_description:
            return ServiceError("Job Description not found", 404)
        for key in data:
            setattr(job_description, key, data[key])
        db.session.commit()
        return job_description

    @staticmethod
    def delete(job_description_id):
        job_description = model.query.get(job_description_id)
        if not job_description:
            return ServiceError("Job Description not found", 404)
        db.session.delete(job_description)
        db.session.commit()
        return {"message": "Job Description deleted successfully"}