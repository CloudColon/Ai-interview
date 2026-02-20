from flask import Flask
from config import LocalDevelopmentConfig
from extensions import db, security
from flask_security import SQLAlchemyUserDatastore
from models import User, Role
from resources.auth_resources import auth_bp
from resources import api_bp
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config.from_object(LocalDevelopmentConfig)

    # ─── Extensions ───────────────────────────────────────────────
    db.init_app(app)
    CORS(app, origins="*")

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

if __name__ == '__main__':
    app.run(debug=True)