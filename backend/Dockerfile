FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Run Alembic before uvicorn so DB schema matches the SQLAlchemy models on
# every container start. Migrations are guarded by inspector checks so they
# are no-ops on an already up-to-date DB (see Property 3 idempotency PBT).
# If upgrade fails, the container exits — preferred over silently serving
# traffic against a drifted schema.
CMD ["/bin/sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
