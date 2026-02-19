import os
from dotenv import load_dotenv

load_dotenv()

class BaseConfig:
    SQLALCHEMY_TRACK_MODIFICATIONS = False  # False is recommended to save memory
    SECURITY_REGISTERABLE = True
    SECURITY_SEND_REGISTER_EMAIL = False    # disable email during dev
    WTF_CSRF_ENABLED = False                # disable CSRF for API-based apps

class LocalDevelopmentConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI', 'sqlite:///database.sqlite3')
    DEBUG = True
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SECURITY_PASSWORD_SALT = os.environ.get('SECURITY_PASSWORD_SALT')
    SECURITY_PASSWORD_HASH = 'argon2'

class ProductionConfig(BaseConfig):
    SQLALCHEMY_DATABASE_URI = os.environ.get('SQLALCHEMY_DATABASE_URI')
    DEBUG = False
    SECRET_KEY = os.environ.get('SECRET_KEY')
    SECURITY_PASSWORD_SALT = os.environ.get('SECURITY_PASSWORD_SALT')
    SECURITY_PASSWORD_HASH = 'argon2'
    SQLALCHEMY_POOL_RECYCLE = 299           # prevent stale connections
    SQLALCHEMY_POOL_TIMEOUT = 20