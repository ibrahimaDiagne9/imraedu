import { useRef, useState } from 'react';
import { Award, Share2, Download } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const fetchCourse = async (id: string) => {
  const { data } = await api.get(`/courses/${id}/`);
  return data;
};

const Certificate = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => fetchCourse(id!),
    enabled: !!id,
  });

  const displayName = user?.first_name
    ? `${user.first_name}`
    : user?.username || 'Learner';

  const courseTitle = course?.title || 'Course';
  const instructorName = course?.instructor_name || 'ImraEdu';

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    setIsDownloading(true);
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${courseTitle.replace(/\s+/g, '_')}_Certificate.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) return <div className="container py-3xl text-center text-secondary">Loading certificate...</div>;

  return (
    <div className="container py-3xl min-h-screen flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <div className="flex justify-between items-center mb-xl">
          <h1 className="text-h2">Course Certificate</h1>
          <div className="flex gap-md">
            <button 
              className="btn btn-secondary flex items-center gap-xs"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download size={16} /> {isDownloading ? 'Generating...' : 'Download PDF'}
            </button>
            <button className="btn btn-primary flex items-center gap-xs"><Share2 size={16} /> Share</button>
          </div>
        </div>

        {/* Certificate Rendering */}
        <div ref={certificateRef} style={{
          backgroundColor: '#fff',
          padding: '20px',
          boxShadow: 'var(--shadow-xl)',
          position: 'relative',
          overflow: 'hidden',
          aspectRatio: '1.414 / 1' // A4 Landscape ratio
        }}>
          {/* Inner Ornate Border */}
          <div style={{
            border: '6px solid var(--brand-blue)',
            outline: '2px solid var(--brand-blue)',
            outlineOffset: '-16px',
            padding: '2rem 3rem',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            position: 'relative',
            background: 'radial-gradient(circle at center, #ffffff 40%, #f8fafc 100%)'
          }}>
            {/* Corner Ornaments */}
            <div style={{ position: 'absolute', top: '24px', left: '24px', width: '40px', height: '40px', borderTop: '4px solid var(--brand-blue)', borderLeft: '4px solid var(--brand-blue)' }}></div>
            <div style={{ position: 'absolute', top: '24px', right: '24px', width: '40px', height: '40px', borderTop: '4px solid var(--brand-blue)', borderRight: '4px solid var(--brand-blue)' }}></div>
            <div style={{ position: 'absolute', bottom: '24px', left: '24px', width: '40px', height: '40px', borderBottom: '4px solid var(--brand-blue)', borderLeft: '4px solid var(--brand-blue)' }}></div>
            <div style={{ position: 'absolute', bottom: '24px', right: '24px', width: '40px', height: '40px', borderBottom: '4px solid var(--brand-blue)', borderRight: '4px solid var(--brand-blue)' }}></div>

            {/* Faint Watermark Logo */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.03, pointerEvents: 'none' }}>
              <img src="/image/IMRAEDU.png" style={{ width: '600px' }} alt="" />
            </div>

            <div className="flex flex-col items-center justify-center mb-md gap-sm relative z-10">
              <img src="/image/IMRAEDU.png" width="200" height="auto" alt="ImraEdu Logo" />
            </div>

            <div className="text-center relative z-10 flex-1 flex flex-col justify-center">
              <h2 className="text-tertiary tracking-[0.3em] uppercase mb-md" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--brand-blue)' }}>Certificate of Completion</h2>

              <p className="text-body-large text-secondary mb-xs" style={{ fontStyle: 'italic' }}>This is to proudly certify that</p>
              
              <h1 className="mb-md font-serif" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '3rem', color: '#111827', borderBottom: '2px solid var(--brand-blue)', display: 'inline-block', padding: '0 2rem', paddingBottom: '0.5rem' }}>
                {displayName}
              </h1>

              <p className="text-body-large text-secondary mb-xs mt-sm" style={{ fontStyle: 'italic' }}>has successfully completed the comprehensive course</p>
              
              <h2 className="mb-lg font-serif" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: '2.25rem', color: 'var(--brand-blue)' }}>
                {courseTitle}
              </h2>
            </div>

            {/* Bottom Signatures Section */}
            <div className="grid grid-cols-3 gap-xl mt-auto text-center relative z-10 items-end px-xl pb-sm">
              <div>
                <div style={{ fontFamily: "'Brush Script MT', 'Dancing Script', cursive", fontSize: '2rem', color: '#1f2937', marginBottom: '0.25rem', borderBottom: '1px solid #d1d5db', paddingBottom: '0.25rem' }}>
                  {instructorName}
                </div>
                <p className="text-small font-semibold text-secondary uppercase tracking-wider">Instructor Signature</p>
              </div>

              <div className="flex flex-col items-center justify-end">
                <div style={{ backgroundColor: 'var(--brand-blue)', color: 'white', padding: '1rem', borderRadius: '50%', display: 'inline-flex', boxShadow: '0 4px 14px rgba(0,0,0,0.2)', marginBottom: '0.5rem' }}>
                  <Award size={40} />
                </div>
                <p className="text-xs text-tertiary">Verify at: imraedu.com/verify/{id || 'cert'}</p>
              </div>

              <div>
                <div style={{ fontSize: '1.25rem', color: '#1f2937', marginBottom: '0.25rem', borderBottom: '1px solid #d1d5db', paddingBottom: '1rem' }}>
                  {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <p className="text-small font-semibold text-secondary uppercase tracking-wider">Date Issued</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
