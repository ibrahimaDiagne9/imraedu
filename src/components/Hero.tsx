import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { ArrowRight, BookOpen, Star, Users } from 'lucide-react';

const Hero = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

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
                <Link to="/dashboard" className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>{t('nav.my_courses')}</Link>
                <Link to="/catalog" className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>{t('nav.explore')}</Link>
              </div>
            </>
          ) : (
            <>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'white', color: 'var(--brand-blue)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-full)', fontWeight: 600, fontSize: '0.875rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
                <Star size={16} fill="currentColor" />
                <span>#1 Online Learning Platform</span>
              </div>

              <h1 className="text-h1 mb-md" style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                {t('hero.title')}
              </h1>
              <p className="text-body-large text-secondary mb-xl" style={{ maxWidth: '600px', fontSize: '1.25rem' }}>
                {t('hero.subtitle')}
              </p>
              
              <div className="flex gap-md mb-xl flex-col-mobile">
                <Link to="/signup" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                  {t('hero.cta_join')} <ArrowRight size={20} />
                </Link>
                <Link to="/business" className="btn btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                  {t('hero.cta_business')}
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex items-center gap-xl text-small font-semibold text-tertiary uppercase tracking-wider" style={{ opacity: 0.8 }}>
                <div className="flex items-center gap-sm">
                  <Users size={20} /> {t('hero.stats.learners')}
                </div>
                <div className="flex items-center gap-sm">
                  <BookOpen size={20} /> 5,000+ {t('hero.stats.courses')}
                </div>
                <div className="flex items-center gap-sm">
                  <Star size={20} /> Professional {t('hero.stats.certifications')}
                </div>
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
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)'
              }}
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800';
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
