# Vercel 배포 가이드

## 개요
이 가이드는 Disease Manager 애플리케이션을 Vercel에 배포하는 방법을 설명합니다.

## 사전 요구사항
- GitHub 계정
- Vercel 계정 (https://vercel.com)
- Firebase 프로젝트 설정 완료
- 환경 변수 준비 (.env 파일의 내용)

## 1. GitHub 저장소 설정

### 1.1 로컬 Git 초기화 및 커밋
```bash
# Git 초기화 (이미 완료됨)
git init

# 원격 저장소 연결 (이미 완료됨)
git remote add origin https://github.com/nanimi7/disease_manager.git

# 모든 파일 추가
git add .

# 초기 커밋
git commit -m "Initial commit: Disease Manager Phase 2 완료

- Phase 1: 기본 증상 관리 시스템
- Phase 2: 데이터 시각화 및 UI/UX 개선
- Firebase Authentication & Firestore 연동
- React + Vite + Tailwind CSS
- Recharts 데이터 시각화

🤖 Generated with Claude Code"

# GitHub에 푸시
git branch -M main
git push -u origin main
```

### 1.2 .gitignore 확인
다음 항목이 .gitignore에 포함되어 있는지 확인:
```
node_modules
dist
.env
.env.local
.env.production
```

## 2. Vercel 배포 설정

### 2.1 Vercel 계정 생성 및 로그인
1. https://vercel.com 접속
2. GitHub 계정으로 로그인

### 2.2 프로젝트 Import

#### 방법 1: Vercel 대시보드에서 Import
1. Vercel 대시보드에서 "Add New..." > "Project" 클릭
2. GitHub에서 `disease_manager` 저장소 선택
3. Import 클릭

#### 방법 2: Vercel CLI 사용
```bash
# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel
```

### 2.3 프로젝트 설정

#### Framework Preset
- **Framework**: Vite
- **Root Directory**: `./` (또는 disease-manager-app 폴더 선택)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Environment Variables 설정
Vercel 프로젝트 설정에서 다음 환경 변수 추가:

```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here
```

**중요**: 모든 환경 변수는 `VITE_` 접두사가 필요합니다 (Vite 요구사항).

### 2.4 배포 실행
1. "Deploy" 버튼 클릭
2. 배포 진행 상황 모니터링
3. 배포 완료 후 URL 확인 (예: https://disease-manager.vercel.app)

## 3. Firebase 설정 업데이트

### 3.1 Authorized Domains 추가
1. Firebase Console > Authentication > Settings
2. "Authorized domains" 섹션에서 "Add domain" 클릭
3. Vercel 배포 URL 추가 (예: `disease-manager.vercel.app`)

### 3.2 Firestore Security Rules 확인
배포 전에 Security Rules가 올바르게 설정되어 있는지 확인:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /diseases/{diseaseId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
    }
    match /symptomRecords/{recordId} {
      allow read, write: if request.auth != null &&
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null &&
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 4. 자동 배포 설정

### 4.1 Production Branch
- **main** 브랜치에 푸시하면 자동으로 프로덕션 배포
- Vercel이 자동으로 감지하여 빌드 및 배포 실행

### 4.2 Preview Deployments
- 다른 브랜치에 푸시하면 Preview 배포 생성
- PR 생성 시 자동으로 Preview URL 생성

### 4.3 Git 워크플로우
```bash
# 새 기능 개발
git checkout -b feature/new-feature
# 코드 작성...
git add .
git commit -m "Add new feature"
git push origin feature/new-feature

# GitHub에서 PR 생성
# Vercel이 자동으로 Preview 배포 생성

# 메인 브랜치에 머지 후
git checkout main
git pull origin main
# Vercel이 자동으로 프로덕션 배포
```

## 5. 배포 확인

### 5.1 배포 성공 확인
1. Vercel 대시보드에서 배포 상태 확인
2. 배포된 URL 접속
3. 회원가입/로그인 테스트
4. 주요 기능 동작 확인

### 5.2 테스트 체크리스트
- [ ] 로그인/회원가입 작동
- [ ] Firebase 연결 정상
- [ ] 질병 추가/수정/삭제
- [ ] 캘린더 증상 기록
- [ ] 차트 표시
- [ ] 분석 기능 동작

## 6. 도메인 설정 (선택사항)

### 6.1 커스텀 도메인 연결
1. Vercel 프로젝트 > Settings > Domains
2. 도메인 입력 (예: disease-manager.com)
3. DNS 레코드 설정
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. SSL 인증서 자동 생성 (Let's Encrypt)

### 6.2 Firebase Authorized Domains 업데이트
커스텀 도메인을 Firebase Authorized Domains에 추가

## 7. 환경별 설정

### 7.1 Development
```bash
npm run dev
```

### 7.2 Production (Vercel)
- 환경 변수: Vercel 대시보드에서 설정
- 자동 빌드 및 배포

### 7.3 Preview (Vercel)
- PR별 자동 생성
- Production과 동일한 환경 변수 사용

## 8. 모니터링 및 분석

### 8.1 Vercel Analytics
1. Vercel 프로젝트 > Analytics 탭
2. 페이지 뷰, 성능 메트릭 확인

### 8.2 Vercel Logs
1. Vercel 프로젝트 > Logs 탭
2. 빌드 로그 및 런타임 로그 확인

### 8.3 Firebase Console
1. Firebase Console > Analytics
2. 사용자 활동, 인증 통계 확인

## 9. 문제 해결

### 9.1 빌드 실패
**문제**: 빌드 중 에러 발생
**해결**:
1. 로컬에서 `npm run build` 실행하여 에러 확인
2. `package.json` dependencies 확인
3. Node.js 버전 확인 (Vercel은 Node 18 사용)

### 9.2 환경 변수 문제
**문제**: Firebase 연결 실패
**해결**:
1. Vercel 환경 변수에 모든 `VITE_FIREBASE_*` 변수 설정 확인
2. 환경 변수 변경 후 재배포 필요
3. 브라우저 콘솔에서 에러 메시지 확인

### 9.3 인증 실패
**문제**: 로그인 시 "Unauthorized domain" 에러
**해결**:
1. Firebase Console > Authentication > Settings
2. Authorized domains에 Vercel URL 추가
3. `*.vercel.app` 와일드카드는 지원하지 않으므로 정확한 URL 입력

### 9.4 CORS 에러
**문제**: API 호출 시 CORS 에러
**해결**:
1. Firebase Security Rules 확인
2. Vercel의 `vercel.json` 설정 확인
3. rewrites 설정이 올바른지 확인

## 10. 성능 최적화

### 10.1 Vercel 최적화
- 자동 CDN 배포
- Edge Network를 통한 빠른 응답
- 자동 이미지 최적화 (Next.js Image 사용 시)

### 10.2 빌드 최적화
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'chart-vendor': ['recharts']
        }
      }
    }
  }
}
```

### 10.3 캐싱 전략
- Static assets: 자동 캐싱 (Vercel)
- API responses: Firebase SDK 내장 캐싱

## 11. 비용

### Vercel 무료 플랜
- ✅ 무제한 배포
- ✅ 자동 SSL
- ✅ 100GB 대역폭/월
- ✅ Commercial 프로젝트 가능
- ✅ Preview deployments

### Vercel Pro 플랜 ($20/월)
- 더 많은 대역폭
- 팀 협업 기능
- Analytics
- Password Protection

### 추천
- 개발/테스트: 무료 플랜
- 프로덕션: 사용자 수에 따라 Pro 플랜 고려

## 12. 배포 체크리스트

배포 전 확인사항:

- [ ] `.env.example` 파일 생성 (민감 정보 제외)
- [ ] `.gitignore`에 `.env` 포함 확인
- [ ] Firebase 프로젝트 설정 완료
- [ ] Firestore Security Rules 설정
- [ ] GitHub 저장소에 코드 푸시
- [ ] Vercel 계정 생성
- [ ] Vercel에 프로젝트 import
- [ ] 환경 변수 설정
- [ ] Firebase Authorized Domains에 Vercel URL 추가
- [ ] 배포 후 기능 테스트

## 13. 유용한 명령어

```bash
# 로컬 빌드 테스트
npm run build
npm run preview

# Vercel CLI 배포
vercel

# Vercel 프로덕션 배포
vercel --prod

# 환경 변수 확인
vercel env ls

# 환경 변수 추가
vercel env add VITE_FIREBASE_API_KEY

# 로그 확인
vercel logs
```

## 14. 참고 자료

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Firebase Hosting vs Vercel](https://firebase.google.com/docs/hosting)

## 15. 다음 단계

배포 완료 후:
1. 도메인 연결 (선택사항)
2. Google Analytics 연동 (선택사항)
3. 성능 모니터링 설정
4. 사용자 피드백 수집
5. Phase 2 완성 (Claude API 연동)

---

**배포 완료 후 URL**: https://disease-manager.vercel.app (예시)
**GitHub**: https://github.com/nanimi7/disease_manager
