FROM python:3.11-slim

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

# Copy production environment file
COPY --chown=user .env.production .env

# Hugging Face Spaces expects the app to run on port 7860.
# Added proxy headers so FastAPI preserves HTTPS when redirecting.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860", "--proxy-headers", "--forwarded-allow-ips", "*"]
