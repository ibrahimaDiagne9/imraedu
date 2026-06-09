import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlayCircle, Award, Clock, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const fetchEnrollments = async () => {
  const { data } = await api.get('/enrollments/');
  return data;
};

const Dashboard = () => {
  const { user } = useAuth();

  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ['enrollments'],
    queryFn: fetchEnrollments,
  });

  const inProgress = enrollments.filter((e: any) => !e.completed);
  const completed = enrollments.filter((e: any) => e.completed);
  const initials = user ? (user.first_name?.[0] || user.username[0]).toUpperCase() : '?';
  const [activeTab, setActiveTab] = useState<'inProgress' | 'completed'>('inProgress');
  const visibleEnrollments = activeTab === 'inProgress' ? inProgress : completed;

  return (
    <div className="container py-3xl min-h-screen">
      <h1 className="text-h1 mb-xl">My Learning</h1>

      {/* Tabs */}
      <div className="flex gap-lg border-b mb-xl" style={{ borderBottom: '1px solid var(--border-light)' }}>
        <button
          className="pb-sm font-medium"
          style={{ borderBottom: activeTab === 'inProgress' ? '2px solid var(--brand-blue)' : '2px solid transparent', color: activeTab === 'inProgress' ? 'var(--brand-blue)' : 'var(--text-secondary)' }}
          onClick={() => setActiveTab('inProgress')}
        >In Progress ({inProgress.length})</button>
        <button
          className="pb-sm font-medium"
          style={{ borderBottom: activeTab === 'completed' ? '2px solid var(--brand-blue)' : '2px solid transparent', color: activeTab === 'completed' ? 'var(--brand-blue)' : 'var(--text-secondary)' }}
          onClick={() => setActiveTab('completed')}
        >Completed ({completed.length})</button>
      </div>

      <div className="dashboard-layout">
        <div>
          {isLoading ? (
            <p className="text-secondary py-xl text-center">Loading your courses...</p>
          ) : visibleEnrollments.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '4rem 2rem',
              backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)',
              border: '2px dashed var(--border-strong)'
            }}>
              <BookOpen size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
              <h3 className="text-h3 mb-sm">{activeTab === 'inProgress' ? 'No courses in progress' : 'No completed courses yet'}</h3>
              <p className="text-secondary mb-lg">{activeTab === 'inProgress' ? 'Browse our catalog to find your first course!' : 'Keep learning to earn your first completion!'}</p>
              {activeTab === 'inProgress' && <Link to="/catalog" className="btn btn-primary">Browse Catalog</Link>}
            </div>
          ) : (
            <div className="flex-col gap-lg">
              {visibleEnrollments.map((enrollment: any) => (
                <div key={enrollment.id} className="enrollment-card">
                  <div className="thumbnail" style={{
                    width: '150px', height: '150px',
                    backgroundColor: enrollment.course.image_color || '#EBF3FF',
                    backgroundImage: enrollment.course.thumbnail_url ? `url(${enrollment.course.thumbnail_url})` : undefined,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    borderRadius: 'var(--radius-lg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {!enrollment.course.thumbnail_url && <PlayCircle size={48} className="text-brand" />}
                  </div>
                  <div className="flex-1 flex-col justify-center gap-md">
                    <div>
                      <span className="text-small text-tertiary">{enrollment.course.provider || enrollment.course.instructor_name}</span>
                      <h2 className="text-h3 font-semibold mt-xs">{enrollment.course.title}</h2>
                    </div>

                    <div>
                      <div className="flex justify-between text-small mb-xs">
                        <span className="font-semibold text-brand">{enrollment.course.level}</span>
                        <span className="text-secondary">{enrollment.progress_percentage}%</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '4px' }}>
                        <div style={{ width: `${enrollment.progress_percentage}%`, height: '100%', backgroundColor: 'var(--brand-blue)', borderRadius: '4px', transition: 'width 0.3s ease' }}></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-sm">
                      <span className="text-small text-tertiary flex items-center gap-xs">
                        <Clock size={14} /> Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </span>
                      <Link to={`/learn/${enrollment.course.id}`} className="btn btn-primary" style={{ padding: '0.5rem 1.5rem' }}>Resume</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          {/* Sidebar */}
          <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', padding: 'var(--spacing-xl)', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-light)' }}>
            <div className="flex items-center gap-md mb-lg">
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--brand-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="text-h3 text-brand font-semibold">{initials}</span>
              </div>
              <div>
                <h3 className="font-semibold">{user?.first_name || user?.username}</h3>
                <Link to="/profile" className="text-small text-brand">Edit Profile</Link>
              </div>
            </div>

            <div className="flex-col gap-md pt-lg" style={{ borderTop: '1px solid var(--border-light)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm text-secondary"><Award size={18} /> Certificates Earned</div>
                <span className="font-semibold text-brand text-h3">{completed.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm text-secondary"><PlayCircle size={18} /> Courses in Progress</div>
                <span className="font-semibold">{inProgress.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
