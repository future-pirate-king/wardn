#!/bin/sh
set -e

echo "[wardn-server] Starting entrypoint..."

# Wait for Postgres
if [ -n "$POSTGRES_URL" ]; then
    echo "[wardn-server] Waiting for Postgres at $POSTGRES_URL..."
    until nc -z postgres 5432 2>/dev/null; do
        echo "[wardn-server] Postgres not ready, retrying in 2s..."
        sleep 2
    done
    echo "[wardn-server] Postgres is ready."
fi

# Wait for Redis
if [ -n "$REDIS_URL" ]; then
    echo "[wardn-server] Waiting for Redis at $REDIS_URL..."
    until nc -z redis 6379 2>/dev/null; do
        echo "[wardn-server] Redis not ready, retrying in 2s..."
        sleep 2
    done
    echo "[wardn-server] Redis is ready."
fi

# Run the server
echo "[wardn-server] Starting server on ${HTTP_ADDR:-:8080}..."
exec wardn-server
