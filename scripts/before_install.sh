#!/bin/bash
set -euxo pipefail

if command -v docker >/dev/null 2>&1; then
  RUNNING_IDS="$(docker ps -q --filter "name=fe-app")"
  if [ -n "$RUNNING_IDS" ]; then
    echo "[before_install] stopping containers: $RUNNING_IDS"
    docker stop --time 20 $RUNNING_IDS || true
  else
    echo "[before_install] no running containers matching name='fe-app'"
  fi
else
  echo "[before_install] docker not found; skip stop step"
fi

sudo mkdir -p /opt/fe-app
sudo chown -R ubuntu:ubuntu /opt/fe-app
