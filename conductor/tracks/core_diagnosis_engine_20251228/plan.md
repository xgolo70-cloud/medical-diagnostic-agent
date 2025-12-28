# Track Plan: Core Diagnosis Engine and Basic Data Ingestion Pipeline

## Phase 1: Environment and Project Scaffolding [checkpoint: 148c439]
- [x] Task: Initialize Python project with Poetry/pip, FastAPI, and required dependencies. [dc05785]
- [x] Task: Implement basic HIPAA-compliant security utilities (Encryption/Decryption helpers). [f119afb]
- [x] Task: Set up the skeleton for the Audit Logging system. [2debb04]
- [x] Task: Conductor - User Manual Verification 'Environment and Project Scaffolding' (Protocol in workflow.md) [148c439]

## Phase 2: Data Ingestion Pipeline [checkpoint: de4c054]
- [x] Task: Implement TDD for Manual Data Entry endpoint. [4e5752f]
    - [x] Write tests for patient data schema validation.
    - [x] Implement FastAPI endpoint for manual data entry.
- [x] Task: Implement TDD for PDF Document Parsing. [ca551ca]
    - [x] Write tests for clinical text extraction from sample PDF lab reports.
    - [x] Implement PDF parsing logic using PyMuPDF or pdfplumber.
- [x] Task: Conductor - User Manual Verification 'Data Ingestion Pipeline' (Protocol in workflow.md) [de4c054]

## Phase 3: Core Diagnosis Engine Integration [checkpoint: e06d340]
- [x] Task: Implement TDD for Gemini 2.0 Flash prompt engineering and integration. [9763bab]
    - [x] Write tests for AI response structure (differential diagnosis, confidence, rationale).
    - [x] Implement the LLM service to process synthesized patient data and return structured results.
- [x] Task: Implement TDD for Clinical Rationale and Citation logic. [b43b904]
    - [x] Write tests ensuring rationale links back to input symptoms or history.
    - [x] Refine the AI prompt to enforce traceable citations.
- [x] Task: Implement /api/diagnose endpoint with Audit Logging. [fab5ecb]
- [x] Task: Conductor - User Manual Verification 'Core Diagnosis Engine Integration' (Protocol in workflow.md) [e06d340]

## Phase 4: MVP Integration and Verification
- [x] Task: Perform end-to-end testing of the full pipeline. [aefbad3]
- [ ] Task: Implement a unified API endpoint that synthesizes manual data and PDF content for analysis.
- [ ] Task: Verify the diagnostic accuracy against a small set of medical benchmark cases.
- [ ] Task: Conductor - User Manual Verification 'MVP Integration and Verification' (Protocol in workflow.md)
