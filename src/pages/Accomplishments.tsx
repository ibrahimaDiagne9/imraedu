import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Award, Download } from 'lucide-react';
import api from '../api';
import SEO from '../components/SEO';

const fetchAccomplishments = async () => {
  const { data } = await api.get('/enrollments/');
  return data.filter((e: any) => e.completed);
};

const Accomplishments = () => {
  const { data: completed = [], isLoading } = useQuery({
    queryKey: ['accomplishments'],
    queryFn: fetchAccomplishments,
  });

  return (
    <div className="container py-3xl min-h-screen">
      <SEO title="My Accomplishments" description="View and download your earned certificates." />
      
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <div className="flex items-center gap-md mb-xl">
          <div style={{ padding: '1rem', backgroundColor: 'var(--brand-blue-light)', borderRadius: 'var(--radius-full)', color: 'var(--brand-blue)' }}>
            <Award size={32} />
          </div>
          <div>
            <h1 className="text-h1">Accomplishments</h1>
            <p className="text-body-large text-secondary">View, download, and share your earned certificates.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-3xl">
            <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-light)', borderTopColor: 'var(--brand-blue)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : completed.length === 0 ? (
          <div className="text-center p-3xl" style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-2xl)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
            <Award size={64} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1.5rem' }} />
            <h2 className="text-h2 mb-sm">No certificates yet</h2>
            <p className="text-body-large text-secondary mb-xl">Complete your first course to earn a verifiable certificate.</p>
            <Link to="/catalog" className="btn btn-primary">Explore Courses</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-xl">
            {completed.map((enrollment: any) => (
              <div key={enrollment.id} style={{ 
                backgroundColor: 'var(--bg-primary)', 
                borderRadius: 'var(--radius-xl)', 
                border: '1px solid var(--border-light)', 
                boxShadow: 'var(--shadow-md)',
                overflow: 'hidden',
                transition: 'transform 0.2s',
                display: 'flex',
                flexDirection: 'column'
              }} className="hover-scale">
                <div style={{ 
                  height: '180px', 
                  backgroundColor: enrollment.course.image_color || 'var(--brand-blue-light)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  borderBottom: '1px solid var(--border-light)',
                  position: 'relative'
                }}>
                  <Award size={80} color="rgba(255,255,255,0.8)" />
                  <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand-blue)' }}>
                    CERTIFIED
                  </div>
                </div>
                <div className="p-xl" style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 className="text-h3 mb-xs line-clamp-2">{enrollment.course.title}</h3>
                  <p className="text-small text-secondary mb-lg">Issued on {new Date(enrollment.enrolled_at).toLocaleDateString()} • By {enrollment.course.instructor_name}</p>
                  
                  <div style={{ marginTop: 'auto' }}>
                    <Link to={`/certificate/${enrollment.course.id}`} className="btn btn-secondary w-full flex items-center justify-center gap-xs">
                      <Download size={16} /> View Certificate
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Accomplishments;
