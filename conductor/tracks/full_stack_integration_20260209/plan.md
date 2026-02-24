# Track Plan: Full Stack Integration & Polish

## Phase 1: Authentication Core (Real JWT)
- [x] Task: Backend - Implement JWT Utilities. [commit: ad268a8]
    - [ ] Create `backend/app/core/security.py` with password hashing (bcrypt) and JWT token generation (PyJWT).
    - [ ] Define `Token` and `TokenData` schemas.
- [x] Task: Backend - Create Login Endpoint. [commit: 3b3d0b5]
    - [ ] Implement `POST /api/auth/token` (OAuth2PasswordRequestForm).
    - [ ] Validate against hardcoded users (Admin, GP, Specialist).
- [x] Task: Backend - Implement Auth Dependency. [commit: d559d10]
    - [ ] Create `get_current_user` dependency to validate JWT header.
    - [ ] Protect `POST /api/diagnose` and `POST /api/ingest` with this dependency.
- [x] Task: Frontend - Refactor Auth Slice.
    - [x] Update `authSlice.ts` to use `createAsyncThunk` for the real login API.
    - [x] Implement local storage persistence for tokens.
- [x] Task: Frontend - Wire up Login Page.
    - [x] Connect `LoginForm.tsx` to the new async thunk.
    - [x] Handle loading and error states (401 Unauthorized).
- [ ] Task: Conductor - User Manual Verification 'Authentication Core' (Protocol in workflow.md)

## Phase 2: Health & Profiles
- [x] Task: Backend - Implement Health Check Endpoint. [commit: b1b7377]
    - [x] Create `GET /api/health` returning system status (AI service reachability).
- [x] Task: Backend - Implement User Profile Endpoint. [commit: 43c7aca]
    - [x] Create `GET /api/users/me` to return current user details.
- [x] Task: Frontend - Implement Health Indicator.
    - [x] Add a polling component (React Query) in `Sidebar` to check `/health`.
    - [x] Display visual status (Green/Red dot).
- [x] Task: Frontend - Update Settings Page.
    - [x] Fetch and display user profile data (Name, Role) from `/api/users/me`.
- [ ] Task: Conductor - User Manual Verification 'Health & Profiles' (Protocol in workflow.md)

## Phase 3: Diagnosis Flow & Validation Polish
- [x] Task: Backend/Frontend - Type Safety Audit.
    - [x] Verify `PatientData` schema matches Frontend types.
    - [x] Ensure `DiagnosisResult` schema matches Frontend types.
- [x] Task: Frontend - Enhanced Error Handling.
    - [x] Update `DiagnosisForm.tsx` to display field-level errors from 422 responses.
- [ ] Task: E2E - Verify Diagnosis Flows.
    - [ ] Test Manual Entry with valid/invalid data (Verify JWT is sent).
    - [ ] Test Unified Upload with valid/invalid file (Verify JWT is sent).
- [ ] Task: Conductor - User Manual Verification 'Diagnosis Flow & Validation Polish' (Protocol in workflow.md)

## Phase 4: History Optimization
- [x] Task: Backend - Optimize Audit Log Reading.
    - [x] Refactor `get_audit_logs` to use efficient reverse reading (avoid loading full file).
- [ ] Task: Frontend - Verify History & Export.
    - [ ] Confirm History table filtering works with real backend data.
    - [ ] Verify CSV/JSON export matches the displayed data.
- [ ] Task: Conductor - User Manual Verification 'History Optimization' (Protocol in workflow.md)
