# Track Plan: Core Diagnosis Engine and Basic Data Ingestion Pipeline

## Phase 1: Environment and Project Scaffolding
- [x] Task: Initialize Python project with Poetry/pip, FastAPI, and required dependencies. [dc05785]
- [x] Task: Implement basic HIPAA-compliant security utilities (Encryption/Decryption helpers). [f119afb]
- [ ] Task: Set up the skeleton for the Audit Logging system.
- [ ] Task: Conductor - User Manual Verification 'Environment and Project Scaffolding' (Protocol in workflow.md)

## Phase 2: Data Ingestion Pipeline
- [ ] Task: Implement TDD for Manual Data Entry endpoint.
    - [ ] Write tests for patient data schema validation.
    - [ ] Implement FastAPI endpoint for manual data entry.
- [ ] Task: Implement TDD for PDF Document Parsing.
    - [ ] Write tests for clinical text extraction from sample PDF lab reports.
    - [ ] Implement PDF parsing logic using PyMuPDF or pdfplumber.
- [ ] Task: Conductor - User Manual Verification 'Data Ingestion Pipeline' (Protocol in workflow.md)

## Phase 3: Core Diagnosis Engine Integration
- [ ] Task: Implement TDD for Gemini 2.0 Flash prompt engineering and integration.
    - [ ] Write tests for AI response structure (differential diagnosis, confidence, rationale).
    - [ ] Implement the LLM service to process synthesized patient data and return structured results.
- [ ] Task: Implement TDD for Clinical Rationale and Citation logic.
    - [ ] Write tests ensuring rationale links back to input symptoms or history.
    - [ ] Refine the AI prompt to enforce traceable citations.
- [ ] Task: Conductor - User Manual Verification 'Core Diagnosis Engine Integration' (Protocol in workflow.md)

## Phase 4: MVP Integration and Verification
- [ ] Task: Implement a unified API endpoint that synthesizes manual data and PDF content for analysis.
- [ ] Task: Verify the diagnostic accuracy against a small set of medical benchmark cases.
- [ ] Task: Conductor - User Manual Verification 'MVP Integration and Verification' (Protocol in workflow.md)
