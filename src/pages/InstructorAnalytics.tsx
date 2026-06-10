import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, CheckCircle, Star, TrendingUp } from 'lucide-react';
import api from '../api';
import SEO from '../components/SEO';

const fetchAnalytics = async () => {
  const { data } = await api.get('/instructor/courses/analytics/');
  return data;
};

const InstructorAnalytics = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['instructor-analytics'],
    queryFn: fetchAnalytics,
  });

  if (isLoading) return <div className="container py-3xl text-center">Loading analytics...</div>;
  if (isError || !data) return <div className="container py-3xl text-center text-accent-red">Failed to load analytics.</div>;

  return (
    <div className="container py-3xl">
      <SEO title="Analytics | Instructor Dashboard" />
      
      <div className="flex justify-between items-center mb-2xl">
        <h1 className="text-h1">Instructor Analytics</h1>
      </div>

      {/* Top Level Metrics */}
      <div className="grid grid-cols-3 gap-lg mb-3xl">
        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-sm mb-sm text-secondary">
            <Users size={20} className="text-brand" />
            <h3 className="font-semibold text-small">Total Enrollments</h3>
          </div>
          <div className="text-h2">{data.total_enrollments.toLocaleString()}</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-sm mb-sm text-secondary">
            <CheckCircle size={20} style={{ color: '#10B981' }} />
            <h3 className="font-semibold text-small">Total Completions</h3>
          </div>
          <div className="text-h2">{data.total_completions.toLocaleString()}</div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
          <div className="flex items-center gap-sm mb-sm text-secondary">
            <Star size={20} style={{ color: '#FACC15' }} />
            <h3 className="font-semibold text-small">Average Rating</h3>
          </div>
          <div className="text-h2 flex items-baseline gap-xs">
            {data.avg_rating.toFixed(1)} <span className="text-small text-tertiary">/ 5.0</span>
          </div>
        </div>
      </div>

      {/* Enrollment Trends Chart */}
      <div className="mb-3xl p-2xl" style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)' }}>
        <div className="flex items-center gap-sm mb-xl">
          <TrendingUp size={24} className="text-brand" />
          <h2 className="text-h3">Enrollment Trends (Last 6 Months)</h2>
        </div>
        
        {data.trends && data.trends.length > 0 ? (
          <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer>
              <BarChart data={data.trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="enrollments" fill="var(--brand-blue)" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-tertiary">No enrollment data available yet.</p>
        )}
      </div>

      {/* Course Performance Table */}
      <div style={{ backgroundColor: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
        <div className="p-xl border-b" style={{ borderBottom: '1px solid var(--border-light)' }}>
          <h2 className="text-h3">Course Performance</h2>
        </div>
        
        {data.course_performance && data.course_performance.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                <tr>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Course Title</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Enrollments</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Completions</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Avg Progress</th>
                  <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Rating</th>
                </tr>
              </thead>
              <tbody className="text-small">
                {data.course_performance.map((course: any) => (
                  <tr key={course.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>{course.title}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>{course.enrollments.toLocaleString()}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>{course.completions.toLocaleString()}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div className="flex items-center gap-sm">
                        <div style={{ width: '60px', height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${course.avg_progress}%`, height: '100%', backgroundColor: 'var(--brand-blue)' }}></div>
                        </div>
                        <span className="text-tertiary">{course.avg_progress}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div className="flex items-center gap-xs">
                        <Star size={14} fill={course.rating > 0 ? '#FACC15' : 'none'} color={course.rating > 0 ? '#FACC15' : '#D1D5DB'} />
                        <span>{course.rating > 0 ? course.rating.toFixed(1) : '-'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-2xl text-center text-tertiary">
            No courses published yet.
          </div>
        )}
      </div>

    </div>
  );
};

export default InstructorAnalytics;
