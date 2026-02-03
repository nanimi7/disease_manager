import { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { getUserDiseases } from '../services/diseaseService';
import { getSymptomsByDateRange } from '../services/symptomService';
import { analyzeSymptoms } from '../services/aiService';
import PainLevelChart from '../components/PainLevelChart';
import FrequencyChart from '../components/FrequencyChart';
import MedicationChart from '../components/MedicationChart';

const AnalysisScreen = () => {
  const { currentUser, userInfo } = useAuth();
  const [diseases, setDiseases] = useState([]);
  const [selectedDiseaseId, setSelectedDiseaseId] = useState('');
  const [periodType, setPeriodType] = useState('1month'); // 1month, 3months, custom
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

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

    // 증상 데이터 가져오기
    const result = await getSymptomsByDateRange(
      currentUser.uid,
      start,
      end,
      selectedDiseaseId
    );

    if (result.success) {
      // 기본 통계 계산
      const symptoms = result.symptoms;
      const basicAnalysis = calculateBasicStats(symptoms, start, end);
      setAnalysis(basicAnalysis);
      setAiAnalysis(null);

      // AI 분석 호출 (증상이 있는 경우에만)
      if (symptoms.length > 0) {
        setAiLoading(true);

        // 사용자 정보 준비
        const age = userInfo?.birthdate ? calculateAge(userInfo.birthdate) : null;
        const userInfoForAI = {
          age,
          gender: userInfo?.gender
        };

        // 질병 정보 준비
        const selectedDisease = diseases.find(d => d.id === selectedDiseaseId);
        const diseaseInfoForAI = {
          diseaseName: selectedDisease?.diseaseName,
          medication: selectedDisease?.medication
        };

        // 기간 정보 준비
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

  // 생년월일로부터 나이 계산
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
        medicationRate: 0,
        message: '해당 기간에 기록된 증상이 없습니다.'
      };
    }

    const count = symptoms.length;
    const totalPainLevel = symptoms.reduce((sum, s) => sum + s.painLevel, 0);
    const avgPainLevel = (totalPainLevel / count).toFixed(1);
    const medicationCount = symptoms.filter(s => s.medicationTaken).length;
    const medicationRate = ((medicationCount / count) * 100).toFixed(1);

    // 날짜별 발생 빈도 계산
    const dateCount = {};
    symptoms.forEach(s => {
      const date = s.date;
      dateCount[date] = (dateCount[date] || 0) + 1;
    });

    const days = Object.keys(dateCount).length;
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    const totalDays = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;
    const frequencyPerWeek = ((days / totalDays) * 7).toFixed(1);

    return {
      count,
      avgPainLevel,
      medicationRate,
      frequencyPerWeek,
      totalDays,
      startDate,
      endDate,
      symptoms
    };
  };

  const getDiseaseName = (diseaseId) => {
    const disease = diseases.find(d => d.id === diseaseId);
    return disease ? disease.diseaseName : '';
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
    borderRadius: '12px'
  });

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
                  style={{ ...inputStyle, width: '100%' }}
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
                  style={{ ...inputStyle, width: '100%' }}
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
              {/* Basic Statistics */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '12px'
                }}>
                  기본 통계
                </h4>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px'
                }}>
                  <div style={statCardStyle('#e3f2fd', '#90caf9')}>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      총 발생 횟수
                    </p>
                    <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#1976d2' }}>
                      {analysis.count}회
                    </p>
                  </div>
                  <div style={statCardStyle('#e8f5e9', '#a5d6a7')}>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      평균 통증 강도
                    </p>
                    <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#388e3c' }}>
                      {analysis.avgPainLevel}/10
                    </p>
                  </div>
                  <div style={statCardStyle('#f3e5f5', '#ce93d8')}>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      약물 복용률
                    </p>
                    <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#7b1fa2' }}>
                      {analysis.medicationRate}%
                    </p>
                  </div>
                  <div style={statCardStyle('#fff3e0', '#ffb74d')}>
                    <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                      주당 평균 발생
                    </p>
                    <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#f57c00' }}>
                      {analysis.frequencyPerWeek}회
                    </p>
                  </div>
                </div>
              </div>

              {/* Analysis Period */}
              <div style={{
                background: '#f8f9fa',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #e9ecef',
                marginBottom: '24px'
              }}>
                <h4 style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '8px'
                }}>
                  📅 분석 기간
                </h4>
                <p style={{ fontSize: '13px', color: '#666' }}>
                  {analysis.startDate} ~ {analysis.endDate} <span style={{ fontWeight: '600', color: '#333' }}>({analysis.totalDays}일)</span>
                </p>
              </div>

              {/* Charts Section */}
              <div style={{ marginBottom: '24px' }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '12px'
                }}>
                  📊 데이터 시각화
                </h4>

                {analysis.symptoms.length >= 2 ? (
                  <div>
                    <PainLevelChart symptoms={analysis.symptoms} />
                    {analysis.symptoms.length >= 3 && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr',
                        gap: '16px',
                        marginTop: '16px'
                      }}>
                        <FrequencyChart symptoms={analysis.symptoms} />
                        <MedicationChart symptoms={analysis.symptoms} />
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{
                    background: '#f8f9fa',
                    border: '1px solid #e9ecef',
                    padding: '24px',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}>
                    <p style={{ fontSize: '13px', color: '#999' }}>
                      차트를 표시하려면 최소 2개 이상의 증상 기록이 필요합니다
                    </p>
                  </div>
                )}
              </div>

              {/* AI Analysis */}
              <div style={{
                background: aiAnalysis ? '#f0f7ff' : '#fff9e6',
                border: `1px solid ${aiAnalysis ? '#90caf9' : '#ffe082'}`,
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>🤖</span>
                  AI 분석 결과
                </h4>

                {aiLoading ? (
                  <div style={{
                    textAlign: 'center',
                    padding: '40px 20px'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      border: '4px solid #e0e0e0',
                      borderTop: '4px solid #667eea',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                      margin: '0 auto 16px'
                    }} />
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      AI가 증상 데이터를 분석하고 있습니다...
                    </p>
                    <style>{`
                      @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                      }
                    `}</style>
                  </div>
                ) : aiAnalysis ? (
                  <div style={{
                    fontSize: '14px',
                    color: '#333',
                    lineHeight: '1.8',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {aiAnalysis.split('###').map((section, idx) => {
                      if (idx === 0) return null;
                      const lines = section.trim().split('\n');
                      const title = lines[0]?.trim();
                      const content = lines.slice(1).join('\n').trim();

                      return (
                        <div key={idx} style={{
                          marginBottom: '20px',
                          padding: '16px',
                          background: 'white',
                          borderRadius: '10px',
                          border: '1px solid #e0e8f0'
                        }}>
                          <h5 style={{
                            fontSize: '15px',
                            fontWeight: '600',
                            color: '#1976d2',
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            {title.includes('심각도') && '📊'}
                            {title.includes('패턴') && '📈'}
                            {title.includes('주의사항') && '⚠️'}
                            {title.includes('의사') && '👨‍⚕️'}
                            {title.includes('권고') && '💡'}
                            {title}
                          </h5>
                          <div style={{
                            fontSize: '13px',
                            color: '#555',
                            lineHeight: '1.7'
                          }}>
                            {content}
                          </div>
                        </div>
                      );
                    })}

                    <div style={{
                      marginTop: '16px',
                      padding: '12px',
                      background: '#fff3e0',
                      borderRadius: '8px',
                      border: '1px solid #ffcc80'
                    }}>
                      <p style={{
                        fontSize: '12px',
                        color: '#e65100',
                        margin: 0,
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px'
                      }}>
                        <span style={{ flexShrink: 0 }}>⚠️</span>
                        <span>이 분석은 AI가 제공하는 참고 정보이며, 정확한 진단과 치료는 반드시 의료 전문가와 상담하세요.</span>
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    padding: '20px',
                    color: '#999'
                  }}>
                    <p style={{ fontSize: '13px' }}>
                      AI 분석 결과가 여기에 표시됩니다.
                    </p>
                  </div>
                )}
              </div>

              {/* Detailed Records */}
              <div>
                <h4 style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '12px'
                }}>
                  📝 상세 기록
                </h4>
                <div style={{
                  maxHeight: '400px',
                  overflow: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {analysis.symptoms.map((symptom, idx) => (
                    <div key={idx} style={{
                      background: '#f8f9fa',
                      borderRadius: '12px',
                      padding: '16px',
                      border: '1px solid #e9ecef'
                    }}>
                      <div style={{ marginBottom: '8px' }}>
                        <p style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#333',
                          marginBottom: '8px'
                        }}>
                          {symptom.date}
                        </p>
                        <div style={{
                          display: 'flex',
                          gap: '12px',
                          fontSize: '13px',
                          color: '#666'
                        }}>
                          <span>
                            통증: <span style={{ fontWeight: '600', color: '#333' }}>{symptom.painLevel}/10</span>
                          </span>
                          <span>
                            약물: <span style={{
                              fontWeight: '600',
                              color: symptom.medicationTaken ? '#4caf50' : '#999'
                            }}>
                              {symptom.medicationTaken ? '예' : '아니오'}
                            </span>
                          </span>
                        </div>
                      </div>
                      {symptom.details && (
                        <p style={{
                          fontSize: '13px',
                          color: '#666',
                          background: '#fff',
                          padding: '12px',
                          borderRadius: '8px',
                          lineHeight: '1.5',
                          margin: 0
                        }}>
                          {symptom.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnalysisScreen;
