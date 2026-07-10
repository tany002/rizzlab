# Production image for backend/server.py (Northflank / generic container hosts).
# Uses requirements-prod.txt (requirements.txt minus Emergent-only packages).

FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Build deps for native wheels in requirements-prod.txt (e.g. jq, grpcio).
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        gcc \
        g++ \
        libjq-dev \
        ca-certificates \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

COPY requirements-prod.txt .
RUN pip install -r requirements-prod.txt

COPY server.py .

RUN useradd --create-home --shell /usr/sbin/nologin appuser \
    && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD sh -c 'python -c "import os, urllib.request; urllib.request.urlopen(\"http://127.0.0.1:\" + os.environ.get(\"PORT\", \"8000\") + \"/api/\")"'

CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8000}"]
