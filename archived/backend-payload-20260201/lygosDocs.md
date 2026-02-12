# Guide Complet d'Intégration Lygos

## 📋 Vue d'ensemble

Lygos est une passerelle de paiement africaine qui permet d'accepter les paiements par Mobile Money et carte bancaire. Ce guide détaille toute la configuration nécessaire pour recréer l'intégration dans un autre projet.

---

## 🔑 1. Configuration des Variables d'Environnement

### Variables requises dans `.env.local` ou `.env`

```bash
# === LYGOS PAYMENT CONFIGURATION ===
LYGOS_API_KEY=lygosapp-xxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
LYGOS_MODE=production  # ou "sandbox" pour les tests
LYGOS_API_URL=https://api.lygosapp.com  # URL de base (optionnel)

# URL de votre application (pour les callbacks)
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
```

### Obtenir votre API Key

1. Créer un compte sur [Lygos](https://lygosapp.com)
2. Accéder au dashboard développeur
3. Générer une clé API
4. Format: `lygosapp-[uuid]`

---

## 🏗️ 2. Architecture du Service

### Structure des fichiers

```
lib/services/
  ├── base.service.ts          # Service de base (optionnel)
  └── lygos.service.ts         # Service principal Lygos

app/api/
  ├── checkout/route.ts        # Création de commande + gateway
  ├── payment/verify/route.ts  # Vérification statut paiement
  └── webhooks/lygos/route.ts  # Réception notifications Lygos

app/checkout/
  └── [gateway_id]/page.tsx    # Page de redirection paiement
```

---

## 💻 3. Service Lygos (`lib/services/lygos.service.ts`)

### Interfaces TypeScript

```typescript
// Input pour créer une passerelle
export interface CreateLygosGatewayInput {
  amount: number;              // Montant en XOF (FCFA)
  currency?: string;           // Devise (défaut: XOF)
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    country?: string;
  };
  orderId: string;             // Référence unique commande
  returnUrl: string;           // URL de retour après paiement
  webhookUrl?: string;         // URL webhook notifications
  description?: string;        // Description du paiement
}

// Réponse de Lygos
export interface LygosGatewayResponse {
  gateway_id: string;          // ID de la passerelle
  payment_url: string;         // URL de redirection paiement
  status: string;              // Statut (created, pending, etc.)
  expires_at?: string;         // Date d'expiration
  amount?: number;
  currency?: string;
  shop_name?: string;
  order_id?: string;
}

// Statut d'un paiement
export interface LygosPaymentStatus {
  order_id: string;
  status: string;              // success, pending, failed, etc.
  amount?: number;
  currency?: string;
  transaction_id?: string;
  gateway_id?: string;
  message?: string;
}
```

### Méthodes principales

```typescript
export class LygosService {
  // 1. Créer une passerelle de paiement
  static async createGateway(input: CreateLygosGatewayInput): Promise<LygosGatewayResponse>
  
  // 2. Vérifier le statut d'un paiement
  static async getPaymentStatus(orderId: string): Promise<LygosPaymentStatus>
  
  // 3. Récupérer les détails d'une passerelle
  static async getGatewayDetails(gatewayId: string): Promise<any>
  
  // 4. Lister toutes les passerelles
  static async listGateways(): Promise<any[]>
  
  // 5. Mettre à jour une passerelle
  static async updateGateway(gatewayId: string, updates: any): Promise<any>
  
  // 6. Supprimer une passerelle
  static async deleteGateway(gatewayId: string): Promise<boolean>
  
  // 7. Helpers de statut
  static isPaymentSuccessful(status: string): boolean
  static isPaymentFailed(status: string): boolean
  static isPaymentPending(status: string): boolean
  
  // 8. Tester la configuration
  static async testConfiguration(): Promise<{ success: boolean; message: string }>
}
```

---

## 🔌 4. API Endpoints

### A. Création de commande et paiement (`/api/checkout`)

**Méthode:** `POST`

**Body:**
```json
{
  "user_id": "uuid-de-l-utilisateur",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "price": 5000
    }
  ],
  "customer": {
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean@example.com",
    "phone": "+22997123456",
    "address": "123 Rue Example",
    "city": "Cotonou",
    "country": "BJ"
  }
}
```

**Réponse:**
```json
{
  "success": true,
  "payment_url": "https://pay.lygosapp.com/checkout/xxxxx",
  "gateway_id": "uuid-gateway",
  "order_id": "uuid-commande",
  "reference": "ORD-1234567890-ABC123",
  "amount": 10000,
  "currency": "XOF"
}
```

**Logique:**
1. Valider les données du panier
2. Calculer le total (produits + livraison)
3. Créer la commande en base (statut: pending)
4. Créer la passerelle Lygos
5. Retourner l'URL de paiement au frontend

### B. Vérification de paiement (`/api/payment/verify`)

**Méthode:** `POST`

**Body:**
```json
{
  "order_id": "ORD-1234567890-ABC123",
  "gateway_id": "uuid-gateway"  // optionnel
}
```

**Réponse:**
```json
{
  "success": true,
  "order_id": "ORD-1234567890-ABC123",
  "status": "success",
  "is_successful": true,
  "is_failed": false,
  "is_pending": false,
  "order_status": "confirmed",
  "payment_status": "paid",
  "amount": 10000,
  "gateway_id": "uuid-gateway",
  "transaction_id": "TXN-123456"
}
```

### C. Webhook Lygos (`/api/webhooks/lygos`)

**Méthode:** `POST` (appelé par Lygos)

**Body reçu de Lygos:**
```json
{
  "order_id": "ORD-1234567890-ABC123",
  "gateway_id": "uuid-gateway",
  "transaction_id": "TXN-123456",
  "status": "success",
  "amount": 10000,
  "currency": "XOF",
  "message": "Paiement réussi"
}
```

**Logique:**
1. Recevoir la notification de Lygos
2. Vérifier le statut auprès de l'API Lygos (sécurité)
3. Trouver la commande en base
4. Mettre à jour le statut de la commande
5. Répondre à Lygos

**Important:** Configurer l'URL du webhook dans votre compte Lygos:
```
https://votre-domaine.com/api/webhooks/lygos
```

---

## 🌐 5. Endpoints API Lygos

### URL de base
```
https://api.lygosapp.com/v1
```

### Headers requis
```typescript
{
  'Content-Type': 'application/json',
  'api-key': 'votre-api-key-lygos'
}
```

### 1. Créer une passerelle

**Endpoint:** `POST /v1/gateway`

**Payload:**
```json
{
  "amount": 10000,           // integer requis (en FCFA)
  "shop_name": "MonShop",    // string requis
  "order_id": "ORD-123",     // string requis
  "message": "Description",  // string optionnel
  "success_url": "https://...", // string optionnel
  "failure_url": "https://..."  // string optionnel
}
```

**Réponse:**
```json
{
  "id": "uuid-gateway",
  "amount": 10000,
  "currency": "XOF",
  "shop_name": "MonShop",
  "user_id": "uuid-user",
  "creation_date": "2023-11-07T05:31:56Z",
  "link": "https://pay.lygosapp.com/checkout/xxxxx",
  "message": "Description",
  "order_id": "ORD-123",
  "success_url": "https://...",
  "failure_url": "https://..."
}
```

### 2. Vérifier le statut d'un paiement

**Endpoint:** `GET /v1/gateway/payin/{order_id}`

**Réponse:**
```json
{
  "order_id": "ORD-123",
  "status": "success"  // success, pending, failed, etc.
}
```

### 3. Récupérer une passerelle

**Endpoint:** `GET /v1/gateway/{gateway_id}`

### 4. Lister les passerelles

**Endpoint:** `GET /v1/gateway`

### 5. Mettre à jour une passerelle

**Endpoint:** `PUT /v1/gateway/{gateway_id}`

### 6. Supprimer une passerelle

**Endpoint:** `DELETE /v1/gateway/{gateway_id}`

---

## 📊 6. Codes de Statut HTTP

| Code | Catégorie | Description |
|------|-----------|-------------|
| 200 | Succès | Requête réussie |
| 201 | Créé | Ressource créée |
| 204 | Aucun Contenu | Succès sans données |
| 400 | Requête Incorrecte | Syntaxe invalide |
| 401 | Non Autorisé | API Key manquante/invalide |
| 403 | Interdit | Permissions insuffisantes |
| 404 | Non Trouvé | Ressource introuvable |
| 409 | Conflit | Ressource en double |
| 422 | Entité Non Traitée | Données invalides |
| 500 | Erreur Serveur | Erreur interne |
| 502 | Mauvaise Passerelle | Service temporairement indisponible |
| 503 | Service Indisponible | Maintenance ou surcharge |
| 504 | Délai d'Attente | Timeout |

---

## 🎯 7. Statuts de Paiement

### Statuts possibles

- **success / successful / completed / paid / confirmed** → Paiement réussi
- **pending / processing / created / initiated** → En attente
- **failed / error / cancelled / canceled / rejected / expired** → Échec

### Helpers de vérification

```typescript
// Vérifier si paiement réussi
LygosService.isPaymentSuccessful(status)

// Vérifier si paiement échoué
LygosService.isPaymentFailed(status)

// Vérifier si paiement en attente
LygosService.isPaymentPending(status)
```

---

## 🔄 8. Flux de Paiement Complet

### Étape 1: Initialisation (Frontend → Backend)

```typescript
// Frontend: Soumettre le checkout
const response = await fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_id: userId,
    items: cartItems,
    customer: customerInfo
  })
});

const { payment_url, gateway_id, order_id } = await response.json();
```

### Étape 2: Redirection vers Lygos

```typescript
// Ouvrir l'URL de paiement Lygos
window.location.href = payment_url;
// ou
window.open(payment_url, '_blank');
```

### Étape 3: Paiement sur Lygos

L'utilisateur effectue le paiement sur la plateforme Lygos:
- Choix du mode de paiement (Mobile Money / Carte)
- Saisie des informations
- Validation du paiement

### Étape 4: Callback (Lygos → Votre Backend)

Lygos envoie une notification webhook à votre endpoint:
```
POST https://votre-domaine.com/api/webhooks/lygos
```

### Étape 5: Vérification (Backend)

```typescript
// Vérifier le statut auprès de Lygos
const status = await LygosService.getPaymentStatus(order_id);

// Mettre à jour la commande
if (LygosService.isPaymentSuccessful(status.status)) {
  await OrdersService.update({
    id: order_id,
    status: 'confirmed',
    payment_status: 'paid'
  });
}
```

### Étape 6: Retour utilisateur

Lygos redirige l'utilisateur vers votre `success_url` ou `failure_url`:
```
https://votre-domaine.com/checkout/callback?order_id=xxx&status=success
```

---

## 🛡️ 9. Sécurité et Bonnes Pratiques

### 1. Validation des montants

```typescript
// Toujours valider les prix côté serveur
const validation = await validateCartItems(items);
const { total } = calculateOrderTotal(validation.items);
```

### 2. Vérification des webhooks

```typescript
// Ne jamais faire confiance aveuglément au webhook
// Toujours vérifier auprès de l'API Lygos
const verifiedStatus = await LygosService.getPaymentStatus(order_id);
```

### 3. Gestion des erreurs

```typescript
try {
  const gateway = await LygosService.createGateway(input);
} catch (error) {
  // Logger l'erreur
  console.error('[Lygos] Erreur:', error);
  
  // Annuler la commande si nécessaire
  await OrdersService.update({
    id: order_id,
    status: 'cancelled',
    notes: `Échec paiement: ${error.message}`
  });
  
  // Retourner une erreur claire au frontend
  return { error: 'Échec initialisation paiement' };
}
```

### 4. Rate limiting

```typescript
// Limiter les tentatives de checkout
const { allowed, resetTime } = checkRateLimit(request);
if (!allowed) {
  return { error: `Trop de tentatives. Réessayez dans ${resetTime}s` };
}
```

### 5. Validation UUID

```typescript
// Vérifier que user_id est un UUID valide
const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
if (!uuidRegex.test(user_id)) {
  return { error: 'user_id invalide' };
}
```

---

## 🧪 10. Tests et Débogage

### Tester la configuration

```typescript
const test = await LygosService.testConfiguration();
console.log(test);
// { success: true, message: '✅ Configuration Lygos valide' }
```

### Logs importants

```typescript
// Activer les logs détaillés
console.log('[Lygos] 🚀 Création passerelle:', { order_id, amount });
console.log('[Lygos] 📥 Réponse brute:', responseText);
console.log('[Lygos] 🔗 URL de paiement:', payment_url);
console.log('[Lygos] ✅ Passerelle créée avec succès');
```

### Mode développement

```typescript
// Simuler une réponse en dev si pas d'API Key
if (!apiKey && process.env.NODE_ENV === 'development') {
  console.warn('[Lygos] ⚠️ Mode développement - Simulation gateway');
  return {
    gateway_id: `dev-${Date.now()}`,
    payment_url: `https://pay.lygosapp.com/dev`,
    status: 'created'
  };
}
```

---

## 📦 11. Dépendances Requises

### Package.json

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0"
  }
}
```

Aucune dépendance externe spécifique à Lygos n'est requise. L'intégration utilise uniquement `fetch` natif.

---

## 🚀 12. Déploiement

### Variables d'environnement sur Vercel/Netlify

1. Aller dans les paramètres du projet
2. Ajouter les variables:
   - `LYGOS_API_KEY`
   - `LYGOS_MODE`
   - `NEXT_PUBLIC_APP_URL`

### Configuration du webhook

1. Se connecter au dashboard Lygos
2. Configurer l'URL du webhook:
   ```
   https://votre-domaine.com/api/webhooks/lygos
   ```
3. Tester le webhook avec un paiement test

---

## 📝 13. Checklist d'Intégration

- [ ] Créer un compte Lygos
- [ ] Obtenir l'API Key
- [ ] Configurer les variables d'environnement
- [ ] Copier `lib/services/lygos.service.ts`
- [ ] Créer `/api/checkout/route.ts`
- [ ] Créer `/api/webhooks/lygos/route.ts`
- [ ] Créer `/api/payment/verify/route.ts`
- [ ] Configurer l'URL du webhook sur Lygos
- [ ] Tester en mode sandbox
- [ ] Tester un paiement réel
- [ ] Vérifier les logs
- [ ] Déployer en production

---

## 🆘 14. Résolution de Problèmes

### Erreur 401: Non Autorisé

**Cause:** API Key manquante ou invalide

**Solution:**
- Vérifier que `LYGOS_API_KEY` est définie
- Vérifier le format: `lygosapp-[uuid]`
- Régénérer une nouvelle clé si nécessaire

### Erreur 403: Interdit

**Cause:** Permissions insuffisantes

**Solution:**
- Vérifier que l'API Key a les bonnes permissions
- Contacter le support Lygos

### payment_url undefined

**Cause:** Lygos ne retourne pas le champ `link`

**Solution:**
- Vérifier les logs de la réponse API
- S'assurer que tous les champs requis sont envoyés
- Vérifier que le montant est un integer

### Webhook non reçu

**Cause:** URL mal configurée ou serveur inaccessible

**Solution:**
- Vérifier l'URL du webhook sur le dashboard Lygos
- S'assurer que l'endpoint est accessible publiquement
- Tester avec un outil comme ngrok en local

### Commande non mise à jour

**Cause:** Webhook échoue ou order_id incorrect

**Solution:**
- Vérifier les logs du webhook
- S'assurer que l'order_id correspond
- Vérifier la logique de recherche de commande

---

## 📚 15. Ressources

- **Documentation officielle:** [Lygos API Docs](https://docs.lygosapp.com)
- **Dashboard:** [Lygos Dashboard](https://dashboard.lygosapp.com)
- **Support:** support@lygosapp.com
- **API Base URL:** https://api.lygosapp.com/v1

---

## 💡 16. Exemple Complet Minimal

### Service minimal

```typescript
// lib/services/lygos.service.ts
export class LygosService {
  private static getHeaders() {
    return {
      'Content-Type': 'application/json',
      'api-key': process.env.LYGOS_API_KEY!
    };
  }

  static async createGateway(input: {
    amount: number;
    orderId: string;
    returnUrl: string;
  }) {
    const response = await fetch('https://api.lygosapp.com/v1/gateway', {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        amount: Math.round(input.amount),
        shop_name: 'MonShop',
        order_id: input.orderId,
        success_url: input.returnUrl,
        failure_url: input.returnUrl
      })
    });

    const data = await response.json();
    
    return {
      gateway_id: data.id,
      payment_url: data.link
    };
  }

  static async getPaymentStatus(orderId: string) {
    const response = await fetch(
      `https://api.lygosapp.com/v1/gateway/payin/${orderId}`,
      { headers: this.getHeaders() }
    );
    
    return await response.json();
  }
}
```

### Route API minimale

```typescript
// app/api/checkout/route.ts
import { LygosService } from '@/lib/services/lygos.service';

export async function POST(request: Request) {
  const { amount, orderId } = await request.json();
  
  const gateway = await LygosService.createGateway({
    amount,
    orderId,
    returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/callback`
  });
  
  return Response.json({
    payment_url: gateway.payment_url,
    gateway_id: gateway.gateway_id
  });
}
```

### Frontend minimal

```typescript
// Checkout
const response = await fetch('/api/checkout', {
  method: 'POST',
  body: JSON.stringify({ amount: 10000, orderId: 'ORD-123' })
});

const { payment_url } = await response.json();
window.location.href = payment_url;
```

---

## ✅ Conclusion

Cette intégration Lygos est complète et production-ready. Elle gère:

- ✅ Création de passerelles de paiement
- ✅ Redirection vers Lygos
- ✅ Réception des webhooks
- ✅ Vérification des statuts
- ✅ Gestion des erreurs
- ✅ Sécurité et validation
- ✅ Logs détaillés
- ✅ Mode développement

Pour recréer cette intégration ailleurs, il suffit de:
1. Copier le service Lygos
2. Créer les 3 routes API
3. Configurer les variables d'environnement
4. Adapter la logique métier (commandes, utilisateurs, etc.)
