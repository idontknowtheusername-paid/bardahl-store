# Intégration Genius Pay - Guide d'implémentation

## Vue d'ensemble

Genius Pay est une passerelle de paiement mobile money pour l'Afrique de l'Ouest (XOF/FCFA).  
Documentation officielle : https://pay.genius.ci/docs/api

## Architecture

```
Client (Checkout) → Edge Function (payment-create) → Genius Pay API → Redirect utilisateur
                                                                          ↓
Genius Pay → Edge Function (payment-webhook) → Mise à jour commande DB
```

## Configuration requise

### Secrets Supabase

| Secret | Description |
|--------|-------------|
| `GENIUS_PAY_API_KEY` | Clé API marchand |
| `GENIUS_PAY_API_SECRET` | Secret API marchand |
| `GENIUS_PAY_WEBHOOK_SECRET` | Secret pour valider les webhooks |

> ⚠️ Genius Pay fournit des clés **sandbox** et **production** séparées.

### Fichiers clés

| Fichier | Rôle |
|---------|------|
| `supabase/functions/payment-create/index.ts` | Crée la commande + initie le paiement |
| `supabase/functions/payment-webhook/index.ts` | Reçoit les notifications de paiement |
| `src/lib/api-payment.ts` | Client frontend pour appeler les edge functions |
| `src/pages/Checkout.tsx` | Page de checkout |
| `src/pages/CheckoutCallback.tsx` | Page de retour après paiement |

## Flux de paiement

### 1. Création de commande (`payment-create`)

```
POST /functions/v1/payment-create
Body: { items, shipping, shippingMethod }
```

**Étapes :**
1. Récupère les prix depuis la DB (jamais depuis le frontend)
2. Calcule sous-total + frais de livraison
3. Crée la commande en DB (status: `pending`)
4. Appelle l'API Genius Pay pour créer le paiement
5. Retourne l'URL de paiement au frontend

**Appel Genius Pay :**
```javascript
POST https://pay.genius.ci/api/v1/merchant/payments
Headers:
  X-API-Key: <GENIUS_PAY_API_KEY>
  X-API-Secret: <GENIUS_PAY_API_SECRET>
  Content-Type: application/json

Body: {
  amount: 15000,        // En FCFA (entier)
  currency: "XOF",
  description: "Commande CMD-xxx - Bardahl",
  success_url: "https://site.com/checkout/callback?order_id=xxx",
  error_url: "https://site.com/checkout",
  customer: {
    email: "client@email.com",
    phone: "+22901234567",
    name: "Nom Client"
  },
  metadata: {
    order_id: "uuid",
    order_number: "CMD-xxx"
  }
}
```

**Réponse Genius Pay :**
```json
{
  "data": {
    "id": "pay_xxx",
    "reference": "ref_xxx",
    "checkout_url": "https://pay.genius.ci/checkout/xxx"
  }
}
```

### 2. Redirection

Le frontend redirige l'utilisateur vers `checkout_url` pour effectuer le paiement mobile money.

### 3. Webhook (`payment-webhook`)

Genius Pay envoie une notification POST après le paiement :

```
POST /functions/v1/payment-webhook
```

**Validation :** Le webhook vérifie la signature HMAC avec `GENIUS_PAY_WEBHOOK_SECRET`.

**Statuts gérés :**
- `successful` / `completed` → `payment_status = 'paid'`, `status = 'confirmed'`
- `failed` → `payment_status = 'failed'`

### 4. Callback

L'utilisateur est redirigé vers `/checkout/callback?order_id=xxx`.  
La page vérifie le statut de la commande en DB et affiche la confirmation.

## Points importants

### Prix
- Les prix sont stockés en **FCFA (entiers)** dans la DB
- Le montant envoyé à Genius Pay est en FCFA tel quel
- Exemple : un produit à 15 000 FCFA → `amount: 15000`

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `PAYMENT_INIT_FAILED` - Limite atteinte | Montant trop élevé ou compte marchand limité | Vérifier les limites du compte Genius Pay |
| `PAYMENT_INIT_FAILED` - Marchand inactif | Compte pas encore validé en production | Contacter le support Genius Pay |
| Timeout réseau | Genius Pay ne répond pas | L'edge function gère le timeout (10s) et retourne une erreur gracieuse |

### Sécurité
- Les prix sont **toujours recalculés côté serveur** depuis la DB
- Les webhooks sont validés par signature HMAC
- Les clés API sont stockées dans les secrets Supabase (jamais dans le code)

## Configuration du webhook dans Genius Pay

Dans le dashboard Genius Pay, configurer l'URL du webhook :
```
https://<PROJECT_ID>.supabase.co/functions/v1/payment-webhook
```

## Adapter à un autre projet

1. Créer les edge functions `payment-create` et `payment-webhook`
2. Ajouter les 3 secrets dans Supabase
3. Configurer le webhook dans le dashboard Genius Pay
4. Adapter les tables `orders` et `order_items` selon le schéma
5. Mettre à jour `success_url` et `error_url` dans `payment-create`
