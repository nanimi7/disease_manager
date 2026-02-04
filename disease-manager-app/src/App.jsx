import { useState } from 'react';
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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'url(#gradient)' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" />
                    <stop offset="100%" stopColor="#764ba2" />
                  </linearGradient>
                </defs>
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )},
            { id: 'calendar', label: '캘린더', icon: (active) => (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'url(#gradient)' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            )},
            { id: 'analysis', label: '분석', icon: (active) => (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? 'url(#gradient)' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                  padding: '8px 12px',
                  background: isActive ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.12) 100%)' : 'transparent',
                  border: 'none',
                  borderRadius: '12px',
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
                    width: '20px',
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
