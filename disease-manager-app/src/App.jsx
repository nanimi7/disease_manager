import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import ProfileScreen from './screens/ProfileScreen';
import CalendarScreen from './screens/CalendarScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import { logOut } from './services/authService';

function MainApp() {
  const { currentUser } = useAuth();
  const [showSignup, setShowSignup] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // PWA 설치 가능 여부 및 standalone 모드 체크
  useEffect(() => {
    // standalone 모드(PWA)인지 체크
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone
      || document.referrer.includes('android-app://');

    if (isStandalone) {
      setShowInstallBanner(false);
      return;
    }

    // 이미 닫기를 누른 경우 체크
    const dismissed = sessionStorage.getItem('pwa-banner-dismissed');
    if (dismissed) {
      setShowInstallBanner(false);
      return;
    }

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // iOS Safari에서는 beforeinstallprompt가 발생하지 않으므로 별도 처리
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    if (isIOS && isSafari && !isStandalone) {
      setShowInstallBanner(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // iOS Safari의 경우 안내 메시지
      alert('Safari 하단의 공유 버튼을 누른 후 "홈 화면에 추가"를 선택하세요.');
    }
  };

  const handleDismissBanner = () => {
    setShowInstallBanner(false);
    sessionStorage.setItem('pwa-banner-dismissed', 'true');
  };

  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      await logOut();
    }
  };

  if (!currentUser) {
    return showSignup ? (
      <Signup onToggleForm={() => setShowSignup(false)} />
    ) : (
      <Login onToggleForm={() => setShowSignup(true)} />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '16px 20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/app-icon.png"
              alt="Disease Manager"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px'
              }}
            />
            <div>
              <h1 style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#333',
                margin: 0
              }}>
                Disease Manager
              </h1>
              <p style={{
                fontSize: '12px',
                color: '#999',
                margin: 0
              }}>
                {currentUser?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: '#f5f5f5',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              color: '#666',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            로그아웃
          </button>
        </div>
      </header>

      {/* PWA Install Banner */}
      {showInstallBanner && (
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '16px 20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flex: 1
            }}>
              <img
                src="/app-icon.png"
                alt="App Icon"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px'
                }}
              />
              <div>
                <p style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'white',
                  margin: 0
                }}>
                  앱으로 더 편리하게!
                </p>
                <p style={{
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.85)',
                  margin: '2px 0 0 0'
                }}>
                  홈 화면에 추가하고 빠르게 접속하세요
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button
                onClick={handleInstallClick}
                style={{
                  padding: '8px 14px',
                  background: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#667eea',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                설치
              </button>
              <button
                onClick={handleDismissBanner}
                style={{
                  padding: '8px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <main style={{
        flex: 1,
        overflow: 'auto',
        paddingBottom: '80px'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          padding: '20px'
        }}>
          {activeTab === 'profile' && <ProfileScreen />}
          {activeTab === 'calendar' && <CalendarScreen />}
          {activeTab === 'analysis' && <AnalysisScreen />}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'white',
        borderTop: '1px solid #eef2f7',
        padding: '8px 0 12px',
        boxShadow: '0 -4px 20px rgba(102, 126, 234, 0.08)'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-around',
          padding: '0 16px'
        }}>
          {[
            { id: 'profile', label: '프로필', icon: (active) => (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#667eea' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )},
            { id: 'calendar', label: '캘린더', icon: (active) => (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#667eea' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            )},
            { id: 'analysis', label: '분석', icon: (active) => (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? '#667eea' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            )}
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 12px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
              >
                {isActive && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '32px',
                    height: '3px',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '0 0 3px 3px'
                  }} />
                )}
                {tab.icon(isActive)}
                <span style={{
                  fontSize: '11px',
                  fontWeight: isActive ? '600' : '500',
                  color: isActive ? '#667eea' : '#9ca3af',
                  letterSpacing: '-0.2px'
                }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
