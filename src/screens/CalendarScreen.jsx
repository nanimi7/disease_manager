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

  // 수정 모드
  const [editingSymptom, setEditingSymptom] = useState(null);

  useEffect(() => {
    loadDiseases();
  }, [currentUser]);

  useEffect(() => {
    loadMonthSymptoms();
  }, [currentMonth, currentUser]);

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
    setShowModal(true);
    resetForm();
  };

  const resetForm = () => {
    setSelectedDiseaseId('');
    setPainLevel(5);
    setMedicationTaken(false);
    setDetails('');
    setEditingSymptom(null);
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

    if (editingSymptom) {
      // 수정
      const result = await updateSymptomRecord(
        editingSymptom.id,
        painLevel,
        medicationTaken,
        details
      );
      if (result.success) {
        loadDaySymptoms();
        loadMonthSymptoms();
        resetForm();
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
        details
      );
      if (result.success) {
        loadDaySymptoms();
        loadMonthSymptoms();
        resetForm();
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
    setDetails(symptom.details);
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

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const dateStr = format(date, 'yyyy-MM-dd');
      const symptomsOnDate = monthSymptoms.filter(s => s.date === dateStr);

      if (symptomsOnDate.length > 0) {
        return (
          <div className="flex flex-wrap gap-1 justify-center mt-1">
            {symptomsOnDate.map((symptom, idx) => {
              const disease = diseases.find(d => d.id === symptom.diseaseId);
              return (
                <span
                  key={idx}
                  className="text-xs bg-blue-500 text-white px-1 rounded"
                  title={disease?.diseaseName}
                >
                  {disease?.diseaseName.substring(0, 3)}
                </span>
              );
            })}
          </div>
        );
      }
    }
    return null;
  };

  const getDiseaseName = (diseaseId) => {
    const disease = diseases.find(d => d.id === diseaseId);
    return disease ? disease.diseaseName : '알 수 없음';
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-800">증상 캘린더</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* 캘린더 */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
          <Calendar
            onChange={handleDateClick}
            value={selectedDate}
            onActiveStartDateChange={({ activeStartDate }) => setCurrentMonth(activeStartDate)}
            tileContent={tileContent}
            className="w-full border-none"
          />
        </div>

        {/* 선택한 날짜의 증상 목록 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">
            {format(selectedDate, 'yyyy년 MM월 dd일')}
          </h2>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="w-full mb-4 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + 증상 추가
          </button>

          <div className="space-y-3">
            {daySymptoms.length === 0 ? (
              <p className="text-gray-500 text-sm">등록된 증상이 없습니다.</p>
            ) : (
              daySymptoms.map((symptom) => (
                <div key={symptom.id} className="border border-gray-200 rounded-md p-3">
                  <h3 className="font-semibold text-gray-800">
                    {getDiseaseName(symptom.diseaseId)}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    통증 강도: {symptom.painLevel}/10
                  </p>
                  <p className="text-sm text-gray-600">
                    약물 복용: {symptom.medicationTaken ? '예' : '아니오'}
                  </p>
                  {symptom.details && (
                    <p className="text-sm text-gray-600 mt-2">{symptom.details}</p>
                  )}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        handleEditSymptom(symptom);
                        setShowModal(true);
                      }}
                      className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteSymptom(symptom.id)}
                      className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 증상 등록/수정 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              {editingSymptom ? '증상 수정' : '증상 등록'}
            </h2>

            {diseases.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">먼저 질병을 등록해주세요.</p>
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                >
                  닫기
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    질병명
                  </label>
                  <select
                    value={selectedDiseaseId}
                    onChange={(e) => setSelectedDiseaseId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={editingSymptom !== null}
                  >
                    <option value="">선택하세요</option>
                    {diseases.map((disease) => (
                      <option key={disease.id} value={disease.id}>
                        {disease.diseaseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    통증 강도: {painLevel}/10
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={painLevel}
                    onChange={(e) => setPainLevel(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 (약함)</span>
                    <span>10 (매우 강함)</span>
                  </div>
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={medicationTaken}
                      onChange={(e) => setMedicationTaken(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium text-gray-700">약물 복용함</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상세 사유 ({details.length}/1,000자)
                  </label>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows="4"
                    maxLength="1000"
                    placeholder="증상에 대한 상세 설명을 입력하세요..."
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleAddSymptom}
                    className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingSymptom ? '수정' : '등록'}
                  </button>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 py-2 px-4 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarScreen;
