FROM python:3.11-slim

# Install LibreOffice (headless) so the CV PDF endpoint can convert DOCX -> PDF.
# `--no-install-recommends` keeps the layer slim; fonts-liberation gives Arial-fallback.
USER root
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        libreoffice-core libreoffice-writer libreoffice-common \
        fonts-liberation fonts-dejavu \
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for security (Hugging Face standard)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Copy requirements and install dependencies
COPY --chown=user backend/requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy all backend files into the container
# This will put the 'app' folder at /home/user/app/app
COPY --chown=user backend/ .

# CV template lives at repo root and is loaded at runtime by
# backend/app/api/v1/cv_generator_dynamic.py — copy it into WORKDIR so
# the path-resolution fallbacks find it.
COPY --chown=user TEMPLATE_CV_EXPERT.docx ./TEMPLATE_CV_EXPERT.docx

# Copy production environment file
COPY --chown=user .env.production .env

# Hugging Face Spaces expects the app to run on port 7860.
# Added proxy headers so FastAPI preserves HTTPS when redirecting.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860", "--proxy-headers", "--forwarded-allow-ips", "*"]
