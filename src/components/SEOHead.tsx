import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'product' | 'article';
  noindex?: boolean;
}

export const SEOHead = ({
  title = 'Autopassion BJ - Produits Bardahl au Bénin | Huiles moteur et entretien auto',
  description = 'Boutique officielle Bardahl au Bénin. Huiles moteur, additifs, liquides de refroidissement et produits d\'entretien automobile. Livraison rapide à Parakou et dans tout le Bénin.',
  keywords = 'bardahl bénin, huile moteur, additifs bardahl, produits automobiles, entretien auto, parakou, autopassion',
  image = '/placeholder.svg',
  url,
  type = 'website',
  noindex = false,
}: SEOHeadProps) => {
  const siteUrl = 'https://autopassion-bj.com';
  const fullUrl = url ? `${siteUrl}${url}` : siteUrl;
  const fullImage = image.startsWith('http') ? image : `${siteUrl}${image}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="Autopassion BJ" />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImage} />

      {/* Canonical URL */}
      <link rel="canonical" href={fullUrl} />
    </Helmet>
  );
};
