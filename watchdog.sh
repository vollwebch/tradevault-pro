#!/bin/bash
# watchdog.sh - keeps Next.js production server alive
# Usage: bash watchdog.sh
# Runs indefinitely, restarting the server if it dies.

cd /home/z/my-project

# Clear old logs on fresh start
echo "$(date) - Watchdog started" > /tmp/watchdog.log

while true; do
  if ! ss -tlnp | grep -q ':3000 '; then
    echo "$(date) - Server dead, starting..." >> /tmp/watchdog.log
    npx next start -p 3000 >> /tmp/next-server.log 2>&1 &
    # Give the server a few seconds to start
    sleep 3
    if ss -tlnp | grep -q ':3000 '; then
      echo "$(date) - Server started successfully" >> /tmp/watchdog.log
    else
      echo "$(date) - WARNING: Server failed to start" >> /tmp/watchdog.log
    fi
  fi
  sleep 5
done
