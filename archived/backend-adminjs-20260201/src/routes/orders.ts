import { Router } from 'express';
import { prisma } from '../server.js';
import { sendOrderConfirmation, sendAdminOrderNotification, sendOrderFailed } from '../services/email.js';

export const orderRoutes = Router();

// Generate order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `CAN-${timestamp}-${random}`;
}

// Create order
orderRoutes.post('/', async (req, res) => {
  try {
    const {
      customer,
      items,
      shippingMethod = 'STANDARD',
      shippingCost,
      subtotal,
      total,
      customerNote,
    } = req.body;

    if (!customer || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: customer, items',
      });
    }

    if (!customer.firstName || !customer.email || !customer.phone || !customer.city) {
      return res.status(400).json({
        success: false,
        message: 'Missing required customer fields',
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        firstName: customer.firstName,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        shippingMethod: shippingMethod.toUpperCase(),
        subtotal: Math.round(subtotal),
        shippingCost: Math.round(shippingCost),
        total: Math.round(total),
        customerNote,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: Math.round(item.price),
            size: item.size,
            color: item.color,
            cupSize: item.cupSize,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
              },
            },
          },
        },
      },
    });

    // Update stock
    for (const item of items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }
    }

    res.status(201).json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
      },
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to create order' });
  }
});

// Get order by order number
orderRoutes.get('/number/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      order: transformOrder(order),
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

// Get order by ID
orderRoutes.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({
      success: true,
      order: transformOrder(order),
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order' });
  }
});

// Update order status (for webhooks)
orderRoutes.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, adminNote, gatewayId, transactionId } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (adminNote) updateData.adminNote = adminNote;
    if (gatewayId) updateData.gatewayId = gatewayId;
    if (transactionId) updateData.transactionId = transactionId;

    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { take: 1 },
              },
            },
          },
        },
      },
    });

    // Send emails based on status change
    if (paymentStatus === 'PAID') {
      await sendOrderConfirmation(order);
      await sendAdminOrderNotification(order);
    } else if (paymentStatus === 'FAILED') {
      await sendOrderFailed(order);
    }

    res.json({
      success: true,
      order: transformOrder(order),
    });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ success: false, message: 'Failed to update order' });
  }
});

function transformOrder(order: any) {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    customer: {
      firstName: order.firstName,
      email: order.email,
      phone: order.phone,
      address: order.address,
      city: order.city,
      country: order.country,
    },
    shippingMethod: order.shippingMethod,
    subtotal: order.subtotal,
    shippingCost: order.shippingCost,
    total: order.total,
    items: order.items.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product?.name,
      productImage: item.product?.images?.[0]?.url,
      quantity: item.quantity,
      price: item.price,
      size: item.size,
      color: item.color,
      cupSize: item.cupSize,
    })),
    customerNote: order.customerNote,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}
