import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

type VerifyState = 'loading' | 'success' | 'already_verified' | 'error';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState<VerifyState>('loading');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(4);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const uidb64 = searchParams.get('uidb64');
    const token = searchParams.get('token');

    if (!uidb64 || !token) {
      setState('error');
      setMessage('This verification link is missing required parameters. Please request a new one.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.get(`/verify-email/?uidb64=${uidb64}&token=${token}`);
        if (res.data.access) {
          // New verification — auto login
          login(res.data.access, res.data.refresh);
          setState('success');
        } else {
          // Already verified
          setState('already_verified');
          setMessage(res.data.message || 'Your account is already verified.');
        }
      } catch (err: any) {
        setState('error');
        setMessage(err.response?.data?.error || 'Something went wrong. The link may have expired.');
      }
    };

    verify();
  }, [searchParams, login]);

  // Countdown auto-redirect after success
  useEffect(() => {
    if (state !== 'success') return;
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          navigate('/dashboard');
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [state, navigate]);

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-primary)',
    padding: '2rem',
  };

  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '480px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: '20px',
    padding: '3rem 2.5rem',
    textAlign: 'center',
    boxShadow: 'var(--shadow-lg)',
    animation: 'fadeIn 0.4s ease',
  };

  if (state === 'loading') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #0056D2, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.75rem',
            boxShadow: '0 8px 24px rgba(0,86,210,0.25)',
          }}>
            <Loader2 size={36} color="white" style={{ animation: 'spin 1s linear infinite' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Verifying your email…
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Please wait while we activate your account.
          </p>
        </div>
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          @keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        `}</style>
      </div>
    );
  }

  if (state === 'success') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          {/* Success icon */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #10B981, #059669)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.75rem',
            boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
          }}>
            <CheckCircle size={42} color="white" />
          </div>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Email verified! 🎉
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Your account is now active. Redirecting you to your dashboard in{' '}
            <strong style={{ color: 'var(--brand-blue)' }}>{countdown}s</strong>…
          </p>

          {/* Progress bar */}
          <div style={{ height: '4px', background: 'var(--border-light)', borderRadius: '99px', overflow: 'hidden', marginBottom: '2rem' }}>
            <div style={{
              height: '100%',
              background: 'linear-gradient(90deg, #10B981, #059669)',
              borderRadius: '99px',
              width: `${((4 - countdown) / 4) * 100}%`,
              transition: 'width 1s linear',
            }} />
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              width: '100%', padding: '0.9rem',
              background: 'linear-gradient(135deg, #0056D2, #0ea5e9)',
              color: 'white', border: 'none', borderRadius: '12px',
              fontSize: '1rem', fontWeight: 700, cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(0,86,210,0.3)',
            }}
          >
            Go to Dashboard
          </button>
        </div>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    );
  }

  if (state === 'already_verified') {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #0056D2, #0ea5e9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.75rem',
            boxShadow: '0 8px 24px rgba(0,86,210,0.25)',
          }}>
            <CheckCircle size={36} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Already verified</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
            {message}
          </p>
          <Link
            to="/login"
            style={{
              display: 'block', padding: '0.9rem',
              background: 'linear-gradient(135deg, #0056D2, #0ea5e9)',
              color: 'white', borderRadius: '12px',
              textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(0,86,210,0.3)',
            }}
          >
            Log In
          </Link>
        </div>
        <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      </div>
    );
  }

  // Error state
  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #EF4444, #DC2626)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.75rem',
          boxShadow: '0 8px 24px rgba(239,68,68,0.25)',
        }}>
          <XCircle size={36} color="white" />
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Verification failed</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          {message}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link
            to="/signup"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.9rem',
              background: 'linear-gradient(135deg, #0056D2, #0ea5e9)',
              color: 'white', borderRadius: '12px',
              textDecoration: 'none', fontWeight: 700, fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(0,86,210,0.3)',
            }}
          >
            <Mail size={18} />
            Sign up again
          </Link>
          <Link
            to="/login"
            style={{
              display: 'block', padding: '0.875rem',
              border: '1.5px solid var(--border-strong)',
              color: 'var(--text-secondary)', borderRadius: '12px',
              textDecoration: 'none', fontWeight: 600, fontSize: '0.95rem',
            }}
          >
            Back to Login
          </Link>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
};

export default VerifyEmail;
