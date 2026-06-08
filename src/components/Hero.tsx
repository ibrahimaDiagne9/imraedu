const Hero = () => {
  return (
    <div style={{ background: 'linear-gradient(135deg, var(--brand-blue-light) 0%, #FFFFFF 100%)', padding: '6rem 0' }}>
      <div className="container grid grid-cols-2 items-center gap-3xl">
        <div className="flex-col gap-lg animate-fade-in">
          <h1 className="text-h1">Learn without <span className="text-brand">limits</span></h1>
          <p className="text-body-large text-secondary">
            Start, switch, or advance your career with thousands of free courses, Professional Certificates, and degrees from world-class universities and companies.
          </p>
          <div className="flex gap-md mt-sm">
            <button className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>Join for Free</button>
            <button className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1.125rem' }}>Explore Courses</button>
          </div>
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <div style={{ 
            background: 'white', 
            padding: '2rem', 
            borderRadius: 'var(--radius-xl)', 
            boxShadow: 'var(--shadow-xl)',
            transform: 'rotate(2deg)'
          }}>
            <div style={{ height: '300px', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="text-tertiary font-medium">Hero Graphic / Image Placeholder</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
