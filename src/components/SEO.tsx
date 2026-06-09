import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  name?: string;
  type?: string;
}

export default function SEO({ title, description, name, type }: SEOProps) {
  const defaultDescription = 'ImraEdu is a global online learning platform that offers anyone, anywhere access to online courses and degrees from world-class universities and companies.';
  
  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title} | ImraEdu</title>
      <meta name='description' content={description || defaultDescription} />
      
      {/* Facebook tags */}
      <meta property="og:type" content={type || 'website'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description || defaultDescription} />
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name || 'ImraEdu'} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description || defaultDescription} />
    </Helmet>
  );
}
