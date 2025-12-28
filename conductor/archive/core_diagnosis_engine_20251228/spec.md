# Track Spec: Core Diagnosis Engine and Basic Data Ingestion Pipeline

## Overview
This track focuses on building the foundational backend and AI logic for the medical diagnostic support agent. It includes the ability to ingest patient data through manual entry and PDF uploads, and uses Gemini 2.0 Flash to generate ranked differential diagnoses with clinical rationale.

## User Stories
- **As a GP**, I want to input patient symptoms and lab results so I can receive a ranked list of differential diagnoses.
- **As a Specialist**, I want to upload pathology reports so the agent can analyze them against medical literature.

## Functional Requirements
- **FastAPI Backend:** Create a robust API to handle data submission and processing.
- **Manual Data Ingestion:** API endpoint to receive structured patient data (symptoms, history, vitals).
- **PDF Document Parsing:** Implement logic to extract clinical text from uploaded PDF lab reports and summaries.
- **Diagnosis Core:** Integration with Gemini 2.0 Flash to analyze synthesized patient data.
- **Structured Output:** Generate a JSON response containing:
    - Ranked list of diagnoses.
    - Confidence scores (0-100%).
    - Clinical rationale with citations.
- **HIPAA Compliance Foundation:** Implement encryption for data at rest and a skeleton for an immutable audit log.

## Non-Functional Requirements
- **Accuracy:** Lay the groundwork for achieving >90% accuracy on medical benchmarks.
- **Security:** Ensure all patient health information (PHI) is handled according to zero-trust principles.
- **Interpretability:** Ensure the AI output is traceable to the input data.

## Technical Constraints
- Language: Python 3.11+
- Framework: FastAPI
- AI: Gemini 2.0 Flash
- PDF Parsing: `PyMuPDF` or `pdfplumber`
- Storage: Initial local encrypted storage (simulating HIPAA-compliant cloud storage)
