# Track Spec: Clinical Dashboard Web Application (MVP)

## Overview
This track focuses on building the MVP of the Clinical Dashboard Web Application using React 18. It will serve as the primary user interface for General Practitioners and Specialists to interact with the Medical Diagnostic Agent. The application will interface with the existing FastAPI backend.

## User Stories
- **As a User**, I want to "log in" via a simulated authentication screen so I can access the secure dashboard.
- **As a GP**, I want a form to manually input patient details (age, symptoms, vitals) and receive a differential diagnosis.
- **As a Specialist**, I want to upload a patient's PDF lab report along with their details to get a comprehensive analysis.
- **As an Auditor**, I want to view a history of diagnosis requests to ensure accountability.

## Functional Requirements
### 1. Project Setup
- Initialize a React 18 project with TypeScript.
- Configure Tailwind CSS and Material UI (MUI) for styling.
- Set up React Query for API data fetching.
- Set up Redux Toolkit for global UI state (e.g., user session, theme).

### 2. Authentication (Mock)
- **Login Screen:** A clean, professional login form.
- **Logic:** Accept specific hardcoded credentials (e.g., `admin/password`) to simulate a session.
- **Protection:** Redirect unauthenticated users away from dashboard routes.

### 3. Dashboard Layout
- **Navigation:** A sidebar or top bar with links to "New Diagnosis", "History", and "Settings".
- **Responsive Design:** Ensure layout works on desktop and tablet.

### 4. Diagnosis Features
- **Manual Entry View:** A form using MUI components to capture `PatientData` fields.
- **Unified Entry View:** A file upload zone (drag & drop) for PDFs combined with the manual entry form.
- **Results View:** A structured display of the AI's response:
    - Ranked differential diagnoses with confidence bars.
    - Clinical rationale text.
    - Citations and recommended tests.

### 5. History View
- **List View:** Fetch and display a list of past actions (simulated by reading the audit log file via a new backend endpoint, or mocked if backend support is out of scope. *Note: We will add a simple read-only endpoint to the backend in this track to support this.*).

## Non-Functional Requirements
- **UX/UI:** Adhere to "Material Design" principles with a "Clinical/Clean" aesthetic.
- **Performance:** Immediate feedback on user actions (loading states).
- **Code Quality:** strictly typed TypeScript, component modularity.

## Out of Scope
- Real backend authentication/security (OAuth/JWT).
- Persistent database storage (we rely on the backend's current mock/log implementation).
- Marketing pages.
