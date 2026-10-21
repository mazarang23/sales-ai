#!/bin/sh

set -e

echo "======================================"
echo "Starting database synchronization..."
echo "======================================"

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set."
  exit 1
fi

echo "DATABASE_URL is configured."

node ./node_modules/prisma/build/index.js db push --accept-data-loss

echo "======================================"
echo "Database synchronization completed."
echo "Starting Next.js..."
echo "======================================"

exec node server.js