# 🏥 Medical Diagnostic Agent

<div align="center">
  <h3>AI-Powered Medical Imaging & Diagnostic Assistant</h3>
  <p>A secure, HIPAA-compliant platform for real-time medical image analysis using specialized AI models.</p>
</div>

![Dashboard Preview](./dashboard_preview.png)

## ✨ key Features

- **Advanced Image Analysis**: Powered by MedGemma 1.5 (Local) for X-Ray, CT, MRI, and more.
- **Secure & Compliant**: JWT Authentication, Audit Logging, and Data Encryption.
- **Modern UI**: "Cosmic Glass" aesthetic with intuitive navigation and smooth animations.
- **Productivity Tools**:
  - 🎤 **MedASR**: Real-time medical speech-to-text dictation.
  - 📄 **PDF Reports**: Instant export of diagnostic findings.
  - 💡 **Smart Onboarding**: Interactive tour for new users.
- **Robust Backend**: FastAPI with strict validation, rate limiting, and security headers.

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- Python 3.9+
- Hugging Face Token (for MedGemma)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/medical-diagnostic-agent.git
   cd medical-diagnostic-agent
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Setup Environment
   cp .env.example .env
   # Add your HF_TOKEN and generate a JWT_SECRET_KEY
   
   uvicorn app.main:app --reload
   ```

## 🔐 Security Features

- **Authentication**: Secure JWT-based auth with role management.
- **Input Validation**: Strict Pydantic models for all data inputs.
- **Protection**: Rate limiting, CORS restrictions, and Security Headers.
- **Audit Logs**: Prevent path traversal and secure sensitive actions.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS, Framer Motion, Vite
- **Backend**: FastAPI, Python, PyTorch (MedGemma), JWT
- **AI Models**: MedGemma 1.5, Whisper (for ASR)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

> **Disclaimer**: This tool is for investigational and educational purposes only. Always verify AI findings with a certified medical professional.
