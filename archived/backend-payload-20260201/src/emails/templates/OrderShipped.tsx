import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface OrderShippedEmailProps {
  orderNumber: string;
  customerName: string;
  trackingNumber?: string;
  trackingUrl?: string;
  carrier?: string;
  estimatedDelivery?: string;
}

export const OrderShippedEmail = ({
  orderNumber = 'CMD-2024-001',
  customerName = 'Marie Dupont',
  trackingNumber,
  trackingUrl,
  carrier = 'Colissimo',
  estimatedDelivery,
}: OrderShippedEmailProps) => (
  <Html>
    <Head />
    <Preview>Votre commande {orderNumber} a été expédiée</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Cannesh Lingerie</Heading>
        </Section>

        <Section style={content}>
          <Section style={successBox}>
            <Text style={successIcon}>📦</Text>
            <Heading style={h2}>Votre commande est en route !</Heading>
          </Section>

          <Text style={text}>
            Bonjour {customerName},
          </Text>
          <Text style={text}>
            Bonne nouvelle ! Votre commande <strong>{orderNumber}</strong> a été expédiée et est en route vers vous.
          </Text>

          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Transporteur :</strong> {carrier}
            </Text>
            {trackingNumber && (
              <Text style={infoText}>
                <strong>Numéro de suivi :</strong> {trackingNumber}
              </Text>
            )}
            {estimatedDelivery && (
              <Text style={infoText}>
                <strong>Livraison estimée :</strong> {estimatedDelivery}
              </Text>
            )}
          </Section>

          {trackingUrl && (
            <Section style={buttonSection}>
              <Link href={trackingUrl} style={button}>
                Suivre mon colis
              </Link>
            </Section>
          )}

          <Text style={text}>
            Vous recevrez une notification dès que votre colis sera livré.
          </Text>

          <Section style={tipsBox}>
            <Heading style={h3}>Conseils de réception</Heading>
            <Text style={tipText}>
              • Assurez-vous qu'une personne soit présente à l'adresse de livraison<br />
              • Vérifiez l'état du colis avant de signer<br />
              • En cas d'absence, un avis de passage sera déposé
            </Text>
          </Section>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            © 2024 Cannesh Lingerie. Tous droits réservés.
          </Text>
          <Text style={footerText}>
            <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/contact`} style={footerLink}>
              Nous contacter
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default OrderShippedEmail;

const main = {
  backgroundColor: '#f6f6f6',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
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
  padding: '0 48px',
};

const successBox = {
  textAlign: 'center' as const,
  padding: '32px 0',
};

const successIcon = {
  fontSize: '64px',
  margin: '0',
};

const h2 = {
  color: '#000000',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '16px 0 0 0',
  textAlign: 'center' as const,
};

const h3 = {
  color: '#000000',
  fontSize: '16px',
  fontWeight: '600',
  lineHeight: '1.3',
  margin: '0 0 12px 0',
};

const text = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '16px 0',
};

const infoBox = {
  backgroundColor: '#f0f9ff',
  border: '1px solid #0ea5e9',
  padding: '16px',
  borderRadius: '4px',
  margin: '24px 0',
};

const infoText = {
  color: '#0c4a6e',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '8px 0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#0ea5e9',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
};

const tipsBox = {
  backgroundColor: '#f9f9f9',
  padding: '20px',
  borderRadius: '4px',
  margin: '24px 0',
};

const tipText = {
  color: '#666666',
  fontSize: '13px',
  lineHeight: '1.6',
  margin: '0',
};

const footer = {
  padding: '32px 48px',
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
