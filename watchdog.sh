#!/bin/bash
cd /home/z/my-project

while true; do
  if ! curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q "200\|307\|404"; then
    echo "[$(date)] Server down, restarting..."
    fuser -k 3000/tcp 2>/dev/null
    sleep 2
    npx next start -p 3000 -H 0.0.0.0 > /tmp/nextserver.log 2>&1 &
    sleep 6
    echo "[$(date)] Server restarted"
  fi
  sleep 8
done
