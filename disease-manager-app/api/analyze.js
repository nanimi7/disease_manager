import Anthropic from '@anthropic-ai/sdk';

export default async function handler(req, res) {
  // CORS 설정
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userInfo, diseaseInfo, symptoms, period } = req.body;

    if (!symptoms || symptoms.length === 0) {
      return res.status(400).json({ error: '분석할 증상 데이터가 없습니다.' });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // 증상 데이터 정리
    const symptomSummary = symptoms.map(s => ({
      date: s.date,
      time: s.symptomTime || '미기록',
      painLevel: s.painLevel,
      medicationTaken: s.medicationTaken ? '예' : '아니오',
      details: s.details || '상세 내용 없음'
    }));

    // 통계 계산
    const totalCount = symptoms.length;
    const avgPainLevel = (symptoms.reduce((sum, s) => sum + s.painLevel, 0) / totalCount).toFixed(1);
    const medicationRate = ((symptoms.filter(s => s.medicationTaken).length / totalCount) * 100).toFixed(1);

    // 통증 분포
    const painDistribution = {};
    symptoms.forEach(s => {
      const level = s.painLevel;
      painDistribution[level] = (painDistribution[level] || 0) + 1;
    });

    // 월별 발생 횟수 계산
    const monthlyCount = {};
    symptoms.forEach(s => {
      const month = s.date.substring(0, 7); // YYYY-MM 형식
      monthlyCount[month] = (monthlyCount[month] || 0) + 1;
    });

    // 월 수 계산
    const monthCount = Object.keys(monthlyCount).length;
    const monthlyAvg = monthCount > 0 ? (totalCount / monthCount).toFixed(1) : 0;

    // 최다/최소 발생 월 찾기
    let maxMonth = '';
    let maxMonthCount = 0;
    let minMonth = '';
    let minMonthCount = Infinity;
    Object.entries(monthlyCount).forEach(([month, count]) => {
      if (count > maxMonthCount) {
        maxMonth = month;
        maxMonthCount = count;
      }
      if (count < minMonthCount) {
        minMonth = month;
        minMonthCount = count;
      }
    });
    // minMonthCount가 Infinity면 데이터 없음
    if (minMonthCount === Infinity) minMonthCount = 0;

    // 월 이름 포맷팅
    const formatMonth = (monthStr) => {
      if (!monthStr) return '없음';
      const [year, month] = monthStr.split('-');
      return `${year}년 ${parseInt(month)}월`;
    };

    const prompt = `당신은 환자의 증상 데이터를 분석하는 의료 AI 어시스턴트입니다.
주어진 데이터를 바탕으로 환자에게 유용한 분석 결과를 제공해주세요.

## 환자 정보
- 나이: ${userInfo?.age || '미입력'}세
- 성별: ${userInfo?.gender === 'male' ? '남성' : userInfo?.gender === 'female' ? '여성' : '미입력'}

## 질병 정보
- 질병명: ${diseaseInfo?.diseaseName || '알 수 없음'}
- 처방 약물: ${diseaseInfo?.medication || '미입력'}

## 분석 기간
- 기간: ${period?.startDate} ~ ${period?.endDate} (${period?.totalDays}일)

## 증상 통계
- 총 발생 횟수: ${totalCount}회
- 평균 통증 강도: ${avgPainLevel}/10
- 약물 복용률: ${medicationRate}%
- 월평균 발생 빈도: ${monthlyAvg}회
- 월 최대 발생: ${formatMonth(maxMonth)} (${maxMonthCount}회)
- 월 최소 발생: ${formatMonth(minMonth)} (${minMonthCount}회)
- 월별 발생 현황: ${Object.entries(monthlyCount).map(([m, c]) => `${formatMonth(m)}: ${c}회`).join(', ')}
- 통증 분포: ${JSON.stringify(painDistribution)}

## 상세 증상 기록
${symptomSummary.map((s, i) => `
${i + 1}. ${s.date} ${s.time}
   - 통증 강도: ${s.painLevel}/10
   - 약물 복용: ${s.medicationTaken}
   - 상세 내용: ${s.details}
`).join('')}

위 데이터를 분석하여 다음 형식으로 답변해주세요:

### 1. 증상 심각도 평가
현재 증상의 심각도가 어느 정도인지, 일반적인 기준에서 평가해주세요.

### 2. 패턴 분석
발생 빈도, 시간대, 통증 강도의 변화 추이 등 눈에 띄는 패턴이 있다면 설명해주세요.

### 3. 주의사항 및 생활 관리 팁
증상 관리를 위해 환자가 주의해야 할 점이나 도움이 될 수 있는 생활 습관을 제안해주세요.

### 4. 의사에게 전달할 내용
병원 방문 시 의료진에게 전달하면 좋을 핵심 정보를 정리해주세요. 의사가 빠르게 파악할 수 있도록 간결하게 요약해주세요.

### 5. 추가 권고사항
위 분석을 바탕으로 환자에게 권고할 사항이 있다면 알려주세요.

참고: 이 분석은 참고용이며, 정확한 진단과 치료는 반드시 의료 전문가와 상담하세요.`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const analysisResult = message.content[0].text;

    return res.status(200).json({
      success: true,
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Claude API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'AI 분석 중 오류가 발생했습니다.'
    });
  }
}
