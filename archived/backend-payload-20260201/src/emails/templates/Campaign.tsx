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
} from '@react-email/components';
import * as React from 'react';

interface CampaignEmailProps {
  subscriberName?: string;
  campaignTitle: string;
  previewText: string;
  heroImage?: string;
  mainHeading: string;
  subheading?: string;
  bodyContent: string;
  promoCode?: string;
  promoDiscount?: string;
  promoExpiry?: string;
  ctaText: string;
  ctaUrl: string;
  secondaryContent?: string;
}

export const CampaignEmail = ({
  subscriberName,
  campaignTitle = 'Offre Spéciale',
  previewText = 'Ne manquez pas notre offre exclusive',
  heroImage,
  mainHeading = 'Offre Exclusive',
  subheading,
  bodyContent = 'Profitez de notre offre spéciale sur une sélection de produits.',
  promoCode,
  promoDiscount,
  promoExpiry,
  ctaText = 'J\'en profite',
  ctaUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || '',
  secondaryContent,
}: CampaignEmailProps) => (
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
              alt={campaignTitle}
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

          <Heading style={h2}>{mainHeading}</Heading>
          
          {subheading && (
            <Text style={subheadingStyle}>{subheading}</Text>
          )}

          <Text style={text}>{bodyContent}</Text>

          {promoCode && (
            <Section style={promoBox}>
              <Text style={promoLabel}>Code promo</Text>
              <Text style={promoCodeStyle}>{promoCode}</Text>
              {promoDiscount && (
                <Text style={promoDiscountStyle}>{promoDiscount}</Text>
              )}
              {promoExpiry && (
                <Text style={promoExpiryStyle}>Valable jusqu'au {promoExpiry}</Text>
              )}
            </Section>
          )}

          <Section style={buttonSection}>
            <Link href={ctaUrl} style={button}>
              {ctaText}
            </Link>
          </Section>

          {secondaryContent && (
            <>
              <Hr style={hr} />
              <Text style={text}>{secondaryContent}</Text>
            </>
          )}

          <Section style={urgencyBox}>
            <Text style={urgencyText}>
              ⏰ Offre à durée limitée - Ne la manquez pas !
            </Text>
          </Section>
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

export default CampaignEmail;

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
  fontSize: '36px',
  fontWeight: '700',
  lineHeight: '1.2',
  margin: '0 0 16px 0',
  textAlign: 'center' as const,
};

const subheadingStyle = {
  color: '#666666',
  fontSize: '20px',
  fontWeight: '500',
  lineHeight: '1.4',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const promoBox = {
  backgroundColor: '#000000',
  padding: '32px',
  borderRadius: '8px',
  textAlign: 'center' as const,
  margin: '32px 0',
};

const promoLabel = {
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 8px 0',
};

const promoCodeStyle = {
  color: '#ffffff',
  fontSize: '32px',
  fontWeight: '700',
  letterSpacing: '2px',
  margin: '8px 0',
  fontFamily: 'monospace',
};

const promoDiscountStyle = {
  color: '#10b981',
  fontSize: '18px',
  fontWeight: '600',
  margin: '8px 0',
};

const promoExpiryStyle = {
  color: '#ffffff',
  fontSize: '12px',
  margin: '8px 0 0 0',
  opacity: 0.8,
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#ef4444',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '18px',
  fontWeight: '700',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '16px 48px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '32px 0',
};

const urgencyBox = {
  backgroundColor: '#fef3c7',
  border: '2px solid #f59e0b',
  padding: '16px',
  borderRadius: '4px',
  margin: '32px 0',
  textAlign: 'center' as const,
};

const urgencyText = {
  color: '#92400e',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
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
