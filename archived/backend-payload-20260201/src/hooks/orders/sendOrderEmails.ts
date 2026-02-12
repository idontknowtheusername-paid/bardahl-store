import type { CollectionAfterChangeHook } from 'payload';

export const sendOrderEmails: CollectionAfterChangeHook = async ({
  doc,
  operation,
  req,
  previousDoc,
}) => {
  // Only send emails on create or when status changes
  if (operation !== 'create' && operation !== 'update') {
    return doc;
  }

  try {
    const order = doc;

    // Prepare order data
    const orderData = {
      orderNumber: order.orderNumber,
      customerName: `${order.shippingInfo?.firstName || ''} ${order.shippingInfo?.lastName || ''}`.trim() || 'Client',
      customerEmail: order.shippingInfo?.email || '',
      orderDate: new Date(order.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      items: order.items?.map((item: any) => ({
        name: item.productTitle || (typeof item.product === 'object' ? item.product.title : 'Produit'),
        quantity: item.quantity,
        price: item.unitPrice * item.quantity,
        image: typeof item.product === 'object' && item.product.images?.[0]
          ? typeof item.product.images[0] === 'object'
            ? item.product.images[0].url
            : undefined
          : undefined,
      })) || [],
      subtotal: order.subtotal || 0,
      shipping: order.shippingCost || 0,
      total: order.total || 0,
      shippingAddress: {
        name: `${order.shippingInfo?.firstName || ''} ${order.shippingInfo?.lastName || ''}`.trim(),
        address: `${order.shippingInfo?.address || ''} ${order.shippingInfo?.addressLine2 || ''}`.trim(),
        city: order.shippingInfo?.city || '',
        postalCode: order.shippingInfo?.postalCode || '',
        country: order.shippingInfo?.country || 'Bénin',
        phone: order.shippingInfo?.phone,
      },
    };

    // Send confirmation email on successful order
    if (operation === 'create' && order.paymentStatus === 'paid') {
      const { sendOrderConfirmation, sendAdminOrderNotification } = await import('@/lib/email');
      await sendOrderConfirmation(orderData);
      await sendAdminOrderNotification(orderData);
    }

    // Send failed email if payment failed
    if (order.paymentStatus === 'failed' && orderData.customerEmail) {
      const { sendOrderFailed } = await import('@/lib/email');
      await sendOrderFailed(
        orderData.customerEmail,
        orderData.orderNumber,
        orderData.customerName,
        orderData.total,
        'Le paiement n\'a pas pu être traité'
      );
    }

    // Send shipped email when order is shipped
    if (
      operation === 'update' &&
      order.status === 'shipped' &&
      previousDoc?.status !== 'shipped' &&
      orderData.customerEmail
    ) {
      const { sendOrderShipped } = await import('@/lib/email');
      await sendOrderShipped(
        orderData.customerEmail,
        orderData.orderNumber,
        orderData.customerName,
        order.trackingNumber,
        undefined,
        'Colissimo',
        undefined
      );
    }
  } catch (error) {
    console.error('Failed to send order emails:', error);
    // Don't throw error to avoid blocking order creation
  }

  return doc;
};
