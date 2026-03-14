import { Helmet } from 'react-helmet-async';

interface Product {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  sku?: string;
  brand?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition';
}

interface Organization {
  name: string;
  url: string;
  logo: string;
  description: string;
  address?: {
    streetAddress: string;
    addressLocality: string;
    addressCountry: string;
  };
  contactPoint?: {
    telephone: string;
    contactType: string;
  };
}

interface StructuredDataProps {
  type: 'product' | 'organization' | 'website' | 'breadcrumb';
  data?: any;
}

export const StructuredData = ({ type, data }: StructuredDataProps) => {
  let structuredData: any = {};

  switch (type) {
    case 'organization':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'Autopassion BJ',
        url: 'https://autopassionbj.com',
        logo: 'https://autopassionbj.com/placeholder.svg',
        description: 'Distributeur officiel Bardahl au Bénin - Huiles moteur, additifs et produits d\'entretien automobile de qualité',
        address: {
          '@type': 'PostalAddress',
          streetAddress: '01 BP 369',
          addressLocality: 'Parakou',
          addressCountry: 'BJ',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+229-01-96-52-64-72',
          contactType: 'Customer Service',
          availableLanguage: ['French'],
        },
        sameAs: [
          'https://facebook.com/autopassionbj',
          'https://instagram.com/autopassionbj',
        ],
      };
      break;

    case 'product':
      if (data) {
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: data.name,
          description: data.description,
          image: data.image,
          sku: data.sku || data.id,
          brand: {
            '@type': 'Brand',
            name: data.brand || 'Autopassion BJ',
          },
          offers: {
            '@type': 'Offer',
            price: data.price,
            priceCurrency: data.currency || 'XOF',
            availability: data.availability
              ? `https://schema.org/${data.availability}`
              : 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            url: `https://autopassionbj.com/produits/${data.slug}`,
          },
        };

        // Ajouter les avis si disponibles
        if (data.rating && data.reviewCount) {
          structuredData.aggregateRating = {
            '@type': 'AggregateRating',
            ratingValue: data.rating,
            reviewCount: data.reviewCount,
          };
        }
      }
      break;

    case 'website':
      structuredData = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Autopassion BJ',
        url: 'https://autopassionbj.com',
        description: 'Boutique Bardahl au Bénin - Huiles moteur et produits d\'entretien automobile',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://autopassionbj.com/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      };
      break;

    case 'breadcrumb':
      if (data && data.items) {
        structuredData = {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: data.items.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `https://autopassionbj.com${item.url}`,
          })),
        };
      }
      break;
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

// Hook pour faciliter l'utilisation
export const useProductStructuredData = (product: Product) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Autopassion BJ',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'XOF',
      availability: product.availability
        ? `https://schema.org/${product.availability}`
        : 'https://schema.org/InStock',
      itemCondition: `https://schema.org/${product.condition || 'NewCondition'}`,
    },
  };
};
