# 🤖 AI Interviewer

An intelligent AI-powered interview platform built with Flask that conducts, evaluates, and provides feedback on mock interviews based on job descriptions.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Models](#database-models)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the App](#running-the-app)
- [API Endpoints](#api-endpoints)
- [Access Control](#access-control)
- [Contributing](#contributing)

---

## Overview

AI Interviewer is a web application that simulates real-world job interviews using AI. Users can register, select or create a job description, start an interview session, and receive AI-generated feedback and scores for each answer they provide.

---

## ✨ Features

- 🔐 User authentication and role-based access (via Flask-Security)
- 📄 Job Description management
- 🎙️ AI-driven interview sessions with start/end lifecycle
- 📊 Per-question feedback and scoring
- 📝 Full session transcript storage
- 🏆 Overall session scoring
- 🛡️ Ownership-based access control (users can only access their own data)

---

## 🛠 Tech Stack

| Layer       | Technology          |
|-------------|---------------------|
| Backend     | Python, Flask       |
| REST API    | Flask-RESTful       |
| Database    | SQLAlchemy (ORM)    |
| Auth        | Flask-Security-Too  |
| DB Driver   | SQLite / PostgreSQL |
| Config      | python-dotenv       |

---

## 📁 Project Structure

```
ai-interviewer/
│
├── app.py                           # App factory & configuration
├── extensions.py                    # Flask extensions (db, security)
├── models.py                        # Database models
├── config.py                        # Config classes (Base, Local, Production)
├── requirements.txt                 # Python dependencies
├── .env                             # Environment variables (not committed)
├── README.md                        # Project documentation
│
├── services/                        # Business logic layer
│   ├── service_error.py             # Custom ServiceError exception
│   ├── user_service.py              # User CRUD operations
│   ├── session_service.py           # Session CRUD operations
│   ├── feedback_service.py          # Feedback CRUD operations
│   └── job_description_service.py   # Job Description CRUD operations
│
└── resources/                       # API layer (Flask-RESTful)
    ├── __init__.py                   # Api blueprint + all route registrations
    ├── marshal.py                    # Flask-RESTful marshal fields
    ├── auth_resources.py             # Auth blueprint (login, register, me)
    ├── user_resources.py             # User endpoints
    ├── session_resources.py          # Session endpoints
    ├── feedback_resources.py         # Feedback endpoints
    └── job_description_resources.py  # Job Description endpoints
```

---

## 🗃 Database Models

### User
Stores registered users. Integrated with Flask-Security for authentication.

| Field         | Type    | Description                |
|---------------|---------|----------------------------|
| id            | Integer | Primary key                |
| email         | String  | Unique email               |
| username      | String  | Unique username            |
| password      | String  | Hashed password            |
| active        | Boolean | Account status             |
| fs_uniquifier | String  | Required by Flask-Security |

---

### Role
Defines user roles (e.g. admin, candidate).

| Field       | Type    | Description      |
|-------------|---------|------------------|
| id          | Integer | Primary key      |
| name        | String  | Role name        |
| description | String  | Role description |

---

### JobDescription
Stores job postings used to tailor interview questions.

| Field       | Type     | Description                     |
|-------------|----------|---------------------------------|
| id          | Integer  | Primary key                     |
| title       | String   | Job title                       |
| description | Text     | Full job description            |
| skills      | Text     | Required skills                 |
| experience  | String   | Experience range (e.g. 2-4 yrs) |
| created_by  | FK(User) | User who created the JD         |

---

### Session
Represents a single interview session for a user.

| Field              | Type       | Description                               |
|--------------------|------------|-------------------------------------------|
| id                 | Integer    | Primary key                               |
| user_id            | FK(User)   | Candidate                                 |
| job_description_id | FK(JD)     | Associated job description                |
| status             | String     | pending / ongoing / completed / cancelled |
| started_at         | DateTime   | Session start time                        |
| ended_at           | DateTime   | Session end time                          |
| transcript         | Text       | Full Q&A transcript                       |
| score              | Float      | Overall AI score (0-100)                  |

---

### Feedback
Stores per-question AI feedback within a session.

| Field       | Type        | Description                 |
|-------------|-------------|-----------------------------|
| id          | Integer     | Primary key                 |
| session_id  | FK(Session) | Associated session          |
| user_id     | FK(User)    | Candidate                   |
| question    | Text        | Interview question asked    |
| answer      | Text        | Candidate's answer          |
| ai_feedback | Text        | AI-generated feedback       |
| score       | Float       | Per-question score (0-10)   |
| category    | String      | e.g. technical, behavioural |

---

## ⚙️ Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/ai-interviewer.git
cd ai-interviewer

# 2. Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt
```

---

## 🔧 Configuration

Create a `.env` file in the root directory:

```env
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key
SECURITY_PASSWORD_SALT=your-password-salt
SQLALCHEMY_DATABASE_URI=sqlite:///ai_interviewer.db
```

---

## 🚀 Running the App

```bash
# Initialize the database
flask db init
flask db migrate -m "Initial migration"
flask db upgrade

# Run the development server
flask run
```

---

## 🔗 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint             | Access  | Description              |
|--------|----------------------|---------|--------------------------|
| POST   | `/api/auth/register` | Public  | Register a new user      |
| POST   | `/api/auth/login`    | Public  | Login and get auth token |
| POST   | `/api/auth/logout`   | Public  | Logout                   |
| GET    | `/api/auth/me`       | Private | Get current user info    |

---

### Users — `/api/users`

| Method | Endpoint          | Access      | Description         |
|--------|-------------------|-------------|---------------------|
| GET    | `/api/users`      | Admin only  | Get all users       |
| POST   | `/api/users`      | Admin only  | Create a user       |
| GET    | `/api/users/<id>` | Owner/Admin | Get user by ID      |
| PUT    | `/api/users/<id>` | Owner/Admin | Full update user    |
| PATCH  | `/api/users/<id>` | Owner/Admin | Partial update user |
| DELETE | `/api/users/<id>` | Owner/Admin | Delete user         |

---

### Job Descriptions — `/api/jobs`

| Method | Endpoint         | Access     | Description               |
|--------|------------------|------------|---------------------------|
| GET    | `/api/jobs`      | Public     | Get all job descriptions  |
| POST   | `/api/jobs`      | Admin only | Create a job description  |
| GET    | `/api/jobs/<id>` | Public     | Get job description by ID |
| PUT    | `/api/jobs/<id>` | Admin only | Full update               |
| PATCH  | `/api/jobs/<id>` | Admin only | Partial update            |
| DELETE | `/api/jobs/<id>` | Admin only | Delete job description    |

---

### Sessions — `/api/sessions`

| Method | Endpoint                          | Access      | Description               |
|--------|-----------------------------------|-------------|---------------------------|
| GET    | `/api/sessions`                   | Admin only  | Get all sessions          |
| POST   | `/api/sessions`                   | Private     | Create a new session      |
| GET    | `/api/sessions/<id>`              | Owner/Admin | Get session by ID         |
| PATCH  | `/api/sessions/<id>`              | Owner/Admin | Update session            |
| DELETE | `/api/sessions/<id>`              | Admin only  | Delete session            |
| POST   | `/api/sessions/<id>/start`        | Owner/Admin | Start a pending session   |
| POST   | `/api/sessions/<id>/end`          | Owner/Admin | End an ongoing session    |
| GET    | `/api/users/<user_id>/sessions`   | Owner/Admin | Get all sessions for user |

---

### Feedback — `/api/feedbacks`

| Method | Endpoint                                 | Access      | Description                    |
|--------|------------------------------------------|-------------|--------------------------------|
| GET    | `/api/feedbacks`                         | Admin only  | Get all feedback               |
| POST   | `/api/feedbacks`                         | Private     | Submit answer & get feedback   |
| GET    | `/api/feedbacks/<id>`                    | Owner/Admin | Get feedback by ID             |
| PUT    | `/api/feedbacks/<id>`                    | Owner/Admin | Full update feedback           |
| PATCH  | `/api/feedbacks/<id>`                    | Owner/Admin | Partial update feedback        |
| DELETE | `/api/feedbacks/<id>`                    | Owner/Admin | Delete feedback                |
| GET    | `/api/sessions/<session_id>/feedbacks`   | Owner/Admin | Get all feedback for a session |

---

## 🛡️ Access Control

| Role      | Access                                               |
|-----------|------------------------------------------------------|
| Admin     | Full access to all resources                         |
| Candidate | Access only to own sessions, feedback, and profile   |
| Public    | Read-only access to job descriptions and auth routes |

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.