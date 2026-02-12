import { Resend } from 'resend';
import { render } from '@react-email/components';

// Templates
import OrderConfirmationEmail from '@/emails/templates/OrderConfirmation';
import OrderFailedEmail from '@/emails/templates/OrderFailed';
import AdminOrderNotificationEmail from '@/emails/templates/AdminOrderNotification';
import OrderShippedEmail from '@/emails/templates/OrderShipped';
import NewsletterEmail from '@/emails/templates/Newsletter';
import CampaignEmail from '@/emails/templates/Campaign';
import WelcomeNewsletterEmail from '@/emails/templates/WelcomeNewsletter';

const FROM_EMAIL = process.env.EMAIL_FROM || 'Cannesh Lingerie <noreply@cannesh.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cannesh.com';

// Initialize Resend only when needed
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[Email] RESEND_API_KEY not configured, emails will not be sent');
    return null;
  }
  return new Resend(apiKey);
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
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
    phone?: string;
  };
}

export interface NewsletterData {
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

export interface CampaignData {
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

/**
 * Send order confirmation email to customer
 */
export async function sendOrderConfirmation(data: OrderEmailData) {
  const resend = getResendClient();
  if (!resend) return { success: false, error: 'Email service not configured' };

  try {
    const emailHtml = await render(OrderConfirmationEmail(data));

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: data.customerEmail,
      subject: `Confirmation de commande ${data.orderNumber}`,
      html: emailHtml,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return { success: false, error };
  }
}

/**
 * Send order failed notification to customer
 */
export async function sendOrderFailed(
  customerEmail: string,
  orderNumber: string,
  customerName: string,
  total: number,
  failureReason?: string
) {
  const resend = getResendClient();
  if (!resend) return { success: false, error: 'Email service not configured' };

  try {
    const emailHtml = await render(
      OrderFailedEmail({
        orderNumber,
        customerName,
        total,
        failureReason,
      })
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Problème avec votre commande ${orderNumber}`,
      html: emailHtml,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending order failed email:', error);
    return { success: false, error };
  }
}

/**
 * Send order notification to admin
 */
export async function sendAdminOrderNotification(data: OrderEmailData) {
  const resend = getResendClient();
  if (!resend) return { success: false, error: 'Email service not configured' };

  try {
    const emailHtml = await render(AdminOrderNotificationEmail(data));

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `🛍️ Nouvelle commande ${data.orderNumber}`,
      html: emailHtml,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return { success: false, error };
  }
}

/**
 * Send order shipped notification to customer
 */
export async function sendOrderShipped(
  customerEmail: string,
  orderNumber: string,
  customerName: string,
  trackingNumber?: string,
  trackingUrl?: string,
  carrier?: string,
  estimatedDelivery?: string
) {
  const resend = getResendClient();
  if (!resend) return { success: false, error: 'Email service not configured' };

  try {
    const emailHtml = await render(
      OrderShippedEmail({
        orderNumber,
        customerName,
        trackingNumber,
        trackingUrl,
        carrier,
        estimatedDelivery,
      })
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: customerEmail,
      subject: `Votre commande ${orderNumber} a été expédiée`,
      html: emailHtml,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending order shipped email:', error);
    return { success: false, error };
  }
}

/**
 * Send newsletter to subscriber
 */
export async function sendNewsletter(
  subscriberEmail: string,
  data: NewsletterData
) {
  const resend = getResendClient();
  if (!resend) return { success: false, error: 'Email service not configured' };

  try {
    const emailHtml = await render(NewsletterEmail(data));

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: subscriberEmail,
      subject: data.subject,
      html: emailHtml,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending newsletter:', error);
    return { success: false, error };
  }
}

/**
 * Send campaign email to subscriber
 */
export async function sendCampaign(
  subscriberEmail: string,
  data: CampaignData
) {
  const resend = getResendClient();
  if (!resend) return { success: false, error: 'Email service not configured' };

  try {
    const emailHtml = await render(CampaignEmail(data));

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: subscriberEmail,
      subject: data.campaignTitle,
      html: emailHtml,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending campaign email:', error);
    return { success: false, error };
  }
}

/**
 * Send welcome email to new newsletter subscriber
 */
export async function sendWelcomeNewsletter(
  subscriberEmail: string,
  subscriberName?: string,
  promoCode?: string
) {
  const resend = getResendClient();
  if (!resend) return { success: false, error: 'Email service not configured' };

  try {
    const emailHtml = await render(
      WelcomeNewsletterEmail({
        subscriberName,
        promoCode,
      })
    );

    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to: subscriberEmail,
      subject: 'Bienvenue chez Cannesh Lingerie 🎁',
      html: emailHtml,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Error sending welcome newsletter:', error);
    return { success: false, error };
  }
}

/**
 * Send bulk emails (for campaigns or newsletters)
 */
export async function sendBulkEmails(
  subscribers: Array<{ email: string; name?: string }>,
  emailType: 'newsletter' | 'campaign',
  data: NewsletterData | CampaignData
) {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as any[],
  };

  for (const subscriber of subscribers) {
    try {
      const emailData = {
        ...data,
        subscriberName: subscriber.name,
      };

      const result =
        emailType === 'newsletter'
          ? await sendNewsletter(subscriber.email, emailData as NewsletterData)
          : await sendCampaign(subscriber.email, emailData as CampaignData);

      if (result.success) {
        results.success++;
      } else {
        results.failed++;
        results.errors.push({ email: subscriber.email, error: result.error });
      }

      // Rate limiting: wait 100ms between emails
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      results.failed++;
      results.errors.push({ email: subscriber.email, error });
    }
  }

  return results;
}
