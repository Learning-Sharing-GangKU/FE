#!/bin/bash
set -euo pipefail

# Node.js 20 설치 (최초 1회만 실행됨)
if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi

# 이전 실행 중인 앱 종료
pkill -f "node .next/standalone/server.js" || true

# 배포 디렉토리 생성
sudo mkdir -p /opt/next-fe
sudo chown -R ubuntu:ubuntu /opt/next-fe
