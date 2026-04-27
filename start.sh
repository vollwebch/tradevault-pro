#!/bin/bash
cd /home/z/my-project
npx next start -p 3000 -H 0.0.0.0 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Keep alive by writing to stdout
while kill -0 $SERVER_PID 2>/dev/null; do
    sleep 5
    echo "Server still running... $(date)"
done
echo "Server died at $(date)"
