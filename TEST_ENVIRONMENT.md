# 테스트 환경 설정 가이드

## 개요
상용화 전에 테스트 환경을 구축하여 안전하게 기능을 검증합니다.

## 환경 구분

### 1. Development (로컬 개발)
- 로컬 머신에서 개발
- Hot reload 지원
- 로컬 Firebase 에뮬레이터 (선택사항)

### 2. Test/Staging (Vercel Preview)
- GitHub PR 기반 자동 배포
- 테스트용 Firebase 프로젝트 연결
- 실제 환경과 동일한 설정

### 3. Production (상용)
- main 브랜치 배포
- 실제 사용자용 Firebase 프로젝트
- 커스텀 도메인 연결

---

## Phase 1: 테스트 Firebase 프로젝트 생성

### 1.1 Firebase Console에서 새 프로젝트 생성
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. "프로젝트 추가" 클릭
3. 프로젝트 이름: **disease-manager-test** 입력
4. Google Analytics: 비활성화 (테스트용)
5. 프로젝트 생성

### 1.2 Firebase Authentication 설정
1. Authentication > 시작하기
2. Sign-in method > 이메일/비밀번호 활성화
3. 저장

### 1.3 Firestore Database 생성
1. Firestore Database > 데이터베이스 만들기
2. **테스트 모드**로 시작 (개발용)
3. 지역: asia-northeast3 (Seoul)
4. 완료

### 1.4 Security Rules 설정
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 테스트 환경: 읽기 쉽게 모든 인증된 사용자 허용
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**⚠️ 주의**: 테스트 환경이므로 보안 규칙이 느슨합니다. 프로덕션에서는 더 엄격한 규칙 적용 필요.

### 1.5 Firebase 설정 정보 복사
Firebase Console > 프로젝트 설정 > 일반 > 앱 추가 (웹)
- 앱 닉네임: disease-manager-test
- Firebase SDK 구성 정보 복사

---

## Phase 2: Vercel 테스트 환경 배포

### 2.1 Vercel 프로젝트 설정

#### 옵션 A: Vercel Dashboard에서 Import
1. https://vercel.com/dashboard 접속
2. "Add New..." > "Project"
3. GitHub 저장소 선택: `nanimi7/disease_manager`
4. **Project Name**: `disease-manager-test`
5. Import

#### 옵션 B: Vercel CLI
```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 테스트 배포
vercel --name disease-manager-test
```

### 2.2 환경 변수 설정 (테스트용)

Vercel 프로젝트 설정 > Environment Variables에서 추가:

**Environment**: `Preview` 선택 (중요!)

```
VITE_FIREBASE_API_KEY=테스트_프로젝트_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=disease-manager-test.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=disease-manager-test
VITE_FIREBASE_STORAGE_BUCKET=disease-manager-test.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=테스트_SENDER_ID
VITE_FIREBASE_APP_ID=테스트_APP_ID
```

### 2.3 테스트 브랜치 생성 및 배포

```bash
# 테스트 브랜치 생성
git checkout -b test/initial-deployment

# 변경사항이 있다면 커밋
git add .
git commit -m "Test: Initial deployment setup"

# GitHub에 푸시
git push origin test/initial-deployment
```

### 2.4 GitHub에서 Pull Request 생성
1. GitHub 저장소로 이동
2. "Compare & pull request" 버튼 클릭
3. PR 제목: `[TEST] Initial deployment`
4. 설명 작성
5. **"Create pull request"** (머지하지 않음!)

### 2.5 Vercel Preview 배포 확인
- PR 생성 시 Vercel이 자동으로 Preview 배포 생성
- PR 댓글에서 Preview URL 확인
- URL 예시: `https://disease-manager-test-abc123.vercel.app`

---

## Phase 3: Firebase Authorized Domains 설정

### 3.1 Vercel Preview URL 추가
1. Firebase Console > Authentication > Settings
2. Authorized domains 섹션
3. "Add domain" 클릭
4. Vercel Preview URL 입력 (예: `disease-manager-test-abc123.vercel.app`)
5. 추가

**⚠️ 주의**: Preview URL은 배포마다 변경될 수 있으므로, 각 배포 후 확인 필요

**더 나은 방법**: Vercel에서 고정 도메인 설정
1. Vercel 프로젝트 > Settings > Domains
2. 서브도메인 추가: `test-disease-manager.vercel.app`
3. 이 도메인을 Firebase Authorized domains에 추가

---

## Phase 4: 테스트 시나리오

### 4.1 기본 기능 테스트

#### 1. 회원가입/로그인
- [ ] 회원가입 (이메일: test@example.com, 비밀번호: test1234)
- [ ] 로그인
- [ ] 로그아웃
- [ ] 다시 로그인

#### 2. 사용자 정보 관리
- [ ] 닉네임 수정
- [ ] 나이 수정
- [ ] 질병 추가 (예: 편두통)
- [ ] 처방 약물 입력
- [ ] 질병 수정
- [ ] 질병 삭제

#### 3. 증상 기록
- [ ] 캘린더에서 오늘 날짜 클릭
- [ ] 증상 등록 (질병 선택, 통증 강도 5, 약물 복용 체크)
- [ ] 상세 사유 입력
- [ ] 저장
- [ ] 캘린더에 뱃지 표시 확인
- [ ] 증상 수정
- [ ] 증상 삭제

#### 4. 데이터 시각화 및 분석
- [ ] 여러 날짜에 증상 기록 추가 (최소 5개)
- [ ] AI 요약 탭 이동
- [ ] 질병 선택
- [ ] 최근 1개월 분석 실행
- [ ] 통증 강도 차트 표시 확인
- [ ] 요일별 발생 빈도 차트 확인
- [ ] 약물 복용 현황 차트 확인
- [ ] 기본 통계 확인

#### 5. 반응형 테스트
- [ ] 데스크톱 브라우저에서 테스트
- [ ] 모바일 브라우저에서 테스트 (Chrome DevTools)
- [ ] 태블릿 뷰 테스트

### 4.2 에러 케이스 테스트

#### 인증 에러
- [ ] 잘못된 이메일/비밀번호로 로그인 시도
- [ ] 이미 존재하는 이메일로 회원가입 시도
- [ ] 비밀번호 6자 미만으로 회원가입 시도

#### 데이터 검증 에러
- [ ] 질병명 없이 증상 등록 시도
- [ ] 상세 사유 1,000자 초과 입력
- [ ] 빈 질병명으로 질병 추가 시도

#### 네트워크 에러 (선택사항)
- [ ] DevTools에서 네트워크 오프라인 설정
- [ ] 데이터 로드 실패 동작 확인

---

## Phase 5: 테스트 데이터 정리

### 5.1 Firestore 데이터 확인
1. Firebase Console > Firestore Database
2. 생성된 컬렉션 확인:
   - users
   - diseases
   - symptomRecords

### 5.2 테스트 데이터 삭제 (필요 시)
```javascript
// Firebase Console에서 직접 삭제
// 또는 테스트 계정 삭제
```

---

## Phase 6: 버그 트래킹 및 수정

### 6.1 발견된 버그 기록
GitHub Issues 생성:
- 제목: `[BUG] 버그 설명`
- 라벨: `bug`, `test-environment`
- 재현 단계 상세 작성
- 스크린샷 첨부

### 6.2 버그 수정 워크플로우
```bash
# 버그 수정 브랜치 생성
git checkout -b fix/bug-description

# 수정 작업
# ...

# 커밋 및 푸시
git add .
git commit -m "Fix: 버그 수정 내용"
git push origin fix/bug-description

# GitHub에서 PR 생성
# Vercel이 자동으로 Preview 배포 생성
# 테스트 후 메인 브랜치에 머지
```

---

## Phase 7: 상용 배포 준비

### 7.1 테스트 통과 기준
- [ ] 모든 기본 기능 정상 작동
- [ ] 에러 케이스 처리 확인
- [ ] 반응형 디자인 정상 작동
- [ ] 성능 이슈 없음
- [ ] 보안 취약점 없음

### 7.2 프로덕션 Firebase 프로젝트 생성
1. Firebase Console에서 새 프로젝트 생성
   - 프로젝트 이름: **disease-manager-prod**
2. Authentication, Firestore 설정
3. **Production Security Rules** 적용 (SETUP.md 참조)

### 7.3 프로덕션 환경 변수 설정
Vercel 프로젝트 > Environment Variables

**Environment**: `Production` 선택

```
VITE_FIREBASE_API_KEY=프로덕션_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=disease-manager-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=disease-manager-prod
VITE_FIREBASE_STORAGE_BUCKET=disease-manager-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=프로덕션_SENDER_ID
VITE_FIREBASE_APP_ID=프로덕션_APP_ID
```

### 7.4 main 브랜치에 머지
```bash
# 테스트 브랜치에서 main으로 이동
git checkout main
git pull origin main

# 테스트 브랜치 머지
git merge test/initial-deployment

# GitHub에 푸시 (프로덕션 자동 배포)
git push origin main
```

---

## 테스트 체크리스트

### 필수 테스트
- [x] Firebase 테스트 프로젝트 생성
- [ ] Vercel Preview 배포 성공
- [ ] Firebase Authorized Domains 설정
- [ ] 회원가입/로그인 테스트
- [ ] 증상 기록 기능 테스트
- [ ] 데이터 시각화 테스트
- [ ] 모바일 반응형 테스트
- [ ] 에러 처리 테스트

### 선택 테스트
- [ ] 성능 테스트 (Lighthouse)
- [ ] 크로스 브라우저 테스트
- [ ] 보안 테스트
- [ ] 접근성 테스트

---

## 테스트 환경 URL

### 테스트 Firebase
- **Console**: https://console.firebase.google.com/project/disease-manager-test
- **Auth Domain**: disease-manager-test.firebaseapp.com

### 테스트 Vercel
- **Dashboard**: https://vercel.com/your-username/disease-manager-test
- **Preview URL**: (PR 생성 후 자동 생성)
- **고정 도메인**: test-disease-manager.vercel.app (설정 후)

---

## 주의사항

### 테스트 환경
⚠️ **절대 실제 사용자 데이터 사용 금지**
⚠️ **보안 규칙이 느슨하므로 민감한 데이터 입력 금지**
⚠️ **테스트 완료 후 테스트 계정 삭제 권장**

### 비용 관리
- Firebase Spark Plan (무료) 사용
- Vercel 무료 플랜 사용
- 테스트 데이터 정기적으로 정리

---

## 다음 단계

1. ✅ 테스트 환경 구축 완료
2. 🔄 기능 테스트 진행
3. 🔄 버그 수정
4. 🔄 최종 검증
5. ⏳ 프로덕션 배포

---

## 지원 및 문의

테스트 중 문제 발생 시:
1. GitHub Issues에 버그 보고
2. DEPLOYMENT.md의 문제 해결 섹션 참조
3. Firebase Console 로그 확인
4. Vercel Logs 확인
