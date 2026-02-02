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
  const [demoMode, setDemoMode] = useState(false);

  const handleLogout = async () => {
    if (demoMode) {
      setDemoMode(false);
      return;
    }
    if (window.confirm('로그아웃 하시겠습니까?')) {
      await logOut();
    }
  };

  const handleDemoMode = () => {
    setDemoMode(true);
  };

  if (!currentUser && !demoMode) {
    return showSignup ? (
      <Signup onToggleForm={() => setShowSignup(false)} onDemoMode={handleDemoMode} />
    ) : (
      <Login onToggleForm={() => setShowSignup(true)} onDemoMode={handleDemoMode} />
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
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px'
            }}>
              🏥
            </div>
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
                {demoMode ? '데모 모드' : currentUser?.email}
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
        borderTop: '1px solid #e0e0e0',
        padding: '10px 0',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-around'
        }}>
          {[
            { id: 'profile', icon: '👤', label: '프로필' },
            { id: 'calendar', icon: '📅', label: '캘린더' },
            { id: 'analysis', icon: '📊', label: '분석' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '8px',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: activeTab === tab.id ? '#667eea' : '#999',
                transition: 'color 0.3s'
              }}
            >
              <span style={{ fontSize: '24px' }}>{tab.icon}</span>
              <span style={{
                fontSize: '12px',
                fontWeight: activeTab === tab.id ? '600' : '400'
              }}>
                {tab.label}
              </span>
            </button>
          ))}
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
