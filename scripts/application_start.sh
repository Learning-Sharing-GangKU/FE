#!/bin/bash
set -euo pipefail

cd /opt/next-fe

# nohup으로 백그라운드 실행 (로그는 app.log)
nohup node .next/standalone/server.js \
  --port 3000 \
  > /opt/next-fe/app.log 2>&1 &
