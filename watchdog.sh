#!/bin/bash
# watchdog.sh - keeps Next.js alive
cd /home/z/my-project
while true; do
  if ! ss -tlnp | grep -q ':3000 '; then
    echo "$(date) - Server dead, starting..." >> /tmp/watchdog.log
    node k.js >> /tmp/next-server.log 2>&1 &
  fi
  sleep 5
done
