
#!/bin/sh

set -e

echo "======================================"
echo "Starting Sales AI..."
echo "======================================"

if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set."
  exit 1
fi

echo "DATABASE_URL is configured."

echo "Synchronizing Prisma database schema..."

./node_modules/.bin/prisma db push --accept-data-loss

echo "Database synchronization completed."

echo "Starting Next.js..."

exec node server.js
