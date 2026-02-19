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
- [Contributing](#contributing)

---

## Overview

AI Interviewer is a web application that simulates real-world job interviews using AI. Users can register, select or create a job description, start an interview session, and receive AI-generated feedback and scores for each answer they provide.

---

## ✨ Features

- 🔐 User authentication and role-based access (via Flask-Security)
- 📄 Job Description management
- 🎙️ AI-driven interview sessions
- 📊 Per-question feedback and scoring
- 📝 Full session transcript storage
- 🏆 Overall session scoring

---

## 🛠 Tech Stack

| Layer        | Technology              |
|-------------|-------------------------|
| Backend      | Python, Flask           |
| Database     | SQLAlchemy (ORM)        |
| Auth         | Flask-Security-Too      |
| DB Driver    | SQLite / PostgreSQL      |

---

## 📁 Project Structure

```
ai-interviewer/
│
├── extensions.py        # Flask extensions (db, security)
├── models.py            # Database models
├── app.py               # App factory & configuration
├── requirements.txt     # Python dependencies
├── README.md            # Project documentation
│
├── routes/
│   ├── auth.py          # Authentication routes
│   ├── session.py       # Interview session routes
│   ├── feedback.py      # Feedback routes
│   └── job.py           # Job description routes
│
├── templates/           # Jinja2 HTML templates
└── static/              # CSS, JS, assets
```

---

## 🗃 Database Models

### User
Stores registered users. Integrated with Flask-Security for authentication.

| Field          | Type    | Description                  |
|----------------|---------|------------------------------|
| id             | Integer | Primary key                  |
| email          | String  | Unique email                 |
| username       | String  | Unique username              |
| password       | String  | Hashed password              |
| active         | Boolean | Account status               |
| fs_uniquifier  | String  | Required by Flask-Security   |

---

### Role
Defines user roles (e.g. admin, candidate).

| Field       | Type   | Description       |
|-------------|--------|-------------------|
| id          | Integer| Primary key       |
| name        | String | Role name         |
| description | String | Role description  |

---

### JobDescription
Stores job postings used to tailor interview questions.

| Field       | Type    | Description                    |
|-------------|---------|--------------------------------|
| id          | Integer | Primary key                    |
| title       | String  | Job title                      |
| description | Text    | Full job description           |
| skills      | Text    | Required skills                |
| experience  | String  | Experience range (e.g. 2-4 yrs)|
| created_by  | FK(User)| User who created the JD        |

---

### Session
Represents a single interview session for a user.

| Field              | Type       | Description                          |
|--------------------|------------|--------------------------------------|
| id                 | Integer    | Primary key                          |
| user_id            | FK(User)   | Candidate                            |
| job_description_id | FK(JD)     | Associated job description           |
| status             | String     | pending / ongoing / completed / cancelled |
| started_at         | DateTime   | Session start time                   |
| ended_at           | DateTime   | Session end time                     |
| transcript         | Text       | Full Q&A transcript                  |
| score              | Float      | Overall AI score (0-100)             |

---

### Feedback
Stores per-question AI feedback within a session.

| Field       | Type        | Description                        |
|-------------|-------------|------------------------------------|
| id          | Integer     | Primary key                        |
| session_id  | FK(Session) | Associated session                 |
| user_id     | FK(User)    | Candidate                          |
| question    | Text        | Interview question asked           |
| answer      | Text        | Candidate's answer                 |
| ai_feedback | Text        | AI-generated feedback              |
| score       | Float       | Per-question score (0-10)          |
| category    | String      | e.g. technical, behavioural        |

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

| Method | Endpoint                  | Description                  |
|--------|---------------------------|------------------------------|
| POST   | `/auth/register`          | Register a new user          |
| POST   | `/auth/login`             | Login                        |
| GET    | `/jobs`                   | List all job descriptions    |
| POST   | `/jobs`                   | Create a job description     |
| POST   | `/session/start`          | Start an interview session   |
| GET    | `/session/<id>`           | Get session details          |
| POST   | `/session/<id>/feedback`  | Submit answer & get feedback |
| GET    | `/session/<id>/report`    | Get full session report      |

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