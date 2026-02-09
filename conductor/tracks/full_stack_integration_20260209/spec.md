# Track Spec: Full Stack Integration & Polish

## Overview
This track aims to finalize the "Clinical Dashboard" by fully integrating the React frontend with the FastAPI backend. The primary goal is to ensure all features work cohesively, replacing mock authentication with a basic real JWT flow, polishing data consistency, and filling in missing UX gaps like health checks and validation feedback.

## User Stories
- **As a User**, I want to log in with real credentials and receive a secure session token so my access is genuinely protected.
- **As a User**, I want to see specific error messages from the backend (e.g., "Age must be less than 120") directly on the form fields so I can correct them easily.
- **As a User**, I want to know if the AI system is offline immediately via a status indicator on the dashboard.
- **As an Auditor**, I want the "History" and "Export" features to accurately reflect the actual data processed by the backend.

## Functional Requirements

### 1. Authentication (Real JWT)
- **Backend:**
    - Implement `POST /api/login` endpoint accepting `username` and `password`.
    - Validate against a hardcoded set of users (or simple file-based store).
    - Return a signed JWT (JSON Web Token) on success.
    - Implement a dependency `get_current_user` to protect sensitive routes.
- **Frontend:**
    - Update `authSlice` to call the real login endpoint.
    - Store the JWT in `localStorage` or memory.
    - Attach the JWT to the `Authorization` header in all subsequent API requests.
    - Handle 401 (Unauthorized) responses by redirecting to Login.

### 2. Diagnosis Flow & Validation
- **End-to-End Test:** Verify `Manual` and `Unified` (File Upload) diagnosis flows pass data correctly to the AI engine and return results.
- **Error Reflection:**
    - Update the Frontend `api.ts` to parse Pydantic validation errors (422 Unprocessable Entity).
    - Map these errors to React Hook Form fields to display inline messages.

### 3. History & Persistence (Optimized File-Based)
- **Backend:**
    - Optimize the `get_audit_logs` function to efficiently read the `audit.log` file (ensure stable reverse reading).
    - Ensure the `GET /api/history` endpoint respects pagination parameters.
- **Frontend:**
    - Verify the "History" page correctly displays the filtered data from the backend.
    - Ensure "Export to CSV/JSON" uses the actual data structure returned by the API.

### 4. System Health & Profile
- **Health Check:**
    - **Backend:** Add a lightweight `GET /health` endpoint that checks if the AI service is reachable.
    - **Frontend:** Add a status indicator (Green/Red dot) in the Sidebar or Header that polls this endpoint.
- **User Profile:**
    - Allow users to view their current profile details (extracted from the JWT or a `/api/me` endpoint) in the Settings page.

### 5. Type Safety
- Audit all TypeScript interfaces in `frontend/src/types/` and ensure they strictly match the Pydantic models in `backend/app/schemas/`.

## Non-Functional Requirements
- **Consistency:** Error toasts and loading spinners must be consistent across all pages.
- **Performance:** Health check polling should not degrade app performance.

## Out of Scope
- Database migration (we are sticking to file-based `audit.log` for now).
- User registration/Sign-up (we will use pre-defined users).
