# Track Plan: Clinical Dashboard Web Application (MVP)

## Phase 1: Frontend Scaffolding and Infrastructure [checkpoint: e3c8322]
- [x] Task: Initialize React project with TypeScript, Vite, Tailwind CSS, and Material UI.
- [x] Task: Configure Redux Toolkit (store, auth slice) and React Query (query client).
- [x] Task: Create basic layout components (Sidebar, Layout shell, Theme provider).
- [x] Task: Conductor - User Manual Verification 'Frontend Scaffolding and Infrastructure' (Protocol in workflow.md)

## Phase 2: Authentication and Routing [checkpoint: 6d02af5]
- [x] Task: Implement TDD for Mock Authentication Logic.
    - [x] Write unit tests for the auth slice (login/logout actions).
    - [x] Implement the login form component and auth guard (Protected Route wrapper).
- [x] Task: Set up React Router with public (Login) and protected (Dashboard) routes.
- [x] Task: Conductor - User Manual Verification 'Authentication and Routing' (Protocol in workflow.md)

## Phase 3: Diagnosis Features (Manual & Unified) [checkpoint: cf67bed]
- [x] Task: Implement API Client service.
    - [x] Create a typed `api.ts` service to communicate with the FastAPI backend endpoints (`/api/ingest`, `/api/diagnose`).
- [x] Task: Implement Manual Diagnosis Form.
    - [x] Create form with validation (using React Hook Form + Zod) matching `PatientData` schema.
    - [x] Connect form submission to the API and display raw results.
- [x] Task: Implement Unified Diagnosis View (File Upload).
    - [x] Add file upload component for PDFs.
    - [x] Update API service to handle multipart/form-data.
- [x] Task: Build Diagnosis Results Display.
    - [x] Create UI components for Differential Diagnosis cards, Confidence bars, and Rationale sections.
- [x] Task: Conductor - User Manual Verification 'Diagnosis Features' (Protocol in workflow.md)

## Phase 4: History View and Final Polish
- [x] Task: Backend - Implement simple GET /api/history endpoint to read `audit.log` (Required for frontend view).
- [x] Task: Implement History/Audit Log View in Frontend.
    - [x] Fetch data from the new endpoint.
    - [x] Display audit logs in a data table.
- [x] Task: Final UI Polish.
    - [x] Ensure consistent styling, error handling, and loading states across all views.
- [ ] Task: Conductor - User Manual Verification 'History View and Final Polish' (Protocol in workflow.md)
