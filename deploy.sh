#!/bin/bash

echo "🚀 한자 학습 프로그램 배포 시작..."

# Docker 이미지 빌드
echo "📦 Docker 이미지 빌드 중..."
docker compose build

# 기존 컨테이너 정리
echo "🧹 기존 컨테이너 정리 중..."
docker compose down

# 새 컨테이너 시작
echo "🔄 새 컨테이너 시작 중..."
docker compose up -d

echo "✅ 배포 완료!"
echo "🌐 프론트엔드: http://localhost"
echo "🔧 백엔드 API: http://localhost:8001"

# 컨테이너 상태 확인
echo "📊 컨테이너 상태:"
docker compose ps