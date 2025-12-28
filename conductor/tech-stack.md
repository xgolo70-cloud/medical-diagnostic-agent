# Tech Stack

## Backend & AI Core
- **Primary Language:** Python 3.11+
- **API Framework:** FastAPI
- **AI Models:** Gemini 2.0 Flash (Reasoning & NLP), Med-PaLM (Clinical Specialization)
- **AI SDK:** google-generativeai
- **Medical NLP:** Spark NLP for Healthcare, MedSPACY (Entity Extraction & Relation Mapping)
- **Document Parsing:** pypdf (PDF Text Extraction)
- **Ontology Mapping:** Neo4j (Graph database for SNOMED CT and ICD-10 knowledge representation)

## Data & Infrastructure
- **Cloud Provider:** Google Cloud Platform (GCP)
- **Healthcare Data:** GCP Healthcare API (FHIR, HL7 v2, DICOM support)
- **Primary Database:** Cloud SQL (PostgreSQL) with Binary Authorization and BAA
- **Vector Search:** Pinecone (For RAG-based medical literature retrieval)
- **Security:** Cloud IAM, Secret Manager, Cloud KMS (Encryption at rest/transit)

## Frontend (Clinical Dashboard)
- **Framework:** React 18+
- **Styling:** Tailwind CSS (Layout), Material UI (Component Library & Theme)
- **State Management:** React Query (Data fetching), Redux Toolkit (UI state)

## MLOps & Quality Assurance
- **Experiment Tracking:** Weights & Biases (W&B)
- **Containerization:** Docker & Google Kubernetes Engine (GKE)
- **Testing:** Pytest (Unit/Integration), Playwright (E2E)
- **CI/CD:** GitHub Actions with Automated Accuracy Benchmarking
