#!/bin/bash
cd /home/z/my-project
while true; do
  if ! curl -s -o /dev/null -w "" http://127.0.0.1:3000/ 2>/dev/null; then
    echo "[$(date)] Server not responding, starting..."
    nohup node server.js > /home/z/my-project/server.log 2>&1 &
    sleep 5
    echo "[$(date)] Server started with PID $!"
  fi
  sleep 15
done
