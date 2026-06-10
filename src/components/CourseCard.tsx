import { Link } from 'react-router-dom';
import { Star, Clock, BarChart } from 'lucide-react';

interface CourseCardProps {
  id: number | string;
  title: string;
  provider: string;
  rating: number;
  reviews: number;
  level: string;
  duration: string;
  imageColor?: string;
  image_color?: string;
  thumbnail_url?: string;
}

const CourseCard = ({ id, title, provider, rating, reviews, level, duration, imageColor, image_color, thumbnail_url }: CourseCardProps) => {
  const bgColor = imageColor || image_color || '#EBF3FF';

  return (
    <Link to={`/course/${id}`} className="hover-scale" style={{ display: 'block', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
      <div style={{ height: '160px', backgroundColor: bgColor, position: 'relative', backgroundImage: thumbnail_url ? `url('${thumbnail_url}')` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
          Free
        </div>
      </div>
      <div style={{ padding: 'var(--spacing-lg)' }}>
        <div className="flex items-center gap-xs mb-sm">
          <span className="text-small text-tertiary">{provider}</span>
        </div>
        <h3 className="font-semibold mb-md" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '3rem' }}>
          {title}
        </h3>
        <div className="flex items-center gap-sm mb-md">
          <span className="font-semibold text-small" style={{ color: '#b4690e' }}>{(rating || 0).toFixed(1)}</span>
          <div className="flex" style={{ color: '#b4690e' }}>
            <Star size={14} fill="currentColor" />
          </div>
          <span className="text-small text-tertiary">({(reviews || 0).toLocaleString()})</span>
        </div>
        <div className="flex items-center gap-md text-small text-tertiary pt-sm" style={{ borderTop: '1px solid var(--border-light)' }}>
          <div className="flex items-center gap-xs">
            <BarChart size={14} />
            <span>{level || 'Beginner'}</span>
          </div>
          <div className="flex items-center gap-xs">
            <Clock size={14} />
            <span>{duration || '—'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
