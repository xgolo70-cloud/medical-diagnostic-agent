# Medical Diagnostic Agent Full Revamp Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul the existing Medical Diagnostic Agent to feature a clean Tailwind/Shadcn UI, FastAPI Async optimization, Multimodal inputs (PDF+Images), and Streaming AI responses.

**Architecture:** We are keeping the core stack (FastAPI, React, Postgres, Docker). We will refactor the Python backend to fully embrace `async/await` patterns for performance and use Server-Sent Events (SSE) for streaming Gemini AI outputs. The React frontend will migrate from custom "Cosmic Glass" CSS to a clean `TailwindCSS` + `Shadcn UI` component library setup.

**Tech Stack:**
- Frontend: React (Vite), TypeScript, TailwindCSS, Shadcn UI, Recharts (for Analytics).
- Backend: FastAPI, SQLAlchemy, PostgreSQL, Google Gemini API.

---

## Chunk 1: Frontend UI/UX Overhaul Foundation

### Task 1: Setup TailwindCSS & Shadcn UI in React Frontend
**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/vite.config.ts` (if path aliases needed)
- Create: `frontend/components.json` (Shadcn config)
- Create/Modify: `frontend/tailwind.config.js`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Install TailwindCSS dependencies**
Run: `cd frontend && npm install -D tailwindcss postcss autoprefixer && npx tailwindcss init -p`

- [ ] **Step 2: Configure paths in `tsconfig.app.json` for Shadcn**
Add `"baseUrl": ".", "paths": { "@/*": ["./src/*"] }` to `compilerOptions`. Update `vite.config.ts` to use `vite-tsconfig-paths` or resolve aliases manually.

- [ ] **Step 3: Initialize Shadcn UI**
Run: `cd frontend && npx shadcn-ui@latest init`
(Configure for neutral styling, CSS variables: true)

- [ ] **Step 4: Commit**
```bash
git add frontend/
git commit -m "chore(ui): setup TailwindCSS and Shadcn UI foundation"
```

### Task 2: Migrate App Layout to Shadcn
**Files:**
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/components/layout/MainLayout.tsx`
- Remove/Deprecate: Old "Cosmic Glass" CSS imports in `App.tsx`

- [ ] **Step 1: Install base Shadcn components (Button, Card, Layout elements)**
Run: `cd frontend && npx shadcn-ui@latest add button card`

- [ ] **Step 2: Create MainLayout component**
Create a clean shell (Sidebar/Header) using standard Tailwind classes (no cosmic glass).
```tsx
export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <main className="flex-1 p-6">{children}</main>
    </div>
  )
}
```

- [ ] **Step 3: Apply to App.tsx**
Wrap routing in `MainLayout`. Remove global imports of legacy CSS if it conflicts.

- [ ] **Step 4: Commit**
```bash
git add frontend/src/
git commit -m "feat(ui): implement base MainLayout with Shadcn styling"
```

## Chunk 2: Backend Architecture (Async & Streaming)

### Task 3: Refactor Engine to Async
**Files:**
- Modify: `backend/app/core/engine/diagnosis.py`
- Modify: `backend/app/api/diagnose.py`
- Modify: `backend/tests/test_diagnosis_engine.py`

- [ ] **Step 1: Update Test to expect Async**
Modify `test_diagnosis_engine.py` to use `pytest.mark.asyncio` and await the `generate_diagnosis` call. Verify it fails.

- [ ] **Step 2: Refactor `DiagnosisEngine`**
Convert `generate_diagnosis` to `async def`. If using `google.generativeai`, use the `generate_content_async` method.
```python
async def generate_diagnosis(self, patient_data: PatientData, ...) -> dict:
    # Async implementation
```

- [ ] **Step 3: Update FastAPI Router**
In `backend/app/api/diagnose.py`, ensure the route handler is `async def` and awaits the engine call.

- [ ] **Step 4: Run Tests**
Run: `cd backend && pytest tests/test_diagnosis_engine.py -v`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add backend/
git commit -m "refactor(engine): convert diagnosis generation to fully async"
```

### Task 4: Implement Streaming Responses (SSE)
**Files:**
- Modify: `backend/app/core/engine/diagnosis.py`
- Modify: `backend/app/api/diagnose.py`

- [ ] **Step 1: Create Async Generator in Engine**
Add `async def stream_diagnosis` yielding chunks of text from Gemini's `generate_content_async(stream=True)`.

- [ ] **Step 2: Create Streaming Endpoint**
In `api/diagnose.py`, add a new route `/api/diagnose/stream` returning `StreamingResponse(engine.stream_diagnosis(...), media_type="text/event-stream")`.

- [ ] **Step 3: Test Endpoint**
Create a quick integration test or use curl to verify SSE chunks are emitted.

- [ ] **Step 4: Commit**
```bash
git add backend/
git commit -m "feat(api): add Server-Sent Events (SSE) endpoint for streaming AI diagnosis"
```

## Chunk 3: Multimodal & Integration

### Task 5: PDF Parsing Support in Backend
**Files:**
- Create: `backend/app/core/ingestion/pdf_parser.py`
- Modify: `backend/app/api/ingest.py`
- Create: `backend/tests/test_pdf_parser.py`

- [ ] **Step 1: Write PDF Test**
Create `test_pdf_parser.py` with a dummy PDF buffer, asserting text extraction.

- [ ] **Step 2: Install PyPDF2 or PyMuPDF**
Add `PyMuPDF` (fitz) to `backend/requirements.txt`.

- [ ] **Step 3: Implement Parser**
Write `extract_text_from_pdf(file_bytes)` returning concatenated text.

- [ ] **Step 4: Update Ingestion API**
Modify `/api/ingest` to handle `application/pdf` mime types, calling the parser and appending it to the `lab_results` or clinical notes context.

- [ ] **Step 5: Commit**
```bash
git add backend/
git commit -m "feat(ingest): support PDF text extraction for multimodal diagnostic context"
```

### Task 6: Frontend Streaming & PDF Integration
**Files:**
- Modify: `frontend/src/pages/Diagnose.tsx` (or equivalent)
- Modify: `frontend/src/services/api.ts`

- [ ] **Step 1: Update API Client**
Add a function to handle EventSource/SSE connections to `/api/diagnose/stream`.

- [ ] **Step 2: Update UI for Streaming & Uploads**
Refactor the Diagnose page to allow PDF uploads (using Shadcn input). Create a state `streamingDiagnosis` and append chunks dynamically as they arrive from the backend.

- [ ] **Step 3: Commit**
```bash
git add frontend/src/
git commit -m "feat(ui): integrate streaming AI responses and PDF upload support"
```

## Chunk 4: Analytics Dashboard

### Task 7: Build Advanced Analytics View
**Files:**
- Create: `frontend/src/pages/Dashboard.tsx`
- Modify: `frontend/package.json`

- [ ] **Step 1: Install Recharts**
Run: `cd frontend && npm install recharts`

- [ ] **Step 2: Create Dashboard Components**
Build charts (e.g., `BarChart` for cases per day, `PieChart` for severity distribution) using mock data first, housed within Shadcn `<Card>` components.

- [ ] **Step 3: Wire to Backend Stats**
(Assuming `/api/dashboard` exists, update it to return aggregations). Fetch data in `Dashboard.tsx` and populate charts.

- [ ] **Step 4: Commit**
```bash
git add frontend/
git commit -m "feat(ui): implement advanced analytics dashboard using Recharts and Shadcn"
```