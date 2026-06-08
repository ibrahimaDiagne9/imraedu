import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }} className="py-2xl mt-3xl">
      <div className="container grid grid-cols-4 gap-xl">
        <div>
          <h3 className="text-h3 font-semibold mb-md">IMRAEDU.</h3>
          <p className="text-small text-tertiary mb-lg">Learn without limits. Accessible, high-quality education for everyone, everywhere.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-md">IMRAEDU</h4>
          <ul className="flex-col gap-sm">
            <li><Link to="/about" className="text-small text-tertiary hover-scale" style={{ display: 'inline-block' }}>About</Link></li>
            <li><Link to="/careers" className="text-small text-tertiary hover-scale" style={{ display: 'inline-block' }}>Careers</Link></li>
            <li><Link to="/catalog" className="text-small text-tertiary hover-scale" style={{ display: 'inline-block' }}>Catalog</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-md">Community</h4>
          <ul className="flex-col gap-sm">
            <li><Link to="/learners" className="text-small text-tertiary hover-scale" style={{ display: 'inline-block' }}>Learners</Link></li>
            <li><Link to="/partners" className="text-small text-tertiary hover-scale" style={{ display: 'inline-block' }}>Partners</Link></li>
            <li><Link to="/teaching-center" className="text-small text-tertiary hover-scale" style={{ display: 'inline-block' }}>Teaching Center</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-md">More</h4>
          <ul className="flex-col gap-sm">
            <li><Link to="/press" className="text-small text-tertiary hover-scale" style={{ display: 'inline-block' }}>Press</Link></li>
            <li><Link to="/investors" className="text-small text-tertiary hover-scale" style={{ display: 'inline-block' }}>Investors</Link></li>
            <li><Link to="/terms" className="text-small text-tertiary hover-scale" style={{ display: 'inline-block' }}>Terms</Link></li>
            <li><Link to="/privacy" className="text-small text-tertiary hover-scale" style={{ display: 'inline-block' }}>Privacy</Link></li>
          </ul>
        </div>
      </div>
      <div className="container mt-xl py-lg" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
        <p className="text-small text-tertiary">© 2026 IMRAEDU Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
