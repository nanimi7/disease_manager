/**
 * AI 분석 서비스
 * Vercel 서버리스 함수를 통해 Claude API를 호출합니다.
 */

export const analyzeSymptoms = async (userInfo, diseaseInfo, symptoms, period) => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userInfo,
        diseaseInfo,
        symptoms,
        period
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'AI 분석 요청 실패');
    }

    return {
      success: true,
      analysis: data.analysis
    };
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return {
      success: false,
      error: error.message || 'AI 분석 중 오류가 발생했습니다.'
    };
  }
};
