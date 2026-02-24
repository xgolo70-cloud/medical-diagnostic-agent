#!/bin/bash
set -e

echo "Running database initialization..."
# You can add Alembic migration commands here in the future
# e.g., alembic upgrade head
python -c "from app.database.init_db import init_database; init_database()"

echo "Starting backend server via Gunicorn..."
exec gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --access-logfile - \
    --error-logfile - \
    --timeout 120
