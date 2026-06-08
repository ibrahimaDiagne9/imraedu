import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Profile = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: '',
    bio: '',
    email: user?.email || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const initials = user ? (user.first_name?.[0] || user.username[0]).toUpperCase() : '?';

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await api.patch('/me/', {
        first_name: form.first_name,
        bio: form.bio,
      });
      // Refresh user data by re-fetching
      const token = localStorage.getItem('access_token');
      const refresh = localStorage.getItem('refresh_token');
      if (token && refresh) {
        await login(token, refresh);
      }
      setSaved(true);
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-strong)',
    outline: 'none', fontFamily: 'inherit', fontSize: '1rem'
  };

  return (
    <div className="container py-3xl min-h-screen">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-h1 mb-xl">Account Settings</h1>

        <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', padding: '2rem', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
          <h2 className="text-h3 mb-lg border-b pb-sm" style={{ borderBottom: '1px solid var(--border-light)' }}>Personal Information</h2>

          <div className="flex items-center gap-lg mb-xl">
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--brand-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="text-h1 text-brand font-semibold">{initials}</span>
            </div>
            <div>
              <h3 className="font-semibold">{user?.username}</h3>
              <p className="text-small text-tertiary">{user?.email}</p>
            </div>
          </div>

          <form className="flex-col gap-lg" onSubmit={e => { e.preventDefault(); handleSave(); }}>
            <div className="grid grid-cols-2 gap-md">
              <div>
                <label className="text-small font-semibold mb-xs" style={{ display: 'block' }}>First Name</label>
                <input type="text" style={inputStyle}
                  value={form.first_name}
                  onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
              </div>
              <div>
                <label className="text-small font-semibold mb-xs" style={{ display: 'block' }}>Username</label>
                <input type="text" style={{ ...inputStyle, backgroundColor: 'var(--bg-secondary)' }}
                  value={user?.username || ''} readOnly />
              </div>
            </div>

            <div>
              <label className="text-small font-semibold mb-xs" style={{ display: 'block' }}>Email Address</label>
              <input type="email" style={{ ...inputStyle, backgroundColor: 'var(--bg-secondary)' }}
                value={user?.email || ''} readOnly />
            </div>

            <div>
              <label className="text-small font-semibold mb-xs" style={{ display: 'block' }}>Bio</label>
              <textarea rows={4} style={{ ...inputStyle, resize: 'vertical' }}
                placeholder="Tell us a little bit about yourself..."
                value={form.bio}
                onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
            </div>

            <div className="mt-md flex justify-end gap-md items-center">
              {saved && <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>✓ Saved successfully!</span>}
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
