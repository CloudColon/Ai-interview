from flask import Flask
from config import LocalDevelopmentConfig
from extensions import db, security
from flask_security import SQLAlchemyUserDatastore
from models import User, Role
from resources.auth_resources import auth_bp
from resources import api_bp
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()  # Load environment variables from .env file

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)

    # ─── Extensions ───────────────────────────────────────────────
    db.init_app(app)
    CORS(app,
        origins=["http://localhost:3000"],
        methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization", "Authentication-Token"],
        supports_credentials=True
    )

    # ─── Flask-Security ───────────────────────────────────────────
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    security.init_app(app, datastore)

    # ─── Blueprints ───────────────────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(api_bp)

    # ─── Database ─────────────────────────────────────────────────
    with app.app_context():
        db.create_all()

    return app


app = create_app()

# app.py
if __name__ == '__main__':
    app.run(debug=True, port=8000)  # change to 8000