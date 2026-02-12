import { Resend } from 'resend';

// Initialize Resend only if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.EMAIL_FROM || 'Cannesh Lingerie <noreply@cannesh.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cannesh.com';

// Helper to check if email is configured
function isEmailConfigured(): boolean {
  if (!resend) {
    console.warn('⚠️ Email not configured: RESEND_API_KEY is missing');
    return false;
  }
  return true;
}

// Order confirmation email
export async function sendOrderConfirmation(order: any) {
  if (!isEmailConfigured()) return;
  
  const itemsHtml = order.items.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">
        ${item.product?.name || 'Produit'}
        ${item.size ? ` - Taille: ${item.size}` : ''}
        ${item.color ? ` - Couleur: ${item.color}` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString()} FCFA</td>
    </tr>
  `).join('');

  await resend.emails.send({
    from: FROM_EMAIL,
    to: order.email,
    subject: `Confirmation de commande ${order.orderNumber} - Cannesh Lingerie`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #d4a574; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Cannesh Lingerie</h1>
        </div>
        
        <div style="padding: 30px;">
          <h2>Merci pour votre commande, ${order.firstName}!</h2>
          <p>Votre commande <strong>${order.orderNumber}</strong> a été confirmée.</p>
          
          <h3>Détails de la commande</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px; text-align: left;">Produit</th>
                <th style="padding: 12px; text-align: center;">Qté</th>
                <th style="padding: 12px; text-align: right;">Prix</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="margin-top: 20px; text-align: right;">
            <p>Sous-total: ${order.subtotal.toLocaleString()} FCFA</p>
            <p>Livraison: ${order.shippingCost.toLocaleString()} FCFA</p>
            <p style="font-size: 18px; font-weight: bold;">Total: ${order.total.toLocaleString()} FCFA</p>
          </div>
          
          <h3>Adresse de livraison</h3>
          <p>
            ${order.firstName}<br>
            ${order.address || ''}<br>
            ${order.city}, ${order.country}
          </p>
          
          <p style="margin-top: 30px;">
            Pour toute question, contactez-nous à <a href="mailto:contact@cannesh.com">contact@cannesh.com</a>
          </p>
        </div>
        
        <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
          © ${new Date().getFullYear()} Cannesh Lingerie. Tous droits réservés.
        </div>
      </div>
    `,
  });
}

// Admin notification for new order
export async function sendAdminOrderNotification(order: any) {
  if (!isEmailConfigured()) return;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `🛒 Nouvelle commande ${order.orderNumber}`,
    html: `
      <div style="font-family: sans-serif;">
        <h2>Nouvelle commande reçue!</h2>
        <p><strong>Numéro:</strong> ${order.orderNumber}</p>
        <p><strong>Client:</strong> ${order.firstName} (${order.email})</p>
        <p><strong>Téléphone:</strong> ${order.phone}</p>
        <p><strong>Ville:</strong> ${order.city}</p>
        <p><strong>Total:</strong> ${order.total.toLocaleString()} FCFA</p>
        <p><strong>Méthode de livraison:</strong> ${order.shippingMethod}</p>
        <p><strong>Articles:</strong> ${order.items.length}</p>
        
        <h3>Produits commandés:</h3>
        <ul>
          ${order.items.map((item: any) => `
            <li>${item.product?.name || 'Produit'} x${item.quantity} - ${item.price.toLocaleString()} FCFA</li>
          `).join('')}
        </ul>
        
        <p><a href="${process.env.BACKEND_URL || 'http://localhost:3001'}/admin/resources/orders/records/${order.id}/show">Voir la commande dans l'admin</a></p>
      </div>
    `,
  });
}

// Order failed email
export async function sendOrderFailed(order: any) {
  if (!isEmailConfigured()) return;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: order.email,
    subject: `Paiement échoué - Commande ${order.orderNumber}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #d4a574; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Cannesh Lingerie</h1>
        </div>
        
        <div style="padding: 30px;">
          <h2>Le paiement de votre commande a échoué</h2>
          <p>Bonjour ${order.firstName},</p>
          <p>Malheureusement, le paiement pour votre commande <strong>${order.orderNumber}</strong> n'a pas pu être traité.</p>
          
          <p>Vous pouvez réessayer en passant une nouvelle commande sur notre site.</p>
          
          <p style="margin-top: 30px;">
            Si vous avez des questions, contactez-nous à <a href="mailto:contact@cannesh.com">contact@cannesh.com</a>
          </p>
        </div>
      </div>
    `,
  });
}

// Welcome newsletter email
export async function sendWelcomeNewsletter(email: string, firstName?: string) {
  if (!isEmailConfigured()) return;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: 'Bienvenue chez Cannesh Lingerie! 💕',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #d4a574; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Cannesh Lingerie</h1>
        </div>
        
        <div style="padding: 30px;">
          <h2>Bienvenue${firstName ? ` ${firstName}` : ''}!</h2>
          <p>Merci de vous être inscrit(e) à notre newsletter.</p>
          <p>Vous recevrez désormais nos dernières nouveautés, offres exclusives et conseils mode.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}" style="background: #d4a574; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
              Découvrir notre boutique
            </a>
          </div>
          
          <p style="font-size: 12px; color: #666;">
            <a href="${process.env.BACKEND_URL}/api/newsletter/unsubscribe?email=${email}">Se désinscrire</a>
          </p>
        </div>
      </div>
    `,
  });
}

// Contact notification to admin
export async function sendContactNotification(message: any) {
  if (!isEmailConfigured()) return;
  
  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `📩 Nouveau message de contact - ${message.subject || 'Sans objet'}`,
    html: `
      <div style="font-family: sans-serif;">
        <h2>Nouveau message de contact</h2>
        <p><strong>De:</strong> ${message.name} (${message.email})</p>
        ${message.phone ? `<p><strong>Téléphone:</strong> ${message.phone}</p>` : ''}
        ${message.subject ? `<p><strong>Sujet:</strong> ${message.subject}</p>` : ''}
        
        <h3>Message:</h3>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 4px;">
          ${message.message.replace(/\n/g, '<br>')}
        </div>
        
        <p style="margin-top: 20px;">
          <a href="mailto:${message.email}">Répondre à ${message.email}</a>
        </p>
      </div>
    `,
  });
}
