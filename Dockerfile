FROM node:22-bookworm-slim AS node-runtime

FROM node:22-bookworm-slim AS web-builder
WORKDIR /app

COPY web/package.json web/package-lock.json ./
RUN npm ci

COPY web/ ./
RUN npm run build

FROM python:3.12-slim AS backend-deps
WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim AS app
WORKDIR /srv

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1 \
    PYTHONPATH=/srv/backend \
    HOME=/home/appuser \
    PORT=3000 \
    HOSTNAME=127.0.0.1

RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    curl \
    libpq5 \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -u 1000 appuser \
    && mkdir -p /run/nginx /var/log/supervisor /srv/backend /srv/web

COPY --from=node-runtime /usr/local/bin/node /usr/local/bin/node
COPY --from=backend-deps /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=backend-deps /usr/local/bin /usr/local/bin

COPY backend/ /srv/backend/
COPY --from=web-builder /app/web/.next/standalone/app/ /srv/web/
COPY --from=web-builder /app/web/.next/static /srv/web/.next/static
COPY --from=web-builder /app/web/public /srv/web/public
COPY infra/nginx/nginx.single.conf /etc/nginx/nginx.conf
COPY infra/supervisor/supervisord.single.conf /etc/supervisor/conf.d/supervisord.conf
COPY infra/docker/entrypoint.single.sh /usr/local/bin/entrypoint-single.sh

RUN chmod +x /usr/local/bin/entrypoint-single.sh \
    && chown -R appuser:appuser /srv/backend /srv/web /var/log/supervisor

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
    CMD curl -f http://localhost/health || exit 1

ENTRYPOINT ["entrypoint-single.sh"]
