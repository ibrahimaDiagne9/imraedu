import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Hero = () => {
  const { user } = useAuth();

  return (
    <div style={{ background: 'linear-gradient(135deg, var(--brand-blue-light) 0%, #FFFFFF 100%)', padding: '6rem 0' }}>
      <div className="container grid grid-cols-2 items-center gap-3xl flex-col-mobile">
        <div className="flex-col gap-lg animate-fade-in w-full-mobile">
          {user ? (
            <>
              <h1 className="text-h1">Welcome back, <span className="text-brand">{user.first_name || user.username}</span>!</h1>
              <p className="text-body-large text-secondary">
                Ready to continue your learning journey? Pick up right where you left off or explore new courses today.
              </p>
              <div className="flex gap-md mt-sm">
                <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>Go to Dashboard</Link>
                <Link to="/catalog" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>Explore Courses</Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-h1">Learn without <span className="text-brand">limits</span></h1>
              <p className="text-body-large text-secondary">
                Start, switch, or advance your career with thousands of free courses, Professional Certificates, and degrees from world-class universities and companies.
              </p>
              <div className="flex gap-md mt-sm">
                <Link to="/signup" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>Join for Free</Link>
                <Link to="/catalog" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>Explore Courses</Link>
              </div>
            </>
          )}
        </div>
        <div className="animate-fade-in hide-on-mobile" style={{ animationDelay: '200ms' }}>
          <div style={{ 
            background: 'white', 
            padding: '1rem', 
            borderRadius: 'var(--radius-xl)', 
            boxShadow: 'var(--shadow-xl)',
            transform: 'rotate(2deg)'
          }}>
            <img 
              src="/hero_graphic.png" 
              alt="ImraEdu Learning Graphic" 
              style={{ 
                width: '100%', 
                height: 'auto', 
                maxHeight: '350px',
                objectFit: 'contain',
                borderRadius: 'var(--radius-lg)' 
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
