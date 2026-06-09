import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, ShieldAlert } from 'lucide-react';

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

const focusInput = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = 'var(--brand-blue)';
  e.target.style.boxShadow = '0 0 0 3px rgba(0,86,210,0.1)';
};
const blurInput = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = 'var(--border-strong)';
  e.target.style.boxShadow = 'none';
};

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const uidb64 = searchParams.get('uidb64');
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage("Passwords don't match.");
      return;
    }
    if (password.length < 8) {
      setStatus('error');
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    try {
      await api.post('/password-reset/confirm/', { uidb64, token, new_password: password });
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      setStatus('error');
      if (error.response?.data?.token || error.response?.data?.uidb64) {
        setErrorMessage('This password reset link is invalid or has expired.');
      } else {
        setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again.');
      }
    }
  };

  // ── Invalid link state ────────────────────────────────────────────
  if (!uidb64 || !token) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1.5rem', backgroundColor: 'var(--bg-secondary)',
      }}>
        <div className="animate-fade-in" style={{
          maxWidth: '440px', width: '100%', background: 'var(--bg-primary)',
          borderRadius: '20px', padding: '3rem 2.5rem', textAlign: 'center',
          boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)',
        }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 1.5rem',
            background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <ShieldAlert size={36} color="#DC2626" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
            Invalid Reset Link
          </h1>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem', fontSize: '0.95rem' }}>
            The password reset link is missing required parameters or has expired.
          </p>
          <Link
            to="/forgot-password"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg, #0056D2, #0ea5e9)',
              color: 'white', borderRadius: '12px', fontWeight: 700, fontSize: '0.9rem',
              textDecoration: 'none', boxShadow: '0 4px 15px rgba(0,86,210,0.3)',
            }}
          >
            Request a new link
          </Link>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
              <ArrowLeft size={15} /> Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1.5rem', backgroundColor: 'var(--bg-secondary)',
    }}>
      <div className="animate-fade-in" style={{
        maxWidth: '460px', width: '100%', background: 'var(--bg-primary)',
        borderRadius: '20px', padding: '3rem 2.5rem',
        boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-light)',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 1.25rem',
            background: 'linear-gradient(135deg, #dbeafe, #eff6ff)',
            border: '2px solid #bfdbfe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Lock size={32} color="var(--brand-blue)" />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            Set new password
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
            Your new password must be at least 8 characters long.
          </p>
        </div>

        {/* ── Success ── */}
        {status === 'success' ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(16,185,129,0.3)',
            }}>
              <CheckCircle size={40} color="white" />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
              Password reset!
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem', fontSize: '0.95rem' }}>
              Your password has been changed successfully. Redirecting you to the login page…
            </p>
            <div style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-light)',
              borderRadius: '12px', padding: '0.875rem 1rem',
              fontSize: '0.875rem', color: 'var(--text-secondary)',
            }}>
              <div style={{
                height: '4px', background: 'var(--border-light)', borderRadius: '4px', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', background: 'linear-gradient(90deg, #0056D2, #0ea5e9)',
                  borderRadius: '4px', animation: 'progress 3s linear forwards',
                }} />
              </div>
            </div>
            <Link
              to="/login"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                marginTop: '1.5rem', color: 'var(--brand-blue)', fontWeight: 600, fontSize: '0.875rem',
              }}
            >
              <ArrowLeft size={15} /> Go to login now
            </Link>
          </div>
        ) : (
          /* ── Form ── */
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* New password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={status === 'loading'}
                  placeholder="Minimum 8 characters"
                  style={{ ...inputStyle, paddingRight: '3rem' }}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0 }}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Password strength indicator */}
              {password && (
                <div style={{ marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '0.25rem' }}>
                    {[1, 2, 3, 4].map(i => {
                      const strength = password.length >= 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4
                        : password.length >= 10 && (/[A-Z]/.test(password) || /[0-9]/.test(password)) ? 3
                        : password.length >= 8 ? 2 : 1;
                      const colors = ['#DC2626', '#F59E0B', '#0ea5e9', '#10B981'];
                      return <div key={i} style={{ flex: 1, height: '3px', borderRadius: '4px', background: i <= strength ? colors[strength - 1] : 'var(--border-light)', transition: 'background 0.3s' }} />;
                    })}
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {password.length < 8 ? 'Too short' : password.length < 10 ? 'Weak' : password.length < 12 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                Confirm New Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', pointerEvents: 'none' }} />
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                  disabled={status === 'loading'}
                  placeholder="Repeat your password"
                  style={{
                    ...inputStyle,
                    paddingRight: '3rem',
                    borderColor: confirmPassword && password !== confirmPassword ? '#DC2626' : undefined,
                  }}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0 }}>
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: '#DC2626' }}>Passwords don't match</p>
              )}
            </div>

            {/* Error message */}
            {status === 'error' && (
              <div style={{
                padding: '0.75rem 1rem', borderRadius: '10px',
                background: '#FEF2F2', border: '1px solid #FECACA',
                color: '#DC2626', fontSize: '0.875rem', fontWeight: 500,
              }}>
                {errorMessage}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={status === 'loading' || !password || !confirmPassword}
              style={{
                width: '100%', padding: '0.9rem',
                background: status === 'loading' || !password || !confirmPassword
                  ? 'var(--bg-tertiary)'
                  : 'linear-gradient(135deg, #0056D2, #0ea5e9)',
                color: status === 'loading' || !password || !confirmPassword ? 'var(--text-tertiary)' : 'white',
                border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 700,
                cursor: status === 'loading' || !password || !confirmPassword ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                transition: 'all 0.2s',
                boxShadow: status === 'loading' || !password || !confirmPassword ? 'none' : '0 4px 15px rgba(0,86,210,0.3)',
              }}
            >
              {status === 'loading' ? (
                <>
                  <div style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                  Resetting password…
                </>
              ) : (
                <>
                  <Lock size={17} />
                  Reset password
                </>
              )}
            </button>

            <div style={{ textAlign: 'center' }}>
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}>
                <ArrowLeft size={15} /> Back to login
              </Link>
            </div>
          </form>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
      `}</style>
    </div>
  );
};

export default ResetPassword;
