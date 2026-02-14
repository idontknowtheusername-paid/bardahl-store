import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const db = supabase as any;

export type PromoCodeType = 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y';

export interface PromoCode {
  id: string;
  code: string;
  discount_type: PromoCodeType;
  discount_value: number;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  buy_quantity: number | null;
  get_quantity: number | null;
  valid_from: string;
  valid_until: string | null;
  max_uses: number | null;
  uses_count: number;
  is_active: boolean | null;
}

export interface PromoCodeDiscount {
  code: string;
  type: PromoCodeType;
  amount: number;
  freeShipping: boolean;
}

export function usePromoCode() {
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validatePromoCode = async (code: string): Promise<boolean> => {
    if (!code.trim()) {
      setError('Veuillez entrer un code promo');
      return false;
    }

    setIsValidating(true);
    setError(null);

    try {
      const { data, error: fetchError } = await db
        .from('promo_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (fetchError || !data) {
        setError('Code promo invalide');
        setPromoCode(null);
        return false;
      }

      const promoData = data as any;

      const now = new Date();
      const validFrom = new Date(promoData.valid_from);
      const validUntil = promoData.valid_until ? new Date(promoData.valid_until) : null;

      if (now < validFrom) {
        setError('Ce code promo n\'est pas encore valide');
        setPromoCode(null);
        return false;
      }

      if (validUntil && now > validUntil) {
        setError('Ce code promo a expiré');
        setPromoCode(null);
        return false;
      }

      if (promoData.max_uses && promoData.uses_count >= promoData.max_uses) {
        setError('Ce code promo a atteint sa limite d\'utilisation');
        setPromoCode(null);
        return false;
      }

      const mappedPromo: PromoCode = {
        id: promoData.id,
        code: promoData.code,
        discount_type: promoData.discount_type as PromoCodeType,
        discount_value: promoData.discount_value,
        min_order_amount: promoData.min_order_amount,
        max_discount_amount: promoData.max_discount_amount,
        buy_quantity: promoData.buy_quantity,
        get_quantity: promoData.get_quantity,
        valid_from: promoData.valid_from,
        valid_until: promoData.valid_until,
        max_uses: promoData.max_uses,
        uses_count: promoData.uses_count,
        is_active: promoData.is_active,
      };

      setPromoCode(mappedPromo);
      return true;
    } catch (err) {
      console.error('Error validating promo code:', err);
      setError('Erreur lors de la validation du code');
      setPromoCode(null);
      return false;
    } finally {
      setIsValidating(false);
    }
  };

  const calculateDiscount = (
    subtotal: number,
    itemCount: number
  ): PromoCodeDiscount | null => {
    if (!promoCode) return null;

    if (promoCode.min_order_amount && subtotal < promoCode.min_order_amount) {
      return null;
    }

    let discountAmount = 0;
    let freeShipping = false;

    switch (promoCode.discount_type) {
      case 'percentage':
        discountAmount = (subtotal * promoCode.discount_value) / 100;
        if (promoCode.max_discount_amount && discountAmount > promoCode.max_discount_amount) {
          discountAmount = promoCode.max_discount_amount;
        }
        break;
      case 'fixed_amount':
        discountAmount = Math.min(promoCode.discount_value, subtotal);
        break;
      case 'free_shipping':
        freeShipping = true;
        discountAmount = 0;
        break;
      case 'buy_x_get_y':
        discountAmount = 0;
        break;
    }

    return {
      code: promoCode.code,
      type: promoCode.discount_type,
      amount: discountAmount,
      freeShipping,
    };
  };

  const clearPromoCode = () => {
    setPromoCode(null);
    setError(null);
  };

  return {
    promoCode,
    isValidating,
    error,
    validatePromoCode,
    calculateDiscount,
    clearPromoCode,
  };
}
