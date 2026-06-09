import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowLeft, CheckCircle, KeyRound, ShieldCheck, Sparkles } from 'lucide-react';

// Social provider SVG icons
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.39-1.32 2.76-2.53 3.99zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const GitHubIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const features = [
  { icon: <ShieldCheck size={20} />, text: 'Secure password recovery via encrypted token' },
  { icon: <KeyRound size={20} />, text: 'Reset link expires in 24 hours for your safety' },
  { icon: <Sparkles size={20} />, text: 'Instant access restored after reset' },
];

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // ── Google & Apple Sign-In (recover via social account) ──────────────────────────
  useEffect(() => {
    const initGoogle = () => {
      const g = (window as any).google;
      if (!g) return;
      g.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '1081395352601-nb8o7k7qfej9iic5c7t4c12h32uolb67.apps.googleusercontent.com',
        callback: async (response: any) => {
          setStatus('loading');
          setErrorMessage('');
          try {
            const res = await api.post('/auth/google/', { token: response.credential });
            login(res.data.access, res.data.refresh);
            navigate('/dashboard');
          } catch (err: any) {
            setStatus('error');
            setErrorMessage(err.response?.data?.error || 'Google Sign-In failed. Please try again.');
          }
        },
      });
    };
    
    const initApple = () => {
      const appleId = (window as any).AppleID;
      if (appleId) {
        appleId.auth.init({
          clientId: import.meta.env.VITE_APPLE_CLIENT_ID || 'com.imraedu.web',
          scope: 'name email',
          redirectURI: window.location.origin + '/forgot-password',
          usePopup: true
        });
      }
    };

    const timer = setTimeout(() => {
      initGoogle();
      initApple();
    }, 500);
    return () => clearTimeout(timer);
  }, [login, navigate]);

  const handleGoogleRecover = () => {
    const g = (window as any).google;
    if (g) g.accounts.id.prompt();
    else setErrorMessage('Google Sign-In is not available. Please use the email form below.');
  };

  const handleAppleRecover = async () => {
    const appleId = (window as any).AppleID;
    if (appleId) {
      try {
        const response = await appleId.auth.signIn();
        setStatus('loading');
        setErrorMessage('');
        const res = await api.post('/auth/apple/', { token: response.authorization.id_token });
        login(res.data.access, res.data.refresh);
        navigate('/dashboard');
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.response?.data?.error || 'Apple Sign-In failed. Please try again.');
      }
    } else {
      setErrorMessage('Apple Sign-In is not available.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');
    try {
      await api.post('/password-reset/', { email });
      setStatus('success');
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="auth-grid">

      {/* ── Left panel ── */}
      <div className="hide-on-mobile" style={{
        background: 'linear-gradient(145deg, #0f1f3d 0%, #0056D2 60%, #38bdf8 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '4rem 3.5rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '320px', height: '320px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '240px', height: '240px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />

        <div className="animate-fade-in" style={{ maxWidth: '400px', position: 'relative', zIndex: 1 }}>
          {/* Icon badge */}
          <div style={{
            width: '72px', height: '72px', borderRadius: '20px',
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '2rem', boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <Mail size={36} color="white" />
          </div>

          <h2 style={{ color: 'white', fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '1rem', letterSpacing: '-0.02em' }}>
            Forgot your<br />password?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            No worries — it happens to the best of us. Enter your email and we'll send you a secure reset link instantly.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                  background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white'
                }}>
                  {f.icon}
                </div>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.9rem', fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel – form ── */}
      <div style={{
        backgroundColor: 'var(--bg-primary)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '3rem 2.5rem'
      }}>
        <div className="animate-fade-in" style={{ width: '100%', maxWidth: '420px' }}>

          {status === 'success' ? (
            /* ── Success state ── */
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(16,185,129,0.3)'
              }}>
                <CheckCircle size={40} color="white" />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>Check your inbox!</h2>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
                We've sent a password reset link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>. It may take a minute to arrive — also check your spam folder.
              </p>
              <div style={{
                background: 'var(--bg-secondary)', borderRadius: '12px',
                padding: '1rem 1.25rem', marginBottom: '2rem',
                fontSize: '0.875rem', color: 'var(--text-secondary)',
                border: '1px solid var(--border-light)'
              }}>
                Didn't receive it?{' '}
                <button
                  onClick={() => setStatus('idle')}
                  style={{ color: 'var(--brand-blue)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                >
                  Resend email
                </button>
              </div>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                  fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)',
                  transition: 'color 0.2s'
                }}
              >
                <ArrowLeft size={16} /> Back to login
              </Link>
            </div>
          ) : (
            /* ── Form state ── */
            <>
              <div style={{ marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Reset password</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Remember it?{' '}
                  <Link to="/login" style={{ color: 'var(--brand-blue)', fontWeight: 600 }}>
                    Back to login
                  </Link>
                </p>
              </div>

              {/* ── Social recovery options ── */}
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.875rem' }}>
                  Or recover via
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.625rem' }}>
                  {[
                    { icon: <GoogleIcon />, label: 'Google', key: 'google' },
                    { icon: <AppleIcon />, label: 'Apple', key: 'apple' },
                    { icon: <GitHubIcon />, label: 'GitHub', key: 'github' },
                  ].map(({ icon, label, key }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={key === 'google' ? handleGoogleRecover : key === 'apple' ? handleAppleRecover : undefined}
                      disabled={status === 'loading'}
                      style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        gap: '0.4rem', padding: '0.875rem 0.5rem',
                        border: '1px solid var(--border-strong)', borderRadius: '12px',
                        background: 'var(--bg-primary)', cursor: key === 'google' || key === 'apple' ? 'pointer' : 'not-allowed',
                        opacity: key !== 'google' && key !== 'apple' ? 0.5 : 1,
                        transition: 'all 0.2s', fontSize: '0.75rem', fontWeight: 600,
                        color: 'var(--text-secondary)',
                      }}
                      onMouseEnter={e => {
                        if (key !== 'google' && key !== 'apple') return;
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--brand-blue)';
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--brand-blue-light)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--brand-blue)';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-strong)';
                        (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-primary)';
                        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
                        (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
                      }}
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* ── Divider ── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', fontWeight: 500 }}>or reset with email</span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
              </div>

              {/* ── Email form ── */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label htmlFor="fp-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                    Email address
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                    <input
                      id="fp-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={status === 'loading'}
                      placeholder="name@example.com"
                      style={{
                        width: '100%', padding: '0.875rem 1rem 0.875rem 2.75rem',
                        borderRadius: '12px', border: '1.5px solid var(--border-strong)',
                        outline: 'none', fontFamily: 'inherit', fontSize: '1rem',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        backgroundColor: 'var(--bg-primary)',
                      }}
                      onFocus={e => {
                        e.target.style.borderColor = 'var(--brand-blue)';
                        e.target.style.boxShadow = '0 0 0 3px rgba(0,86,210,0.1)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = 'var(--border-strong)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {status === 'error' && (
                  <div style={{
                    padding: '0.75rem 1rem', borderRadius: '10px',
                    background: '#FEF2F2', border: '1px solid #FECACA',
                    color: '#DC2626', fontSize: '0.875rem', fontWeight: 500
                  }}>
                    {errorMessage}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || !email}
                  style={{
                    width: '100%', padding: '0.9rem',
                    background: status === 'loading' || !email
                      ? 'var(--bg-tertiary)'
                      : 'linear-gradient(135deg, #0056D2, #0ea5e9)',
                    color: status === 'loading' || !email ? 'var(--text-tertiary)' : 'white',
                    border: 'none', borderRadius: '12px',
                    fontSize: '1rem', fontWeight: 700, cursor: status === 'loading' || !email ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                    transition: 'all 0.2s',
                    boxShadow: status === 'loading' || !email ? 'none' : '0 4px 15px rgba(0,86,210,0.3)',
                  }}
                >
                  {status === 'loading' ? (
                    <>
                      <div style={{
                        width: '18px', height: '18px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: 'white', borderRadius: '50%',
                        animation: 'spin 0.7s linear infinite'
                      }} />
                      Sending reset link…
                    </>
                  ) : (
                    <>
                      <Mail size={18} />
                      Send reset link
                    </>
                  )}
                </button>

                <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                  We'll send a one-time secure link to your email.
                </p>
              </form>
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
