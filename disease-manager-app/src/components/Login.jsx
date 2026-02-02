import { useState } from 'react';
import { signIn } from '../services/authService';

const Login = ({ onToggleForm, onDemoMode }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn(email, password);

    if (!result.success) {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'white',
            borderRadius: '20px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            marginBottom: '20px'
          }}>
            🏥
          </div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: 'white',
            marginBottom: '10px',
            textShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            Disease Manager
          </h1>
          <p style={{
            color: 'rgba(255,255,255,0.9)',
            fontSize: '16px'
          }}>
            증상을 기록하고 패턴을 분석하세요
          </p>
        </div>

        {/* Login Card */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '30px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                이메일
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                비밀번호
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '10px',
                  fontSize: '16px',
                  outline: 'none',
                  transition: 'border 0.3s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
              />
            </div>

            {error && (
              <div style={{
                background: '#fee',
                border: '2px solid #fcc',
                color: '#c33',
                padding: '12px',
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                marginBottom: '15px',
                boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
              }}
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>

            <button
              type="button"
              onClick={onToggleForm}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#666',
                fontSize: '14px',
                cursor: 'pointer',
                padding: '10px'
              }}
            >
              계정이 없으신가요? <span style={{ color: '#667eea', fontWeight: '600' }}>회원가입</span>
            </button>
          </form>

          <div style={{
            borderTop: '1px solid #eee',
            marginTop: '20px',
            paddingTop: '20px'
          }}>
            <button
              type="button"
              onClick={onDemoMode}
              style={{
                width: '100%',
                padding: '14px',
                background: '#f5f5f5',
                color: '#333',
                border: '2px solid #e0e0e0',
                borderRadius: '10px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span style={{ fontSize: '20px' }}>🎨</span>
              데모 모드로 체험하기
            </button>
            <p style={{
              textAlign: 'center',
              fontSize: '12px',
              color: '#999',
              marginTop: '10px'
            }}>
              Firebase 설정 없이 모든 기능을 체험할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
