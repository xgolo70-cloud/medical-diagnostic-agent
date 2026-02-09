# Track Plan: Full Stack Integration & Polish

## Phase 1: Authentication Core (Real JWT)
- [x] Task: Backend - Implement JWT Utilities. [commit: ad268a8]
    - [ ] Create `backend/app/core/security.py` with password hashing (bcrypt) and JWT token generation (PyJWT).
    - [ ] Define `Token` and `TokenData` schemas.
- [x] Task: Backend - Create Login Endpoint. [commit: 3b3d0b5]
    - [ ] Implement `POST /api/auth/token` (OAuth2PasswordRequestForm).
    - [ ] Validate against hardcoded users (Admin, GP, Specialist).
- [ ] Task: Backend - Implement Auth Dependency.
    - [ ] Create `get_current_user` dependency to validate JWT header.
    - [ ] Protect `POST /api/diagnose` and `POST /api/ingest` with this dependency.
- [ ] Task: Frontend - Refactor Auth Slice.
    - [ ] Update `authSlice.ts` to use `createAsyncThunk` for the real login API.
    - [ ] Implement local storage persistence for tokens.
- [ ] Task: Frontend - Wire up Login Page.
    - [ ] Connect `LoginForm.tsx` to the new async thunk.
    - [ ] Handle loading and error states (401 Unauthorized).
- [ ] Task: Conductor - User Manual Verification 'Authentication Core' (Protocol in workflow.md)

## Phase 2: Health & Profiles
- [ ] Task: Backend - Implement Health Check.
    - [ ] Create `GET /api/health` returning system status (AI service reachability).
- [ ] Task: Backend - Implement User Profile Endpoint.
    - [ ] Create `GET /api/users/me` to return current user details.
- [ ] Task: Frontend - Implement Health Indicator.
    - [ ] Add a polling component (React Query) in `Sidebar` to check `/health`.
    - [ ] Display visual status (Green/Red dot).
- [ ] Task: Frontend - Update Settings Page.
    - [ ] Fetch and display user profile data (Name, Role) from `/api/users/me`.
- [ ] Task: Conductor - User Manual Verification 'Health & Profiles' (Protocol in workflow.md)

## Phase 3: Diagnosis Flow & Validation Polish
- [ ] Task: Backend/Frontend - Type Safety Audit.
    - [ ] Verify `PatientData` schema matches Frontend types.
    - [ ] Ensure `DiagnosisResult` schema matches Frontend types.
- [ ] Task: Frontend - Enhanced Error Handling.
    - [ ] Update `DiagnosisForm.tsx` to display field-level errors from 422 responses.
- [ ] Task: E2E - Verify Diagnosis Flows.
    - [ ] Test Manual Entry with valid/invalid data (Verify JWT is sent).
    - [ ] Test Unified Upload with valid/invalid file (Verify JWT is sent).
- [ ] Task: Conductor - User Manual Verification 'Diagnosis Flow & Validation Polish' (Protocol in workflow.md)

## Phase 4: History Optimization
- [ ] Task: Backend - Optimize Audit Log Reading.
    - [ ] Refactor `get_audit_logs` to use efficient reverse reading (avoid loading full file).
- [ ] Task: Frontend - Verify History & Export.
    - [ ] Confirm History table filtering works with real backend data.
    - [ ] Verify CSV/JSON export matches the displayed data.
- [ ] Task: Conductor - User Manual Verification 'History Optimization' (Protocol in workflow.md)
