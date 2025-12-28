import fastapi
import uvicorn

def test_imports():
    assert fastapi.__version__
    assert uvicorn.__version__
