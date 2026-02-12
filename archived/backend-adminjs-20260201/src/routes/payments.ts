import { Router } from 'express';
import { prisma } from '../server.js';
import { LygosService } from '../services/lygos.js';

export const paymentRoutes = Router();

// Create payment
paymentRoutes.post('/create', async (req, res) => {
  try {
    const { orderId, amount, customer, returnUrl } = req.body;

    if (!orderId || !amount || !customer) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, amount, customer',
      });
    }

    if (!customer.firstName || !customer.email || !customer.phone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required customer fields',
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3001';

    const gateway = await LygosService.createGateway({
      amount: Math.round(amount),
      orderId,
      customer,
      returnUrl: returnUrl || `${frontendUrl}/checkout/callback`,
      webhookUrl: `${backendUrl}/api/webhooks/lygos`,
      description: `Commande Cannesh Lingerie ${orderId}`,
    });

    res.json({
      success: true,
      gateway_id: gateway.gateway_id,
      payment_url: gateway.payment_url,
      order_id: orderId,
      amount: gateway.amount,
      currency: gateway.currency,
    });
  } catch (error) {
    console.error('Payment creation error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create payment',
    });
  }
});

// Verify payment
paymentRoutes.post('/verify', async (req, res) => {
  try {
    const { orderId, orderNumber } = req.body;
    const searchId = orderId || orderNumber;

    if (!searchId) {
      return res.status(400).json({
        success: false,
        message: 'Missing orderId or orderNumber',
      });
    }

    const paymentStatus = await LygosService.getPaymentStatus(searchId);

    const order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderNumber: searchId },
          { id: searchId },
        ],
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    let orderStatus = order.status;
    let paymentStatusValue = order.paymentStatus;

    if (LygosService.isPaymentSuccessful(paymentStatus.status)) {
      orderStatus = 'CONFIRMED';
      paymentStatusValue = 'PAID';
    } else if (LygosService.isPaymentFailed(paymentStatus.status)) {
      orderStatus = 'CANCELLED';
      paymentStatusValue = 'FAILED';
    } else if (LygosService.isPaymentPending(paymentStatus.status)) {
      orderStatus = 'PENDING';
      paymentStatusValue = 'PENDING';
    }

    if (orderStatus !== order.status || paymentStatusValue !== order.paymentStatus) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: orderStatus,
          paymentStatus: paymentStatusValue,
        },
      });
    }

    res.json({
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
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to verify payment',
    });
  }
});

// Lygos webhook
paymentRoutes.post('/webhooks/lygos', async (req, res) => {
  try {
    const { order_id, gateway_id, transaction_id, status, amount, currency, message } = req.body;
    console.log('[Webhook Lygos] 📥 Notification reçue:', req.body);

    if (!order_id) {
      console.error('[Webhook Lygos] ❌ order_id manquant');
      return res.status(400).json({
        success: false,
        message: 'order_id is required',
      });
    }

    // Verify payment status with Lygos
    let verifiedStatus;
    try {
      verifiedStatus = await LygosService.getPaymentStatus(order_id);
      console.log('[Webhook Lygos] ✅ Statut vérifié:', verifiedStatus);
    } catch (error) {
      console.error('[Webhook Lygos] ⚠️ Impossible de vérifier le statut, utilisation du webhook');
      verifiedStatus = { status, order_id, amount, currency, transaction_id, gateway_id };
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: order_id },
    });

    if (!order) {
      console.error('[Webhook Lygos] ❌ Commande non trouvée:', order_id);
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    let orderStatus = order.status;
    let paymentStatus = order.paymentStatus;

    if (LygosService.isPaymentSuccessful(verifiedStatus.status)) {
      orderStatus = 'CONFIRMED';
      paymentStatus = 'PAID';
      console.log('[Webhook Lygos] ✅ Paiement réussi');
    } else if (LygosService.isPaymentFailed(verifiedStatus.status)) {
      orderStatus = 'CANCELLED';
      paymentStatus = 'FAILED';
      console.log('[Webhook Lygos] ❌ Paiement échoué');
    } else if (LygosService.isPaymentPending(verifiedStatus.status)) {
      orderStatus = 'PENDING';
      paymentStatus = 'PENDING';
      console.log('[Webhook Lygos] ⏳ Paiement en attente');
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: orderStatus,
        paymentStatus: paymentStatus,
        paymentMethod: 'Lygos',
        gatewayId: gateway_id,
        transactionId: transaction_id,
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

    res.json({
      success: true,
      message: 'Webhook processed successfully',
      order_id,
      order_status: orderStatus,
      payment_status: paymentStatus,
    });
  } catch (error) {
    console.error('[Webhook Lygos] ❌ Erreur:', error);
    res.json({
      success: false,
      message: 'Webhook received but processing failed',
    });
  }
});
