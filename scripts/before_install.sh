#!/bin/bash
set -euxo pipefail

# 배포 디렉토리 생성
sudo mkdir -p /opt/fe-app
sudo chown -R ubuntu:ubuntu /opt/fe-app
