import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from app import app
from extensions import db
from models import JobDescription

jobs = [
    {
        "title": "Backend Developer (Python / Flask)",
        "description": "We are looking for a Backend Developer to build scalable APIs and microservices using Python and Flask. The role involves designing database schemas, optimizing performance, and integrating third-party APIs.",
        "skills": "Python, Flask, REST APIs, SQLAlchemy, PostgreSQL, Docker",
        "experience": "2-4 years"
    },
    {
        "title": "Frontend Developer (React)",
        "description": "Seeking a React developer to build modern and responsive web interfaces. The candidate should work closely with backend teams to integrate APIs and deliver seamless user experiences.",
        "skills": "React, JavaScript, HTML, CSS, Redux, REST APIs",
        "experience": "1-3 years"
    },
    {
        "title": "Full Stack Developer",
        "description": "Looking for a Full Stack Developer who can build both frontend and backend components of web applications. Responsibilities include developing APIs, UI components, and ensuring application scalability.",
        "skills": "Python, Node.js, React, PostgreSQL, REST APIs, Git",
        "experience": "3-5 years"
    },
    {
        "title": "Machine Learning Engineer",
        "description": "Responsible for developing machine learning models and deploying them into production systems. The role includes data preprocessing, feature engineering, model evaluation, and monitoring.",
        "skills": "Python, PyTorch, TensorFlow, Scikit-learn, Pandas, NLP",
        "experience": "2-5 years"
    },
    {
        "title": "Data Scientist",
        "description": "Analyze large datasets to extract insights and build predictive models. Work with business stakeholders to translate data findings into actionable decisions.",
        "skills": "Python, Pandas, NumPy, Machine Learning, SQL, Data Visualization",
        "experience": "2-4 years"
    },
    {
        "title": "DevOps Engineer",
        "description": "Manage infrastructure and automate deployment pipelines. Ensure high availability, scalability, and security of production systems.",
        "skills": "Docker, Kubernetes, AWS, CI/CD, Linux, Terraform",
        "experience": "3-6 years"
    },
    {
        "title": "AI Engineer (LLM / GenAI)",
        "description": "Develop AI-powered applications using Large Language Models. Implement prompt engineering, retrieval-augmented generation pipelines, and AI automation workflows.",
        "skills": "Python, LangChain, LangGraph, LLMs, Vector Databases, NLP",
        "experience": "2-4 years"
    },
    {
        "title": "Software Engineer (Java)",
        "description": "Build scalable enterprise applications using Java and Spring Boot. Collaborate with cross-functional teams to design robust backend services.",
        "skills": "Java, Spring Boot, REST APIs, Microservices, MySQL",
        "experience": "2-5 years"
    },
    {
        "title": "Mobile App Developer (Flutter)",
        "description": "Develop cross-platform mobile applications using Flutter. Work with designers and backend developers to build high-quality mobile experiences.",
        "skills": "Flutter, Dart, REST APIs, Firebase, Mobile UI/UX",
        "experience": "1-3 years"
    },
    {
        "title": "Cloud Engineer",
        "description": "Design and manage cloud infrastructure and services. Optimize performance, security, and cost across cloud environments.",
        "skills": "AWS, Azure, Docker, Kubernetes, Infrastructure as Code",
        "experience": "3-6 years"
    }
]


def seed_jobs():
    with app.app_context():
        for job in jobs:
            jd = JobDescription(
                title=job["title"],
                description=job["description"],
                skills=job["skills"],
                experience=job["experience"]
            )
            db.session.add(jd)

        db.session.commit()
        print("✅ 10 Job Descriptions inserted successfully!")


if __name__ == "__main__":
    seed_jobs()
