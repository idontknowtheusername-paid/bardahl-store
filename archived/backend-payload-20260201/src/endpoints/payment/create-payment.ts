import type { Endpoint } from 'payload';
import { LygosService } from '@/lib/lygos.service';

export const createPaymentEndpoint: Endpoint = {
  path: '/payment/create',
  method: 'post',
  handler: async (req) => {
    const payload = req.payload;

    try {
      const body = await req.json?.();
      const { orderId, amount, customer, returnUrl } = body || {};

      if (!orderId || !amount || !customer) {
        return Response.json(
          { success: false, message: 'Missing required fields: orderId, amount, customer' },
          { status: 400 }
        );
      }

      if (!customer.firstName || !customer.email || !customer.phone) {
        return Response.json(
          { success: false, message: 'Missing required customer fields' },
          { status: 400 }
        );
      }

      const gateway = await LygosService.createGateway({
        amount: Math.round(amount),
        orderId,
        customer,
        returnUrl: returnUrl || `${process.env.NEXT_PUBLIC_FRONTEND_URL}/checkout/callback`,
        webhookUrl: `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/webhooks/lygos`,
        description: `Commande Cannesh Lingerie ${orderId}`,
      });

      return Response.json({
        success: true,
        gateway_id: gateway.gateway_id,
        payment_url: gateway.payment_url,
        order_id: orderId,
        amount: gateway.amount,
        currency: gateway.currency,
      });
    } catch (error) {
      console.error('Payment creation error:', error);
      return Response.json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create payment',
      }, { status: 500 });
    }
  },
};
