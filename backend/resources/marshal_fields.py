from flask_restful import fields

base_fields = {
    "id": fields.Integer,
    "created_at": fields.DateTime,
    "updated_at": fields.DateTime
}

role_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "description": fields.String
}

# ─── User Fields ──────────────────────────────────────────────────
user_fields = {
    ** base_fields,
    'username':   fields.String,
    'email':      fields.String,
    'active':     fields.Boolean,
    "roles":    fields.List(fields.Nested(role_fields))
}

# ─── Job Description Fields ───────────────────────────────────────
job_description_fields = {
    ** base_fields,
    "title":       fields.String,
    "description": fields.String,
    "skills":      fields.String,
    "experience":  fields.String
}

# ─── Feedback Fields ──────────────────────────────────────────────
feedback_fields = {
    ** base_fields,
    "session_id":  fields.Integer,
    "user_id":     fields.Integer,
    "question":    fields.String,
    "answer":      fields.String,
    "ai_feedback": fields.String,   
    "score":       fields.Float,
    "category":    fields.String
}

# ─── Session Fields ───────────────────────────────────────────────
session_fields = {
    ** base_fields,
    "user_id":            fields.Integer,
    "job_description_id": fields.Integer,
    "status":             fields.String,
    "started_at":         fields.DateTime(dt_format='iso8601'),  
    "ended_at":           fields.DateTime(dt_format='iso8601'),  
    "transcript":         fields.String,
    "score":              fields.Float,
    "feedbacks":          fields.List(fields.Nested(feedback_fields)),
    "job_description":    fields.Nested(job_description_fields, allow_null=True),
    "user":               fields.Nested(user_fields, allow_null=True)
}
