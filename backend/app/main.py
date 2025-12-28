from fastapi import FastAPI
from app.api import ingest

app = FastAPI()

app.include_router(ingest.router, prefix="/api/ingest")

@app.get("/")
def read_root():
    return {"message": "Medical Diagnostic Agent API"}
