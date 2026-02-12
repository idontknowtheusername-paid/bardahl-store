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

interface OrderConfirmationEmailProps {
  orderNumber: string;
  customerName: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    image?: string;
  }>;
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
  };
}

export const OrderConfirmationEmail = ({
  orderNumber = 'CMD-2024-001',
  customerName = 'Marie Dupont',
  orderDate = '26 décembre 2024',
  items = [],
  subtotal = 89.97,
  shipping = 5.99,
  total = 95.96,
  shippingAddress = {
    name: 'Marie Dupont',
    address: '123 Rue de la Paix',
    city: 'Paris',
    postalCode: '75001',
    country: 'France',
  },
}: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>Votre commande {orderNumber} a été confirmée</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={h1}>Cannesh Lingerie</Heading>
        </Section>

        <Section style={content}>
          <Heading style={h2}>Merci pour votre commande !</Heading>
          <Text style={text}>
            Bonjour {customerName},
          </Text>
          <Text style={text}>
            Nous avons bien reçu votre commande et nous vous en remercions. Votre commande est en cours de préparation et vous recevrez un email de confirmation d'expédition dès qu'elle sera envoyée.
          </Text>

          <Section style={orderInfo}>
            <Text style={orderInfoText}>
              <strong>Numéro de commande :</strong> {orderNumber}
            </Text>
            <Text style={orderInfoText}>
              <strong>Date de commande :</strong> {orderDate}
            </Text>
          </Section>

          <Hr style={hr} />

          <Heading style={h3}>Détails de la commande</Heading>
          
          {items.map((item, index) => (
            <Section key={index} style={itemSection}>
              <Row>
                <Column style={itemImageColumn}>
                  {item.image && (
                    <Img
                      src={item.image}
                      alt={item.name}
                      style={itemImage}
                    />
                  )}
                </Column>
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

          <Section style={totalsSection}>
            <Row>
              <Column style={totalsLabel}>
                <Text style={text}>Sous-total :</Text>
              </Column>
              <Column style={totalsValue}>
                <Text style={text}>{subtotal.toFixed(2)} €</Text>
              </Column>
            </Row>
            <Row>
              <Column style={totalsLabel}>
                <Text style={text}>Livraison :</Text>
              </Column>
              <Column style={totalsValue}>
                <Text style={text}>{shipping.toFixed(2)} €</Text>
              </Column>
            </Row>
            <Row>
              <Column style={totalsLabel}>
                <Text style={totalText}><strong>Total :</strong></Text>
              </Column>
              <Column style={totalsValue}>
                <Text style={totalText}><strong>{total.toFixed(2)} €</strong></Text>
              </Column>
            </Row>
          </Section>

          <Hr style={hr} />

          <Heading style={h3}>Adresse de livraison</Heading>
          <Text style={text}>
            {shippingAddress.name}<br />
            {shippingAddress.address}<br />
            {shippingAddress.postalCode} {shippingAddress.city}<br />
            {shippingAddress.country}
          </Text>

          <Section style={buttonSection}>
            <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/confirmation/${orderNumber}`} style={button}>
              Suivre ma commande
            </Link>
          </Section>

          <Text style={text}>
            Si vous avez des questions concernant votre commande, n'hésitez pas à nous contacter.
          </Text>
        </Section>

        <Section style={footer}>
          <Text style={footerText}>
            © 2024 Cannesh Lingerie. Tous droits réservés.
          </Text>
          <Text style={footerText}>
            <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}`} style={footerLink}>
              Visiter notre boutique
            </Link>
            {' | '}
            <Link href={`${process.env.NEXT_PUBLIC_FRONTEND_URL}/contact`} style={footerLink}>
              Nous contacter
            </Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default OrderConfirmationEmail;

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

const orderInfo = {
  backgroundColor: '#f9f9f9',
  padding: '16px',
  borderRadius: '4px',
  margin: '24px 0',
};

const orderInfoText = {
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
};

const itemImageColumn = {
  width: '80px',
  paddingRight: '16px',
};

const itemImage = {
  width: '80px',
  height: '80px',
  objectFit: 'cover' as const,
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

const totalsSection = {
  margin: '24px 0',
};

const totalsLabel = {
  textAlign: 'left' as const,
};

const totalsValue = {
  textAlign: 'right' as const,
};

const totalText = {
  color: '#000000',
  fontSize: '16px',
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
