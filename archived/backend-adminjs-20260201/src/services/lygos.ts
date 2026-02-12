interface CreateGatewayParams {
  amount: number;
  orderId: string;
  customer: {
    firstName: string;
    email: string;
    phone: string;
  };
  returnUrl: string;
  webhookUrl: string;
  description?: string;
}

interface GatewayResponse {
  gateway_id: string;
  payment_url: string;
  amount: number;
  currency: string;
  status: string;
}

interface PaymentStatus {
  status: string;
  order_id: string;
  amount: number;
  currency: string;
  transaction_id?: string;
  gateway_id?: string;
}

const LYGOS_BASE_URL = process.env.LYGOS_BASE_URL || 'https://api.lygos.app';
const LYGOS_API_KEY = process.env.LYGOS_API_KEY || '';
const LYGOS_SECRET_KEY = process.env.LYGOS_SECRET_KEY || '';

export class LygosService {
  private static getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${LYGOS_API_KEY}`,
      'X-Secret-Key': LYGOS_SECRET_KEY,
    };
  }

  static async createGateway(params: CreateGatewayParams): Promise<GatewayResponse> {
    const response = await fetch(`${LYGOS_BASE_URL}/v1/gateways`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        amount: params.amount,
        currency: 'XOF',
        order_id: params.orderId,
        customer: {
          first_name: params.customer.firstName,
          email: params.customer.email,
          phone: params.customer.phone,
        },
        return_url: params.returnUrl,
        webhook_url: params.webhookUrl,
        description: params.description || `Order ${params.orderId}`,
        payment_methods: ['mtn_momo', 'moov_money', 'card'],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Lygos API error:', error);
      throw new Error(`Lygos API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      gateway_id: data.id || data.gateway_id,
      payment_url: data.payment_url || data.url,
      amount: data.amount,
      currency: data.currency || 'XOF',
      status: data.status || 'pending',
    };
  }

  static async getPaymentStatus(orderId: string): Promise<PaymentStatus> {
    const response = await fetch(`${LYGOS_BASE_URL}/v1/transactions?order_id=${orderId}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Lygos API error:', error);
      throw new Error(`Lygos API error: ${response.status}`);
    }

    const data = await response.json();
    const transaction = Array.isArray(data) ? data[0] : data;

    return {
      status: transaction?.status || 'pending',
      order_id: orderId,
      amount: transaction?.amount || 0,
      currency: transaction?.currency || 'XOF',
      transaction_id: transaction?.id || transaction?.transaction_id,
      gateway_id: transaction?.gateway_id,
    };
  }

  static isPaymentSuccessful(status: string): boolean {
    const successStatuses = ['successful', 'success', 'completed', 'paid', 'approved'];
    return successStatuses.includes(status?.toLowerCase());
  }

  static isPaymentFailed(status: string): boolean {
    const failedStatuses = ['failed', 'failure', 'rejected', 'declined', 'cancelled', 'expired'];
    return failedStatuses.includes(status?.toLowerCase());
  }

  static isPaymentPending(status: string): boolean {
    const pendingStatuses = ['pending', 'processing', 'awaiting_payment', 'initiated'];
    return pendingStatuses.includes(status?.toLowerCase());
  }
}
