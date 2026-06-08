import { Link, useNavigate } from 'react-router-dom';
import { Search, Menu, GraduationCap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="glass" style={{ position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="container flex items-center justify-between py-md">
        <div className="flex items-center gap-xl">
          <Link to="/" className="text-h3 text-brand font-semibold" style={{ letterSpacing: '-0.05em' }}>
            <img src="image/imraedu.png" width={"100"} height={"10%"} alt="imraedu" />
          </Link>
          <Link to="/catalog" className="flex items-center gap-sm btn-ghost" style={{ cursor: 'pointer', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)' }}>
            <span>Explore</span>
            <Menu size={16} />
          </Link>
        </div>

        <div className="flex items-center flex-grow" style={{ maxWidth: '400px' }}>
          <div className="flex items-center w-full" style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem' }}>
            <Search size={18} className="text-tertiary" />
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

        <div className="flex items-center gap-md">
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
      </div>
    </nav>
  );
};

export default Navbar;
