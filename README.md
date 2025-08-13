# 한자 학습 프로그램 📚

급수별 한자 학습과 문제 풀이를 제공하는 현대적인 웹 애플리케이션입니다.

## ✨ 주요 기능

### 📖 기본 학습
- **급수별 학습**: 준8급부터 4급까지 1000개 한자 데이터
- **한자 카드**: 한자, 음, 뜻을 카드 형태로 학습
- **순서 섞기**: 원래 순서 또는 무작위 순서로 학습 가능
- **선택적 가리기**: 음이나 뜻을 클릭하여 가리고 자기 테스트
- **상태 유지**: 가린 상태가 다음 한자로 넘어가도 유지

### 🎯 문제 풀이
- **객관식 문제**: 뜻과 음을 고르는 4지선다 문제
- **주관식 문제**: 한자를 보고 음과 뜻을 직접 입력하는 문제
- **한자어 독음**: 한자어를 보고 올바른 독음을 고르는 객관식 문제 (6급 이상)
- **틀린 문제 복습**: 틀린 문제만 모아서 집중 학습
- **즉시 피드백**: 선택/입력 즉시 정답/오답 표시
- **부분 점수**: 주관식에서 음 또는 뜻 중 하나만 맞아도 부분 점수 획득
- **실시간 통계**: 정답/오답 개수 실시간 표시

### 🎨 사용자 경험
- **반응형 디자인**: 모든 기기에서 최적화된 화면
- **직관적 UI**: 깔끔하고 사용하기 쉬운 인터페이스
- **한국어 폰트**: Noto Sans KR 폰트로 가독성 향상
- **시각적 피드백**: 호버 효과 및 상태 표시
- **다양한 학습 모드**: 기본 학습, 객관식, 주관식, 한자어 독음, 복습 모드 지원
- **급수별 맞춤**: 각 급수에 적합한 문제 유형 제공

## 🛠 기술 스택

### 백엔드
- **FastAPI**: 고성능 Python 웹 프레임워크
- **Pandas**: CSV 데이터 처리 및 분석
- **Uvicorn**: ASGI 서버
- **Pydantic**: 데이터 검증 및 타입 힌트

### 프론트엔드
- **React 18**: 최신 React 기능 활용
- **TypeScript**: 타입 안전성 보장
- **Vite**: 빠른 개발 서버 및 빌드 도구
- **React Router**: SPA 라우팅
- **Axios**: HTTP 클라이언트

## 🚀 설치 및 실행

### 🐳 Docker로 빠른 시작 (추천)

```bash
# 저장소 클론
git clone https://github.com/woairi/hanja-learning-app.git
cd hanja-learning-app

# Docker로 실행
./deploy.sh

# 접속
# 프론트엔드: http://localhost:7780
# 백엔드 API: http://localhost:7781
```

### 수동 설치

#### 사전 요구사항
- Python 3.8+
- Node.js 16+
- npm 또는 yarn

#### 백엔드 실행

```bash
cd backend
pip install -r requirements.txt
python main.py
```

백엔드 서버가 http://localhost:7781 에서 실행됩니다.

#### 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
```

프론트엔드가 http://localhost:5173 에서 실행됩니다.

#### Docker 배포

```bash
# 원클릭 배포
./deploy.sh

# 또는 수동 배포
docker compose build
docker compose up -d
```

- **프론트엔드**: http://localhost:7780
- **백엔드 API**: http://localhost:7781

## 📁 프로젝트 구조

```
hanja-learning-app/
├── backend/
│   ├── main.py              # FastAPI 메인 애플리케이션
│   ├── requirements.txt     # Python 의존성
│   └── Dockerfile           # 백엔드 Docker 설정
├── frontend/
│   ├── src/
│   │   ├── components/      # React 컴포넌트
│   │   ├── pages/          # 페이지 컴포넌트
│   │   ├── types/          # TypeScript 타입 정의
│   │   ├── utils/          # 유틸리티 함수
│   │   ├── App.tsx         # 메인 App 컴포넌트
│   │   └── App.css         # 전역 스타일
│   ├── Dockerfile           # 프론트엔드 Docker 설정
│   ├── nginx.conf           # Nginx 설정
│   └── package.json        # Node.js 의존성
├── docker-compose.yml      # Docker Compose 설정
├── deploy.sh               # 배포 스크립트
├── hanja.csv               # 한자 데이터 (1000개)
├── hanjaword.csv           # 한자어 데이터 (313개)
└── README.md               # 프로젝트 문서
```

## 🔌 API 엔드포인트

| 메서드 | 엔드포인트 | 설명 |
|--------|------------|------|
| GET | `/api/grades` | 급수 목록 조회 |
| GET | `/api/hanja/{grade}` | 급수별 한자 목록 조회 |
| POST | `/api/questions/multiple-choice/{grade}` | 객관식 문제 생성 |
| POST | `/api/questions/subjective/{grade}` | 주관식 문제 생성 |
| POST | `/api/questions/hanja-word/{grade}` | 한자어 독음 문제 생성 |
| POST | `/api/check-answer` | 주관식 답안 채점 |

## 📖 사용법

### 1. 급수 선택
홈페이지에서 학습할 급수 선택 (준8급 ~ 4급)

### 2. 학습 모드
- **기본 학습**: 한자 카드로 차근차근 학습
- **객관식 문제**: 4지선다 문제 풀이
- **주관식 문제**: 직접 입력하여 학습
- **한자어 독음**: 한자어 독음 문제 (6급 이상)
- **틀린 문제 복습**: 약한 부분 집중 학습

### 3. 특징
- **즉시 피드백**: 선택/입력 즉시 정답 여부 확인
- **부분 점수**: 주관식에서 부분 정답도 인정
- **오타 허용**: 유사도 검사로 오타 허용
- **진도 저장**: 학습 진도 자동 저장
- **통계 제공**: 학습 성과 시각화

## 🎨 디자인 특징

- **모던 UI**: 깔끔하고 직관적인 사용자 인터페이스
- **반응형**: 데스크톱, 태블릿, 모바일 모든 기기 지원
- **한국어 최적화**: Noto Sans KR 폰트 사용
- **안정성**: React Hook 규칙 준수로 안정적인 렌더링

## 📊 데이터

- **한자 데이터**: 1000개 한자 (준8급~4급)
- **한자어 데이터**: 313개 한자어 (6급~5급)
- **CSV 형식**: 쉽게 편집 및 확장 가능

## 🤝 기여하기

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/새기능`)
3. 변경사항 커밋 (`git commit -am '새 기능 추가'`)
4. 브랜치 푸시 (`git push origin feature/새기능`)
5. Pull Request 생성

## 📄 라이선스

MIT 라이선스 하에 배포됩니다.