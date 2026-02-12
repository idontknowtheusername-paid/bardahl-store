import type { Endpoint } from 'payload';
import { LygosService } from '@/lib/lygos.service';

export const verifyPaymentEndpoint: Endpoint = {
  path: '/payment/verify',
  method: 'post',
  handler: async (req) => {
    const payload = req.payload;

    try {
      const body = await req.json?.();
      const { orderId, orderNumber } = body || {};

      const searchId = orderId || orderNumber;

      if (!searchId) {
        return Response.json(
          { success: false, message: 'Missing orderId or orderNumber' },
          { status: 400 }
        );
      }

      const paymentStatus = await LygosService.getPaymentStatus(searchId);

      const orders = await payload.find({
        collection: 'orders',
        where: {
          or: [
            { orderNumber: { equals: searchId } },
            { id: { equals: searchId } },
          ],
        },
        limit: 1,
      });

      if (orders.docs.length === 0) {
        return Response.json(
          { success: false, message: 'Order not found' },
          { status: 404 }
        );
      }

      const order = orders.docs[0];

      let orderStatus = order.status;
      let paymentStatusValue = order.paymentStatus;

      if (LygosService.isPaymentSuccessful(paymentStatus.status)) {
        orderStatus = 'confirmed';
        paymentStatusValue = 'paid';
      } else if (LygosService.isPaymentFailed(paymentStatus.status)) {
        orderStatus = 'cancelled';
        paymentStatusValue = 'failed';
      } else if (LygosService.isPaymentPending(paymentStatus.status)) {
        orderStatus = 'pending';
        paymentStatusValue = 'pending';
      }

      if (orderStatus !== order.status || paymentStatusValue !== order.paymentStatus) {
        await payload.update({
          collection: 'orders',
          id: order.id,
          data: {
            status: orderStatus,
            paymentStatus: paymentStatusValue,
          },
        });
      }

      return Response.json({
        success: true,
        order_id: order.orderNumber,
        status: paymentStatus.status,
        is_successful: LygosService.isPaymentSuccessful(paymentStatus.status),
        is_failed: LygosService.isPaymentFailed(paymentStatus.status),
        is_pending: LygosService.isPaymentPending(paymentStatus.status),
        order_status: orderStatus,
        payment_status: paymentStatusValue,
        amount: paymentStatus.amount,
        gateway_id: paymentStatus.gateway_id,
        transaction_id: paymentStatus.transaction_id,
      });
    } catch (error) {
      console.error('Payment verification error:', error);
      return Response.json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to verify payment',
      }, { status: 500 });
    }
  },
};
