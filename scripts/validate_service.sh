#!/bin/bash
set -euo pipefail

for i in {1..30}; do
  code=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:3000/api/health || true)
  if [[ "$code" == "200" ]]; then
    echo "Next.js is running"
    exit 0
  fi
  echo "Waiting for Next.js... ($i)"
  sleep 2
done

echo "Health check failed"
exit 1
