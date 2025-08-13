# 🐳 Docker 배포 가이드

## 🚀 빠른 시작

### 1. 저장소 클론
```bash
git clone https://github.com/woairi/hanja-learning-app.git
cd hanja-learning-app
```

### 2. Docker로 실행
```bash
# 자동 배포 스크립트 실행
./deploy.sh

# 또는 수동 실행
docker-compose up -d
```

### 3. 접속
- **프론트엔드**: http://localhost
- **백엔드 API**: http://localhost:8001

## 📋 사전 요구사항

- Docker
- Docker Compose

## 🛠 수동 배포

### 빌드
```bash
docker-compose build
```

### 실행
```bash
docker-compose up -d
```

### 중지
```bash
docker-compose down
```

### 로그 확인
```bash
docker-compose logs -f
```

## 🔧 환경 설정

### 포트 변경
`docker-compose.yml`에서 포트 수정:
```yaml
ports:
  - "8080:80"  # 프론트엔드 포트 변경
  - "8002:8001"  # 백엔드 포트 변경
```

### 데이터 파일 업데이트
- `hanja.csv`: 한자 데이터
- `hanjaword.csv`: 한자어 데이터

파일 수정 후 컨테이너 재시작:
```bash
docker-compose restart backend
```

## 🐛 문제 해결

### 컨테이너 상태 확인
```bash
docker-compose ps
```

### 로그 확인
```bash
# 전체 로그
docker-compose logs

# 특정 서비스 로그
docker-compose logs backend
docker-compose logs frontend
```

### 컨테이너 재시작
```bash
docker-compose restart
```

### 완전 재배포
```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```