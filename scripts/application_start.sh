#!/bin/bash
set -euxo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo ".env 파일이 없습니다."
  exit 1
fi

APP_IMAGE="$(grep '^APP_IMAGE=' .env | cut -d= -f2-)"
SERVICE_PORT="$(grep '^SERVICE_PORT=' .env | cut -d= -f2-)"

if [ -z "$APP_IMAGE" ]; then
  echo "APP_IMAGE 값이 없습니다."
  exit 1
fi

if [ -z "$SERVICE_PORT" ]; then
  echo "SERVICE_PORT 값이 없습니다."
  exit 1
fi

mkdir -p /opt/be-app/logs

if ! docker network inspect app-net >/dev/null 2>&1; then
  echo "Docker network 'app-net' 이 존재하지 않습니다."
  exit 1
fi

# 기존 컨테이너 정리
sudo docker rm -f fe-app || true

# 컨테이너 실행
sudo docker run -d \
  --name fe-app \
  --network app-net \
  -p "${PORT}:${PORT}" \
  -e PORT="${PORT}" \
  --env-file .env \
  -e NODE_ENV=production \
  -e HOSTNAME=0.0.0.0 \
  --restart unless-stopped \
  "$APP_IMAGE"

# 기동 여유
sleep 10
