import type { Endpoint } from 'payload';
import { LygosService } from '@/lib/lygos.service';

export const createOrderEndpoint: Endpoint = {
  path: '/checkout/create-order',
  method: 'post',
  handler: async (req) => {
    const payload = req.payload;

    try {
      const body = await req.json?.();
      const { items, shippingInfo, billingInfo, shippingMethodId, customerNote } = body || {};

      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        return Response.json(
          { success: false, message: 'Cart items are required' },
          { status: 400 }
        );
      }

      if (!shippingInfo || !shippingInfo.firstName || !shippingInfo.email || !shippingInfo.phone || !shippingInfo.city) {
        return Response.json(
          { success: false, message: 'Complete shipping information is required' },
          { status: 400 }
        );
      }

      // Validate and fetch products
      const productIds = items.map((item: any) => item.productId);
      const products = await payload.find({
        collection: 'products',
        where: {
          id: {
            in: productIds,
          },
        },
        limit: productIds.length,
      });

      if (products.docs.length !== productIds.length) {
          const foundIds = products.docs.map((p: any) => p.id);
          const missingIds = productIds.filter((id: string) => !foundIds.includes(id));
          console.error('[Checkout] Products not found:', missingIds);

        return Response.json(
            {
                success: false,
                message: 'Some products not found or no longer available',
                missingProducts: missingIds,
            },
          { status: 400 }
        );
      }

      // Calculate order totals
      let subtotal = 0;
      const orderItems = items.map((item: any) => {
        const product = products.docs.find((prod: any) => prod.id === item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        const unitPrice = product.price;
        subtotal += unitPrice * item.quantity;

        return {
          product: product.id,
          productTitle: product.title,
          quantity: item.quantity,
          unitPrice,
          size: item.size,
          color: item.color,
          cupSize: item.cupSize,
        };
      });

      // Calculate shipping
      let shippingCost = 0;
      if (shippingMethodId) {
        try {
          const shippingMethod = await payload.findByID({
            collection: 'shippingRates',
            id: shippingMethodId,
          });
          shippingCost = shippingMethod.price || 0;
        } catch (error) {
          console.warn('Shipping method not found, using default');
          shippingCost = 2000;
        }
      }

      const total = subtotal + shippingCost;

      // Generate order number
      const orderNumber = `CAN-${Date.now().toString(36).toUpperCase()}`;

      // Create order
      const order = await payload.create({
        collection: 'orders',
        data: {
          orderNumber,
          items: orderItems,
          shippingInfo: {
            firstName: shippingInfo.firstName,
            lastName: shippingInfo.lastName || '',
            email: shippingInfo.email,
            phone: shippingInfo.phone,
            address: shippingInfo.address || '',
            addressLine2: shippingInfo.addressLine2,
            city: shippingInfo.city,
            postalCode: shippingInfo.postalCode,
            country: shippingInfo.country || 'Bénin',
          },
          billingInfo: billingInfo || undefined,
          useDifferentBillingAddress: !!billingInfo,
          subtotal,
          shippingCost,
          total,
          shippingMethod: shippingMethodId || undefined,
          customerNote: customerNote || undefined,
          status: 'pending',
          paymentStatus: 'pending',
          paymentMethod: 'Lygos',
        },
      });

      console.log('[Checkout] ✅ Commande créée:', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total,
      });

      // Create Lygos payment gateway
      try {
        const gateway = await LygosService.createGateway({
          amount: total,
          orderId: order.orderNumber,
          customer: {
            firstName: shippingInfo.firstName,
            lastName: shippingInfo.lastName || '',
            email: shippingInfo.email,
            phone: shippingInfo.phone,
            address: shippingInfo.address,
            city: shippingInfo.city,
            country: shippingInfo.country || 'Bénin',
          },
          returnUrl: `${process.env.NEXT_PUBLIC_FRONTEND_URL}/checkout/callback`,
          webhookUrl: `${process.env.PAYLOAD_PUBLIC_SERVER_URL}/api/webhooks/lygos`,
          description: `Commande Cannesh Lingerie ${order.orderNumber}`,
        });

        console.log('[Checkout] ✅ Passerelle Lygos créée:', {
          gateway_id: gateway.gateway_id,
          payment_url: gateway.payment_url,
        });

        return Response.json({
          success: true,
          order_id: order.id,
          order_number: order.orderNumber,
          payment_url: gateway.payment_url,
          gateway_id: gateway.gateway_id,
          amount: total,
          currency: gateway.currency || 'XOF',
        }, { status: 201 });
      } catch (paymentError) {
        console.error('[Checkout] ❌ Erreur création passerelle:', paymentError);

        await payload.update({
          collection: 'orders',
          id: order.id,
          data: {
            status: 'cancelled',
            paymentStatus: 'failed',
            adminNote: `Échec création passerelle Lygos: ${paymentError instanceof Error ? paymentError.message : 'Erreur inconnue'}`,
          },
        });

        return Response.json({
          success: false,
          message: 'Failed to create payment gateway',
          order_id: order.id,
          order_number: order.orderNumber,
        }, { status: 500 });
      }
    } catch (error) {
      console.error('[Checkout] ❌ Erreur:', error);
      
      return Response.json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create order',
      }, { status: 500 });
    }
  },
};
