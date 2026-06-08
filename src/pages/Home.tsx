import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Hero from '../components/Hero';
import CourseCard from '../components/CourseCard';
import api from '../api';

const fetchCourses = async () => {
  const { data } = await api.get('/courses/');
  return data;
};

const Home = () => {
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: fetchCourses,
  });

  const featured = courses.slice(0, 4);

  return (
    <div>
      <Hero />

      <section className="py-3xl container">
        <div className="flex justify-between items-center mb-xl">
          <h2 className="text-h2">Launch your new career</h2>
          <Link to="/catalog" className="btn btn-ghost text-brand font-semibold">Show all</Link>
        </div>
        {isLoading ? (
          <p className="text-secondary text-center py-xl">Loading courses...</p>
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-4 gap-xl">
            {featured.map((course: any) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        ) : (
          <div className="text-center py-xl" style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', padding: '3rem' }}>
            <p className="text-secondary text-body-large">Courses are being added by our instructors. Check back soon!</p>
            <Link to="/catalog" className="btn btn-primary mt-md" style={{ display: 'inline-block' }}>Browse Catalog</Link>
          </div>
        )}
      </section>

      <section className="py-3xl container" style={{ backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', padding: '4rem 3rem', boxShadow: 'var(--shadow-sm)' }}>
        <div className="grid grid-cols-2 items-center gap-3xl">
          <div>
            <h2 className="text-h2 mb-lg">Access to education is a <span className="text-brand">right</span>, not a privilege.</h2>
            <p className="text-body-large text-secondary mb-xl">
              ImraEdu provides free, unlimited access to world-class educational content. We believe everyone deserves the opportunity to learn and grow without financial barriers.
            </p>
            <Link to="/signup" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>Start your journey today</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--brand-blue-light)', padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <div className="text-h2 text-brand mb-xs">{courses.length > 0 ? `${courses.length}+` : '—'}</div>
              <div className="text-secondary font-medium">Free Courses</div>
            </div>
            <div style={{ backgroundColor: '#F0FDF4', padding: '2rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', marginTop: '2rem' }}>
              <div className="text-h2 mb-xs" style={{ color: 'var(--accent-green)' }}>100%</div>
              <div className="text-secondary font-medium">Free Forever</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
