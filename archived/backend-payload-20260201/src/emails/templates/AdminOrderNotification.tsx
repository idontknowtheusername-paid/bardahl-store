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
  Hr,
  Row,
  Column,
} from '@react-email/components';
import * as React from 'react';

interface AdminOrderNotificationEmailProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
}

export const AdminOrderNotificationEmail = ({
  orderNumber = 'CMD-2024-001',
  customerName = 'Marie Dupont',
  customerEmail = 'marie@example.com',
  orderDate = '26 décembre 2024',
  items = [],
  total = 95.96,
  shippingAddress = {
    name: 'Marie Dupont',
    address: '123 Rue de la Paix',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
    phone: '+33 6 12 34 56 78',
  },
}: AdminOrderNotificationEmailProps) => (
  <Html>
    <Head />
    <Preview>Nouvelle commande {orderNumber} - {customerName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>🛍️ Nouvelle Commande</Heading>
        </Section>

        <Section style={content}>
          <Section style={alertBox}>
            <Text style={alertText}>
              Une nouvelle commande vient d'être passée sur votre boutique !
            </Text>
          </Section>

          <Heading style={h2}>Informations de la commande</Heading>
          
          <Section style={infoBox}>
            <Text style={infoText}>
              <strong>Numéro :</strong> {orderNumber}
            </Text>
            <Text style={infoText}>
              <strong>Date :</strong> {orderDate}
            </Text>
            <Text style={infoText}>
              <strong>Montant total :</strong> {total.toFixed(2)} €
            </Text>
          </Section>

          <Hr style={hr} />

          <Heading style={h3}>Client</Heading>
          <Text style={text}>
            <strong>Nom :</strong> {customerName}<br />
            <strong>Email :</strong> <Link href={`mailto:${customerEmail}`}>{customerEmail}</Link><br />
            {shippingAddress.phone && (
              <>
                <strong>Téléphone :</strong> <Link href={`tel:${shippingAddress.phone}`}>{shippingAddress.phone}</Link>
              </>
            )}
          </Text>

          <Hr style={hr} />

          <Heading style={h3}>Produits commandés</Heading>
          
          {items.map((item, index) => (
            <Section key={index} style={itemSection}>
              <Row>
                <Column style={itemDetailsColumn}>
                  <Text style={itemName}>{item.name}</Text>
                  <Text style={itemQuantity}>Quantité : {item.quantity}</Text>
                </Column>
                <Column style={itemPriceColumn}>
                  <Text style={itemPrice}>{item.price.toFixed(2)} €</Text>
                </Column>
              </Row>
            </Section>
          ))}

          <Hr style={hr} />

          <Heading style={h3}>Adresse de livraison</Heading>
          <Text style={text}>
            {shippingAddress.name}<br />
            {shippingAddress.address}<br />
            {shippingAddress.postalCode} {shippingAddress.city}<br />
            {shippingAddress.country}
          </Text>

          <Section style={buttonSection}>
            <Link href={`${process.env.PAYLOAD_PUBLIC_SERVER_URL}/admin/collections/orders`} style={button}>
              Voir dans l'admin
            </Link>
          </Section>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            Cet email a été envoyé automatiquement par votre système de gestion des commandes.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default AdminOrderNotificationEmail;

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
  backgroundColor: '#10b981',
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

const alertBox = {
  backgroundColor: '#d1fae5',
  border: '1px solid #10b981',
  padding: '16px',
  borderRadius: '4px',
  margin: '24px 0',
};

const alertText = {
  color: '#065f46',
  fontSize: '14px',
  fontWeight: '600',
  lineHeight: '1.5',
  margin: '0',
  textAlign: 'center' as const,
};

const infoBox = {
  backgroundColor: '#f9f9f9',
  padding: '16px',
  borderRadius: '4px',
  margin: '16px 0',
};

const infoText = {
  color: '#333333',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '8px 0',
};

const hr = {
  borderColor: '#e6e6e6',
  margin: '24px 0',
};

const itemSection = {
  margin: '16px 0',
  padding: '12px',
  backgroundColor: '#f9f9f9',
  borderRadius: '4px',
};

const itemDetailsColumn = {
  verticalAlign: 'top' as const,
};

const itemName = {
  color: '#000000',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0 0 4px 0',
};

const itemQuantity = {
  color: '#666666',
  fontSize: '12px',
  margin: '0',
};

const itemPriceColumn = {
  verticalAlign: 'top' as const,
  textAlign: 'right' as const,
};

const itemPrice = {
  color: '#000000',
  fontSize: '14px',
  fontWeight: '600',
  margin: '0',
};

const buttonSection = {
  textAlign: 'center' as const,
  margin: '32px 0',
};

const button = {
  backgroundColor: '#10b981',
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
