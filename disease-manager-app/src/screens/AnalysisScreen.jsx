import { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { getUserDiseases } from '../services/diseaseService';
import { getSymptomsByDateRange } from '../services/symptomService';
import { analyzeSymptoms } from '../services/aiService';

const AnalysisScreen = () => {
  const { currentUser, userInfo } = useAuth();
  const [diseases, setDiseases] = useState([]);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState('');
  const [periodType, setPeriodType] = useState('1month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadDiseases();
  }, [currentUser]);

  const loadDiseases = async () => {
    if (currentUser) {
      const result = await getUserDiseases(currentUser.uid);
      if (result.success) {
        setDiseases(result.diseases);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedDiseaseId) {
      alert('질병을 선택해주세요.');
      return;
    }

    setLoading(true);
    setShowDetails(false);

    let start, end;
    const today = new Date();

    if (periodType === '1month') {
      start = format(subMonths(today, 1), 'yyyy-MM-dd');
      end = format(today, 'yyyy-MM-dd');
    } else if (periodType === '3months') {
      start = format(subMonths(today, 3), 'yyyy-MM-dd');
      end = format(today, 'yyyy-MM-dd');
    } else {
      if (!startDate || !endDate) {
        alert('시작일과 종료일을 선택해주세요.');
        setLoading(false);
        return;
      }
      start = startDate;
      end = endDate;
    }

    const result = await getSymptomsByDateRange(
      currentUser.uid,
      start,
      end,
      selectedDiseaseId
    );

    if (result.success) {
      const symptoms = result.symptoms;
      const basicAnalysis = calculateBasicStats(symptoms, start, end);
      setAnalysis(basicAnalysis);
      setAiAnalysis(null);

      if (symptoms.length > 0) {
        setAiLoading(true);

        const age = userInfo?.birthdate ? calculateAge(userInfo.birthdate) : null;
        const userInfoForAI = {
          age,
          gender: userInfo?.gender
        };

        const selectedDisease = diseases.find(d => d.id === selectedDiseaseId);
        const diseaseInfoForAI = {
          diseaseName: selectedDisease?.diseaseName,
          medication: selectedDisease?.medication
        };

        const periodInfo = {
          startDate: start,
          endDate: end,
          totalDays: basicAnalysis.totalDays
        };

        const aiResult = await analyzeSymptoms(userInfoForAI, diseaseInfoForAI, symptoms, periodInfo);

        if (aiResult.success) {
          setAiAnalysis(aiResult.analysis);
        } else {
          console.error('AI 분석 실패:', aiResult.error);
        }

        setAiLoading(false);
      }
    } else {
      alert('데이터 조회 실패: ' + result.error);
    }

    setLoading(false);
  };

  const calculateAge = (birthdateStr) => {
    if (!birthdateStr) return null;
    const birthDate = new Date(birthdateStr);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const calculateBasicStats = (symptoms, startDate, endDate) => {
    if (symptoms.length === 0) {
      return {
        count: 0,
        avgPainLevel: 0,
        multiOccurrenceDays: 0,
        message: '해당 기간에 기록된 증상이 없습니다.'
      };
    }

    const count = symptoms.length;
    const totalPainLevel = symptoms.reduce((sum, s) => sum + s.painLevel, 0);
    const avgPainLevel = (totalPainLevel / count).toFixed(1);

    // 날짜별 발생 횟수 계산
    const dateCount = {};
    symptoms.forEach(s => {
      dateCount[s.date] = (dateCount[s.date] || 0) + 1;
    });

    // 2회 이상 발생한 날짜 수
    const multiOccurrenceDays = Object.values(dateCount).filter(c => c >= 2).length;

    // 월별 발생 횟수 계산
    const monthlyCount = {};
    symptoms.forEach(s => {
      const month = s.date.substring(0, 7); // YYYY-MM 형식
      monthlyCount[month] = (monthlyCount[month] || 0) + 1;
    });

    // 월 수 및 월평균 계산
    const monthCount = Object.keys(monthlyCount).length;
    const monthlyAvg = monthCount > 0 ? (count / monthCount).toFixed(1) : 0;

    // 최대/최소 발생 월 찾기
    let maxMonth = '';
    let maxMonthCount = 0;
    let minMonth = '';
    let minMonthCount = Infinity;
    Object.entries(monthlyCount).forEach(([month, cnt]) => {
      if (cnt > maxMonthCount) {
        maxMonth = month;
        maxMonthCount = cnt;
      }
      if (cnt < minMonthCount) {
        minMonth = month;
        minMonthCount = cnt;
      }
    });
    if (minMonthCount === Infinity) minMonthCount = 0;

    // 월 포맷팅 함수
    const formatMonth = (monthStr) => {
      if (!monthStr) return '-';
      const [year, month] = monthStr.split('-');
      return `${parseInt(month)}월`;
    };

    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const totalDays = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;

    return {
      count,
      avgPainLevel,
      multiOccurrenceDays,
      totalDays,
      startDate,
      endDate,
      symptoms,
      // 월별 통계
      monthlyAvg,
      maxMonth: formatMonth(maxMonth),
      maxMonthCount,
      minMonth: formatMonth(minMonth),
      minMonthCount
    };
  };

  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '2px solid #e0e0e0',
    borderRadius: '10px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '8px'
  };

  const cardStyle = {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  };

  const buttonPrimaryStyle = {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
  };

  const periodButtonStyle = (isActive) => ({
    flex: 1,
    padding: '10px 16px',
    background: isActive ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f5f5f5',
    color: isActive ? 'white' : '#666',
    border: isActive ? 'none' : '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  });

  const statCardStyle = (bgColor, borderColor) => ({
    background: bgColor,
    border: `1px solid ${borderColor}`,
    padding: '16px',
    borderRadius: '12px',
    textAlign: 'center'
  });

  // 마크다운 파싱 함수
  const renderMarkdown = (text) => {
    if (!text) return null;

    // --- 구분선 제거
    let cleaned = text.replace(/^---+$/gm, '').trim();

    // 줄 단위로 파싱
    const lines = cleaned.split('\n');
    const elements = [];
    let currentList = [];

    const flushList = () => {
      if (currentList.length > 0) {
        elements.push(
          <ul key={`list-${elements.length}`} style={{
            margin: '12px 0',
            paddingLeft: '8px',
            listStyle: 'none'
          }}>
            {currentList.map((item, i) => (
              <li key={i} style={{
                marginBottom: '14px',
                position: 'relative',
                paddingLeft: '18px',
                lineHeight: '1.75'
              }}>
                <span style={{
                  position: 'absolute',
                  left: 0,
                  top: '2px',
                  width: '8px',
                  height: '8px',
                  background: '#667eea',
                  borderRadius: '50%'
                }}></span>
                {parseBold(item)}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };

    // **text** → bold 변환 (서브헤더 스타일 포함)
    const parseBold = (line) => {
      const parts = line.split(/\*\*(.*?)\*\*/g);
      const result = [];

      parts.forEach((part, i) => {
        if (i % 2 === 1) {
          // Bold 텍스트 처리
          // "소제목: 내용" 패턴 체크 (콜론 뒤에 내용이 있는 경우)
          const colonMatch = part.match(/^(.+?):\s*(.*)$/);
          if (colonMatch && colonMatch[2]) {
            // 소제목과 내용을 분리 (콜론 제거)
            result.push(
              <strong key={`${i}-header`} style={{
                display: 'block',
                color: '#1a1a1a',
                fontWeight: '700',
                fontSize: '15px',
                marginTop: result.length > 0 ? '14px' : '0',
                marginBottom: '6px'
              }}>{colonMatch[1]}</strong>
            );
            result.push(
              <span key={`${i}-content`} style={{ display: 'block' }}>{colonMatch[2]}</span>
            );
          } else if (part.endsWith(':')) {
            // 콜론으로만 끝나면 서브헤더 스타일 (콜론 제거)
            result.push(
              <strong key={i} style={{
                display: 'block',
                color: '#1a1a1a',
                fontWeight: '700',
                fontSize: '15px',
                marginTop: result.length > 0 ? '14px' : '0',
                marginBottom: '6px'
              }}>{part.slice(0, -1)}</strong>
            );
          } else {
            // 일반 bold 텍스트
            result.push(
              <strong key={i} style={{ color: '#1a1a1a', fontWeight: '600' }}>{part}</strong>
            );
          }
        } else if (part) {
          result.push(part);
        }
      });

      return result;
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      if (!trimmed) {
        flushList();
        return;
      }

      // 리스트 아이템
      if (trimmed.startsWith('- ')) {
        currentList.push(trimmed.substring(2));
      } else {
        flushList();
        // 일반 텍스트
        elements.push(
          <p key={idx} style={{
            margin: '0 0 14px 0',
            lineHeight: '1.85'
          }}>
            {parseBold(trimmed)}
          </p>
        );
      }
    });

    flushList();
    return elements;
  };

  return (
    <div>
      {/* Page Title */}
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '8px'
        }}>
          데이터 분석
        </h2>
        <p style={{ fontSize: '14px', color: '#999' }}>
          증상 패턴과 통계를 분석하세요
        </p>
      </div>

      {/* Analysis Settings Card */}
      <div style={cardStyle}>
        <h3 style={{
          fontSize: '16px',
          fontWeight: '600',
          color: '#333',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>⚙️</span>
          분석 설정
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>질병 선택</label>
          <select
            value={selectedDiseaseId}
            onChange={(e) => setSelectedDiseaseId(e.target.value)}
            style={inputStyle}
            onFocus={(e) => e.target.style.borderColor = '#667eea'}
            onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
          >
            <option value="">질병을 선택하세요</option>
            {diseases.map((disease) => (
              <option key={disease.id} value={disease.id}>
                {disease.diseaseName}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>분석 기간</label>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <button
              onClick={() => setPeriodType('1month')}
              style={periodButtonStyle(periodType === '1month')}
            >
              최근 1개월
            </button>
            <button
              onClick={() => setPeriodType('3months')}
              style={periodButtonStyle(periodType === '3months')}
            >
              최근 3개월
            </button>
            <button
              onClick={() => setPeriodType('custom')}
              style={periodButtonStyle(periodType === 'custom')}
            >
              사용자 지정
            </button>
          </div>

          {periodType === 'custom' && (
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={{ ...labelStyle, fontSize: '12px' }}>시작일</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{
                    ...inputStyle,
                    width: '100%',
                    color: '#333',
                    background: '#fff',
                    WebkitAppearance: 'none',
                    minHeight: '48px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <label style={{ ...labelStyle, fontSize: '12px' }}>종료일</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{
                    ...inputStyle,
                    width: '100%',
                    color: '#333',
                    background: '#fff',
                    WebkitAppearance: 'none',
                    minHeight: '48px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#667eea'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            ...buttonPrimaryStyle,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '분석 중...' : '📊 분석 시작'}
        </button>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div style={cardStyle}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>📈</span>
            분석 결과
          </h3>

          {analysis.count === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: '#999'
            }}>
              <p style={{ fontSize: '14px' }}>{analysis.message}</p>
            </div>
          ) : (
            <div>
              {/* Basic Statistics - 6개 표시 */}
              <div style={{ marginBottom: '24px' }}>
                {/* 첫번째 줄 - 기본 통계 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <div style={statCardStyle('#e3f2fd', '#90caf9')}>
                    <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                      총 발생
                    </p>
                    <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#1976d2' }}>
                      {analysis.count}<span style={{ fontSize: '14px' }}>회</span>
                    </p>
                  </div>
                  <div style={statCardStyle('#fff3e0', '#ffb74d')}>
                    <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                      2회이상발생
                    </p>
                    <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#f57c00' }}>
                      {analysis.multiOccurrenceDays}<span style={{ fontSize: '14px' }}>일</span>
                    </p>
                  </div>
                  <div style={statCardStyle('#e8f5e9', '#a5d6a7')}>
                    <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                      평균 통증
                    </p>
                    <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#388e3c' }}>
                      {analysis.avgPainLevel}
                    </p>
                  </div>
                </div>
                {/* 두번째 줄 - 월별 통계 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px'
                }}>
                  <div style={statCardStyle('#f3e5f5', '#ce93d8')}>
                    <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                      월평균
                    </p>
                    <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#8e24aa' }}>
                      {analysis.monthlyAvg}<span style={{ fontSize: '14px' }}>회</span>
                    </p>
                  </div>
                  <div style={statCardStyle('#fce4ec', '#f48fb1')}>
                    <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                      최다발생
                    </p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#d81b60', lineHeight: '1.2' }}>
                      {analysis.maxMonth}<span style={{ color: '#999', margin: '0 2px' }}>/</span><span style={{ fontSize: '16px' }}>{analysis.maxMonthCount}회</span>
                    </p>
                  </div>
                  <div style={statCardStyle('#e0f2f1', '#80cbc4')}>
                    <p style={{ fontSize: '11px', color: '#666', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                      최소발생
                    </p>
                    <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#00897b', lineHeight: '1.2' }}>
                      {analysis.minMonth}<span style={{ color: '#999', margin: '0 2px' }}>/</span><span style={{ fontSize: '16px' }}>{analysis.minMonthCount}회</span>
                    </p>
                  </div>
                </div>
                <p style={{
                  fontSize: '12px',
                  color: '#999',
                  textAlign: 'center',
                  marginTop: '12px'
                }}>
                  {analysis.startDate} ~ {analysis.endDate} ({analysis.totalDays}일)
                </p>
              </div>

              {/* AI Analysis - Notion Style */}
              <div style={{
                background: '#ffffff',
                borderRadius: '8px',
                marginBottom: '24px',
                overflow: 'hidden'
              }}>
                {/* Header */}
                <div style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid #e8e8e8',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px'
                  }}>
                    🤖
                  </div>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#37352f'
                  }}>
                    AI 분석 리포트
                  </span>
                </div>

                {/* Content */}
                <div style={{ padding: '20px' }}>
                  {aiLoading ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '48px 20px'
                    }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        border: '3px solid #f0f0f0',
                        borderTop: '3px solid #667eea',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                        margin: '0 auto 16px'
                      }} />
                      <p style={{
                        fontSize: '14px',
                        color: '#787774',
                        margin: 0
                      }}>
                        AI가 데이터를 분석하고 있어요...
                      </p>
                      <style>{`
                        @keyframes spin {
                          0% { transform: rotate(0deg); }
                          100% { transform: rotate(360deg); }
                        }
                      `}</style>
                    </div>
                  ) : aiAnalysis ? (
                    <div>
                      {aiAnalysis.split('###').map((section, idx) => {
                        if (idx === 0) return null;
                        const lines = section.trim().split('\n');
                        const title = lines[0]?.trim().replace(/^\d+\.\s*/, '');
                        const content = lines.slice(1).join('\n').trim();

                        // 섹션별 색상 테마
                        const getTheme = (t) => {
                          if (t.includes('심각도')) return { bg: '#fff4f4', border: '#ffcdd2', icon: '📊', iconBg: '#ffebee' };
                          if (t.includes('패턴')) return { bg: '#f3f0ff', border: '#d1c4e9', icon: '📈', iconBg: '#ede7f6' };
                          if (t.includes('주의사항') || t.includes('생활')) return { bg: '#fff8e1', border: '#ffe082', icon: '💡', iconBg: '#fffde7' };
                          if (t.includes('의사')) return { bg: '#e3f2fd', border: '#90caf9', icon: '👨‍⚕️', iconBg: '#e1f5fe' };
                          if (t.includes('권고')) return { bg: '#e8f5e9', border: '#a5d6a7', icon: '✅', iconBg: '#f1f8e9' };
                          return { bg: '#f7f6f3', border: '#e8e8e8', icon: '📌', iconBg: '#f0f0f0' };
                        };

                        const theme = getTheme(title);

                        return (
                          <div key={idx} style={{
                            marginBottom: '20px',
                            background: theme.bg,
                            borderRadius: '12px',
                            borderLeft: `5px solid ${theme.border}`,
                            overflow: 'hidden'
                          }}>
                            {/* Section Header */}
                            <div style={{
                              padding: '16px 18px 14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px'
                            }}>
                              <span style={{
                                width: '28px',
                                height: '28px',
                                background: theme.iconBg,
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '15px'
                              }}>
                                {theme.icon}
                              </span>
                              <span style={{
                                fontSize: '16px',
                                fontWeight: '700',
                                color: '#1a1a1a'
                              }}>
                                {title}
                              </span>
                            </div>
                            {/* Section Content */}
                            <div style={{
                              padding: '0 18px 18px 18px',
                              fontSize: '15px',
                              color: '#333',
                              lineHeight: '1.85'
                            }}>
                              {renderMarkdown(content)}
                            </div>
                          </div>
                        );
                      })}

                      {/* Disclaimer */}
                      <div style={{
                        marginTop: '24px',
                        padding: '16px 18px',
                        background: '#f7f6f3',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '14px'
                      }}>
                        <span style={{
                          fontSize: '18px',
                          lineHeight: '1'
                        }}>ℹ️</span>
                        <p style={{
                          fontSize: '14px',
                          color: '#666',
                          margin: 0,
                          lineHeight: '1.7'
                        }}>
                          이 분석은 AI가 제공하는 참고 정보입니다. 정확한 진단과 치료는 반드시 의료 전문가와 상담하세요.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      padding: '40px 20px',
                      color: '#9b9a97'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        background: '#f7f6f3',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 12px',
                        fontSize: '20px'
                      }}>
                        🔍
                      </div>
                      <p style={{ fontSize: '13px', margin: 0 }}>
                        분석을 시작하면 AI 리포트가 여기에 표시됩니다
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Detailed Records - 접기/펼치기 */}
              <div>
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📝</span>
                    상세 기록 ({analysis.symptoms.length}건)
                  </span>
                  <span style={{
                    transform: showDetails ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.2s'
                  }}>
                    ▼
                  </span>
                </button>

                {showDetails && (
                  <div style={{
                    marginTop: '12px',
                    maxHeight: '400px',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    {analysis.symptoms.map((symptom, idx) => (
                      <div key={idx} style={{
                        background: '#f8f9fa',
                        borderRadius: '10px',
                        padding: '14px',
                        border: '1px solid #e9ecef'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: symptom.details ? '10px' : 0
                        }}>
                          <span style={{
                            fontSize: '13px',
                            fontWeight: '600',
                            color: '#333'
                          }}>
                            {symptom.date} {symptom.symptomTime && `(${symptom.symptomTime.replace('AM', '오전').replace('PM', '오후')})`}
                          </span>
                          <div style={{
                            display: 'flex',
                            gap: '10px',
                            fontSize: '12px',
                            color: '#666'
                          }}>
                            <span>통증 <strong style={{ color: '#333' }}>{symptom.painLevel}</strong></span>
                            <span>약물 <strong style={{ color: symptom.medicationTaken ? '#4caf50' : '#999' }}>
                              {symptom.medicationTaken ? 'O' : 'X'}
                            </strong></span>
                          </div>
                        </div>
                        {symptom.details && (
                          <p style={{
                            fontSize: '12px',
                            color: '#666',
                            background: '#fff',
                            padding: '10px',
                            borderRadius: '6px',
                            lineHeight: '1.5',
                            margin: 0
                          }}>
                            {symptom.details}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisScreen;
