// Payment API - Lygos Integration via Supabase Edge Functions
import { supabase } from '@/integrations/supabase/client';

export interface OrderItem {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
  cupSize?: string;
}

export interface ShippingInfo {
  firstName: string;
  email: string;
  phone: string;
  city: string;
  address?: string;
  country?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  order_id?: string;
  order_number?: string;
  payment_url?: string;
  amount?: number;
  message?: string;
  payment_method?: 'genius_pay' | 'kkiapay';
  kkiapay_config?: {
    public_key: string;
    amount: number;
    sandbox: boolean;
    callback: string;
  };
}

export interface VerifyPaymentResponse {
  success: boolean;
  status?: 'pending' | 'paid' | 'failed';
  order?: {
    id: string;
    order_number: string;
    payment_status: string;
    status: string;
  };
  message?: string;
}

export const paymentApi = {
  async createOrder(
    items: OrderItem[],
    shippingInfo: ShippingInfo,
    shippingMethod: string,
    gateway: 'genius_pay' | 'kkiapay' = 'genius_pay',
    shippingCost?: number
  ): Promise<CreateOrderResponse> {
    const functionName = gateway === 'kkiapay' ? 'payment-create-kkiapay' : 'payment-create';

    const { data, error } = await supabase.functions.invoke(functionName, {
      body: {
        items,
        shipping: shippingInfo,
        shippingMethod,
        shippingCost, // Pass explicit shipping cost from frontend
      },
    });

    if (error) {
      console.error('Payment create error:', error);
      throw new Error(error.message || 'Failed to create order');
    }

    return data as CreateOrderResponse;
  },

  async verifyPayment(orderNumber: string): Promise<VerifyPaymentResponse> {
    const { data, error } = await supabase.functions.invoke('payment-verify', {
      body: { orderNumber },
    });

    if (error) {
      console.error('Payment verify error:', error);
      throw new Error(error.message || 'Failed to verify payment');
    }

    return data as VerifyPaymentResponse;
  },

  redirectToPayment(paymentUrl: string) {
    window.location.href = paymentUrl;
  },
};

export const shippingApi = {
  async calculateShipping(
    city: string,
    subtotal: number,
    shippingMethod: string,
    country: string = 'Bénin'
  ) {
    try {
      const { data, error } = await supabase.functions.invoke('shipping-calculate', {
        body: { city, subtotal, shippingMethod, country },
      });

      if (error) {
        console.warn('Shipping calculation failed:', error);
        return { shippingCost: 0, freeShipping: false, error: true };
      }

      return data;
    } catch (e) {
      console.warn('Shipping calculation error:', e);
      return { shippingCost: 0, freeShipping: false, error: true };
    }
  },
};
