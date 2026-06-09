import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

// ── Social icons ────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AppleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.53 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const GitHubIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const socialProviders = [
  { key: 'google', icon: <GoogleIcon />, label: 'Google' },
  { key: 'apple', icon: <AppleIcon />, label: 'Apple' },
  { key: 'github', icon: <GitHubIcon />, label: 'GitHub' },
];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.875rem 1rem 0.875rem 2.75rem',
  borderRadius: '12px',
  border: '1.5px solid var(--border-strong)',
  outline: 'none',
  fontFamily: 'inherit',
  fontSize: '1rem',
  backgroundColor: 'var(--bg-primary)',
  transition: 'border-color 0.2s, box-shadow 0.2s',
};

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeGoogle = () => {
      const g = (window as any).google;
      if (!g) return;
      g.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '943815507074-2of3v46l8e5sc28rluag3g73p4405rog.apps.googleusercontent.com',
        callback: async (response: any) => {
          setLoading(true);
          setError('');
          try {
            const res = await api.post('/auth/google/', { token: response.credential });
            login(res.data.access, res.data.refresh);
            navigate('/dashboard');
          } catch (err: any) {
            setError(err.response?.data?.error || 'Google Sign-In failed. Please try again.');
          } finally {
            setLoading(false);
          }
        }
      });
      // Render the real Google button in an invisible overlay — more reliable than prompt()
      const btnEl = document.getElementById('google-signin-overlay-login');
      if (btnEl) {
        g.accounts.id.renderButton(btnEl, {
          theme: 'outline', size: 'large', text: 'signin_with', width: 200
        });
      }
    };
    const timer = setTimeout(initializeGoogle, 600);
    return () => clearTimeout(timer);
  }, [login, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/token/', { username, password });
      login(res.data.access, res.data.refresh);
      navigate('/dashboard');
    } catch {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const focusInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--brand-blue)';
    e.target.style.boxShadow = '0 0 0 3px rgba(0,86,210,0.1)';
  };
  const blurInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'var(--border-strong)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="auth-grid">

      {/* ── Left panel ── */}
      <div className="hide-on-mobile" style={{
        background: 'linear-gradient(145deg, #0f1f3d 0%, #0056D2 60%, #38bdf8 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '4rem 3.5rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* Blobs */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '360px', height: '360px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

        <div className="animate-fade-in" style={{ maxWidth: '400px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          {/* Logo badge */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem', fontSize: '1.75rem', fontWeight: 800, color: 'white',
          }}>I</div>

          <h2 style={{ color: 'white', fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Welcome back to<br /><span style={{ color: '#93c5fd' }}>IMRAEDU.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', lineHeight: 1.65, marginBottom: '2.5rem' }}>
            Continue your learning journey. Thousands of free courses are waiting for you.
          </p>

          {/* Stat badges */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            {[['10K+', 'Learners'], ['500+', 'Courses'], ['100%', 'Free']].map(([val, lbl]) => (
              <div key={lbl} style={{
                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px', padding: '0.75rem 1.25rem', textAlign: 'center',
              }}>
                <div style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>{val}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.8rem', fontWeight: 500 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel – form ── */}
      <div style={{ backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 2.5rem' }}>
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '420px' }}>

          <h2 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>Log in</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.75rem', fontSize: '0.95rem' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>Sign up for free</Link>
          </p>

          {/* Google Sign-In — full-width */}
          <div
            style={{
              position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.625rem', padding: '0.8rem 1.25rem',
              border: '1.5px solid var(--border-strong)', borderRadius: '12px',
              background: 'var(--bg-primary)', cursor: 'pointer',
              transition: 'all 0.2s', fontSize: '0.9rem', fontWeight: 600,
              color: 'var(--text-secondary)', marginBottom: '1.5rem',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--brand-blue)';
              e.currentTarget.style.background = 'var(--brand-blue-light)';
              e.currentTarget.style.color = 'var(--brand-blue)';
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,86,210,0.12)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-strong)';
              e.currentTarget.style.background = 'var(--bg-primary)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <GoogleIcon />
            Continue with Google
            <div id="google-signin-overlay-login" style={{
              position: 'absolute', inset: 0, opacity: 0.01, overflow: 'hidden',
              display: 'flex', alignItems: 'stretch',
            }} />
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>or continue with username</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
          </div>

          {error && (
            <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', borderRadius: '10px', background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', fontSize: '0.875rem', fontWeight: 500 }}>
              {error}
            </div>
          )}

          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }} onSubmit={handleLogin}>
            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Username</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                <input
                  type="text" placeholder="johndoe" value={username} required
                  onChange={e => setUsername(e.target.value)}
                  style={inputStyle} onFocus={focusInput} onBlur={blurInput}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--brand-blue)', fontWeight: 600 }}>Forgot password?</Link>
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                <input
                  type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={password} required
                  onChange={e => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '3rem' }} onFocus={focusInput} onBlur={blurInput}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0 }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '0.9rem',
                background: loading ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, #0056D2, #0ea5e9)',
                color: loading ? 'var(--text-tertiary)' : 'white',
                border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(0,86,210,0.3)',
                marginTop: '0.25rem',
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Logging in…
                </>
              ) : 'Log In'}
            </button>
          </form>

          <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
            By logging in, you agree to our{' '}
            <Link to="#" style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>Terms</Link> &amp;{' '}
            <Link to="#" style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>Privacy Policy</Link>.
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Login;
