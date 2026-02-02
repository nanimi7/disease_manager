# Disease Manager

만성질환 환자가 증상 발생을 기록하고, AI 분석을 통해 패턴을 파악하여 의료진과 공유할 수 있는 웹 서비스

## 프로젝트 개요

Disease Manager는 만성 두통, 편두통 등 반복적인 증상을 겪는 환자들이 증상을 체계적으로 기록하고 관리할 수 있도록 돕는 웹 애플리케이션입니다.

### 주요 기능

#### Phase 1 (완료) ✅
- **회원 관리**: Firebase Authentication을 통한 안전한 회원가입/로그인
- **사용자 정보 관리**: 닉네임, 나이, 보유 질병 정보 관리
- **질병 관리**: 질병 추가, 수정, 삭제 및 처방 약물 정보 관리
- **증상 기록**: 캘린더 기반 증상 기록
  - 발생 날짜 선택
  - 통증 강도 (1-10 척도)
  - 약물 복용 여부
  - 상세 사유 (1,000자 제한)
- **기본 통계**: 증상 발생 빈도, 평균 통증 강도, 약물 복용률 등

#### Phase 2 (부분 완료) 🚧
- ✅ **데이터 시각화**: Recharts를 활용한 그래프 및 차트
  - 통증 강도 추이 차트 (라인 차트)
  - 요일별 발생 빈도 차트 (바 차트)
  - 약물 복용 현황 차트 (파이 차트)
- ✅ **반응형 디자인**: 모바일 및 태블릿 최적화
- ✅ **커스텀 캘린더 스타일**: 향상된 UI/UX
- 📝 **Claude API 연동 가이드**: 준비 완료 (CLAUDE_API_SETUP.md)
- ⏳ **AI 요약 분석**: Claude API 연동 대기 중
  - 주요 발생 패턴 분석
  - 예상 트리거 분석
  - 환자 참고 정보 제공
  - 의료진 전달 권장 내용

#### Phase 3 (예정) 📋
- **PDF 다운로드**: 분석 결과 다운로드 기능
- **데이터 백업/복원**: 사용자 데이터 관리
- **React Native**: 모바일 앱 전환

## 기술 스택

### Frontend
- **React 18**: UI 라이브러리
- **Vite**: 빌드 도구
- **Tailwind CSS**: 스타일링
- **react-calendar**: 캘린더 컴포넌트
- **date-fns**: 날짜 처리
- **recharts**: 데이터 시각화 차트

### Backend
- **Firebase Authentication**: 사용자 인증
- **Firebase Firestore**: NoSQL 데이터베이스
- **Firebase Hosting**: 웹 호스팅 (배포 시)

### 향후 확장
- **Claude API**: AI 분석 (Phase 2)
- **React Native**: 모바일 앱 전환 (Phase 3)

## 빠른 시작

### 사전 요구사항
- Node.js (최신 LTS 버전)
- npm 또는 yarn
- Firebase 프로젝트

### 설치 및 실행

1. **의존성 설치**
   ```bash
   npm install
   ```

2. **환경 변수 설정**
   ```bash
   cp .env.example .env
   ```

   `.env` 파일을 열고 Firebase 설정 정보 입력

3. **개발 서버 실행**
   ```bash
   npm run dev
   ```

4. **브라우저에서 확인**
   ```
   http://localhost:5173
   ```

### 빌드

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

## 프로젝트 구조

```
src/
├── components/           # UI 컴포넌트
│   ├── Login.jsx        # 로그인 컴포넌트
│   ├── Signup.jsx       # 회원가입 컴포넌트
│   ├── LoadingSpinner.jsx   # 로딩 컴포넌트
│   ├── PainLevelChart.jsx   # 통증 강도 차트
│   ├── FrequencyChart.jsx   # 발생 빈도 차트
│   └── MedicationChart.jsx  # 약물 복용 차트
├── context/             # React Context
│   └── AuthContext.jsx  # 인증 상태 관리
├── screens/             # 화면 컴포넌트
│   ├── ProfileScreen.jsx    # 사용자 정보 관리
│   ├── CalendarScreen.jsx   # 증상 캘린더
│   └── AnalysisScreen.jsx   # AI 요약 분석
├── services/            # Firebase 서비스
│   ├── firebase.js      # Firebase 초기화
│   ├── authService.js   # 인증 서비스
│   ├── diseaseService.js    # 질병 관리 서비스
│   └── symptomService.js    # 증상 기록 서비스
├── App.jsx             # 메인 App 컴포넌트
├── main.jsx            # 엔트리 포인트
├── index.css           # Tailwind CSS
└── calendar-custom.css # 캘린더 커스텀 스타일
```

## 데이터 구조

### users (사용자 정보)
```javascript
{
  userId: string,       // Firebase Auth UID
  email: string,        // 이메일
  nickname: string,     // 닉네임
  age: number,         // 나이
  createdAt: timestamp // 가입일시
}
```

### diseases (질병 정보)
```javascript
{
  diseaseId: string,    // 자동 생성 ID
  userId: string,       // 사용자 ID
  diseaseName: string,  // 질병명
  medication: string,   // 처방 약물
  createdAt: timestamp  // 등록일시
}
```

### symptomRecords (증상 기록)
```javascript
{
  recordId: string,          // 자동 생성 ID
  userId: string,           // 사용자 ID
  diseaseId: string,       // 질병 ID
  date: string,            // 발생 날짜 (YYYY-MM-DD)
  painLevel: number,       // 통증 강도 (1-10)
  medicationTaken: boolean, // 약물 복용 여부
  details: string,         // 상세 사유 (최대 1,000자)
  createdAt: timestamp,    // 등록일시
  updatedAt: timestamp     // 수정일시
}
```

## 설정 가이드

자세한 Firebase 설정 및 배포 방법은 [SETUP.md](./SETUP.md)를 참조하세요.

## 화면 구성

### 1. 로그인/회원가입
- 이메일/비밀번호 기반 인증
- 회원가입 시 닉네임, 나이 정보 수집

### 2. 사용자 정보 관리 탭
- 개인 정보 수정
- 보유 질병 추가/수정/삭제
- 처방 약물 정보 관리

### 3. 캘린더 탭
- 월간 캘린더 뷰
- 날짜별 증상 뱃지 표시
- 증상 추가/수정/삭제 모달
- 선택한 날짜의 증상 목록 표시

### 4. AI 요약 탭
- 질병 선택
- 분석 기간 선택 (1개월, 3개월, 사용자 지정)
- 기본 통계 표시
- AI 분석 결과 표시 (Phase 2)

## 보안

### Firebase Security Rules
Firestore Security Rules를 통해 사용자는 자신의 데이터만 읽고 쓸 수 있도록 제한됩니다.

### 환경 변수
Firebase API 키 등 민감한 정보는 `.env` 파일로 관리되며, Git에 커밋되지 않습니다.

## 로드맵

### Phase 1 (완료) ✅
- [x] 프로젝트 초기 설정
- [x] Firebase Authentication 연동
- [x] 사용자 정보 관리
- [x] 질병 등록/관리
- [x] 캘린더 증상 기록
- [x] 기본 통계 분석

### Phase 2 (부분 완료) 🚧
- [x] 데이터 시각화 (그래프) - Recharts
- [x] 반응형 디자인 최적화
- [ ] Claude API 연동
- [ ] AI 요약 분석 기능 구현
- [ ] PDF 다운로드 기능

### Phase 3 (향후 계획) 📋
- [ ] React Native 앱 전환
- [ ] 푸시 알림 기능
- [ ] 의료진 공유 기능
- [ ] 데이터 백업/복원
- [ ] 다국어 지원

## 배포

### 테스트 환경 (권장)
상용 배포 전에 테스트 환경에서 기능을 검증하세요.

📚 **[TEST_ENVIRONMENT.md](./TEST_ENVIRONMENT.md)** - 테스트 환경 구축 가이드

주요 단계:
1. 테스트용 Firebase 프로젝트 생성
2. Vercel Preview 배포 설정
3. 기능 테스트 체크리스트 수행
4. 버그 수정 및 검증

### 프로덕션 배포
테스트 완료 후 Vercel을 통해 배포합니다.

📚 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - 상세 배포 가이드

주요 단계:
1. GitHub 저장소에 푸시
2. Vercel에서 프로젝트 import
3. 환경 변수 설정
4. Firebase Authorized Domains 설정
5. 자동 배포 확인

### 링크
- **GitHub**: https://github.com/nanimi7/disease_manager
- **테스트 환경**: (테스트 배포 후 URL 업데이트)
- **프로덕션**: (상용 배포 후 URL 업데이트)

## 라이선스

이 프로젝트는 개인 프로젝트입니다.

## 문의

프로젝트에 대한 문의사항이 있으시면 [GitHub Issues](https://github.com/nanimi7/disease_manager/issues)에 등록해주세요.
