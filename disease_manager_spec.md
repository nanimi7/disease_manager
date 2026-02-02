# Disease Manager 서비스 기획서

## 1. 서비스 개요
### 서비스 이름
Disease Manager

### 핵심 기능 요약
만성질환 환자가 증상 발생을 기록하고, AI 분석을 통해 패턴을 파악하여 의료진과 공유할 수 있는 웹 서비스

### 타겟 사용자
- 만성 두통, 편두통 등 반복적인 증상을 겪는 환자
- 증상 패턴 파악이 필요한 만성질환자
- 병원 방문 시 정확한 증상 기록이 필요한 환자

---

## 2. 핵심 기능 명세

### 2.1 회원 관리
- 회원가입 필수
- 회원별 독립적인 데이터 관리
- 로그인/로그아웃 기능

### 2.2 사용자 정보 관리
**등록 가능한 정보**
- 닉네임
- 나이
- 보유 질병명 (복수 등록 가능)

**기능**
- 정보 등록
- 정보 수정
- 정보 삭제

### 2.3 질병 관리
**질병 등록 정보**
- 질병명 (사용자 직접 입력)
- 처방 약물 정보

**기능**
- 질병 추가
- 질병 수정
- 질병 삭제

### 2.4 증상 기록
**기록 항목**
- 발생 날짜 (캘린더에서 선택)
- 질병명 (등록된 질병 중 선택)
- 통증 강도 (1-10 선택)
- 약물 복용 여부 (예/아니오)
- 상세 사유 (텍스트 입력, 공백 포함 1,000자 제한)

**기능**
- 증상 등록
- 증상 수정
- 증상 삭제

### 2.5 AI 요약 분석
**입력 정보**
- 질병명 선택
- 분석 기간 선택
  - 최근 1개월
  - 최근 3개월
  - 사용자 지정 (시작일 ~ 종료일)

**제공 정보**
- 기간별 평균 발생 빈도
- 기간별 평균 통증 강도
- 통계 데이터
- 주요 발생 패턴 분석
- 예상 트리거 분석
- 환자가 알아두면 좋은 정보
- 의료진에게 전달하면 좋을 내용

**분석 기준**
- 사용자 나이
- 선택한 기간 내 증상 기록
- 사용자가 입력한 상세 사유

---

## 3. 화면 구성

### 3.1 사용자 정보 관리 탭
**화면 구성 요소**
- 닉네임 입력란
- 나이 입력란
- 보유 질병 목록
- 질병 추가 버튼
- 저장 버튼

**사용자 행동**
- 개인 정보 입력/수정
- 보유 질병 추가
- 보유 질병 수정/삭제
- 처방 약물 정보 입력/수정

### 3.2 캘린더 탭
**화면 구성 요소**
- 월간 캘린더
- 날짜별 증상 뱃지 표시
- 증상 등록 모달/패널

**증상 등록 화면**
- 질병명 선택 드롭다운 (등록된 질병 목록)
- 통증 강도 선택 (1-10)
- 약물 복용 여부 선택
- 상세 사유 텍스트 입력란 (1,000자 제한)
- 저장 버튼
- 취소 버튼

**사용자 행동**
- 날짜 클릭하여 증상 등록
- 등록된 증상 조회
- 등록된 증상 수정
- 등록된 증상 삭제

**표시 방식**
- 등록된 질병명이 뱃지 형태로 캘린더에 표시됨

### 3.3 AI 요약 탭
**화면 구성 요소**
- 질병명 선택 드롭다운
- 분석 기간 선택
  - 최근 1개월 버튼
  - 최근 3개월 버튼
  - 사용자 지정 (시작일-종료일 선택)
- 분석 요청 버튼
- 분석 결과 표시 영역

**분석 결과 표시 영역**
- 발생 빈도 통계
- 평균 통증 강도
- 패턴 분석 내용
- 트리거 분석 내용
- 환자 참고 정보
- 의료진 전달 권장 내용

**사용자 행동**
- 질병 선택
- 기간 선택
- 분석 요청
- 결과 확인
- 결과 저장/인쇄 (추후 기능)

---

## 4. 데이터 구조

### 4.1 사용자 정보 (users)
```
{
  userId: string,          // Firebase Auth UID
  email: string,          // 로그인용 이메일
  nickname: string,       // 닉네임
  age: number,           // 나이
  createdAt: timestamp   // 가입일시
}
```

### 4.2 질병 정보 (diseases)
```
{
  diseaseId: string,        // 자동 생성 ID
  userId: string,          // 사용자 ID (외래키)
  diseaseName: string,    // 질병명
  medication: string,     // 처방 약물 정보
  createdAt: timestamp    // 등록일시
}
```

### 4.3 증상 기록 (symptomRecords)
```
{
  recordId: string,          // 자동 생성 ID
  userId: string,           // 사용자 ID (외래키)
  diseaseId: string,       // 질병 ID (외래키)
  date: string,            // 발생 날짜 (YYYY-MM-DD)
  painLevel: number,       // 통증 강도 (1-10)
  medicationTaken: boolean, // 약물 복용 여부
  details: string,         // 상세 사유 (최대 1,000자)
  createdAt: timestamp,    // 등록일시
  updatedAt: timestamp     // 수정일시
}
```

---

## 5. 기술 스택

### 5.1 프론트엔드
**추천: React**
- 이유: 컴포넌트 재사용성이 높고, React Native로 앱 전환 시 코드 재사용 가능
- UI 라이브러리: Tailwind CSS (반응형 구현 용이)
- 캘린더: react-calendar 또는 @fullcalendar/react
- 상태 관리: React Context API (초기에는 이것만으로 충분)

**대안: Next.js**
- 이유: SEO 필요 시, 서버 사이드 렌더링 필요 시
- 단점: 앱 전환 시 코드 재사용 제한적

### 5.2 백엔드
**Firebase**
- Authentication: 회원가입/로그인
- Firestore: 데이터베이스 (NoSQL)
- Hosting: 웹 배포
- Cloud Functions: 서버리스 함수 (필요 시)

**Firestore 구조**
```
users/
  {userId}/
    - 사용자 정보
    
diseases/
  {diseaseId}/
    - 질병 정보
    
symptomRecords/
  {recordId}/
    - 증상 기록
```

### 5.3 AI 분석
- Claude API (Anthropic)
- API 호출: Firebase Cloud Functions에서 처리 권장
  - 이유: API 키 보안 (프론트엔드에 노출 방지)

### 5.4 배포
**웹 (현재)**
- Firebase Hosting 또는 Vercel

**앱 (추후)**
- React Native + Expo
- 백엔드는 동일하게 Firebase 사용 (코드 변경 불필요)
- Firebase SDK는 React Native에서도 동일하게 작동

---

## 6. 앱 전환 대비 설계

### 6.1 코드 구조
```
src/
  components/     # UI 컴포넌트 (웹/앱 공통)
  screens/        # 화면 단위 (웹에서는 pages)
  services/       # Firebase 연동 로직 (웹/앱 공통)
  hooks/          # 커스텀 훅 (웹/앱 공통)
  utils/          # 유틸리티 함수 (웹/앱 공통)
```

### 6.2 Firebase 설정 분리
- 환경 변수로 Firebase 설정 관리
- 웹/앱에서 동일한 Firebase 프로젝트 사용

### 6.3 스타일링
- Tailwind CSS (웹) → NativeWind (앱) 전환 가능
- 또는 Styled Components 사용 (웹/앱 공통)

---

## 7. 개발 우선순위

### Phase 1 (MVP - 웹)
1. Firebase 프로젝트 생성 및 설정
2. React 프로젝트 초기 세팅
3. Firebase Authentication 연동 (회원가입/로그인)
4. 사용자 정보 관리 화면
5. 질병 등록/관리 기능
6. 캘린더 증상 기록 기능
7. Firestore 데이터 저장/조회

### Phase 2 (웹)
1. Claude API 연동 (Cloud Functions)
2. AI 요약 분석 기능
3. 반응형 디자인 최적화
4. Firebase Hosting 배포

### Phase 3 (앱 전환)
1. React Native 프로젝트 생성
2. 공통 로직 코드 이관
3. 네이티브 UI 컴포넌트 구현
4. 앱 스토어 배포

---

## 8. 개발 환경 설정

### 필요한 도구
- Node.js (최신 LTS 버전)
- npm 또는 yarn
- Git
- Firebase CLI
- 코드 에디터 (VS Code 추천)

### 설치할 주요 패키지
```bash
# React 프로젝트 생성
npx create-react-app disease-manager

# Firebase
npm install firebase

# UI 라이브러리
npm install tailwindcss
npm install react-calendar

# 기타 유틸리티
npm install date-fns  # 날짜 처리
```

---

## 9. 보안 및 규정 검토 사항
- [ ] 의료 데이터 보안 처리 (암호화)
- [ ] 개인정보 처리 방침 작성
- [ ] 의료기기법 규제 대상 여부 확인
- [ ] Firebase Security Rules 설정
  - 사용자는 자신의 데이터만 읽기/쓰기 가능
- [ ] Claude API 키 보안 관리 (Cloud Functions)

---

## 10. 비용 예상

### Firebase 비용
- Spark Plan (무료): 소규모 사용자 충분
- Blaze Plan (종량제): 사용자 증가 시
  - Firestore: 읽기/쓰기/저장 용량 기준
  - Cloud Functions: 호출 횟수 기준

### Claude API 비용
- 사용량 기반 과금
- 월별 예산 설정 권장

---

## 11. 추후 고려 기능
- [ ] 분석 결과 PDF 다운로드
- [ ] 의료진 공유 기능 (링크 생성)
- [ ] 증상 알림 기능 (PWA 푸시 알림)
- [ ] 다국어 지원
- [ ] 데이터 백업/복원
- [ ] 그래프 시각화 개선
