import { useState, useEffect } from 'react';
import { format, subMonths } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { getUserDiseases } from '../services/diseaseService';
import { getSymptomsByDateRange } from '../services/symptomService';
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
  const [loading, setLoading] = useState(false);

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

      // TODO: Phase 2에서 Claude API 연동하여 AI 분석 추가
    } else {
      alert('데이터 조회 실패: ' + result.error);
    }

    setLoading(false);
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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">AI 요약 분석</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">분석 설정</h2>

        <div className="space-y-4">
          {/* 질병 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              질병 선택
            </label>
            <select
              value={selectedDiseaseId}
              onChange={(e) => setSelectedDiseaseId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">질병을 선택하세요</option>
              {diseases.map((disease) => (
                <option key={disease.id} value={disease.id}>
                  {disease.diseaseName}
                </option>
              ))}
            </select>
          </div>

          {/* 기간 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              분석 기간
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setPeriodType('1month')}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    periodType === '1month'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  최근 1개월
                </button>
                <button
                  onClick={() => setPeriodType('3months')}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    periodType === '3months'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  최근 3개월
                </button>
                <button
                  onClick={() => setPeriodType('custom')}
                  className={`flex-1 py-2 px-4 rounded-md ${
                    periodType === 'custom'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  사용자 지정
                </button>
              </div>

              {periodType === 'custom' && (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">시작일</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">종료일</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '분석 중...' : '분석 시작'}
          </button>
        </div>
      </div>

      {/* 분석 결과 */}
      {analysis && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">분석 결과</h2>

          {analysis.count === 0 ? (
            <p className="text-gray-600">{analysis.message}</p>
          ) : (
            <div className="space-y-6">
              {/* 기본 통계 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">기본 통계</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">총 발생 횟수</p>
                    <p className="text-2xl font-bold text-blue-600">{analysis.count}회</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">평균 통증 강도</p>
                    <p className="text-2xl font-bold text-green-600">{analysis.avgPainLevel}/10</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">약물 복용률</p>
                    <p className="text-2xl font-bold text-purple-600">{analysis.medicationRate}%</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-md">
                    <p className="text-sm text-gray-600">주당 평균 발생</p>
                    <p className="text-2xl font-bold text-orange-600">{analysis.frequencyPerWeek}회</p>
                  </div>
                </div>
              </div>

              {/* 분석 기간 정보 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">분석 기간</h3>
                <p className="text-gray-700">
                  {analysis.startDate} ~ {analysis.endDate} ({analysis.totalDays}일)
                </p>
              </div>

              {/* 차트 섹션 */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">데이터 시각화</h3>

                {analysis.symptoms.length >= 2 && (
                  <PainLevelChart symptoms={analysis.symptoms} />
                )}

                {analysis.symptoms.length >= 3 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <FrequencyChart symptoms={analysis.symptoms} />
                    <MedicationChart symptoms={analysis.symptoms} />
                  </div>
                )}

                {analysis.symptoms.length < 2 && (
                  <div className="bg-gray-50 p-4 rounded-md text-center text-gray-600">
                    <p>차트를 표시하려면 최소 2개 이상의 증상 기록이 필요합니다.</p>
                  </div>
                )}
              </div>

              {/* AI 분석 (Phase 2에서 추가 예정) */}
              <div className="bg-yellow-50 p-4 rounded-md">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">AI 분석</h3>
                <p className="text-sm text-gray-700">
                  Phase 2에서 Claude API를 연동하여 다음 내용을 제공할 예정입니다:
                </p>
                <ul className="list-disc list-inside text-sm text-gray-600 mt-2 space-y-1">
                  <li>주요 발생 패턴 분석</li>
                  <li>예상 트리거 분석</li>
                  <li>환자가 알아두면 좋은 정보</li>
                  <li>의료진에게 전달하면 좋을 내용</li>
                </ul>
              </div>

              {/* 상세 기록 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">상세 기록</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {analysis.symptoms.map((symptom, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-md p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold text-gray-800">{symptom.date}</p>
                          <p className="text-sm text-gray-600">
                            통증: {symptom.painLevel}/10 | 약물: {symptom.medicationTaken ? '예' : '아니오'}
                          </p>
                        </div>
                      </div>
                      {symptom.details && (
                        <p className="text-sm text-gray-700 mt-2">{symptom.details}</p>
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
