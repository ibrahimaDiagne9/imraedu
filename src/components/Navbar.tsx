import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, GraduationCap, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <img src="image/IMRAEDU.png" width="100" height="auto" alt="imraedu" />
          </Link>
          <Link to="/catalog" className="flex items-center gap-sm btn-ghost hide-on-mobile" style={{ cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
            <span>Explore</span>
            <Menu size={16} />
          </Link>
        </div>

        {/* Desktop Search Bar */}
        <div className="flex items-center flex-grow hide-on-mobile" style={{ maxWidth: '400px', margin: '0 1.5rem' }}>
          <div className="flex items-center w-full" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem' }}>
            <Search size={18} className="text-tertiary" style={{ cursor: 'pointer' }} onClick={handleSearchSubmit} />
            <input
              type="text"
              placeholder="What do you want to learn?"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', marginLeft: '0.5rem', fontFamily: 'inherit' }}
            />
          </div>
        </div>

        {/* Desktop Auth Controls */}
        <div className="items-center gap-md hide-on-mobile" style={{ display: 'flex' }}>
          {user ? (
            <>
              {user.is_instructor && (
                <Link to="/instructor" className="btn btn-ghost flex items-center gap-xs" style={{ color: 'var(--brand-blue)', fontWeight: 700 }}>
                  <GraduationCap size={16} /> Teacher Panel
                </Link>
              )}
              <Link to="/dashboard" className="font-semibold text-brand hover-scale" style={{ display: 'block', padding: '0 1rem' }}>{user.username}</Link>
              <button onClick={logout} className="btn btn-ghost">Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">Log In</Link>
              <Link to="/signup" className="btn btn-primary">Join for Free</Link>
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
              placeholder="What do you want to learn?"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', marginLeft: '0.5rem', fontFamily: 'inherit' }}
            />
          </div>

          {/* Links & Actions */}
          <Link to="/catalog" className="btn btn-ghost w-full" style={{ textAlign: 'left', justifyContent: 'flex-start' }} onClick={() => setIsMenuOpen(false)}>
            Explore Courses
          </Link>

          {user ? (
            <>
              {user.is_instructor && (
                <Link to="/instructor" className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start' }} onClick={() => setIsMenuOpen(false)}>
                  <GraduationCap size={16} style={{ marginRight: '0.5rem' }} /> Teacher Panel
                </Link>
              )}
              <Link to="/dashboard" className="btn btn-ghost w-full" style={{ textAlign: 'left', justifyContent: 'flex-start', fontWeight: 600, color: 'var(--brand-blue)' }} onClick={() => setIsMenuOpen(false)}>
                My Dashboard ({user.username})
              </Link>
              <button onClick={() => { logout(); setIsMenuOpen(false); }} className="btn btn-ghost w-full" style={{ textAlign: 'left', justifyContent: 'flex-start' }}>
                Log Out
              </button>
            </>
          ) : (
            <div className="flex-col gap-sm mt-sm">
              <Link to="/login" className="btn btn-secondary w-full" onClick={() => setIsMenuOpen(false)}>Log In</Link>
              <Link to="/signup" className="btn btn-primary w-full" onClick={() => setIsMenuOpen(false)}>Join for Free</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
