import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface NewsletterEmailProps {
  subscriberName?: string;
  subject: string;
  previewText: string;
  heroImage?: string;
  mainTitle: string;
  mainContent: string;
  featuredProducts?: Array<{
    name: string;
    price: number;
    image: string;
    url: string;
  }>;
  ctaText?: string;
  ctaUrl?: string;
}

export const NewsletterEmail = ({
  subscriberName,
  subject = 'Découvrez nos nouveautés',
  previewText = 'Les dernières tendances lingerie vous attendent',
  heroImage,
  mainTitle = 'Nouvelle Collection',
  mainContent = 'Découvrez notre nouvelle collection de lingerie élégante et confortable.',
  featuredProducts = [],
  ctaText = 'Découvrir la collection',
  ctaUrl = process.env.NEXT_PUBLIC_FRONTEND_URL,
}: NewsletterEmailProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Cannesh Lingerie</Heading>
        </Section>

        {heroImage && (
          <Section style={heroSection}>
            <Img
              src={heroImage}
              alt={mainTitle}
              style={heroImageStyle}
            />
          </Section>
        )}

        <Section style={content}>
          {subscriberName && (
            <Text style={greeting}>
              Bonjour {subscriberName},
            </Text>
          )}

          <Heading style={h2}>{mainTitle}</Heading>
          <Text style={text}>{mainContent}</Text>

          {ctaText && ctaUrl && (
            <Section style={buttonSection}>
              <Link href={ctaUrl} style={button}>
                {ctaText}
              </Link>
            </Section>
          )}

          {featuredProducts.length > 0 && (
            <>
              <Hr style={hr} />
              <Heading style={h3}>Nos coups de cœur</Heading>
              
              <Section style={productsGrid}>
                {featuredProducts.map((product, index) => (
                  <Section key={index} style={productCard}>
                    <Link href={product.url}>
                      <Img
                        src={product.image}
                        alt={product.name}
                        style={productImage}
                      />
                    </Link>
                    <Text style={productName}>{product.name}</Text>
                    <Text style={productPrice}>{product.price.toFixed(2)} €</Text>
                    <Link href={product.url} style={productLink}>
                      Voir le produit →
                    </Link>
                  </Section>
                ))}
              </Section>
            </>
          )}
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Vous recevez cet email car vous êtes inscrit(e) à notre newsletter.
          </Text>
          <Text style={footerText}>
            <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}`} style={footerLink}>
              Visiter notre boutique
            </Link>
            {' | '}
            <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/contact`} style={footerLink}>
              Nous contacter
            </Link>
            {' | '}
            <Link href="{{unsubscribe_url}}" style={footerLink}>
              Se désabonner
            </Link>
          </Text>
          <Text style={footerText}>
            © 2024 Cannesh Lingerie. Tous droits réservés.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default NewsletterEmail;

const main = {
  backgroundColor: '#f6f6f6',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '0',
  marginBottom: '64px',
  maxWidth: '600px',
};

const header = {
  padding: '32px 48px',
  backgroundColor: '#000000',
  textAlign: 'center' as const,
};

const h1 = {
  color: '#ffffff',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0',
};

const heroSection = {
  padding: '0',
};

const heroImageStyle = {
  width: '100%',
  height: 'auto',
  display: 'block',
};

const content = {
  padding: '48px',
};

const greeting = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '0 0 24px 0',
};

const h2 = {
  color: '#000000',
  fontSize: '32px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 16px 0',
};

const h3 = {
  color: '#000000',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '32px 0 24px 0',
};

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 40px',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '32px 0',
};

const productsGrid = {
  margin: '24px 0',
};

const productCard = {
  display: 'inline-block',
  width: '48%',
  verticalAlign: 'top' as const,
  margin: '0 1% 24px 1%',
  textAlign: 'center' as const,
};

const productImage = {
  width: '100%',
  height: 'auto',
  borderRadius: '8px',
  marginBottom: '12px',
};

const productName = {
  color: '#000000',
  fontSize: '14px',
  fontWeight: '600',
  margin: '8px 0 4px 0',
};

const productPrice = {
  color: '#666666',
  fontSize: '16px',
  fontWeight: '600',
  margin: '4px 0 8px 0',
};

const productLink = {
  color: '#000000',
  fontSize: '12px',
  textDecoration: 'underline',
};

const footer = {
  padding: '32px 48px',
  backgroundColor: '#f9f9f9',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#666666',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '8px 0',
};

const footerLink = {
  color: '#666666',
  textDecoration: 'underline',
};
