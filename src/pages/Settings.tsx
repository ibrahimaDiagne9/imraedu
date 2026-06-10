import { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Moon, Monitor } from 'lucide-react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import api from '../api';

const Settings = () => {
  const [activeTab, setActiveTab] = useState<'preferences' | 'security'>('preferences');
  
  // Preferences State
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [marketingNotifs, setMarketingNotifs] = useState(false);
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');

  // Security State
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passSaving, setPassSaving] = useState(false);
  const [passMessage, setPassMessage] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setPassMessage('New passwords do not match.');
      return;
    }
    setPassSaving(true);
    try {
      await api.put('/password-change/', {
        old_password: passwords.current,
        new_password: passwords.new
      });
      setPassMessage('Password updated successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
      setTimeout(() => setPassMessage(''), 3000);
    } catch (err: any) {
      if (err.response?.data?.old_password) {
        setPassMessage('Incorrect current password.');
      } else {
        setPassMessage('Failed to update password. Please try again.');
      }
    } finally {
      setPassSaving(false);
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
      <SEO title="Account Settings" description="Manage your preferences and security." />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="flex items-center gap-md mb-xl">
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', color: 'var(--text-primary)' }}>
            <SettingsIcon size={32} />
          </div>
          <div>
            <h1 className="text-h1">Parameters & Settings</h1>
            <p className="text-body-large text-secondary">Manage your preferences, security, and notifications.</p>
          </div>
        </div>

        <div className="split-grid" style={{ gridTemplateColumns: '250px 1fr', alignItems: 'start' }}>
          
          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Link to="/profile" className="btn btn-ghost w-full" style={{ justifyContent: 'flex-start', color: 'var(--text-secondary)' }}>
              Profile Editor
            </Link>
            <button 
              onClick={() => setActiveTab('preferences')}
              className="btn w-full" 
              style={{ justifyContent: 'flex-start', backgroundColor: activeTab === 'preferences' ? 'var(--bg-secondary)' : 'transparent', color: activeTab === 'preferences' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'preferences' ? 600 : 500 }}
            >
              <Bell size={18} style={{ marginRight: '0.5rem' }} /> Preferences
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className="btn w-full" 
              style={{ justifyContent: 'flex-start', backgroundColor: activeTab === 'security' ? 'var(--bg-secondary)' : 'transparent', color: activeTab === 'security' ? 'var(--text-primary)' : 'var(--text-secondary)', fontWeight: activeTab === 'security' ? 600 : 500 }}
            >
              <Shield size={18} style={{ marginRight: '0.5rem' }} /> Security
            </button>
          </div>

          {/* Content Area */}
          <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            
            {activeTab === 'preferences' && (
              <div className="animate-fade-in">
                <h2 className="text-h3 mb-lg border-b pb-sm" style={{ borderBottom: '1px solid var(--border-light)' }}>Email Notifications</h2>
                
                <div className="flex items-center justify-between py-md border-b" style={{ borderBottom: '1px solid var(--border-light)' }}>
                  <div>
                    <h4 className="font-semibold mb-xs">Course Updates</h4>
                    <p className="text-small text-secondary">Receive emails about your enrolled courses, certificates, and instructor announcements.</p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={emailNotifs} onChange={e => setEmailNotifs(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--brand-blue)' }} />
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-md mb-xl">
                  <div>
                    <h4 className="font-semibold mb-xs">Marketing & Newsletter</h4>
                    <p className="text-small text-secondary">Occasional emails about new courses, platform features, and educational content.</p>
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <input type="checkbox" checked={marketingNotifs} onChange={e => setMarketingNotifs(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--brand-blue)' }} />
                  </label>
                </div>

                <h2 className="text-h3 mb-lg border-b pb-sm" style={{ borderBottom: '1px solid var(--border-light)' }}>Appearance</h2>
                <div className="flex gap-md mb-xl">
                  {['system', 'light', 'dark'].map((t) => (
                    <button 
                      key={t}
                      onClick={() => setTheme(t as any)}
                      className="btn"
                      style={{
                        flex: 1,
                        padding: '1rem',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
                        backgroundColor: theme === t ? 'var(--brand-blue-light)' : 'var(--bg-secondary)',
                        color: theme === t ? 'var(--brand-blue)' : 'var(--text-secondary)',
                        border: theme === t ? '2px solid var(--brand-blue)' : '2px solid transparent',
                        textTransform: 'capitalize'
                      }}
                    >
                      {t === 'dark' ? <Moon size={24} /> : <Monitor size={24} />}
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="animate-fade-in">
                <h2 className="text-h3 mb-lg border-b pb-sm" style={{ borderBottom: '1px solid var(--border-light)' }}>Change Password</h2>
                
                <form onSubmit={handlePasswordChange} className="flex-col gap-lg max-w-md">
                  <div>
                    <label className="text-small font-semibold mb-xs" style={{ display: 'block' }}>Current Password</label>
                    <input type="password" style={inputStyle} value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} required />
                  </div>
                  <div>
                    <label className="text-small font-semibold mb-xs" style={{ display: 'block' }}>New Password</label>
                    <input type="password" style={inputStyle} value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} required minLength={8} />
                    <p className="text-xs text-secondary mt-xs">Must be at least 8 characters long.</p>
                  </div>
                  <div>
                    <label className="text-small font-semibold mb-xs" style={{ display: 'block' }}>Confirm New Password</label>
                    <input type="password" style={inputStyle} value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} required minLength={8} />
                  </div>

                  {passMessage && (
                    <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: passMessage.includes('match') ? '#FEF2F2' : '#F0FDF4', color: passMessage.includes('match') ? '#DC2626' : '#16A34A', fontSize: '0.9rem', fontWeight: 500 }}>
                      {passMessage}
                    </div>
                  )}

                  <div className="mt-sm">
                    <button type="submit" className="btn btn-primary" disabled={passSaving}>
                      {passSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>

                <div className="mt-3xl pt-xl border-t" style={{ borderTop: '1px solid var(--border-light)' }}>
                  <h2 className="text-h3 text-accent-red mb-sm">Danger Zone</h2>
                  <p className="text-body text-secondary mb-md">Permanently delete your account and all associated data. This action cannot be undone.</p>
                  <button className="btn" style={{ backgroundColor: '#FEF2F2', color: '#DC2626', fontWeight: 600 }}>Delete Account</button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
