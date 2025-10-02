#!/bin/bash
set -euo pipefail

# 파일 권한 정리
chown -R ubuntu:ubuntu /opt/next-fe
chmod -R 755 /opt/next-fe
