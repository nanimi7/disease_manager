import { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../calendar-custom.css';
import { format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { getUserDiseases } from '../services/diseaseService';
import {
  getSymptomsByMonth,
  getSymptomsByDate,
  addSymptomRecord,
  updateSymptomRecord,
  deleteSymptomRecord
} from '../services/symptomService';
import BottomSheet from '../components/BottomSheet';

const CalendarScreen = () => {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [diseases, setDiseases] = useState([]);
  const [monthSymptoms, setMonthSymptoms] = useState([]);
  const [daySymptoms, setDaySymptoms] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // 증상 등록 폼
  const [selectedDiseaseId, setSelectedDiseaseId] = useState('');
  const [painLevel, setPainLevel] = useState(5);
  const [medicationTaken, setMedicationTaken] = useState(false);
  const [details, setDetails] = useState('');
  const [symptomTimePeriod, setSymptomTimePeriod] = useState(''); // 'AM' | 'PM' | ''
  const [symptomTimeHour, setSymptomTimeHour] = useState('');
  const [symptomTimeMinute, setSymptomTimeMinute] = useState('');

  // 수정 모드
  const [editingSymptom, setEditingSymptom] = useState(null);

  // 바텀시트 상태
  const [bottomSheetType, setBottomSheetType] = useState(null); // 'disease' | 'period' | 'hour' | 'minute'

  useEffect(() => {
    loadDiseases();
  }, [currentUser]);

  useEffect(() => {
    loadMonthSymptoms();
  }, [currentMonth, currentUser]);

  // 디버깅용
  useEffect(() => {
    console.log('캘린더 데이터:', {
      monthSymptoms: monthSymptoms.length,
      diseases: diseases.length,
      daySymptoms: daySymptoms.length
    });
  }, [monthSymptoms, diseases, daySymptoms]);

  useEffect(() => {
    loadDaySymptoms();
  }, [selectedDate, currentUser]);

  const loadDiseases = async () => {
    if (currentUser) {
      const result = await getUserDiseases(currentUser.uid);
      if (result.success) {
        setDiseases(result.diseases);
      }
    }
  };

  const loadMonthSymptoms = async () => {
    if (currentUser) {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const result = await getSymptomsByMonth(currentUser.uid, year, month);
      if (result.success) {
        setMonthSymptoms(result.symptoms);
      }
    }
  };

  const loadDaySymptoms = async () => {
    if (currentUser) {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const result = await getSymptomsByDate(currentUser.uid, dateStr);
      if (result.success) {
        setDaySymptoms(result.symptoms);
      }
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    // 날짜만 선택하고 모달은 열지 않음
  };

  const resetForm = () => {
    setSelectedDiseaseId('');
    setPainLevel(5);
    setMedicationTaken(false);
    setDetails('');
    setSymptomTimePeriod('');
    setSymptomTimeHour('');
    setSymptomTimeMinute('');
    setEditingSymptom(null);
  };

  // 시간 문자열 생성 (선택한 경우에만)
  const getSymptomTimeString = () => {
    if (!symptomTimePeriod || !symptomTimeHour || !symptomTimeMinute) {
      return null;
    }
    return `${symptomTimePeriod} ${symptomTimeHour}:${symptomTimeMinute}`;
  };

  const handleAddSymptom = async () => {
    if (!selectedDiseaseId) {
      alert('질병을 선택해주세요.');
      return;
    }

    if (details.length > 1000) {
      alert('상세 사유는 1,000자를 초과할 수 없습니다.');
      return;
    }

    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    const symptomTime = getSymptomTimeString();

    if (editingSymptom) {
      // 수정
      const result = await updateSymptomRecord(
        editingSymptom.id,
        painLevel,
        medicationTaken,
        details,
        symptomTime
      );
      if (result.success) {
        setShowModal(false);
        resetForm();
        loadDaySymptoms();
        loadMonthSymptoms();
      } else {
        alert('수정 실패: ' + result.error);
      }
    } else {
      // 추가
      const result = await addSymptomRecord(
        currentUser.uid,
        selectedDiseaseId,
        dateStr,
        painLevel,
        medicationTaken,
        details,
        symptomTime
      );
      if (result.success) {
        setShowModal(false);
        resetForm();
        loadDaySymptoms();
        loadMonthSymptoms();
      } else {
        alert('등록 실패: ' + result.error);
      }
    }
  };

  const handleEditSymptom = (symptom) => {
    setEditingSymptom(symptom);
    setSelectedDiseaseId(symptom.diseaseId);
    setPainLevel(symptom.painLevel);
    setMedicationTaken(symptom.medicationTaken);
    setDetails(symptom.details || '');
    // 시간 정보 파싱 (예: "AM 09:30")
    if (symptom.symptomTime) {
      const parts = symptom.symptomTime.split(' ');
      if (parts.length === 2) {
        setSymptomTimePeriod(parts[0]);
        const timeParts = parts[1].split(':');
        if (timeParts.length === 2) {
          setSymptomTimeHour(timeParts[0]);
          setSymptomTimeMinute(timeParts[1]);
        }
      }
    } else {
      setSymptomTimePeriod('');
      setSymptomTimeHour('');
      setSymptomTimeMinute('');
    }
  };

  const handleDeleteSymptom = async (symptomId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const result = await deleteSymptomRecord(symptomId);
      if (result.success) {
        loadDaySymptoms();
        loadMonthSymptoms();
      } else {
        alert('삭제 실패: ' + result.error);
      }
    }
  };

  // 파스텔톤 색상 팔레트
  const pastelColors = [
    { bg: '#A8D8EA', text: '#2E6B7E' }, // 하늘색
    { bg: '#FFB6C1', text: '#8B3A4A' }, // 핑크
    { bg: '#C3E6CB', text: '#3D6B4A' }, // 연두색
    { bg: '#F9E79F', text: '#7D6608' }, // 노란색
    { bg: '#D7BDE2', text: '#5B3A6B' }, // 라벤더
    { bg: '#F5CBA7', text: '#8B5A2B' }, // 살구색
    { bg: '#AED6F1', text: '#2471A3' }, // 연파랑
    { bg: '#FADBD8', text: '#943126' }, // 연빨강
    { bg: '#D5F5E3', text: '#1E8449' }, // 민트
    { bg: '#FCF3CF', text: '#9A7D0A' }, // 크림
  ];

  // 병명 기반으로 색상 선택 (같은 병명은 항상 같은 색상)
  const getDiseaseColor = (diseaseName) => {
    let hash = 0;
    for (let i = 0; i < diseaseName.length; i++) {
      hash = diseaseName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % pastelColors.length;
    return pastelColors[index];
  };

  const tileClassName = ({ date, view }) => {
    if (view === 'month') {
      // 일요일이면 'sunday' 클래스 추가
      if (date.getDay() === 0) {
        return 'sunday';
      }
    }
    return null;
  };

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd');
      const symptomsOnDate = monthSymptoms.filter(s => s.date === dateStr);

      // 오늘 날짜 체크
      const today = new Date();
      const isToday = date.getDate() === today.getDate() &&
                      date.getMonth() === today.getMonth() &&
                      date.getFullYear() === today.getFullYear();

      const hasSymptoms = symptomsOnDate.length > 0;

      // 해당 날짜의 질병별 입력 횟수 계산
      const dailyDiseaseCount = {};
      symptomsOnDate.forEach(symptom => {
        dailyDiseaseCount[symptom.diseaseId] = (dailyDiseaseCount[symptom.diseaseId] || 0) + 1;
      });

      // 질병별로 그룹화된 배열 생성
      const groupedDiseases = Object.keys(dailyDiseaseCount).map(diseaseId => ({
        diseaseId,
        count: dailyDiseaseCount[diseaseId]
      }));

      return (
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px'
        }}>
          {/* 오늘 날짜 레드닷 */}
          {isToday && (
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#e74c3c',
              marginBottom: '2px'
            }}></div>
          )}

          {/* 증상 뱃지 */}
          {hasSymptoms && groupedDiseases.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              alignItems: 'center',
              width: '100%',
              overflow: 'hidden'
            }}>
              {groupedDiseases.slice(0, 2).map(({ diseaseId, count }) => {
                const disease = diseases.find(d => d.id === diseaseId);
                if (!disease) return null;
                const color = getDiseaseColor(disease.diseaseName);
                return (
                  <span
                    key={diseaseId}
                    style={{
                      fontSize: '10px',
                      background: color.bg,
                      color: color.text,
                      padding: '3px 6px',
                      borderRadius: '10px',
                      whiteSpace: 'nowrap',
                      lineHeight: '1.2',
                      fontWeight: '600',
                      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)'
                    }}
                    title={`${disease.diseaseName} - 이 날 ${count}회 기록`}
                  >
                    {disease.diseaseName}/{count}
                  </span>
                );
              })}
              {groupedDiseases.length > 2 && (
                <span style={{
                  fontSize: '9px',
                  color: '#667eea',
                  fontWeight: '600'
                }}>
                  +{groupedDiseases.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const getDiseaseName = (diseaseId) => {
    const disease = diseases.find(d => d.id === diseaseId);
    return disease ? disease.diseaseName : '알 수 없음';
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

  const buttonSecondaryStyle = {
    padding: '10px 16px',
    background: '#f5f5f5',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    color: '#666'
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
          증상 캘린더
        </h2>
        <p style={{ fontSize: '14px', color: '#999' }}>
          날짜별로 증상을 기록하고 관리하세요
        </p>
      </div>

      {/* Calendar Card */}
      <div style={cardStyle}>
        <Calendar
          onChange={handleDateClick}
          value={selectedDate}
          onActiveStartDateChange={({ activeStartDate }) => setCurrentMonth(activeStartDate)}
          tileContent={tileContent}
          tileClassName={tileClassName}
          locale="ko-KR"
        />
      </div>

      {/* Selected Date Info & Symptoms */}
      <div style={cardStyle}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#333',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>📅</span>
            {format(selectedDate, 'yyyy년 MM월 dd일')}
          </h3>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            style={{
              padding: '8px 16px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + 증상 추가
          </button>
        </div>

        {/* Day Symptoms List */}
        {daySymptoms.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999'
          }}>
            <p style={{ fontSize: '14px', marginBottom: '8px' }}>
              등록된 증상이 없습니다
            </p>
            <p style={{ fontSize: '12px' }}>
              날짜를 선택하고 증상을 추가해보세요
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {daySymptoms.map((symptom) => (
              <div key={symptom.id} style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e9ecef'
              }}>
                <h4 style={{
                  fontSize: '15px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '12px'
                }}>
                  {getDiseaseName(symptom.diseaseId)}
                </h4>
                <div style={{ marginBottom: '12px' }}>
                  {symptom.symptomTime && (
                    <p style={{
                      fontSize: '13px',
                      color: '#666',
                      marginBottom: '4px'
                    }}>
                      발생 시간: <span style={{ fontWeight: '600', color: '#333' }}>
                        {symptom.symptomTime.replace('AM', '오전').replace('PM', '오후')}
                      </span>
                    </p>
                  )}
                  <p style={{
                    fontSize: '13px',
                    color: '#666',
                    marginBottom: '4px'
                  }}>
                    통증 강도: <span style={{ fontWeight: '600', color: '#333' }}>
                      {symptom.painLevel}
                      ({symptom.painLevel === 1 ? '거의 느껴지지 않음' :
                        symptom.painLevel === 2 ? '신경 쓰이는 정도' :
                        symptom.painLevel === 3 ? '불편함을 느낌' :
                        symptom.painLevel === 4 ? '일상에 약간 지장' :
                        symptom.painLevel === 5 ? '집중하기 어려움' :
                        symptom.painLevel === 6 ? '일상 활동에 지장' :
                        symptom.painLevel === 7 ? '많이 힘듦' :
                        symptom.painLevel === 8 ? '참기 어려움' :
                        symptom.painLevel === 9 ? '매우 고통스러움' : '견딜 수 없는 통증'})
                    </span>
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: '#666'
                  }}>
                    약물 복용: <span style={{
                      fontWeight: '600',
                      color: symptom.medicationTaken ? '#4caf50' : '#999'
                    }}>
                      {symptom.medicationTaken ? '예' : '아니오'}
                    </span>
                  </p>
                </div>
                {symptom.details && (
                  <p style={{
                    fontSize: '13px',
                    color: '#666',
                    background: '#fff',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    lineHeight: '1.5'
                  }}>
                    {symptom.details}
                  </p>
                )}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {
                      handleEditSymptom(symptom);
                      setShowModal(true);
                    }}
                    style={{
                      ...buttonSecondaryStyle,
                      flex: 1
                    }}
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteSymptom(symptom.id)}
                    style={{
                      ...buttonSecondaryStyle,
                      flex: 1,
                      background: '#fee',
                      border: '1px solid #fcc',
                      color: '#c33'
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '24px',
            maxWidth: '500px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '20px'
            }}>
              {editingSymptom ? '증상 수정' : '증상 등록'}
            </h2>

            {diseases.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <p style={{ color: '#999', marginBottom: '20px' }}>
                  먼저 질병을 등록해주세요
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  style={buttonSecondaryStyle}
                >
                  닫기
                </button>
              </div>
            ) : (
              <div>
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>질병명</label>
                  <button
                    type="button"
                    onClick={() => !editingSymptom && setBottomSheetType('disease')}
                    disabled={editingSymptom !== null}
                    style={{
                      ...inputStyle,
                      background: editingSymptom ? '#f8f8f8' : 'white',
                      color: selectedDiseaseId ? '#333' : '#999',
                      textAlign: 'left',
                      cursor: editingSymptom ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span>
                      {selectedDiseaseId
                        ? diseases.find(d => d.id === selectedDiseaseId)?.diseaseName
                        : '선택하세요'}
                    </span>
                    {!editingSymptom && <span style={{ color: '#999' }}>▼</span>}
                  </button>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>통증 강도</label>

                  {/* 1~10 버튼 그리드 */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(10, 1fr)',
                    gap: '4px',
                    marginBottom: '12px'
                  }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => {
                      const getBgColor = (l) => {
                        if (l <= 2) return '#4caf50';
                        if (l <= 4) return '#ffca28';
                        if (l <= 6) return '#ff9800';
                        if (l <= 8) return '#f44336';
                        return '#c2185b';
                      };
                      const isSelected = painLevel === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setPainLevel(level)}
                          style={{
                            padding: '10px 0',
                            border: isSelected ? `2px solid ${getBgColor(level)}` : '2px solid #e0e0e0',
                            borderRadius: '8px',
                            background: isSelected ? getBgColor(level) : '#f8f8f8',
                            color: isSelected ? 'white' : '#666',
                            fontSize: '14px',
                            fontWeight: isSelected ? '700' : '500',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>

                  {/* 선택한 강도 설명 */}
                  <div style={{
                    padding: '12px',
                    background: painLevel <= 2 ? '#e8f5e9' : painLevel <= 4 ? '#fff8e1' : painLevel <= 6 ? '#fff3e0' : painLevel <= 8 ? '#ffebee' : '#fce4ec',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: painLevel <= 2 ? '#2e7d32' : painLevel <= 4 ? '#f9a825' : painLevel <= 6 ? '#ef6c00' : painLevel <= 8 ? '#c62828' : '#ad1457',
                      marginBottom: '4px'
                    }}>
                      {painLevel <= 2 ? '경미한 통증' :
                       painLevel <= 4 ? '가벼운 통증' :
                       painLevel <= 6 ? '중간 통증' :
                       painLevel <= 8 ? '심한 통증' : '극심한 통증'}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: '#666'
                    }}>
                      {painLevel === 1 && '거의 느껴지지 않음'}
                      {painLevel === 2 && '신경 쓰이는 정도'}
                      {painLevel === 3 && '불편함을 느낌'}
                      {painLevel === 4 && '일상에 약간 지장'}
                      {painLevel === 5 && '집중하기 어려움'}
                      {painLevel === 6 && '일상 활동에 지장'}
                      {painLevel === 7 && '많이 힘듦'}
                      {painLevel === 8 && '참기 어려움'}
                      {painLevel === 9 && '매우 고통스러움'}
                      {painLevel === 10 && '견딜 수 없는 통증'}
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    background: '#f8f9fa',
                    borderRadius: '10px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={medicationTaken}
                      onChange={(e) => setMedicationTaken(e.target.checked)}
                      style={{
                        width: '18px',
                        height: '18px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      약물 복용함
                    </span>
                  </label>
                </div>

                {/* 증상 발생 시간 (선택) */}
                <div style={{ marginBottom: '16px' }}>
                  <label style={labelStyle}>
                    증상 발생 시간 <span style={{ color: '#999' }}>(선택)</span>
                  </label>

                  {/* 오전/오후 라디오버튼 */}
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '12px'
                  }}>
                    <label style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      border: `2px solid ${symptomTimePeriod === 'AM' ? '#667eea' : '#e0e0e0'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: symptomTimePeriod === 'AM' ? '#f0f4ff' : 'white',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="radio"
                        name="timePeriod"
                        value="AM"
                        checked={symptomTimePeriod === 'AM'}
                        onChange={(e) => setSymptomTimePeriod(e.target.value)}
                        style={{ marginRight: '8px' }}
                      />
                      <span style={{
                        fontSize: '15px',
                        fontWeight: symptomTimePeriod === 'AM' ? '600' : '400',
                        color: symptomTimePeriod === 'AM' ? '#667eea' : '#333'
                      }}>
                        오전
                      </span>
                    </label>
                    <label style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      padding: '12px 16px',
                      border: `2px solid ${symptomTimePeriod === 'PM' ? '#667eea' : '#e0e0e0'}`,
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: symptomTimePeriod === 'PM' ? '#f0f4ff' : 'white',
                      transition: 'all 0.2s'
                    }}>
                      <input
                        type="radio"
                        name="timePeriod"
                        value="PM"
                        checked={symptomTimePeriod === 'PM'}
                        onChange={(e) => setSymptomTimePeriod(e.target.value)}
                        style={{ marginRight: '8px' }}
                      />
                      <span style={{
                        fontSize: '15px',
                        fontWeight: symptomTimePeriod === 'PM' ? '600' : '400',
                        color: symptomTimePeriod === 'PM' ? '#667eea' : '#333'
                      }}>
                        오후
                      </span>
                    </label>
                  </div>

                  {/* 시:분 직접 입력 */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="2"
                      placeholder="시"
                      value={symptomTimeHour}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val === '' || (parseInt(val) >= 1 && parseInt(val) <= 12)) {
                          setSymptomTimeHour(val);
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value && e.target.value.length === 1) {
                          setSymptomTimeHour(e.target.value.padStart(2, '0'));
                        }
                      }}
                      style={{
                        ...inputStyle,
                        width: '60px',
                        textAlign: 'center'
                      }}
                    />
                    <span style={{ color: '#666', fontWeight: '600', fontSize: '18px' }}>:</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength="2"
                      placeholder="분"
                      value={symptomTimeMinute}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val === '' || (parseInt(val) >= 0 && parseInt(val) <= 59)) {
                          setSymptomTimeMinute(val);
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value && e.target.value.length === 1) {
                          setSymptomTimeMinute(e.target.value.padStart(2, '0'));
                        }
                      }}
                      style={{
                        ...inputStyle,
                        width: '60px',
                        textAlign: 'center'
                      }}
                    />
                    {symptomTimePeriod && (
                      <button
                        type="button"
                        onClick={() => {
                          setSymptomTimePeriod('');
                          setSymptomTimeHour('');
                          setSymptomTimeMinute('');
                        }}
                        style={{
                          padding: '8px 12px',
                          background: '#f5f5f5',
                          border: '1px solid #e0e0e0',
                          borderRadius: '8px',
                          fontSize: '13px',
                          color: '#666',
                          cursor: 'pointer'
                        }}
                      >
                        초기화
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>
                    상세 사유 <span style={{ color: '#999' }}>(선택, {details.length}/1,000자)</span>
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    maxLength="1000"
                    placeholder="상세 사유를 입력해주세요. AI 분석 시 참고자료로 활용합니다."
                    rows="4"
                    style={{
                      ...inputStyle,
                      resize: 'vertical',
                      minHeight: '100px'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#667eea'}
                    onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={handleAddSymptom}
                    style={{
                      ...buttonPrimaryStyle,
                      flex: 1
                    }}
                  >
                    {editingSymptom ? '수정' : '등록'}
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    style={{
                      ...buttonSecondaryStyle,
                      flex: 1
                    }}
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 바텀시트들 */}
      <BottomSheet
        isOpen={bottomSheetType === 'disease'}
        onClose={() => setBottomSheetType(null)}
        title="질병 선택"
        options={diseases.map(d => ({ value: d.id, label: d.diseaseName }))}
        selectedValue={selectedDiseaseId}
        onSelect={(value) => setSelectedDiseaseId(value)}
      />

    </div>
  );
};

export default CalendarScreen;
