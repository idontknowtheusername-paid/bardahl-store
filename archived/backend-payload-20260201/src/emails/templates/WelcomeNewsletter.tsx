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
} from '@react-email/components';
import * as React from 'react';

interface WelcomeNewsletterEmailProps {
  subscriberName?: string;
  promoCode?: string;
}

export const WelcomeNewsletterEmail = ({
  subscriberName,
  promoCode = 'BIENVENUE10',
}: WelcomeNewsletterEmailProps) => (
  <Html>
    <Head />
    <Preview>Bienvenue chez Cannesh Lingerie - Votre code promo vous attend</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Cannesh Lingerie</Heading>
        </Section>

        <Section style={content}>
          <Heading style={h2}>Bienvenue dans notre univers !</Heading>
          
          {subscriberName && (
            <Text style={text}>
              Bonjour {subscriberName},
            </Text>
          )}

          <Text style={text}>
            Merci de vous être inscrit(e) à notre newsletter ! Nous sommes ravis de vous compter parmi notre communauté.
          </Text>

          <Text style={text}>
            En vous inscrivant, vous bénéficiez de :
          </Text>

          <Section style={benefitsBox}>
            <Text style={benefitItem}>✨ Accès en avant-première aux nouvelles collections</Text>
            <Text style={benefitItem}>🎁 Offres exclusives réservées aux abonnés</Text>
            <Text style={benefitItem}>💝 Conseils mode et lingerie personnalisés</Text>
            <Text style={benefitItem}>🎉 Surprises pour votre anniversaire</Text>
          </Section>

          <Section style={promoBox}>
            <Text style={promoLabel}>Votre cadeau de bienvenue</Text>
            <Text style={promoCodeStyle}>{promoCode}</Text>
            <Text style={promoDescription}>
              -10% sur votre première commande
            </Text>
          </Section>

          <Section style={buttonSection}>
            <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/collections`} style={button}>
              Découvrir nos collections
            </Link>
          </Section>

          <Text style={text}>
            Nous avons hâte de vous faire découvrir nos créations et de vous accompagner dans votre quête de la lingerie parfaite.
          </Text>

          <Text style={signature}>
            À très bientôt,<br />
            L'équipe Cannesh Lingerie
          </Text>
        </Section>

        <Section style={footer}>
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

export default WelcomeNewsletterEmail;

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

const content = {
  padding: '48px',
};

const h2 = {
  color: '#000000',
  fontSize: '28px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 24px 0',
  textAlign: 'center' as const,
};

const text = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '16px 0',
};

const benefitsBox = {
  backgroundColor: '#f9f9f9',
  padding: '24px',
  borderRadius: '8px',
  margin: '24px 0',
};

const benefitItem = {
  color: '#333333',
  fontSize: '15px',
  lineHeight: '1.8',
  margin: '8px 0',
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
  fontSize: '14px',
  fontWeight: '600',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  margin: '0 0 12px 0',
};

const promoCodeStyle = {
  color: '#ffffff',
  fontSize: '36px',
  fontWeight: '700',
  letterSpacing: '3px',
  margin: '12px 0',
  fontFamily: 'monospace',
};

const promoDescription = {
  color: '#10b981',
  fontSize: '18px',
  fontWeight: '600',
  margin: '12px 0 0 0',
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

const signature = {
  color: '#333333',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '32px 0 0 0',
  fontStyle: 'italic' as const,
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
