#!/bin/bash
# .zscripts/dev.sh - Container startup script for TradeVault Pro
# This script is executed by /start.sh as user 'z' via: sudo -u z bash .zscripts/dev.sh
# It runs as a background child of tini (PID 1), so it persists for the container lifetime.

set -e

cd /home/z/my-project

echo "[DEV] Starting TradeVault Pro server..."

# 1. Install dependencies (if needed)
if [ ! -d "node_modules" ] || [ ! -d "node_modules/next" ]; then
  echo "[DEV] Installing dependencies..."
  bun install
fi

# 2. Build if .next is missing or stale
NEED_BUILD=0
if [ ! -d ".next" ] || [ ! -f ".next/BUILD_ID" ]; then
  NEED_BUILD=1
elif [ "package.json" -nt ".next/BUILD_ID" ] 2>/dev/null; then
  NEED_BUILD=1
fi

if [ "$NEED_BUILD" -eq 1 ]; then
  echo "[DEV] Building Next.js application..."
  bun run build
fi

# 3. Ensure db directory and file exist
mkdir -p /home/z/my-project/db
if [ ! -f "/home/z/my-project/db/tradevault.db" ]; then
  touch /home/z/my-project/db/tradevault.db
fi

# 4. Start the Next.js production server with auto-restart watchdog
echo "[DEV] Starting Next.js production server on port 3000..."
while true; do
  echo "[$(date)] Starting next start -p 3000..." >> /tmp/next-server.log
  npx next start -p 3000 >> /tmp/next-server.log 2>&1
  EXIT_CODE=$?
  echo "[$(date)] Next.js exited with code $EXIT_CODE, restarting in 3s..." >> /tmp/next-server.log
  sleep 3
done
