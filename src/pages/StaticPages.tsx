import React from 'react';

const StaticPage = ({ title, children }: { title: string, children: React.ReactNode }) => {
  return (
    <div className="container py-3xl animate-fade-in" style={{ minHeight: 'calc(100vh - 80px)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 className="text-h1 mb-xl text-brand">{title}</h1>
        <div className="text-body-large text-secondary" style={{ lineHeight: '1.8' }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export const About = () => (
  <StaticPage title="About IMRAEDU">
    <p className="mb-md">
      IMRAEDU is on a mission to provide free, world-class education for anyone, anywhere. We believe that learning is a lifelong right, not a privilege reserved for a few.
    </p>
    <p className="mb-md">
      Founded in 2026, we have partnered with top educators and institutions to deliver high-quality courses across a wide range of disciplines, from computer science to business, arts, and beyond.
    </p>
    <p>
      Join our global community of learners today and take the next step in your educational journey.
    </p>
  </StaticPage>
);

export const Careers = () => (
  <StaticPage title="Careers at IMRAEDU">
    <p className="mb-md">
      We're looking for passionate individuals who want to democratize education. Check back soon for open positions across our engineering, product, and content teams!
    </p>
  </StaticPage>
);

export const Press = () => (
  <StaticPage title="Press & Media">
    <p className="mb-md">
      For all media inquiries, please contact our PR team at <strong>press@imraedu.org</strong>.
    </p>
  </StaticPage>
);

export const Terms = () => (
  <StaticPage title="Terms of Service">
    <p className="mb-md"><strong>1. Acceptance of Terms</strong><br/>By accessing IMRAEDU, you agree to be bound by these terms of service and all applicable laws and regulations.</p>
    <p className="mb-md"><strong>2. User Conduct</strong><br/>You agree to use the platform only for lawful educational purposes and in a way that does not infringe the rights of others.</p>
    <p className="mb-md"><strong>3. Content Ownership</strong><br/>All course materials remain the property of their respective creators and instructors.</p>
  </StaticPage>
);

export const Privacy = () => (
  <StaticPage title="Privacy Policy">
    <p className="mb-md"><strong>Your Privacy Matters</strong><br/>We are committed to protecting your personal data. We only collect information necessary to provide you with the best learning experience.</p>
    <p className="mb-md"><strong>Data Collection</strong><br/>We collect your email, username, and course progress to track your educational journey and issue certificates.</p>
    <p className="mb-md"><strong>Data Sharing</strong><br/>We do not sell your personal data to third parties. Your data is secure with us.</p>
  </StaticPage>
);

export const GenericFooterPage = ({ title }: { title: string }) => (
  <StaticPage title={title}>
    <p className="mb-md">
      This page is currently under construction. Please check back later for updates regarding {title.toLowerCase()}.
    </p>
  </StaticPage>
);
