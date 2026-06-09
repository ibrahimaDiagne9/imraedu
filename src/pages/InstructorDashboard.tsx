import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen, Plus, Users, Star, Eye, EyeOff,
  Edit3, Trash2, GraduationCap
} from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';

const fetchMyCourses = async () => {
  const { data } = await api.get('/instructor/courses/');
  return data;
};

const InstructorDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', level: 'Beginner',
    duration: '', image_color: '#EBF3FF', thumbnail_url: '', is_published: false
  });

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: fetchMyCourses,
  });

  const createCourse = useMutation({
    mutationFn: (data: typeof form) => api.post('/instructor/courses/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instructor-courses'] });
      setShowCreateModal(false);
      setForm({ title: '', description: '', level: 'Beginner', duration: '', image_color: '#EBF3FF', thumbnail_url: '', is_published: false });
    },
  });

  const deleteCourse = useMutation({
    mutationFn: (id: number) => api.delete(`/instructor/courses/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instructor-courses'] }),
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, is_published }: { id: number; is_published: boolean }) =>
      api.patch(`/instructor/courses/${id}/`, { is_published }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instructor-courses'] }),
  });

  const totalEnrollments = courses.reduce((sum: number, c: any) => sum + (c.reviews || 0), 0);
  const publishedCount = courses.filter((c: any) => c.is_published).length;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-strong)',
    fontFamily: 'inherit', fontSize: '0.95rem',
    backgroundColor: 'var(--bg-primary)', outline: 'none',
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)', padding: '3rem 0' }}>
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-sm mb-sm">
                <GraduationCap size={28} color="white" />
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                  INSTRUCTOR PANEL
                </span>
              </div>
              <h1 className="text-h1" style={{ color: 'white', marginBottom: '0.5rem' }}>
                Welcome, {user?.first_name || user?.username}!
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1.05rem' }}>
                Manage your courses and track your learners' progress.
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn"
              style={{
                backgroundColor: 'white', color: 'var(--brand-blue)',
                fontWeight: 700, padding: '0.85rem 1.75rem',
                borderRadius: 'var(--radius-full)',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
              }}
            >
              <Plus size={20} /> New Course
            </button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-4 gap-md mt-xl">
            {[
              { label: 'Total Courses', value: courses.length, icon: <BookOpen size={20} /> },
              { label: 'Published', value: publishedCount, icon: <Eye size={20} /> },
              { label: 'Draft', value: courses.length - publishedCount, icon: <EyeOff size={20} /> },
              { label: 'Learners', value: totalEnrollments, icon: <Users size={20} /> },
            ].map((stat) => (
              <div key={stat.label} style={{
                backgroundColor: 'rgba(255,255,255,0.12)',
                backdropFilter: 'blur(10px)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-md)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '0.5rem' }}>{stat.icon}</div>
                <div style={{ color: 'white', fontSize: '1.75rem', fontWeight: 700 }}>{stat.value}</div>
                <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.85rem' }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="container py-3xl">
        <h2 className="text-h2 mb-lg">Your Courses</h2>

        {isLoading ? (
          <p className="text-secondary">Loading courses...</p>
        ) : courses.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '5rem',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-xl)',
            border: '2px dashed var(--border-strong)'
          }}>
            <BookOpen size={48} style={{ color: 'var(--text-tertiary)', margin: '0 auto 1rem' }} />
            <h3 className="text-h3 mb-sm">No courses yet</h3>
            <p className="text-secondary mb-lg">Start creating your first course to share your knowledge with learners worldwide.</p>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              <Plus size={18} style={{ marginRight: '0.5rem' }} /> Create First Course
            </button>
          </div>
        ) : (
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-xl)',
            border: '1px solid var(--border-light)',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-light)' }}>
                  {['Course', 'Level', 'Status', 'Rating', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '1rem 1.25rem', textAlign: 'left', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courses.map((course: any) => (
                  <tr key={course.id} style={{ borderBottom: '1px solid var(--border-light)' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = '')}
                  >
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{
                          width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                          backgroundColor: course.image_color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          <BookOpen size={20} color="#2563eb" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{course.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
                            {course.modules?.length || 0} modules
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem', fontWeight: 600,
                        backgroundColor: 'var(--brand-blue-light)', color: 'var(--brand-blue)'
                      }}>{course.level}</span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)',
                        fontSize: '0.8rem', fontWeight: 600,
                        backgroundColor: course.is_published ? '#DCFCE7' : '#FEF3C7',
                        color: course.is_published ? '#15803D' : '#92400E'
                      }}>
                        {course.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Star size={14} fill="#FBBF24" color="#FBBF24" />
                        <span style={{ fontWeight: 600 }}>{course.rating || '—'}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Link
                          to={`/instructor/course/${course.id}/edit`}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-md)',
                            backgroundColor: 'var(--brand-blue-light)', color: 'var(--brand-blue)',
                            fontSize: '0.85rem', fontWeight: 600, textDecoration: 'none'
                          }}
                        >
                          <Edit3 size={14} /> Edit
                        </Link>
                        <button
                          onClick={() => togglePublish.mutate({ id: course.id, is_published: !course.is_published })}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-md)',
                            backgroundColor: course.is_published ? '#FEF3C7' : '#DCFCE7',
                            color: course.is_published ? '#92400E' : '#15803D',
                            fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer'
                          }}
                        >
                          {course.is_published ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish</>}
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this course?')) deleteCourse.mutate(course.id); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                            padding: '0.4rem 0.9rem', borderRadius: 'var(--radius-md)',
                            backgroundColor: '#FEF2F2', color: '#DC2626',
                            fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {showCreateModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: '2.5rem',
            width: '100%', maxWidth: '560px',
            boxShadow: 'var(--shadow-xl)',
            maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 className="text-h2 mb-sm">Create New Course</h2>
            <p className="text-secondary mb-xl">Start with the basics. You can add modules and lessons after creating the course.</p>

            <form onSubmit={e => { e.preventDefault(); createCourse.mutate(form); }}
              style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Course Title *</label>
                <input style={inputStyle} placeholder="e.g. Introduction to Machine Learning" required
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Description</label>
                <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                  placeholder="What will learners gain from this course?"
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="split-grid">
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Level</label>
                  <select style={inputStyle} value={form.level}
                    onChange={e => setForm(f => ({ ...f, level: e.target.value }))}>
                    {['Beginner', 'Intermediate', 'Advanced', 'Mixed'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Duration</label>
                  <input style={inputStyle} placeholder="e.g. 4 weeks" value={form.duration}
                    onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Thumbnail Image URL</label>
                <input style={inputStyle} type="url" placeholder="https://example.com/image.jpg"
                  value={form.thumbnail_url} onChange={e => setForm(f => ({ ...f, thumbnail_url: e.target.value }))} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.4rem', fontSize: '0.9rem' }}>Card Background Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="color" value={form.image_color}
                    onChange={e => setForm(f => ({ ...f, image_color: e.target.value }))}
                    style={{ width: '48px', height: '38px', border: '1px solid var(--border-strong)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }} />
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{form.image_color}</span>
                </div>
              </div>

              {createCourse.isError && (
                <p style={{ color: '#DC2626', fontSize: '0.9rem' }}>Failed to create course. Please try again.</p>
              )}

              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={createCourse.isPending}>
                  {createCourse.isPending ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
