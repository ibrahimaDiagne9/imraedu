import { Award, Share2, Download } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const fetchCourse = async (id: string) => {
  const { data } = await api.get(`/courses/${id}/`);
  return data;
};

const Certificate = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => fetchCourse(id!),
    enabled: !!id,
  });

  const displayName = user?.first_name
    ? `${user.first_name}`
    : user?.username || 'Learner';

  const courseTitle = course?.title || 'Course';
  const instructorName = course?.instructor_name || 'ImraEdu';

  if (isLoading) return <div className="container py-3xl text-center text-secondary">Loading certificate...</div>;

  return (
    <div className="container py-3xl min-h-screen flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-xl">
          <h1 className="text-h2">Course Certificate</h1>
          <div className="flex gap-md">
            <button className="btn btn-secondary flex items-center gap-xs"><Download size={16} /> Download PDF</button>
            <button className="btn btn-primary flex items-center gap-xs"><Share2 size={16} /> Share</button>
          </div>
        </div>

        {/* Certificate Rendering */}
        <div style={{
          border: '10px solid var(--brand-blue-light)',
          padding: '4rem',
          backgroundColor: 'white',
          textAlign: 'center',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Decorative elements */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100px', height: '100px', borderRight: '10px solid var(--brand-blue-light)', borderBottom: '10px solid var(--brand-blue-light)' }}></div>
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '100px', height: '100px', borderLeft: '10px solid var(--brand-blue-light)', borderTop: '10px solid var(--brand-blue-light)' }}></div>

          <div className="flex justify-center mb-xl">
            <Award size={64} className="text-brand" />
          </div>

          <h2 className="text-h3 text-tertiary tracking-widest uppercase mb-lg">Certificate of Completion</h2>

          <p className="text-body-large text-secondary mb-sm">This is to certify that</p>
          <h1 className="text-h1 text-brand mb-lg font-serif" style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            {displayName}
          </h1>

          <p className="text-body-large text-secondary mb-sm">has successfully completed the course</p>
          <h2 className="text-h2 mb-2xl">{courseTitle}</h2>

          <div className="grid grid-cols-3 gap-xl mt-3xl text-left" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '2rem' }}>
            <div>
              <p className="text-small font-semibold mb-xs">Instructor</p>
              <p className="font-serif italic text-lg" style={{ fontFamily: 'Georgia, serif', fontSize: '1.25rem' }}>{instructorName}</p>
            </div>
            <div>
              <p className="text-small font-semibold mb-xs">Date Completed</p>
              <p>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div>
              <p className="text-small font-semibold mb-xs">Verify at</p>
              <p className="text-small text-brand">imraedu.com/verify/{id || 'cert'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
