#!/bin/bash
cd /home/z/my-project
while true; do
  if ! ss -tlnp | grep -q ":3000 " 2>/dev/null; then
    echo "$(date) Restarting..." >> /tmp/wd.log
    npx next start -p 3000 >> /tmp/next-server.log 2>&1 &
  fi
  sleep 3
done
