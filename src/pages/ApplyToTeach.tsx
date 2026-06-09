import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, GraduationCap, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const ApplyToTeach = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'none' | 'Pending' | 'Approved' | 'Rejected'>('loading');
  const [formData, setFormData] = useState({ expertise: '', experience: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setStatus('none');
      return;
    }
    const checkStatus = async () => {
      try {
        const { data } = await api.get('/apply-instructor/');
        setStatus(data.status);
      } catch (err: any) {
        if (err.response?.status === 404) {
          setStatus('none');
        } else {
          setStatus('none');
        }
      }
    };
    checkStatus();
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await api.post('/apply-instructor/', formData);
      setStatus('Pending');
    } catch (err: any) {
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <div className="container py-3xl text-center text-secondary">Loading...</div>;
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="py-3xl" style={{ backgroundColor: 'var(--bg-inverse)', color: 'white' }}>
        <div className="container grid grid-cols-2 items-center gap-3xl">
          <div>
            <h1 className="text-h1 mb-lg">Come teach with us</h1>
            <p className="text-body-large mb-xl" style={{ color: '#9CA3AF' }}>
              Become an instructor and change lives — including your own. Join the ImraEdu community and reach millions of learners worldwide.
            </p>
            {status === 'none' && (
              <a href="#apply-form" className="btn" style={{ backgroundColor: 'white', color: 'var(--bg-inverse)', padding: '0.875rem 2rem', fontSize: '1.125rem' }}>
                Apply to Teach
              </a>
            )}
          </div>
          <div className="hide-on-mobile">
            <img 
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&q=80&w=600" 
              alt="Instructor" 
              style={{ borderRadius: 'var(--radius-xl)', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }} 
            />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="container py-3xl">
        <h2 className="text-h2 text-center mb-2xl">Why teach on ImraEdu?</h2>
        <div className="grid grid-cols-3 gap-xl">
          <div className="flex-col items-center text-center p-xl" style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ backgroundColor: 'var(--brand-blue-light)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <Users size={32} className="text-brand" />
            </div>
            <h3 className="text-h3 mb-sm">Inspire learners</h3>
            <p className="text-secondary">Teach what you know and help learners explore their interests, gain new skills, and advance their careers.</p>
          </div>
          <div className="flex-col items-center text-center p-xl" style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ backgroundColor: 'var(--brand-blue-light)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <CheckCircle size={32} className="text-brand" />
            </div>
            <h3 className="text-h3 mb-sm">Teach your way</h3>
            <p className="text-secondary">Publish the course you want, in the way you want, and always have control of your own content.</p>
          </div>
          <div className="flex-col items-center text-center p-xl" style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ backgroundColor: 'var(--brand-blue-light)', padding: '1rem', borderRadius: '50%', marginBottom: '1.5rem' }}>
              <GraduationCap size={32} className="text-brand" />
            </div>
            <h3 className="text-h3 mb-sm">Build your brand</h3>
            <p className="text-secondary">Expand your professional network, build your expertise, and make a global impact.</p>
          </div>
        </div>
      </section>

      {/* Application Form or Status */}
      <section id="apply-form" className="py-3xl" style={{ backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          {status === 'Pending' ? (
            <div className="text-center p-2xl" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', backgroundColor: '#F8FAFC' }}>
              <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: '#DBEAFE', borderRadius: '50%', color: '#1D4ED8', marginBottom: '1.5rem' }}>
                <CheckCircle size={48} />
              </div>
              <h2 className="text-h2 mb-sm">Application Received!</h2>
              <p className="text-secondary text-body-large mb-lg">
                Thank you for applying to teach on ImraEdu. Our team is currently reviewing your application. We will email you once a decision is made.
              </p>
              <Link to="/catalog" className="btn btn-secondary">Explore Courses</Link>
            </div>
          ) : status === 'Approved' ? (
            <div className="text-center p-2xl" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', backgroundColor: '#F0FDF4' }}>
              <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: '#DCFCE7', borderRadius: '50%', color: '#166534', marginBottom: '1.5rem' }}>
                <GraduationCap size={48} />
              </div>
              <h2 className="text-h2 mb-sm">You are an Instructor!</h2>
              <p className="text-secondary text-body-large mb-lg">
                Your application has been approved. You now have access to the Instructor Dashboard to create and publish courses.
              </p>
              <Link to="/instructor/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>Go to Dashboard</Link>
            </div>
          ) : status === 'Rejected' ? (
            <div className="text-center p-2xl" style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xl)', backgroundColor: '#FEF2F2' }}>
              <h2 className="text-h2 mb-sm text-accent-red">Application Declined</h2>
              <p className="text-secondary text-body-large mb-lg">
                Unfortunately, we cannot accept your application at this time. Thank you for your interest in ImraEdu.
              </p>
            </div>
          ) : (
            <div className="p-2xl" style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-xl)', margin: '0 auto', maxWidth: '600px' }}>
              <h2 className="text-h2 mb-xl text-center">Submit your application</h2>
              {!isAuthenticated && (
                <div className="mb-lg p-md text-center text-small text-brand" style={{ backgroundColor: 'var(--brand-blue-light)', borderRadius: 'var(--radius-md)' }}>
                  You must be logged in to apply. <Link to="/login" className="font-semibold" style={{ textDecoration: 'underline' }}>Log in here</Link>.
                </div>
              )}
              {error && <div className="mb-md text-accent-red text-center">{error}</div>}
              
              <form onSubmit={handleSubmit} className="flex-col gap-lg">
                <div className="form-group flex-col gap-xs">
                  <label className="font-semibold text-small">What is your area of expertise? *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.expertise}
                    onChange={(e) => setFormData({...formData, expertise: e.target.value})}
                    placeholder="e.g. Full-Stack Web Development, Data Science"
                    style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', outline: 'none', fontSize: '1rem', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--brand-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,86,210,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                
                <div className="form-group flex-col gap-xs">
                  <label className="font-semibold text-small">Briefly describe your teaching experience *</label>
                  <textarea 
                    required
                    rows={5}
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    placeholder="Tell us about any previous teaching, mentoring, or public speaking experience you have..."
                    style={{ padding: '0.875rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', outline: 'none', resize: 'vertical', fontSize: '1rem', transition: 'border-color 0.2s, box-shadow 0.2s' }}
                    onFocus={(e) => { e.target.style.borderColor = 'var(--brand-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,86,210,0.1)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--border-strong)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn btn-primary w-full" 
                  style={{ padding: '0.875rem' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ApplyToTeach;
