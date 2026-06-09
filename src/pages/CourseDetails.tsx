import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Star, Clock, Globe, Award, PlayCircle, BarChart, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const fetchCourse = async (id: string) => {
  const { data } = await api.get(`/courses/${id}/`);
  return data;
};

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const { data: course, isLoading, isError } = useQuery({
    queryKey: ['course', id],
    queryFn: () => fetchCourse(id!),
    enabled: !!id,
  });

  const enrollMutation = useMutation({
    mutationFn: () => api.post('/enrollments/enroll/', { course_id: Number(id) }),
  });

  if (isLoading) return <div className="container py-3xl text-center text-secondary">Loading course details...</div>;
  if (isError || !course) return <div className="container py-3xl text-center" style={{ color: 'var(--accent-red)' }}>Course not found or not published yet.</div>;

  const moduleCount = course.modules?.length || 0;
  const lessonCount = course.modules?.reduce((sum: number, m: any) => sum + (m.lessons?.length || 0), 0) || 0;

  return (
    <div>
      {/* Course Header Banner */}
      <div style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)', padding: '4rem 0' }}>
        <div className="container grid grid-cols-2 gap-3xl">
          <div className="flex-col gap-md">
            <div className="text-small font-semibold mb-sm" style={{ color: '#9CA3AF' }}>
              ImraEdu Free Catalog &gt; {course.level} &gt; {course.provider || 'ImraEdu'}
            </div>
            <h1 className="text-h1">{course.title}</h1>
            <p className="text-body-large" style={{ color: '#D1D5DB' }}>
              {course.description || 'Explore this free course and advance your skills.'}
            </p>
            <div className="flex items-center gap-md mt-sm text-small">
              <span className="font-semibold" style={{ color: '#FACC15' }}>{(course.rating || 0).toFixed(1)}</span>
              <div className="flex" style={{ color: '#FACC15' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={14} fill={i <= Math.round(course.rating || 0) ? 'currentColor' : 'none'} />
                ))}
              </div>
              <span>({(course.reviews || 0).toLocaleString()} ratings)</span>
              <span className="flex items-center gap-xs"><Users size={14} /> {course.enrollment_count || 0} enrolled</span>
            </div>
            {course.instructor_name && (
              <div className="mt-sm text-small" style={{ color: '#D1D5DB' }}>
                Taught by <span className="font-semibold" style={{ color: 'white' }}>{course.instructor_name}</span>
              </div>
            )}
            <div className="flex items-center gap-xl mt-lg">
              <div className="flex items-center gap-sm"><Globe size={18} /> <span>English</span></div>
              <div className="flex items-center gap-sm"><Clock size={18} /> <span>{course.duration || 'Self-paced'}</span></div>
              <div className="flex items-center gap-sm"><BarChart size={18} /> <span>{course.level}</span></div>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <div style={{ backgroundColor: 'white', color: 'var(--text-primary)', padding: '2rem', borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '400px', boxShadow: 'var(--shadow-xl)' }}>
              <div style={{
                width: '100%', height: '200px',
                backgroundColor: course.image_color || 'var(--bg-tertiary)',
                backgroundImage: course.thumbnail_url ? `url(${course.thumbnail_url})` : undefined,
                backgroundSize: 'cover', backgroundPosition: 'center',
                borderRadius: 'var(--radius-md)', marginBottom: '1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
              }}>
                {!course.thumbnail_url && <PlayCircle size={48} className="text-brand" />}
              </div>
              <h3 className="font-semibold mb-md">100% Free Access</h3>
              {user ? (
                <>
                  <button
                    onClick={() => enrollMutation.mutate()}
                    disabled={enrollMutation.isPending}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', marginBottom: '0.5rem' }}
                  >
                    {enrollMutation.isPending ? 'Enrolling...' : enrollMutation.isSuccess ? '✓ Enrolled!' : 'Enroll for Free'}
                  </button>
                  <Link to={`/learn/${id}`} className="btn btn-secondary" style={{ width: '100%', padding: '0.75rem', textAlign: 'center', display: 'block', marginBottom: '1rem' }}>
                    Go to Course Player
                  </Link>
                </>
              ) : (
                <Link to="/signup" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', marginBottom: '1rem', display: 'block', textAlign: 'center' }}>
                  Sign Up to Enroll
                </Link>
              )}
              <p className="text-small text-center text-tertiary">Access all course materials immediately.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Details Content */}
      <div className="container details-layout py-3xl">
        <div className="flex-col gap-2xl">
          {course.description && (
            <section>
              <h2 className="text-h2 mb-lg">About this course</h2>
              <p className="text-body text-secondary">{course.description}</p>
            </section>
          )}

          {/* Real Syllabus */}
          <section>
            <h2 className="text-h2 mb-lg">Syllabus</h2>
            <p className="text-secondary mb-md">{moduleCount} modules • {lessonCount} lessons</p>
            {moduleCount > 0 ? (
              <div className="flex-col gap-md">
                {course.modules.map((mod: any, i: number) => (
                  <div key={mod.id} style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: '1.5rem' }}>
                    <h3 className="text-h3 mb-sm">Section {i + 1}: {mod.title}</h3>
                    <div className="flex items-center gap-md text-small text-tertiary mb-md">
                      <span className="flex items-center gap-xs"><PlayCircle size={14} /> {mod.lessons?.length || 0} lessons</span>
                    </div>
                    {mod.lessons && mod.lessons.length > 0 && (
                      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {mod.lessons.map((lesson: any) => (
                          <li key={lesson.id} className="flex items-center gap-sm text-secondary text-small" style={{ padding: '0.4rem 0' }}>
                            <PlayCircle size={14} className="text-brand" />
                            <span>{lesson.title}</span>
                            <span className="text-tertiary" style={{ marginLeft: 'auto' }}>{lesson.duration}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-secondary">The curriculum for this course is being prepared.</p>
            )}
          </section>
        </div>

        <div>
          {/* Sidebar Info */}
          <div style={{ position: 'sticky', top: '100px' }}>
            <div className="flex-col gap-lg">
              <div className="flex gap-md items-start">
                <Award className="text-brand mt-xs" size={24} />
                <div>
                  <h4 className="font-semibold">Shareable Certificate</h4>
                  <p className="text-small text-secondary">Earn a certificate upon completion</p>
                </div>
              </div>
              <div className="flex gap-md items-start">
                <Globe className="text-brand mt-xs" size={24} />
                <div>
                  <h4 className="font-semibold">100% online courses</h4>
                  <p className="text-small text-secondary">Start instantly and learn at your own schedule.</p>
                </div>
              </div>
              <div className="flex gap-md items-start">
                <Clock className="text-brand mt-xs" size={24} />
                <div>
                  <h4 className="font-semibold">Flexible deadlines</h4>
                  <p className="text-small text-secondary">Reset deadlines in accordance to your schedule.</p>
                </div>
              </div>
              <div className="flex gap-md items-start">
                <BarChart className="text-brand mt-xs" size={24} />
                <div>
                  <h4 className="font-semibold">{course.level} Level</h4>
                  <p className="text-small text-secondary">
                    {course.level === 'Beginner' ? 'No prior experience required.' : `Recommended for ${course.level.toLowerCase()} learners.`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
