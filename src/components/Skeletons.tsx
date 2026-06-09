import React from 'react';

export const CourseSkeleton = () => {
  return (
    <div className="course-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Thumbnail skeleton */}
      <div className="course-thumbnail" style={{ height: '160px', position: 'relative', overflow: 'hidden' }}>
        <div className="skeleton-shimmer" style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-tertiary)' }} />
      </div>
      
      {/* Content skeleton */}
      <div className="course-content" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div className="skeleton-shimmer" style={{ width: '80%', height: '24px', borderRadius: '4px', marginBottom: '0.75rem', backgroundColor: 'var(--bg-tertiary)' }} />
        <div className="skeleton-shimmer" style={{ width: '60%', height: '16px', borderRadius: '4px', marginBottom: 'auto', backgroundColor: 'var(--bg-tertiary)' }} />
        
        {/* Footer skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
          <div className="skeleton-shimmer" style={{ width: '30%', height: '16px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }} />
          <div className="skeleton-shimmer" style={{ width: '20%', height: '16px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }} />
        </div>
      </div>
    </div>
  );
};

export const EnrollmentSkeleton = () => {
  return (
    <div className="enrollment-card" style={{ display: 'flex', gap: '1.5rem', padding: '1.5rem', backgroundColor: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
      {/* Thumbnail skeleton */}
      <div className="skeleton-shimmer" style={{ width: '150px', height: '150px', borderRadius: 'var(--radius-lg)', flexShrink: 0, backgroundColor: 'var(--bg-tertiary)' }} />
      
      {/* Content skeleton */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1rem' }}>
        <div>
          <div className="skeleton-shimmer" style={{ width: '30%', height: '14px', borderRadius: '4px', marginBottom: '0.5rem', backgroundColor: 'var(--bg-tertiary)' }} />
          <div className="skeleton-shimmer" style={{ width: '70%', height: '28px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }} />
        </div>
        
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <div className="skeleton-shimmer" style={{ width: '15%', height: '14px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }} />
            <div className="skeleton-shimmer" style={{ width: '10%', height: '14px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }} />
          </div>
          <div className="skeleton-shimmer" style={{ width: '100%', height: '8px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton-shimmer" style={{ width: '25%', height: '14px', borderRadius: '4px', backgroundColor: 'var(--bg-tertiary)' }} />
          <div className="skeleton-shimmer" style={{ width: '100px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--bg-tertiary)' }} />
        </div>
      </div>
    </div>
  );
};
