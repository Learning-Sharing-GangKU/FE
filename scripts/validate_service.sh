#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

PORT="$(grep '^SERVICE_PORT=' .env | cut -d= -f2)"

for i in {1..30}; do
  code=$(curl -s -o resp.txt -w "%{http_code}" "http://127.0.0.1:${PORT}/api/health" || true)
  echo "[validate] try $i, code=$code body=$(cat resp.txt || true)"
  if [[ "$code" == "200" ]]; then
    echo "healthy"
    exit 0
  fi
  sleep 2
done

echo "health check failed"
exit 1
