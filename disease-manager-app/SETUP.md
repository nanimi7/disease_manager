# Disease Manager - 설정 가이드

## 1. Firebase 프로젝트 설정

### 1.1 Firebase 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름 입력 (예: disease-manager)
4. Google Analytics 설정 (선택 사항)
5. 프로젝트 생성 완료

### 1.2 Firebase Authentication 설정
1. Firebase Console에서 프로젝트 선택
2. 좌측 메뉴에서 "Authentication" 클릭
3. "시작하기" 클릭
4. "Sign-in method" 탭 선택
5. "이메일/비밀번호" 활성화
6. 저장

### 1.3 Firestore Database 설정
1. Firebase Console에서 "Firestore Database" 클릭
2. "데이터베이스 만들기" 클릭
3. **테스트 모드**로 시작 (개발용)
4. 지역 선택 (예: asia-northeast3 - Seoul)
5. 데이터베이스 생성

### 1.4 Firestore Security Rules 설정
Firebase Console > Firestore Database > 규칙 탭에서 다음 규칙 설정:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 사용자 문서 - 본인만 읽기/쓰기 가능
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // 질병 문서 - 본인만 읽기/쓰기 가능
    match /diseases/{diseaseId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
    }

    // 증상 기록 문서 - 본인만 읽기/쓰기 가능
    match /symptomRecords/{recordId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 1.5 Firebase 설정 정보 가져오기
1. Firebase Console > 프로젝트 설정 (⚙️ 아이콘)
2. "일반" 탭 선택
3. "내 앱" 섹션에서 웹 앱 추가 (</>)
4. 앱 닉네임 입력 (예: disease-manager-web)
5. Firebase SDK 구성 정보 복사

## 2. 프로젝트 환경 변수 설정

### 2.1 .env 파일 생성
프로젝트 루트 디렉토리에 `.env` 파일 생성:

```bash
cd disease-manager-app
cp .env.example .env
```

### 2.2 .env 파일 편집
Firebase Console에서 복사한 설정 정보를 입력:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

## 3. 개발 서버 실행

### 3.1 의존성 설치 (이미 완료됨)
```bash
npm install
```

### 3.2 개발 서버 시작
```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

## 4. 빌드 및 배포

### 4.1 프로덕션 빌드
```bash
npm run build
```

### 4.2 Firebase Hosting 배포 (선택 사항)

#### Firebase CLI 설치
```bash
npm install -g firebase-tools
```

#### Firebase 로그인
```bash
firebase login
```

#### Firebase 프로젝트 초기화
```bash
firebase init hosting
```

설정 옵션:
- Public directory: `dist`
- Configure as single-page app: `Yes`
- Set up automatic builds: `No`
- Overwrite index.html: `No`

#### 배포
```bash
npm run build
firebase deploy --only hosting
```

## 5. 프로젝트 구조

```
disease-manager-app/
├── src/
│   ├── components/        # UI 컴포넌트
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── context/          # React Context
│   │   └── AuthContext.jsx
│   ├── screens/          # 화면 컴포넌트
│   │   ├── ProfileScreen.jsx
│   │   ├── CalendarScreen.jsx
│   │   └── AnalysisScreen.jsx
│   ├── services/         # Firebase 서비스
│   │   ├── firebase.js
│   │   ├── authService.js
│   │   ├── diseaseService.js
│   │   └── symptomService.js
│   ├── hooks/            # 커스텀 훅 (추후 추가)
│   ├── utils/            # 유틸리티 함수 (추후 추가)
│   ├── App.jsx           # 메인 App 컴포넌트
│   ├── main.jsx          # 엔트리 포인트
│   └── index.css         # Tailwind CSS
├── .env                  # 환경 변수 (Git 제외)
├── .env.example          # 환경 변수 예시
├── tailwind.config.js    # Tailwind 설정
├── postcss.config.js     # PostCSS 설정
└── vite.config.js        # Vite 설정
```

## 6. 주요 기능

### Phase 1 (현재 완료)
- ✅ 회원가입/로그인
- ✅ 사용자 정보 관리
- ✅ 질병 등록/수정/삭제
- ✅ 캘린더 증상 기록
- ✅ 증상 CRUD 기능
- ✅ 기본 통계 분석

### Phase 2 (예정)
- ⏳ Claude API 연동
- ⏳ AI 요약 분석 기능
- ⏳ 반응형 디자인 최적화
- ⏳ 데이터 시각화 (그래프)
- ⏳ PDF 다운로드 기능

## 7. 문제 해결

### Firebase 연결 오류
- `.env` 파일이 올바르게 설정되었는지 확인
- Firebase 프로젝트 설정이 올바른지 확인
- 브라우저 콘솔에서 에러 메시지 확인

### Firestore 권한 오류
- Security Rules가 올바르게 설정되었는지 확인
- 로그인한 사용자의 UID와 데이터의 userId가 일치하는지 확인

### Tailwind CSS가 적용되지 않음
- `npm run dev`로 개발 서버 재시작
- `tailwind.config.js`와 `postcss.config.js` 설정 확인
- `index.css`에 Tailwind directives가 있는지 확인

## 8. 개발 팁

### 로컬 테스트 계정
Firebase Authentication에서 테스트 계정 생성:
- 이메일: test@example.com
- 비밀번호: test1234

### Firestore 데이터 확인
Firebase Console > Firestore Database에서 실시간 데이터 확인 가능

### 디버깅
브라우저 개발자 도구 (F12) > Console 탭에서 에러 확인

## 9. 참고 자료

- [Firebase 문서](https://firebase.google.com/docs)
- [React 문서](https://react.dev/)
- [Tailwind CSS 문서](https://tailwindcss.com/docs)
- [Vite 문서](https://vitejs.dev/)
- [react-calendar 문서](https://github.com/wojtekmaj/react-calendar)
