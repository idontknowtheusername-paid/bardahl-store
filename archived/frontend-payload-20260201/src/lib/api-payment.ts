/**
 * Payment API Client for Lygos Integration
 */

const API_URL = import.meta.env.VITE_PAYLOAD_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface CreateOrderResponse {
  success: boolean;
  order_id: string;
  order_number: string;
  payment_url: string;
  gateway_id: string;
  amount: number;
  currency: string;
  message?: string;
}

interface VerifyPaymentResponse {
  success: boolean;
  order_id: string;
  status: string;
  is_successful: boolean;
  is_failed: boolean;
  is_pending: boolean;
  order_status: string;
  payment_status: string;
  amount?: number;
  gateway_id?: string;
  transaction_id?: string;
  message?: string;
}

interface OrderItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  cupSize?: string;
}

interface ShippingInfo {
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  address?: string;
  addressLine2?: string;
  city: string;
  postalCode?: string;
  country?: string;
}

export const paymentApi = {
  /**
   * Create order and initialize Lygos payment
   */
  async createOrder(
    items: OrderItem[],
    shippingInfo: ShippingInfo,
    shippingMethodId?: string,
    customerNote?: string,
    billingInfo?: ShippingInfo
  ): Promise<CreateOrderResponse> {
    const response = await fetch(`${API_URL}/api/checkout/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items,
        shippingInfo,
        billingInfo,
        shippingMethodId,
        customerNote,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Failed to create order');
    }

    return response.json();
  },

  /**
   * Verify payment status
   */
  async verifyPayment(orderNumber: string): Promise<VerifyPaymentResponse> {
    const response = await fetch(`${API_URL}/api/payment/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        orderNumber,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'Failed to verify payment');
    }

    return response.json();
  },

  /**
   * Redirect to Lygos payment page
   */
  redirectToPayment(paymentUrl: string) {
    window.location.href = paymentUrl;
  },

  /**
   * Open Lygos payment in new window
   */
  openPaymentWindow(paymentUrl: string, width = 600, height = 700) {
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    return window.open(
      paymentUrl,
      'LygosPayment',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  },
};
