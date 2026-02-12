/**
 * Lygos Payment Service
 * Service pour gérer les paiements via l'API Lygos
 */

const LYGOS_API_URL = process.env.LYGOS_API_URL || 'https://api.lygosapp.com/v1';
const LYGOS_API_KEY = process.env.LYGOS_API_KEY;
const LYGOS_MODE = process.env.LYGOS_MODE || 'production';

export interface CreateLygosGatewayInput {
  amount: number; // Montant en FCFA
  currency?: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    country?: string;
  };
  orderId: string;
  returnUrl: string;
  webhookUrl?: string;
  description?: string;
}

export interface LygosGatewayResponse {
  gateway_id: string;
  payment_url: string;
  status: string;
  expires_at?: string;
  amount?: number;
  currency?: string;
  shop_name?: string;
  order_id?: string;
}

export interface LygosPaymentStatus {
  order_id: string;
  status: string;
  amount?: number;
  currency?: string;
  transaction_id?: string;
  gateway_id?: string;
  message?: string;
}

export class LygosService {
  private static getHeaders() {
    if (!LYGOS_API_KEY) {
      throw new Error('LYGOS_API_KEY is not configured');
    }

    return {
      'Content-Type': 'application/json',
      'api-key': LYGOS_API_KEY,
    };
  }

  /**
   * Créer une passerelle de paiement Lygos
   */
  static async createGateway(input: CreateLygosGatewayInput): Promise<LygosGatewayResponse> {
    try {
      console.log('[Lygos] 🚀 Création passerelle:', {
        order_id: input.orderId,
        amount: input.amount,
        mode: LYGOS_MODE,
      });

      const payload = {
        amount: Math.round(input.amount), // S'assurer que c'est un entier
        shop_name: 'Cannesh Lingerie',
        order_id: input.orderId,
        message: input.description || `Commande ${input.orderId}`,
        success_url: input.returnUrl,
        failure_url: input.returnUrl,
        currency: input.currency || 'XOF',
      };

      const response = await fetch(`${LYGOS_API_URL}/gateway`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('[Lygos] 📥 Réponse brute:', responseText);

      if (!response.ok) {
        let errorMessage = 'Erreur lors de la création de la passerelle';
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = responseText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const data = JSON.parse(responseText);

      const gatewayResponse: LygosGatewayResponse = {
        gateway_id: data.id,
        payment_url: data.link,
        status: data.status || 'created',
        amount: data.amount,
        currency: data.currency,
        shop_name: data.shop_name,
        order_id: data.order_id,
        expires_at: data.expires_at,
      };

      console.log('[Lygos] ✅ Passerelle créée:', {
        gateway_id: gatewayResponse.gateway_id,
        payment_url: gatewayResponse.payment_url,
      });

      return gatewayResponse;
    } catch (error) {
      console.error('[Lygos] ❌ Erreur création passerelle:', error);
      throw error;
    }
  }

  /**
   * Vérifier le statut d'un paiement
   */
  static async getPaymentStatus(orderId: string): Promise<LygosPaymentStatus> {
    try {
      console.log('[Lygos] 🔍 Vérification statut:', orderId);

      const response = await fetch(`${LYGOS_API_URL}/gateway/payin/${orderId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      const data = await response.json();

      console.log('[Lygos] 📊 Statut reçu:', data);

      return {
        order_id: data.order_id || orderId,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        transaction_id: data.transaction_id,
        gateway_id: data.gateway_id,
        message: data.message,
      };
    } catch (error) {
      console.error('[Lygos] ❌ Erreur vérification statut:', error);
      throw error;
    }
  }

  /**
   * Récupérer les détails d'une passerelle
   */
  static async getGatewayDetails(gatewayId: string): Promise<any> {
    try {
      const response = await fetch(`${LYGOS_API_URL}/gateway/${gatewayId}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('[Lygos] ❌ Erreur récupération passerelle:', error);
      throw error;
    }
  }

  /**
   * Helpers de statut
   */
  static isPaymentSuccessful(status: string): boolean {
    const successStatuses = ['success', 'successful', 'completed', 'paid', 'confirmed'];
    return successStatuses.includes(status.toLowerCase());
  }

  static isPaymentFailed(status: string): boolean {
    const failedStatuses = ['failed', 'error', 'cancelled', 'canceled', 'rejected', 'expired'];
    return failedStatuses.includes(status.toLowerCase());
  }

  static isPaymentPending(status: string): boolean {
    const pendingStatuses = ['pending', 'processing', 'created', 'initiated'];
    return pendingStatuses.includes(status.toLowerCase());
  }

  /**
   * Tester la configuration
   */
  static async testConfiguration(): Promise<{ success: boolean; message: string }> {
    try {
      if (!LYGOS_API_KEY) {
        return {
          success: false,
          message: 'LYGOS_API_KEY non configurée',
        };
      }

      // Test simple de connexion
      const response = await fetch(`${LYGOS_API_URL}/gateway`, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      if (response.ok) {
        return {
          success: true,
          message: '✅ Configuration Lygos valide',
        };
      }

      return {
        success: false,
        message: `Erreur HTTP ${response.status}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `Erreur: ${error instanceof Error ? error.message : 'Inconnue'}`,
      };
    }
  }
}
