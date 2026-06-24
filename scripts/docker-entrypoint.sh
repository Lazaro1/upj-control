#!/bin/sh
set -e

cd /app

if [ -n "${DATABASE_URL}" ] && [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "Running database migrations..."
  PATH="/prisma-cli/node_modules/.bin:$PATH" prisma migrate deploy
fi

exec "$@"
