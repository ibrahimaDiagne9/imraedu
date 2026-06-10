import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, GraduationCap, X, UserCircle, BookOpen, Settings, Award, HelpCircle, LogOut, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('en') ? 'fr' : 'en';
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="container flex items-center justify-between py-md" style={{ position: 'relative' }}>
        <div className="flex items-center gap-xl">
          <Link to="/" className="text-h3 text-brand font-semibold" style={{ letterSpacing: '-0.05em', display: 'flex', alignItems: 'center' }}>
            <img src="/image/IMRAEDU.png" width="100" height="auto" alt="imraedu" />
          </Link>
          <Link to="/catalog" className="flex items-center gap-sm btn-ghost hide-on-mobile" style={{ cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
            <span>{t('nav.explore')}</span>
            <Menu size={16} />
          </Link>
        </div>

        {/* Desktop Search Bar */}
        <div className="flex items-center flex-grow hide-on-mobile" style={{ maxWidth: '400px', margin: '0 1.5rem' }}>
          <div className="flex items-center w-full" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem' }}>
            <Search size={18} className="text-tertiary" style={{ cursor: 'pointer' }} onClick={handleSearchSubmit} />
            <input
              type="text"
              placeholder={t('nav.search_placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', marginLeft: '0.5rem', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Desktop Auth Controls */}
        <div className="items-center gap-md hide-on-mobile" style={{ display: 'flex' }}>
          <button onClick={toggleLanguage} className="btn-ghost flex items-center gap-xs" title="Switch Language" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%' }}>
            <Globe size={20} className="text-secondary" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{i18n.language.startsWith('fr') ? 'FR' : 'EN'}</span>
          </button>

          {user ? (
            <>
              {user.is_instructor && (
                <Link to="/instructor" className="btn btn-ghost flex items-center gap-xs" style={{ color: 'var(--brand-blue)', fontWeight: 700 }}>
                  <GraduationCap size={16} /> {t('nav.instructor_panel')}
                </Link>
              )}
              <div style={{ position: 'relative' }} ref={profileMenuRef}>
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="font-semibold text-brand hover-scale flex items-center gap-xs" 
                  style={{ display: 'flex', padding: '0 1rem', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <UserCircle size={24} />
                  {user.username}
                </button>

                {isProfileMenuOpen && (
                  <div 
                    className="profile-dropdown"
                    style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.75rem', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)', width: '250px', padding: '0.5rem', zIndex: 100 }}
                  >
                    <Link to="/dashboard" onClick={() => setIsProfileMenuOpen(false)} className="dropdown-item flex items-center gap-sm" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', color: 'var(--text-primary)', transition: 'background-color 0.2s', fontWeight: 500 }}>
                      <BookOpen size={18} className="text-secondary" /> {t('nav.my_courses')}
                    </Link>
                    <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="dropdown-item flex items-center gap-sm" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', color: 'var(--text-primary)', transition: 'background-color 0.2s', fontWeight: 500 }}>
                      <UserCircle size={18} className="text-secondary" /> Profile
                    </Link>
                    <Link to="/settings" onClick={() => setIsProfileMenuOpen(false)} className="dropdown-item flex items-center gap-sm" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', color: 'var(--text-primary)', transition: 'background-color 0.2s', fontWeight: 500 }}>
                      <Settings size={18} className="text-secondary" /> {t('nav.settings')}
                    </Link>
                    <Link to="/accomplishments" onClick={() => setIsProfileMenuOpen(false)} className="dropdown-item flex items-center gap-sm" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', color: 'var(--text-primary)', transition: 'background-color 0.2s', fontWeight: 500 }}>
                      <Award size={18} className="text-secondary" /> {t('nav.accomplishments')}
                    </Link>
                    <Link to="/help" onClick={() => setIsProfileMenuOpen(false)} className="dropdown-item flex items-center gap-sm" style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', color: 'var(--text-primary)', transition: 'background-color 0.2s', fontWeight: 500 }}>
                      <HelpCircle size={18} className="text-secondary" /> {t('nav.help_center')}
                    </Link>
                    <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '0.5rem 0' }}></div>
                    <button 
                      onClick={() => { setIsProfileMenuOpen(false); logout(); }} 
                      className="dropdown-item flex items-center gap-sm w-full" 
                      style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', display: 'flex', color: 'var(--accent-red)', transition: 'background-color 0.2s', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      <LogOut size={18} /> {t('nav.log_out')}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">{t('nav.log_in')}</Link>
              <Link to="/signup" className="btn btn-primary">{t('nav.join_for_free')}</Link>
            </>
          )}
        </div>

        {/* Mobile & Tablet Hamburger Toggle */}
        <button className="mobile-nav-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile/Tablet Drawer Menu */}
        <div className={`mobile-menu-drawer ${isMenuOpen ? 'open' : ''}`}>
          {/* Mobile Search */}
          <div className="flex items-center w-full" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', padding: '0.65rem 1rem' }}>
            <Search size={18} className="text-tertiary" style={{ cursor: 'pointer' }} onClick={handleSearchSubmit} />
            <input
              type="text"
              placeholder={t('nav.search_placeholder')}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', marginLeft: '0.5rem', fontFamily: 'inherit' }}
            />
          </div>

          <div className="flex items-center justify-between mt-md mb-sm">
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Language / Langue</span>
            <button onClick={toggleLanguage} className="btn-secondary flex items-center gap-xs" style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)' }}>
              <Globe size={16} />
              <span>{i18n.language.startsWith('fr') ? 'Français' : 'English'}</span>
            </button>
          </div>

          {/* Links & Actions */}
          <Link to="/catalog" className="btn btn-ghost w-full" style={{ textAlign: 'left', justifyContent: 'flex-start' }} onClick={() => setIsMenuOpen(false)}>
            {t('nav.explore')}
          </Link>

          {user ? (
            <>
              {user.is_instructor && (
                <Link to="/instructor" className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start' }} onClick={() => setIsMenuOpen(false)}>
                  <GraduationCap size={16} style={{ marginRight: '0.5rem' }} /> {t('nav.instructor_panel')}
                </Link>
              )}
              <Link to="/dashboard" className="btn btn-ghost w-full flex items-center gap-sm" style={{ textAlign: 'left', justifyContent: 'flex-start', color: 'var(--text-primary)' }} onClick={() => setIsMenuOpen(false)}>
                <BookOpen size={18} /> {t('nav.my_courses')}
              </Link>
              <Link to="/profile" className="btn btn-ghost w-full flex items-center gap-sm" style={{ textAlign: 'left', justifyContent: 'flex-start', color: 'var(--text-primary)' }} onClick={() => setIsMenuOpen(false)}>
                <UserCircle size={18} /> Profile
              </Link>
              <Link to="/settings" className="btn btn-ghost w-full flex items-center gap-sm" style={{ textAlign: 'left', justifyContent: 'flex-start', color: 'var(--text-primary)' }} onClick={() => setIsMenuOpen(false)}>
                <Settings size={18} /> {t('nav.settings')}
              </Link>
              <Link to="/accomplishments" className="btn btn-ghost w-full flex items-center gap-sm" style={{ textAlign: 'left', justifyContent: 'flex-start', color: 'var(--text-primary)' }} onClick={() => setIsMenuOpen(false)}>
                <Award size={18} /> {t('nav.accomplishments')}
              </Link>
              <Link to="/help" className="btn btn-ghost w-full flex items-center gap-sm" style={{ textAlign: 'left', justifyContent: 'flex-start', color: 'var(--text-primary)' }} onClick={() => setIsMenuOpen(false)}>
                <HelpCircle size={18} /> {t('nav.help_center')}
              </Link>
              <button onClick={() => { logout(); setIsMenuOpen(false); }} className="btn btn-ghost w-full flex items-center gap-sm" style={{ textAlign: 'left', justifyContent: 'flex-start', color: 'var(--accent-red)', fontWeight: 600 }}>
                <LogOut size={18} /> {t('nav.log_out')}
              </button>
            </>
          ) : (
            <div className="flex-col gap-sm mt-sm">
              <Link to="/login" className="btn btn-secondary w-full" onClick={() => setIsMenuOpen(false)}>{t('nav.log_in')}</Link>
              <Link to="/signup" className="btn btn-primary w-full" onClick={() => setIsMenuOpen(false)}>{t('nav.join_for_free')}</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
