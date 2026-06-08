import React, { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const uidb64 = searchParams.get('uidb64');
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus('error');
      setErrorMessage("Passwords don't match.");
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      await api.post('/api/password-reset/confirm/', {
        uidb64,
        token,
        new_password: password
      });
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      setStatus('error');
      // If validation error occurs
      if (error.response?.data?.token || error.response?.data?.uidb64) {
         setErrorMessage('This password reset link is invalid or has expired.');
      } else {
         setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again later.');
      }
    }
  };

  if (!uidb64 || !token) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-red-500 mb-4 flex justify-center">
            <Lock size={48} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Invalid Link</h1>
          <p className="text-slate-600 mb-6">The password reset link is missing required parameters.</p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Set new password</h1>
          <p className="text-slate-600">Your new password must be different from previously used passwords.</p>
        </div>

        {status === 'success' ? (
          <div className="text-center space-y-6">
            <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3 text-left">
              <CheckCircle className="flex-shrink-0" size={20} />
              <p className="text-sm font-medium">Password reset successfully! Redirecting you to login...</p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <ArrowLeft size={16} />
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                New Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter new password"
                disabled={status === 'loading'}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Confirm new password"
                disabled={status === 'loading'}
              />
            </div>

            {status === 'error' && (
              <div className="text-red-500 text-sm font-medium">{errorMessage}</div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || !password || !confirmPassword}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {status === 'loading' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Resetting...
                </>
              ) : (
                'Reset password'
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
