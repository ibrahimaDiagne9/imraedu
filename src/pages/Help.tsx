import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Mail } from 'lucide-react';
import SEO from '../components/SEO';

const faqs = [
  {
    question: "Are courses really 100% free?",
    answer: "Yes! ImraEdu is built on the belief that education is a human right. All of our courses, including the video materials, quizzes, and certificates, are completely free forever."
  },
  {
    question: "How do I earn a certificate?",
    answer: "You earn a certificate automatically upon completing 100% of the lessons in a course. Once completed, you can view and download your certificate from the 'Accomplishments' tab in your Profile menu."
  },
  {
    question: "Can I become an instructor?",
    answer: "Absolutely. We are always looking for passionate educators. Click the 'Apply to Teach' button in the footer to submit an application. Once approved, you will gain access to the Instructor Panel to create and publish your own courses."
  },
  {
    question: "How do I reset my password?",
    answer: "If you're logged out, click 'Forgot Password' on the login screen. If you're logged in, you can change your password anytime from the 'Settings' tab in your Profile menu."
  },
  {
    question: "My video won't play. What should I do?",
    answer: "First, ensure your internet connection is stable. If the issue persists, try clearing your browser cache or switching to a different browser like Chrome or Firefox. If it's a YouTube-hosted video, ensure YouTube is not blocked on your network."
  }
];

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', marginBottom: '1rem', backgroundColor: 'var(--bg-primary)', overflow: 'hidden' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
      >
        <span className="font-semibold text-lg">{question}</span>
        {isOpen ? <ChevronUp size={20} className="text-secondary" /> : <ChevronDown size={20} className="text-secondary" />}
      </button>
      {isOpen && (
        <div style={{ padding: '0 1.5rem 1.25rem 1.5rem', color: 'var(--text-secondary)', lineHeight: '1.6' }} className="animate-fade-in">
          {answer}
        </div>
      )}
    </div>
  );
};

const Help = () => {
  return (
    <div className="container py-3xl min-h-screen">
      <SEO title="Help Center" description="Find answers to common questions about ImraEdu." />
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div className="text-center mb-2xl">
          <div style={{ display: 'inline-flex', padding: '1rem', backgroundColor: 'var(--brand-blue-light)', borderRadius: 'var(--radius-full)', color: 'var(--brand-blue)', marginBottom: '1rem' }}>
            <HelpCircle size={40} />
          </div>
          <h1 className="text-h1 mb-sm">How can we help you?</h1>
          <p className="text-body-large text-secondary">Browse our most frequently asked questions below or contact our support team.</p>
        </div>

        <div className="mb-3xl">
          <h2 className="text-h2 mb-xl">Frequently Asked Questions</h2>
          <div>
            {faqs.map((faq, idx) => (
              <FAQItem key={idx} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--brand-blue-light)', padding: '2.5rem', borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
          <Mail size={32} color="var(--brand-blue)" style={{ margin: '0 auto 1rem' }} />
          <h3 className="text-h2 mb-sm">Still need help?</h3>
          <p className="text-body-large text-secondary mb-lg">Our support team is here to assist you with any technical issues or account inquiries.</p>
          <a href="mailto:support@imraedu.org" className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.85rem 2rem' }}>Contact Support</a>
        </div>
      </div>
    </div>
  );
};

export default Help;
