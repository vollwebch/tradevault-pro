#!/bin/bash
# start-and-test.sh - Start server, run all tests, leave server running

cd /home/z/my-project

# Kill any existing node processes
pkill -9 -f "next start" 2>/dev/null
pkill -9 -f "node k.js" 2>/dev/null
sleep 1

# Start server in background with nohup
echo "Starting server..."
nohup npx next start > /tmp/next-server.log 2>&1 &
SERVER_PID=$!
echo "Server PID: $SERVER_PID"

# Wait for server to be ready
for i in $(seq 1 30); do
  if curl -s --connect-timeout 1 --max-time 2 -o /dev/null -w "%{http_code}" http://localhost:3000/ 2>/dev/null | grep -q "200"; then
    echo "Server ready after ${i}s"
    break
  fi
  sleep 1
done

echo ""
echo "========================================="
echo "VERIFICATION RESULTS"
echo "========================================="

echo ""
echo "--- Test 1: GET / HTTP status ---"
CODE1=$(curl -s --connect-timeout 2 --max-time 5 -o /dev/null -w "%{http_code}" http://localhost:3000/)
echo "Result: $CODE1"

echo ""
echo "--- Test 2: GET /dashboard HTTP status ---"
CODE2=$(curl -s --connect-timeout 2 --max-time 5 -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard)
echo "Result: $CODE2"

echo ""
echo "--- Test 3: GET /dashboard/ HTTP status ---"
CODE3=$(curl -s --connect-timeout 2 --max-time 5 -o /dev/null -w "%{http_code}" http://localhost:3000/dashboard/)
echo "Result: $CODE3"

echo ""
echo "--- Test 4: /dashboard/ response headers ---"
curl -s --connect-timeout 2 --max-time 5 -D /tmp/test-headers.txt http://localhost:3000/dashboard/ -o /dev/null
head -15 /tmp/test-headers.txt

echo ""
echo "--- Test 5: Cache-Control on / ---"
curl -s --connect-timeout 2 --max-time 5 -D - http://localhost:3000/ -o /dev/null | rg -i "cache-control"

echo ""
echo "--- Test 6: Cache-Control on /dashboard ---"
curl -s --connect-timeout 2 --max-time 5 -D - http://localhost:3000/dashboard -o /dev/null | rg -i "cache-control"

echo ""
echo "--- Test 7: Old chunk (25c4af278dde8062) check on / ---"
if curl -s --connect-timeout 2 --max-time 5 http://localhost:3000/ | rg -q "25c4af278dde8062"; then
  echo "FAIL: Old chunk reference still present!"
else
  echo "PASS: No stale chunk references"
fi

echo ""
echo "--- Test 8: Static chunk accessibility ---"
PASS=0
FAIL=0
for f in $(ls /home/z/my-project/.next/static/chunks/*.js 2>/dev/null); do
  n=$(basename $f)
  c=$(curl -s --connect-timeout 2 --max-time 5 -o /dev/null -w "%{http_code}" "http://localhost:3000/_next/static/chunks/$n")
  if [ "$c" = "200" ]; then
    echo "  $n -> $c OK"
    PASS=$((PASS + 1))
  else
    echo "  $n -> $c FAIL"
    FAIL=$((FAIL + 1))
  fi
done
for f in $(ls /home/z/my-project/.next/static/chunks/*.css 2>/dev/null); do
  n=$(basename $f)
  c=$(curl -s --connect-timeout 2 --max-time 5 -o /dev/null -w "%{http_code}" "http://localhost:3000/_next/static/chunks/$n")
  if [ "$c" = "200" ]; then
    echo "  $n -> $c OK"
    PASS=$((PASS + 1))
  else
    echo "  $n -> $c FAIL"
    FAIL=$((FAIL + 1))
  fi
done
echo "Static assets: $PASS passed, $FAIL failed"

echo ""
echo "--- Test 9: HTML content on / (first 10 lines) ---"
curl -s --connect-timeout 2 --max-time 5 http://localhost:3000/ | head -10

echo ""
echo "--- Test 10: HTML content on /dashboard (first 10 lines) ---"
curl -s --connect-timeout 2 --max-time 5 http://localhost:3000/dashboard | head -10

echo ""
echo "--- Test 11: Server still alive ---"
if ss -tlnp | grep -q ":3000 "; then
  echo "PASS: Server listening on port 3000"
else
  echo "FAIL: Server not listening on port 3000"
fi

echo ""
echo "========================================="
echo "SUMMARY"
echo "========================================="
echo "GET /: $CODE1"
echo "GET /dashboard: $CODE2"
echo "GET /dashboard/: $CODE3"
echo "Static assets: $PASS passed, $FAIL failed"
echo ""

# Start watchdog
pkill -f watchdog.sh 2>/dev/null
nohup bash /home/z/my-project/watchdog.sh > /tmp/watchdog-out.log 2>&1 &
echo "Watchdog started (PID: $!)"
