import type { Endpoint } from 'payload';
import { LygosService } from '@/lib/lygos.service';

export const lygosWebhookEndpoint: Endpoint = {
  path: '/webhooks/lygos',
  method: 'post',
  handler: async (req) => {
    const payload = req.payload;

    try {
      const body = await req.json?.();
      console.log('[Webhook Lygos] 📥 Notification reçue:', body);

      const { order_id, gateway_id, transaction_id, status, amount, currency, message } = body || {};

      if (!order_id) {
        console.error('[Webhook Lygos] ❌ order_id manquant');
        return Response.json(
          { success: false, message: 'order_id is required' },
          { status: 400 }
        );
      }

      let verifiedStatus;
      try {
        verifiedStatus = await LygosService.getPaymentStatus(order_id);
        console.log('[Webhook Lygos] ✅ Statut vérifié:', verifiedStatus);
      } catch (error) {
        console.error('[Webhook Lygos] ⚠️ Impossible de vérifier le statut, utilisation du webhook');
        verifiedStatus = { status, order_id, amount, currency, transaction_id, gateway_id };
      }

      const orders = await payload.find({
        collection: 'orders',
        where: {
          orderNumber: {
            equals: order_id,
          },
        },
        limit: 1,
      });

      if (orders.docs.length === 0) {
        console.error('[Webhook Lygos] ❌ Commande non trouvée:', order_id);
        return Response.json(
          { success: false, message: 'Order not found' },
          { status: 404 }
        );
      }

      const order = orders.docs[0];

      let orderStatus = order.status;
      let paymentStatus = order.paymentStatus;

      if (LygosService.isPaymentSuccessful(verifiedStatus.status)) {
        orderStatus = 'confirmed';
        paymentStatus = 'paid';
        console.log('[Webhook Lygos] ✅ Paiement réussi');
      } else if (LygosService.isPaymentFailed(verifiedStatus.status)) {
        orderStatus = 'cancelled';
        paymentStatus = 'failed';
        console.log('[Webhook Lygos] ❌ Paiement échoué');
      } else if (LygosService.isPaymentPending(verifiedStatus.status)) {
        orderStatus = 'pending';
        paymentStatus = 'pending';
        console.log('[Webhook Lygos] ⏳ Paiement en attente');
      }

      await payload.update({
        collection: 'orders',
        id: order.id,
        data: {
          status: orderStatus,
          paymentStatus: paymentStatus,
          paymentMethod: 'Lygos',
          adminNote: order.adminNote
            ? `${order.adminNote}\n\nWebhook Lygos: ${verifiedStatus.status} - Transaction: ${transaction_id || 'N/A'}`
            : `Webhook Lygos: ${verifiedStatus.status} - Transaction: ${transaction_id || 'N/A'}`,
        },
      });

      console.log('[Webhook Lygos] ✅ Commande mise à jour:', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: orderStatus,
        paymentStatus,
      });

      return Response.json({
        success: true,
        message: 'Webhook processed successfully',
        order_id,
        order_status: orderStatus,
        payment_status: paymentStatus,
      });
    } catch (error) {
      console.error('[Webhook Lygos] ❌ Erreur:', error);
      
      return Response.json({
        success: false,
        message: 'Webhook received but processing failed',
      });
    }
  },
};
