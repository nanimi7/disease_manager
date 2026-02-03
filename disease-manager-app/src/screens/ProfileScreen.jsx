import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { updateUserData } from '../services/authService';
import { getUserDiseases, addDisease, updateDisease, deleteDisease } from '../services/diseaseService';

const ProfileScreen = () => {
  const { currentUser, userInfo, setUserInfo } = useAuth();
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('');
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // 사용자 정보가 이미 입력되어 있는지 확인
  const hasUserInfo = userInfo?.birthdate && userInfo?.gender;

  const [showAddDisease, setShowAddDisease] = useState(false);
  const [newDiseaseName, setNewDiseaseName] = useState('');
  const [newMedication, setNewMedication] = useState('');

  const [editingDisease, setEditingDisease] = useState(null);
  const [editDiseaseName, setEditDiseaseName] = useState('');
  const [editMedication, setEditMedication] = useState('');

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

  const loadDiseases = async () => {
    if (currentUser) {
      const result = await getUserDiseases(currentUser.uid);
      if (result.success) {
        setDiseases(result.diseases);
      }
    }
  };

  useEffect(() => {
    if (userInfo) {
      setBirthdate(userInfo.birthdate || '');
      setGender(userInfo.gender || '');
    }
    loadDiseases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  const handleSaveProfile = async () => {
    // 필수 항목 검증
    if (!birthdate) {
      setMessage('생년월일을 입력해주세요.');
      return;
    }

    if (!gender) {
      setMessage('성별을 선택해주세요.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const result = await updateUserData(currentUser.uid, {
        birthdate,
        gender
      });

      if (result.success) {
        setUserInfo({ ...userInfo, birthdate, gender });
        setMessage('프로필이 저장되었습니다.');
        setIsEditingProfile(false);
      } else {
        setMessage('저장 실패: ' + result.error);
      }
    } catch (error) {
      console.error('Profile save error:', error);
      setMessage('저장 중 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
    } finally {
      setLoading(false);
    }
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
          사용자 정보 관리
        </h2>
        <p style={{ fontSize: '14px', color: '#999' }}>
          개인 정보와 질병 정보를 관리하세요
        </p>
      </div>

      {/* Personal Info Card */}
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
            <span>👤</span>
            개인 정보
          </h3>
          {hasUserInfo && !isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
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
              수정
            </button>
          )}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>이메일</label>
          <input
            type="text"
            value={currentUser?.email || ''}
            disabled
            style={{
              ...inputStyle,
              background: '#f8f8f8',
              color: '#999'
            }}
          />
        </div>

        {/* 정보가 있고 편집 모드가 아닐 때: 읽기 전용 표시 */}
        {hasUserInfo && !isEditingProfile ? (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>생년월일</label>
              <div style={{
                padding: '12px 16px',
                background: '#f8f8f8',
                borderRadius: '10px',
                border: '2px solid #e0e0e0',
                fontSize: '15px',
                color: '#333'
              }}>
                {userInfo.birthdate}
              </div>
              <div style={{
                marginTop: '8px',
                padding: '12px',
                background: '#f0f7ff',
                borderRadius: '8px',
                border: '1px solid #d0e5ff'
              }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#333',
                  marginBottom: '4px'
                }}>
                  현재 나이: {calculateAge(userInfo.birthdate)}세
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#666'
                }}>
                  (질병패턴 분석시 연령정보를 참고할 수 있습니다)
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>성별</label>
              <div style={{
                padding: '12px 16px',
                background: '#f8f8f8',
                borderRadius: '10px',
                border: '2px solid #e0e0e0',
                fontSize: '15px',
                color: '#333'
              }}>
                {userInfo.gender === 'male' ? '남성' : '여성'}
              </div>
            </div>
          </>
        ) : (
          /* 정보가 없거나 편집 모드일 때: 입력 가능 */
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>
                생년월일 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
              {birthdate && (
                <div style={{
                  marginTop: '8px',
                  padding: '12px',
                  background: '#f0f7ff',
                  borderRadius: '8px',
                  border: '1px solid #d0e5ff'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#333',
                    marginBottom: '4px'
                  }}>
                    현재 나이: {calculateAge(birthdate)}세
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    (질병패턴 분석시 연령정보를 참고할 수 있습니다)
                  </div>
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>
                성별 <span style={{ color: '#e74c3c' }}>*</span>
              </label>
              <div style={{
                display: 'flex',
                gap: '12px',
                marginTop: '8px'
              }}>
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  border: `2px solid ${gender === 'male' ? '#667eea' : '#e0e0e0'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: gender === 'male' ? '#f0f4ff' : 'white',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={gender === 'male'}
                    onChange={(e) => setGender(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{
                    fontSize: '15px',
                    fontWeight: gender === 'male' ? '600' : '400',
                    color: gender === 'male' ? '#667eea' : '#333'
                  }}>
                    남성
                  </span>
                </label>
                <label style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  border: `2px solid ${gender === 'female' ? '#667eea' : '#e0e0e0'}`,
                  borderRadius: '10px',
                  cursor: 'pointer',
                  background: gender === 'female' ? '#f0f4ff' : 'white',
                  transition: 'all 0.2s'
                }}>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={gender === 'female'}
                    onChange={(e) => setGender(e.target.value)}
                    style={{ marginRight: '8px' }}
                  />
                  <span style={{
                    fontSize: '15px',
                    fontWeight: gender === 'female' ? '600' : '400',
                    color: gender === 'female' ? '#667eea' : '#333'
                  }}>
                    여성
                  </span>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleSaveProfile}
                disabled={loading}
                style={{
                  ...buttonPrimaryStyle,
                  flex: 1,
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '저장 중...' : '프로필 저장'}
              </button>
              {isEditingProfile && (
                <button
                  onClick={() => {
                    setIsEditingProfile(false);
                    setBirthdate(userInfo?.birthdate || '');
                    setGender(userInfo?.gender || '');
                    setMessage('');
                  }}
                  style={{
                    ...buttonSecondaryStyle,
                    flex: 1
                  }}
                >
                  취소
                </button>
              )}
            </div>
          </>
        )}

        {message && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: message.includes('실패') || message.includes('입력') || message.includes('선택') ? '#fee' : '#e8f5e9',
            border: `1px solid ${message.includes('실패') || message.includes('입력') || message.includes('선택') ? '#fcc' : '#a5d6a7'}`,
            borderRadius: '8px',
            color: message.includes('실패') || message.includes('입력') || message.includes('선택') ? '#c33' : '#2e7d32',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {message}
          </div>
        )}
      </div>

      {/* Diseases Card */}
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
            <span>💊</span>
            보유 질병
          </h3>
          <button
            onClick={() => {
              if (!hasUserInfo) {
                alert('질병을 추가하려면 먼저 프로필 정보(생년월일, 성별)를 입력해주세요.');
                return;
              }
              setShowAddDisease(!showAddDisease);
            }}
            style={{
              padding: '8px 16px',
              background: showAddDisease ? '#f5f5f5' : !hasUserInfo ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: showAddDisease ? '#666' : 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: !hasUserInfo ? 'not-allowed' : 'pointer',
              opacity: !hasUserInfo ? 0.7 : 1
            }}
          >
            {showAddDisease ? '취소' : '+ 추가'}
          </button>
        </div>

        {/* Add Disease Form */}
        {showAddDisease && (
          <div style={{
            background: '#f8f9fa',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px'
          }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>질병명</label>
              <input
                type="text"
                value={newDiseaseName}
                onChange={(e) => setNewDiseaseName(e.target.value)}
                placeholder="예: 편두통"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>처방 약물 정보</label>
              <input
                type="text"
                value={newMedication}
                onChange={(e) => setNewMedication(e.target.value)}
                placeholder="예: 타이레놀 500mg"
                style={inputStyle}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>
            <button onClick={handleAddDisease} style={buttonPrimaryStyle}>
              추가하기
            </button>
          </div>
        )}

        {/* Diseases List */}
        {!hasUserInfo && (
          <div style={{
            background: '#fff3e0',
            border: '1px solid #ffcc80',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <p style={{
              fontSize: '13px',
              color: '#e65100',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              질병을 등록하려면 먼저 프로필 정보를 입력해주세요.
            </p>
          </div>
        )}

        {diseases.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#999'
          }}>
            <p style={{ fontSize: '14px', marginBottom: '8px' }}>
              등록된 질병이 없습니다
            </p>
            <p style={{ fontSize: '12px' }}>
              {hasUserInfo ? '증상을 추적하려면 질병을 먼저 등록해주세요' : '프로필 정보 입력 후 질병을 등록할 수 있습니다'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {diseases.map((disease) => (
              <div key={disease.id} style={{
                background: '#f8f9fa',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid #e9ecef'
              }}>
                {editingDisease === disease.id ? (
                  <div>
                    <div style={{ marginBottom: '12px' }}>
                      <input
                        type="text"
                        value={editDiseaseName}
                        onChange={(e) => setEditDiseaseName(e.target.value)}
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <input
                        type="text"
                        value={editMedication}
                        onChange={(e) => setEditMedication(e.target.value)}
                        placeholder="처방 약물 정보"
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = '#667eea'}
                        onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleSaveEdit(disease.id)}
                        style={{
                          ...buttonPrimaryStyle,
                          flex: 1
                        }}
                      >
                        저장
                      </button>
                      <button
                        onClick={() => setEditingDisease(null)}
                        style={{
                          ...buttonSecondaryStyle,
                          flex: 1
                        }}
                      >
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '8px'
                    }}>
                      {disease.diseaseName}
                    </h4>
                    {disease.medication && (
                      <p style={{
                        fontSize: '13px',
                        color: '#666',
                        marginBottom: '12px'
                      }}>
                        💊 {disease.medication}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleEditDisease(disease)}
                        style={{
                          ...buttonSecondaryStyle,
                          flex: 1
                        }}
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDeleteDisease(disease.id)}
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
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileScreen;
