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

interface OrderFailedEmailProps {
  orderNumber: string;
  customerName: string;
  failureReason?: string;
  total: number;
}

export const OrderFailedEmail = ({
  orderNumber = 'CMD-2024-001',
  customerName = 'Marie Dupont',
  failureReason = 'Le paiement n\'a pas pu être traité',
  total = 95.96,
}: OrderFailedEmailProps) => (
  <Html>
    <Head />
    <Preview>Problème avec votre commande {orderNumber}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Cannesh Lingerie</Heading>
        </Section>

        <Section style={content}>
          <Heading style={h2}>Problème avec votre commande</Heading>
          <Text style={text}>
            Bonjour {customerName},
          </Text>
          <Text style={text}>
            Nous avons rencontré un problème lors du traitement de votre commande <strong>{orderNumber}</strong>.
          </Text>

          <Section style={errorBox}>
            <Text style={errorText}>
              <strong>Raison :</strong> {failureReason}
            </Text>
            <Text style={errorText}>
              <strong>Montant :</strong> {total.toFixed(2)} €
            </Text>
          </Section>

          <Text style={text}>
            Pas d'inquiétude, aucun montant n'a été débité de votre compte.
          </Text>

          <Heading style={h3}>Que faire maintenant ?</Heading>
          <Text style={text}>
            • Vérifiez les informations de votre carte bancaire<br />
            • Assurez-vous d'avoir suffisamment de fonds disponibles<br />
            • Essayez avec une autre carte de paiement<br />
            • Contactez votre banque si le problème persiste
          </Text>

          <Section style={buttonSection}>
            <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/panier`} style={button}>
              Réessayer ma commande
            </Link>
          </Section>

          <Text style={text}>
            Si vous continuez à rencontrer des difficultés, n'hésitez pas à nous contacter. Notre équipe se fera un plaisir de vous aider.
          </Text>
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

export default OrderFailedEmail;

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

const h2 = {
  color: '#000000',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.3',
  marginTop: '32px',
};

const h3 = {
  color: '#000000',
  fontSize: '18px',
  fontWeight: '600',
  lineHeight: '1.3',
  marginTop: '24px',
  marginBottom: '16px',
};

const text = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '16px 0',
};

const errorBox = {
  backgroundColor: '#fff5f5',
  border: '1px solid #feb2b2',
  padding: '16px',
  borderRadius: '4px',
  margin: '24px 0',
};

const errorText = {
  color: '#c53030',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '8px 0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '4px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 32px',
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
