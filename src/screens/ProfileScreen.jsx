import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserData } from '../services/authService';
import { getUserDiseases, addDisease, updateDisease, deleteDisease } from '../services/diseaseService';

const ProfileScreen = () => {
  const { currentUser, userInfo, setUserInfo } = useAuth();
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState('');
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 질병 추가 폼
  const [showAddDisease, setShowAddDisease] = useState(false);
  const [newDiseaseName, setNewDiseaseName] = useState('');
  const [newMedication, setNewMedication] = useState('');

  // 질병 수정
  const [editingDisease, setEditingDisease] = useState(null);
  const [editDiseaseName, setEditDiseaseName] = useState('');
  const [editMedication, setEditMedication] = useState('');

  useEffect(() => {
    if (userInfo) {
      setNickname(userInfo.nickname || '');
      setAge(userInfo.age?.toString() || '');
    }
    loadDiseases();
  }, [userInfo]);

  const loadDiseases = async () => {
    if (currentUser) {
      const result = await getUserDiseases(currentUser.uid);
      if (result.success) {
        setDiseases(result.diseases);
      }
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage('');

    const result = await updateUserData(currentUser.uid, {
      nickname,
      age: parseInt(age)
    });

    if (result.success) {
      setUserInfo({ ...userInfo, nickname, age: parseInt(age) });
      setMessage('프로필이 저장되었습니다.');
    } else {
      setMessage('저장 실패: ' + result.error);
    }

    setLoading(false);
  };

  const handleAddDisease = async () => {
    if (!newDiseaseName.trim()) {
      alert('질병명을 입력해주세요.');
      return;
    }

    const result = await addDisease(currentUser.uid, newDiseaseName, newMedication);
    if (result.success) {
      setNewDiseaseName('');
      setNewMedication('');
      setShowAddDisease(false);
      loadDiseases();
    } else {
      alert('질병 추가 실패: ' + result.error);
    }
  };

  const handleEditDisease = (disease) => {
    setEditingDisease(disease.id);
    setEditDiseaseName(disease.diseaseName);
    setEditMedication(disease.medication || '');
  };

  const handleSaveEdit = async (diseaseId) => {
    const result = await updateDisease(diseaseId, editDiseaseName, editMedication);
    if (result.success) {
      setEditingDisease(null);
      loadDiseases();
    } else {
      alert('수정 실패: ' + result.error);
    }
  };

  const handleDeleteDisease = async (diseaseId) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      const result = await deleteDisease(diseaseId);
      if (result.success) {
        loadDiseases();
      } else {
        alert('삭제 실패: ' + result.error);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">사용자 정보 관리</h1>

      {/* 사용자 정보 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">개인 정보</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              type="text"
              value={currentUser?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              닉네임
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="닉네임"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              나이
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="나이"
              min="1"
              max="150"
            />
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? '저장 중...' : '프로필 저장'}
          </button>
          {message && (
            <p className="text-sm text-center text-green-600">{message}</p>
          )}
        </div>
      </div>

      {/* 질병 관리 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-700">보유 질병</h2>
          <button
            onClick={() => setShowAddDisease(!showAddDisease)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
          >
            {showAddDisease ? '취소' : '+ 질병 추가'}
          </button>
        </div>

        {/* 질병 추가 폼 */}
        {showAddDisease && (
          <div className="mb-4 p-4 bg-gray-50 rounded-md">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  질병명
                </label>
                <input
                  type="text"
                  value={newDiseaseName}
                  onChange={(e) => setNewDiseaseName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 편두통"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  처방 약물 정보
                </label>
                <input
                  type="text"
                  value={newMedication}
                  onChange={(e) => setNewMedication(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="예: 타이레놀 500mg"
                />
              </div>
              <button
                onClick={handleAddDisease}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                추가
              </button>
            </div>
          </div>
        )}

        {/* 질병 목록 */}
        <div className="space-y-3">
          {diseases.length === 0 ? (
            <p className="text-gray-500 text-center py-4">등록된 질병이 없습니다.</p>
          ) : (
            diseases.map((disease) => (
              <div key={disease.id} className="border border-gray-200 rounded-md p-4">
                {editingDisease === disease.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editDiseaseName}
                      onChange={(e) => setEditDiseaseName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <input
                      type="text"
                      value={editMedication}
                      onChange={(e) => setEditMedication(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="처방 약물 정보"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(disease.id)}
                        className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingDisease(null)}
                        className="flex-1 py-2 px-4 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold text-gray-800">{disease.diseaseName}</h3>
                    {disease.medication && (
                      <p className="text-sm text-gray-600 mt-1">약물: {disease.medication}</p>
                    )}
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleEditDisease(disease)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteDisease(disease.id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
