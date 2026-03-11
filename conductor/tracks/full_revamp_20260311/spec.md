# Medical Diagnostic Agent - Full Revamp & Enhancement Spec

## 1. Overview
A comprehensive revamp of the Medical Diagnostic Agent project to transition from a functional prototype to a robust, highly-performant, and visually polished production-ready application. The revamp focuses on architecture optimization, UI/UX modernization, and the introduction of advanced multimodal and streaming capabilities.

## 2. Selected Approaches & Scope

### 2.1 Architecture & Performance: FastAPI Async Optimization
- **Approach:** Optimize the existing FastAPI synchronous endpoints to fully utilize asynchronous programming (`async/await`).
- **Details:** 
  - Refactor `backend/app/core/engine/diagnosis.py` and related routes to be non-blocking.
  - Implement streaming responses (Server-Sent Events or WebSockets) for the Gemini API calls to reduce perceived latency.
  - Implement caching mechanisms for repeated queries or static data.

### 2.2 UI/UX: TailwindCSS + Shadcn UI (Vercel/Clean Aesthetic)
- **Approach:** Replace the existing "Cosmic Glass" CSS with a modern, clean, Vercel-inspired design using TailwindCSS and Shadcn UI components.
- **Details:**
  - Setup TailwindCSS and install necessary Shadcn UI components (Buttons, Cards, Dialogs, Forms, Data Tables).
  - Implement a consistent Light/Dark mode.
  - Redesign the diagnostic workflow to be more intuitive for medical professionals.

### 2.3 New Features (All Selected)
1.  **Multimodal Inputs (PDF + Images):** Extend the ingestion and diagnostic engine to parse and analyze PDF medical reports alongside standard imaging (X-Ray, MRI).
2.  **Advanced Analytics Dashboard:** Introduce Recharts or similar libraries to build a dashboard visualizing patient statistics, diagnosis accuracy, and system performance.
3.  **Enhanced MedASR (Audio Dictation):** Upgrade the speech-to-text implementation for better real-time medical terminology recognition and smoother integration into the UI.
4.  **Streaming Diagnostics:** Implement streaming for the AI diagnosis generation, showing results to the doctor progressively just like ChatGPT, drastically improving UX.

## 3. Implementation Phasing
1.  **Phase 1: Foundation & UI Overhaul:** Install Tailwind/Shadcn, migrate existing pages to the new design system, and establish the clean aesthetic.
2.  **Phase 2: Backend Async & Streaming:** Refactor FastAPI endpoints to `async`, integrate streaming with the Gemini model, and update the frontend to consume the stream.
3.  **Phase 3: Multimodal & MedASR:** Add PDF parsing capabilities to the backend and UI, and refine the audio dictation component.
4.  **Phase 4: Analytics & Polish:** Build the advanced dashboard, finalize testing, and ensure Docker production builds work flawlessly.

## 4. Technical Constraints
- Must remain fully containerized (Docker Compose).
- Maintain HIPAA compliance considerations (No PII logged, secure auth).
- Strictly adhere to `async` patterns in FastAPI to avoid blocking the event loop.