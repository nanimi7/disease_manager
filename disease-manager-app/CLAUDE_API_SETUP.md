# Claude API 연동 가이드 (Phase 2)

## 개요
이 문서는 Firebase Cloud Functions를 통해 Claude API를 연동하여 AI 증상 분석 기능을 구현하는 방법을 설명합니다.

## 사전 요구사항
- Firebase 프로젝트 (Blaze Plan - 종량제)
- Anthropic Claude API 키
- Node.js 18 이상

## 1. Firebase CLI 설치 및 초기화

### 1.1 Firebase CLI 설치
```bash
npm install -g firebase-tools
```

### 1.2 Firebase 로그인
```bash
firebase login
```

### 1.3 Firebase Functions 초기화
```bash
firebase init functions
```

설정 옵션:
- Language: JavaScript 또는 TypeScript
- ESLint: Yes (권장)
- Install dependencies: Yes

## 2. Cloud Functions 코드 작성

### 2.1 functions 디렉토리 구조
```
functions/
├── index.js
├── package.json
└── .env
```

### 2.2 필요한 패키지 설치
```bash
cd functions
npm install @anthropic-ai/sdk cors
```

### 2.3 index.js 작성
```javascript
const functions = require('firebase-functions');
const Anthropic = require('@anthropic-ai/sdk');
const cors = require('cors')({ origin: true });

const anthropic = new Anthropic({
  apiKey: functions.config().claude.apikey
});

exports.analyzeSymptoms = functions.https.onCall(async (data, context) => {
  // 인증 확인
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      '인증이 필요합니다.'
    );
  }

  const { symptoms, userAge, diseaseName, period } = data;

  try {
    // Claude API 호출
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [{
        role: 'user',
        content: createPrompt(symptoms, userAge, diseaseName, period)
      }]
    });

    return {
      success: true,
      analysis: message.content[0].text
    };
  } catch (error) {
    console.error('Claude API 에러:', error);
    throw new functions.https.HttpsError(
      'internal',
      'AI 분석 중 오류가 발생했습니다.'
    );
  }
});

function createPrompt(symptoms, userAge, diseaseName, period) {
  const symptomsData = symptoms.map(s => ({
    date: s.date,
    painLevel: s.painLevel,
    medicationTaken: s.medicationTaken,
    details: s.details
  }));

  return `당신은 만성질환 증상 분석 전문가입니다. 다음 환자의 증상 기록을 분석해주세요.

**환자 정보:**
- 나이: ${userAge}세
- 질병명: ${diseaseName}
- 분석 기간: ${period.start} ~ ${period.end}

**증상 기록:**
${JSON.stringify(symptomsData, null, 2)}

다음 항목에 대해 분석해주세요:

1. **주요 발생 패턴**: 증상이 언제, 어떤 상황에서 주로 발생하는지 분석
2. **예상 트리거**: 증상을 유발할 수 있는 요인 추측
3. **환자 권장사항**: 환자가 일상에서 주의해야 할 사항
4. **의료진 공유 정보**: 병원 방문 시 의사에게 전달하면 유용한 정보

각 항목을 명확히 구분하여 한국어로 작성해주세요.`;
}
```

## 3. Firebase 환경 변수 설정

### 3.1 Claude API 키 설정
```bash
firebase functions:config:set claude.apikey="YOUR_CLAUDE_API_KEY"
```

### 3.2 설정 확인
```bash
firebase functions:config:get
```

## 4. Functions 배포

### 4.1 배포 명령
```bash
firebase deploy --only functions
```

### 4.2 배포 확인
Firebase Console > Functions에서 배포된 함수 확인

## 5. 프론트엔드 연동

### 5.1 AI 분석 서비스 생성
`src/services/aiService.js` 파일 생성:

```javascript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions();
const analyzeSymptoms = httpsCallable(functions, 'analyzeSymptoms');

export const getAIAnalysis = async (symptoms, userAge, diseaseName, period) => {
  try {
    const result = await analyzeSymptoms({
      symptoms,
      userAge,
      diseaseName,
      period
    });

    if (result.data.success) {
      return {
        success: true,
        analysis: result.data.analysis
      };
    } else {
      return {
        success: false,
        error: '분석 실패'
      };
    }
  } catch (error) {
    console.error('AI 분석 에러:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
```

### 5.2 AnalysisScreen 업데이트

```javascript
import { getAIAnalysis } from '../services/aiService';

// ... 기존 코드 ...

const [aiAnalysis, setAiAnalysis] = useState(null);
const [aiLoading, setAiLoading] = useState(false);

const handleAIAnalyze = async () => {
  setAiLoading(true);

  const result = await getAIAnalysis(
    analysis.symptoms,
    userInfo.age,
    getDiseaseName(selectedDiseaseId),
    { start: analysis.startDate, end: analysis.endDate }
  );

  if (result.success) {
    setAiAnalysis(result.analysis);
  } else {
    alert('AI 분석 실패: ' + result.error);
  }

  setAiLoading(false);
};
```

## 6. 보안 설정

### 6.1 CORS 설정
프로덕션 환경에서는 특정 도메인만 허용:

```javascript
const cors = require('cors')({
  origin: 'https://your-domain.com'
});
```

### 6.2 Rate Limiting
과도한 API 호출 방지:

```javascript
// Firebase App Check 활성화 권장
// Firebase Console > App Check에서 설정
```

### 6.3 비용 제한
```javascript
// Claude API 호출 시 max_tokens 제한
max_tokens: 2048  // 필요에 따라 조정
```

## 7. 비용 관리

### 7.1 Firebase Functions
- Blaze Plan 필요
- 무료 할당량: 월 2백만 호출
- 초과 시 종량제

### 7.2 Claude API
- 모델별 가격:
  - Claude 3.5 Sonnet: Input $3/MTok, Output $15/MTok
- 월별 예산 설정 권장

### 7.3 예상 비용 (월 1,000건 분석 기준)
- Firebase Functions: 무료 범위 내
- Claude API: 약 $10-20 (분석 길이에 따라 변동)

## 8. 테스트

### 8.1 로컬 테스트
```bash
firebase emulators:start --only functions
```

### 8.2 배포 후 테스트
Firebase Console > Functions > 로그에서 실행 확인

## 9. 문제 해결

### 9.1 CORS 에러
- Functions에 cors 미들웨어 추가 확인
- Firebase Console에서 도메인 허용 확인

### 9.2 인증 에러
- httpsCallable 사용 시 자동으로 인증 토큰 전송됨
- context.auth 확인

### 9.3 타임아웃
- Functions 실행 시간 제한 (기본 60초)
- 필요시 timeout 설정 증가:

```javascript
exports.analyzeSymptoms = functions
  .runWith({ timeoutSeconds: 300 })
  .https.onCall(async (data, context) => {
    // ...
  });
```

## 10. 모니터링

### 10.1 Firebase Console
- Functions > 대시보드에서 호출 횟수, 에러율 확인

### 10.2 로그 확인
```bash
firebase functions:log
```

## 11. 참고 자료

- [Firebase Cloud Functions 문서](https://firebase.google.com/docs/functions)
- [Anthropic Claude API 문서](https://docs.anthropic.com/)
- [Firebase 가격 정책](https://firebase.google.com/pricing)
- [Anthropic 가격 정책](https://www.anthropic.com/pricing)

## 12. 다음 단계

Phase 2 완료 후:
- AI 분석 결과 PDF 다운로드 기능
- 분석 결과 히스토리 저장
- 분석 결과 공유 기능
