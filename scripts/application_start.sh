#!/bin/bash
set -euxo pipefail
cd "$(dirname "$0")/.."

APP_IMAGE="$(grep '^APP_IMAGE=' .env | cut -d= -f2)"
PORT="$(grep '^SERVICE_PORT=' .env | cut -d= -f2)"

# 기존 컨테이너 정리
sudo docker rm -f fe-app || true

# 컨테이너 실행
sudo docker run -d --name fe-app \
  -p "${PORT}:${PORT}" \
  --network app-net \
  --env-file .env \
  -e NODE_ENV=production \
  -e PORT="${PORT}" \
  -e HOSTNAME=0.0.0.0 \
  --restart unless-stopped \
  "$APP_IMAGE"

# 기동 여유
sleep 10
