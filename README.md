# 🏥 Medical Diagnostic Agent

<div align="center">
  <h3>AI-Powered Medical Imaging & Diagnostic Assistant</h3>
  <p>A secure, HIPAA-compliant platform for real-time medical image analysis using specialized AI models. Fully Containerized for Production.</p>
</div>

## ✨ Key Features

- **Advanced Image Analysis**: Powered by MedGemma 1.5 for intelligent clinical classification and urgency detection (X-Ray, CT, MRI).
- **Secure & Compliant**: JWT Authentication, Structured JSON Audit Logging, and role-based access control.
- **Modern UI**: Clean, professional design with a "Cosmic Glass" aesthetic.
- **Productivity Tools**:
  - 📋 **Clinical Case Management**: Advanced filtering by severity and condition category for past diagnoses.
  - 🎤 **MedASR**: Real-time medical speech-to-text dictation.
  - 📄 **PDF Reports**: Instant export of diagnostic findings.
- **Robust Backend Architecture**:
  - **API Backend**: FastAPI deployed via Gunicorn in a containerized environment.
  - **Database**: PostgreSQL integration with SQLAlchemy ORM.
  - **File Storage**: Native integration with Supabase Storage for secure medical data handling.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js v20+
- Python 3.11+
- [Docker & Docker Compose](https://docs.docker.com/get-docker/) (For Production testing)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure Environment
cp .env.example .env
# Important: Update HF_TOKEN, GEMINI_API_KEY, and Supabase credentials in .env

uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm ci
npm run dev
```

---

## 🌍 Production Deployment (Docker Compose)

The application is fully configured for a highly scalable production deployment using Docker containers networking a React SPA (Nginx), a Python API (Gunicorn), and a PostgreSQL Database.

### 1. Environment Preparation
Ensure your `.env` file is fully configured with production secrets, including a secure `JWT_SECRET_KEY` and valid API keys for Google Gemini / HuggingFace.

### 2. Build and Launch the Stack
From the root directory of the project, run:

```bash
docker-compose up --build -d
```

### What this does:
- **`db`**: Pulls `postgres:15-alpine` and provisions a persistent `medical_db`.
- **`backend`**: Builds a `python:3.11-slim` image, installs the dependencies (including `psycopg2-binary`), runs database migrations, and serves the FastAPI application via `gunicorn` on port `8000`.
- **`frontend`**: Performs a multi-stage Vite build and serves the static production UI via an Alpine `nginx` server on port `80`. Nginx is explicitly configured to handle React Router SPA fallbacks.

Your application will now be live at `http://localhost`.

---

## � Security & Infrastructure

- **Authentication**: JWT tokens (Access & Refresh flows) managed strictly through environment variables.
- **Data Persistence**: Postgres Data Volumes map outside the container lifecycle allowing zero-loss database updates.
- **Logging**: Production audit logs are safely routed via structured JSON to persisted system mounts.
- **Protection**: Global and Route-specific Rate Limiting via custom middleware, and Strict CORS definitions spanning allowed origins.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

> **Disclaimer**: This tool is for investigational and educational purposes only. Always verify AI findings with a certified medical professional.
