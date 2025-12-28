from fastapi import FastAPI
from app.api import ingest, diagnose

app = FastAPI()

app.include_router(ingest.router, prefix="/api/ingest")
app.include_router(diagnose.router, prefix="/api/diagnose")

@app.get("/")
def read_root():
    return {"message": "Medical Diagnostic Agent API"}
