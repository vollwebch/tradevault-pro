#!/bin/bash
cd /home/z/my-project

while true; do
  # Check if server is running
  if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard 2>/dev/null | grep -q "200"; then
    echo "[$(date)] Server not responding, starting..."
    # Kill any leftover processes
    fuser -k 3000/tcp 2>/dev/null
    sleep 2
    # Start server
    npx next start -p 3000 -H 0.0.0.0 &
    sleep 5
    echo "[$(date)] Server started"
  fi
  sleep 10
done
