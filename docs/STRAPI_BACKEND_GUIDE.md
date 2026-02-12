# Backend Strapi - Cannesh Lingerie

Guide complet pour configurer le backend Strapi de Cannesh Lingerie.

## Stack Technique

- **Strapi v4** (Headless CMS)
- **PostgreSQL** (Base de données)
- **Node.js 18+**
- **Upload Cloudinary**
- **Intégration Lygos** (Paiements Mobile Money)

---

## 1. Installation

```bash
# Créer le projet Strapi
npx create-strapi-app@latest cannesh-backend --quickstart --no-run

cd cannesh-backend

# Installer les dépendances supplémentaires
npm install axios slugify

# Démarrer en mode développement
npm run develop
```

### Configuration PostgreSQL (Production)

Modifier `config/database.js` :

```javascript
module.exports = ({ env }) => ({
  connection: {
    client: 'postgres',
    connection: {
      host: env('DATABASE_HOST', 'localhost'),
      port: env.int('DATABASE_PORT', 5432),
      database: env('DATABASE_NAME', 'cannesh_db'),
      user: env('DATABASE_USERNAME', 'cannesh_user'),
      password: env('DATABASE_PASSWORD', ''),
      ssl: env.bool('DATABASE_SSL', false) && {
        rejectUnauthorized: env.bool('DATABASE_SSL_SELF', false),
      },
    },
    debug: false,
  },
});
```

---

## 2. Collections (Content-Types)

### 2.1 Product

Créer `src/api/product/content-types/product/schema.json` :

```json
{
  "kind": "collectionType",
  "collectionName": "products",
  "info": {
    "singularName": "product",
    "pluralName": "products",
    "displayName": "Product",
    "description": "Produits de lingerie"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "slug": {
      "type": "uid",
      "targetField": "name",
      "required": true
    },
    "description": {
      "type": "richtext"
    },
    "shortDescription": {
      "type": "text"
    },
    "price": {
      "type": "decimal",
      "required": true,
      "min": 0
    },
    "compareAtPrice": {
      "type": "decimal",
      "min": 0
    },
    "sku": {
      "type": "string",
      "unique": true
    },
    "stock": {
      "type": "integer",
      "default": 0,
      "min": 0
    },
    "isNew": {
      "type": "boolean",
      "default": false
    },
    "isFeatured": {
      "type": "boolean",
      "default": false
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "composition": {
      "type": "text"
    },
    "careInstructions": {
      "type": "text"
    },
    "category": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::category.category",
      "inversedBy": "products"
    },
    "collections": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::collection.collection",
      "inversedBy": "products"
    },
    "images": {
      "type": "media",
      "multiple": true,
      "allowedTypes": ["images"]
    },
    "variants": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::product-variant.product-variant",
      "mappedBy": "product"
    }
  }
}
```

### 2.2 ProductVariant

Créer `src/api/product-variant/content-types/product-variant/schema.json` :

```json
{
  "kind": "collectionType",
  "collectionName": "product_variants",
  "info": {
    "singularName": "product-variant",
    "pluralName": "product-variants",
    "displayName": "Product Variant"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "size": {
      "type": "enumeration",
      "enum": ["XS", "S", "M", "L", "XL", "XXL", "85A", "85B", "85C", "85D", "90A", "90B", "90C", "90D", "95A", "95B", "95C", "95D", "95E"]
    },
    "color": {
      "type": "string"
    },
    "colorCode": {
      "type": "string",
      "regex": "^#[0-9A-Fa-f]{6}$"
    },
    "cupSize": {
      "type": "enumeration",
      "enum": ["A", "B", "C", "D", "E", "F", "G"]
    },
    "stock": {
      "type": "integer",
      "default": 0,
      "min": 0
    },
    "sku": {
      "type": "string",
      "unique": true
    },
    "additionalPrice": {
      "type": "decimal",
      "default": 0
    },
    "product": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::product.product",
      "inversedBy": "variants"
    },
    "image": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    }
  }
}
```

### 2.3 Category

Créer `src/api/category/content-types/category/schema.json` :

```json
{
  "kind": "collectionType",
  "collectionName": "categories",
  "info": {
    "singularName": "category",
    "pluralName": "categories",
    "displayName": "Category"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "slug": {
      "type": "uid",
      "targetField": "name",
      "required": true
    },
    "description": {
      "type": "text"
    },
    "image": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "order": {
      "type": "integer",
      "default": 0
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "products": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::product.product",
      "mappedBy": "category"
    },
    "parent": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::category.category"
    }
  }
}
```

### 2.4 Collection

Créer `src/api/collection/content-types/collection/schema.json` :

```json
{
  "kind": "collectionType",
  "collectionName": "collections",
  "info": {
    "singularName": "collection",
    "pluralName": "collections",
    "displayName": "Collection"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true,
      "unique": true
    },
    "slug": {
      "type": "uid",
      "targetField": "name",
      "required": true
    },
    "description": {
      "type": "richtext"
    },
    "image": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "startDate": {
      "type": "date"
    },
    "endDate": {
      "type": "date"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "isFeatured": {
      "type": "boolean",
      "default": false
    },
    "products": {
      "type": "relation",
      "relation": "manyToMany",
      "target": "api::product.product",
      "mappedBy": "collections"
    }
  }
}
```

### 2.5 Order

Créer `src/api/order/content-types/order/schema.json` :

```json
{
  "kind": "collectionType",
  "collectionName": "orders",
  "info": {
    "singularName": "order",
    "pluralName": "orders",
    "displayName": "Order"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "orderNumber": {
      "type": "string",
      "unique": true,
      "required": true
    },
    "status": {
      "type": "enumeration",
      "enum": ["pending", "paid", "processing", "shipped", "delivered", "cancelled", "refunded"],
      "default": "pending"
    },
    "paymentStatus": {
      "type": "enumeration",
      "enum": ["pending", "paid", "failed", "refunded"],
      "default": "pending"
    },
    "paymentMethod": {
      "type": "string"
    },
    "lygosTransactionId": {
      "type": "string"
    },
    "lygosPaymentData": {
      "type": "json"
    },
    "subtotal": {
      "type": "decimal",
      "required": true
    },
    "shippingCost": {
      "type": "decimal",
      "default": 0
    },
    "tax": {
      "type": "decimal",
      "default": 0
    },
    "discount": {
      "type": "decimal",
      "default": 0
    },
    "total": {
      "type": "decimal",
      "required": true
    },
    "customerEmail": {
      "type": "email",
      "required": true
    },
    "customerFirstName": {
      "type": "string",
      "required": true
    },
    "customerLastName": {
      "type": "string",
      "required": true
    },
    "customerPhone": {
      "type": "string",
      "required": true
    },
    "shippingAddress": {
      "type": "text",
      "required": true
    },
    "shippingCity": {
      "type": "string",
      "required": true
    },
    "shippingPostalCode": {
      "type": "string"
    },
    "shippingCountry": {
      "type": "string",
      "default": "Bénin"
    },
    "shippingAddressLine2": {
      "type": "string"
    },
    "billingAddress": {
      "type": "text"
    },
    "billingCity": {
      "type": "string"
    },
    "billingPostalCode": {
      "type": "string"
    },
    "billingCountry": {
      "type": "string"
    },
    "shippingMethod": {
      "type": "enumeration",
      "enum": ["standard", "express", "pickup"],
      "default": "standard"
    },
    "trackingNumber": {
      "type": "string"
    },
    "shippedAt": {
      "type": "datetime"
    },
    "deliveredAt": {
      "type": "datetime"
    },
    "customerNote": {
      "type": "text"
    },
    "internalNote": {
      "type": "text"
    },
    "items": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::order-item.order-item",
      "mappedBy": "order"
    }
  }
}
```

### 2.6 OrderItem

Créer `src/api/order-item/content-types/order-item/schema.json` :

```json
{
  "kind": "collectionType",
  "collectionName": "order_items",
  "info": {
    "singularName": "order-item",
    "pluralName": "order-items",
    "displayName": "Order Item"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "productName": {
      "type": "string",
      "required": true
    },
    "productSku": {
      "type": "string"
    },
    "variantInfo": {
      "type": "json"
    },
    "quantity": {
      "type": "integer",
      "required": true,
      "min": 1
    },
    "unitPrice": {
      "type": "decimal",
      "required": true
    },
    "totalPrice": {
      "type": "decimal",
      "required": true
    },
    "order": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::order.order",
      "inversedBy": "items"
    },
    "product": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::product.product"
    },
    "variant": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::product-variant.product-variant"
    }
  }
}
```

### 2.7 ShippingZone

Créer `src/api/shipping-zone/content-types/shipping-zone/schema.json` :

```json
{
  "kind": "collectionType",
  "collectionName": "shipping_zones",
  "info": {
    "singularName": "shipping-zone",
    "pluralName": "shipping-zones",
    "displayName": "Shipping Zone"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "countries": {
      "type": "json"
    },
    "cities": {
      "type": "json"
    },
    "postalCodes": {
      "type": "json"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "shippingRates": {
      "type": "relation",
      "relation": "oneToMany",
      "target": "api::shipping-rate.shipping-rate",
      "mappedBy": "shippingZone"
    }
  }
}
```

### 2.8 ShippingRate

Créer `src/api/shipping-rate/content-types/shipping-rate/schema.json` :

```json
{
  "kind": "collectionType",
  "collectionName": "shipping_rates",
  "info": {
    "singularName": "shipping-rate",
    "pluralName": "shipping-rates",
    "displayName": "Shipping Rate"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "description": {
      "type": "text"
    },
    "deliveryTime": {
      "type": "string"
    },
    "price": {
      "type": "decimal",
      "required": true,
      "min": 0
    },
    "freeShippingThreshold": {
      "type": "decimal"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "shippingZone": {
      "type": "relation",
      "relation": "manyToOne",
      "target": "api::shipping-zone.shipping-zone",
      "inversedBy": "shippingRates"
    }
  }
}
```

### 2.9 NewsletterSubscriber

Créer `src/api/newsletter-subscriber/content-types/newsletter-subscriber/schema.json` :

```json
{
  "kind": "collectionType",
  "collectionName": "newsletter_subscribers",
  "info": {
    "singularName": "newsletter-subscriber",
    "pluralName": "newsletter-subscribers",
    "displayName": "Newsletter Subscriber"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "email": {
      "type": "email",
      "required": true,
      "unique": true
    },
    "firstName": {
      "type": "string"
    },
    "isActive": {
      "type": "boolean",
      "default": true
    },
    "subscribedAt": {
      "type": "datetime"
    },
    "unsubscribedAt": {
      "type": "datetime"
    }
  }
}
```

### 2.10 ContactMessage

Créer `src/api/contact-message/content-types/contact-message/schema.json` :

```json
{
  "kind": "collectionType",
  "collectionName": "contact_messages",
  "info": {
    "singularName": "contact-message",
    "pluralName": "contact-messages",
    "displayName": "Contact Message"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "name": {
      "type": "string",
      "required": true
    },
    "email": {
      "type": "email",
      "required": true
    },
    "subject": {
      "type": "string",
      "required": true
    },
    "message": {
      "type": "text",
      "required": true
    },
    "status": {
      "type": "enumeration",
      "enum": ["new", "read", "replied", "archived"],
      "default": "new"
    },
    "adminReply": {
      "type": "text"
    },
    "repliedAt": {
      "type": "datetime"
    }
  }
}
```

### 2.11 SiteSettings (Single Type)

Créer `src/api/site-settings/content-types/site-settings/schema.json` :

```json
{
  "kind": "singleType",
  "collectionName": "site_settings",
  "info": {
    "singularName": "site-settings",
    "pluralName": "site-settings",
    "displayName": "Site Settings"
  },
  "options": {
    "draftAndPublish": false
  },
  "attributes": {
    "siteName": {
      "type": "string",
      "default": "Cannesh Lingerie"
    },
    "siteDescription": {
      "type": "text"
    },
    "contactEmail": {
      "type": "email"
    },
    "contactPhone": {
      "type": "string"
    },
    "whatsappNumber": {
      "type": "string"
    },
    "facebookUrl": {
      "type": "string"
    },
    "instagramUrl": {
      "type": "string"
    },
    "taxRate": {
      "type": "decimal",
      "default": 0
    },
    "currency": {
      "type": "string",
      "default": "XOF"
    },
    "minimumOrderAmount": {
      "type": "decimal",
      "default": 0
    },
    "maintenanceMode": {
      "type": "boolean",
      "default": false
    },
    "announcementBar": {
      "type": "richtext"
    },
    "logo": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    },
    "favicon": {
      "type": "media",
      "multiple": false,
      "allowedTypes": ["images"]
    }
  }
}
```

### 2.12 LegalPage

Créer `src/api/legal-page/content-types/legal-page/schema.json` :

```json
{
  "kind": "collectionType",
  "collectionName": "legal_pages",
  "info": {
    "singularName": "legal-page",
    "pluralName": "legal-pages",
    "displayName": "Legal Page"
  },
  "options": {
    "draftAndPublish": true
  },
  "attributes": {
    "title": {
      "type": "string",
      "required": true
    },
    "slug": {
      "type": "uid",
      "targetField": "title",
      "required": true
    },
    "content": {
      "type": "richtext",
      "required": true
    },
    "pageType": {
      "type": "enumeration",
      "enum": ["terms", "privacy", "shipping", "returns"],
      "required": true
    },
    "isActive": {
      "type": "boolean",
      "default": true
    }
  }
}
```

---

## 3. Services Custom

### 3.1 Order Service

Créer `src/api/order/services/order-service.js` :

```javascript
'use strict';

const generateOrderNumber = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const random = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `CL-${year}${month}${day}-${random}`;
};

const calculateOrderTotal = (items, shippingCost = 0, discount = 0, taxRate = 0) => {
  const subtotal = items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  const tax = subtotal * (taxRate / 100);
  const total = subtotal + shippingCost + tax - discount;
  return { subtotal, tax, total: Math.max(0, total) };
};

const decrementStock = async (strapi, orderItems) => {
  for (const item of orderItems) {
    if (item.variant) {
      const variant = await strapi.entityService.findOne('api::product-variant.product-variant', item.variant.id);
      if (variant) {
        await strapi.entityService.update('api::product-variant.product-variant', item.variant.id, {
          data: { stock: Math.max(0, variant.stock - item.quantity) }
        });
      }
    }
    
    if (item.product) {
      const product = await strapi.entityService.findOne('api::product.product', item.product.id);
      if (product) {
        await strapi.entityService.update('api::product.product', item.product.id, {
          data: { stock: Math.max(0, product.stock - item.quantity) }
        });
      }
    }
  }
};

const sendOrderConfirmationEmail = async (order) => {
  // TODO: Intégrer avec un service d'email (SendGrid, Mailgun, etc.)
  console.log(`📧 Email de confirmation envoyé à ${order.customerEmail} pour la commande ${order.orderNumber}`);
};

module.exports = {
  generateOrderNumber,
  calculateOrderTotal,
  decrementStock,
  sendOrderConfirmationEmail
};
```

### 3.2 Lygos Service

Créer `src/api/order/services/lygos-service.js` :

```javascript
'use strict';

const axios = require('axios');
const crypto = require('crypto');

const LYGOS_API_URL = process.env.LYGOS_API_URL || 'https://api.lygos.bj/v1';
const LYGOS_API_KEY = process.env.LYGOS_API_KEY;
const LYGOS_SECRET_KEY = process.env.LYGOS_SECRET_KEY;

const createPaymentSession = async (orderData) => {
  try {
    const response = await axios.post(`${LYGOS_API_URL}/payments/create`, {
      amount: orderData.total,
      currency: 'XOF',
      description: `Commande ${orderData.orderNumber} - Cannesh Lingerie`,
      customer: {
        email: orderData.customerEmail,
        firstName: orderData.customerFirstName,
        lastName: orderData.customerLastName,
        phone: orderData.customerPhone
      },
      metadata: {
        orderId: orderData.id,
        orderNumber: orderData.orderNumber
      },
      callbackUrl: `${process.env.STRAPI_URL}/api/webhooks/lygos`,
      returnUrl: `${process.env.FRONTEND_URL}/confirmation?order=${orderData.orderNumber}`
    }, {
      headers: {
        'Authorization': `Bearer ${LYGOS_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      transactionId: response.data.transactionId,
      checkoutUrl: response.data.checkoutUrl
    };
  } catch (error) {
    console.error('Erreur Lygos:', error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || 'Erreur de paiement'
    };
  }
};

const verifyWebhookSignature = (payload, signature) => {
  const expectedSignature = crypto
    .createHmac('sha256', LYGOS_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};

const getPaymentStatus = async (transactionId) => {
  try {
    const response = await axios.get(`${LYGOS_API_URL}/payments/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${LYGOS_API_KEY}`
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Erreur vérification paiement:', error.response?.data || error.message);
    return null;
  }
};

module.exports = {
  createPaymentSession,
  verifyWebhookSignature,
  getPaymentStatus
};
```

### 3.3 Shipping Service

Créer `src/api/shipping-zone/services/shipping-service.js` :

```javascript
'use strict';

const calculateShippingCost = async (strapi, destination, cartTotal, shippingMethodId) => {
  const { city, country = 'Bénin' } = destination;
  
  // Trouver la zone de livraison correspondante
  const zones = await strapi.entityService.findMany('api::shipping-zone.shipping-zone', {
    filters: { isActive: true },
    populate: ['shippingRates']
  });
  
  let matchedZone = null;
  
  for (const zone of zones) {
    const cities = zone.cities || [];
    const countries = zone.countries || [];
    
    if (cities.includes(city) || countries.includes(country)) {
      matchedZone = zone;
      break;
    }
  }
  
  // Zone par défaut "Reste du Bénin"
  if (!matchedZone) {
    matchedZone = zones.find(z => z.name === 'Reste du Bénin') || zones[0];
  }
  
  if (!matchedZone) {
    return {
      shippingCost: 2500,
      freeShipping: false,
      deliveryTime: '5-7 jours ouvrables'
    };
  }
  
  // Trouver le tarif correspondant
  const rates = matchedZone.shippingRates?.filter(r => r.isActive) || [];
  let selectedRate = rates.find(r => r.id === shippingMethodId) || rates[0];
  
  if (!selectedRate) {
    return {
      shippingCost: 2500,
      freeShipping: false,
      deliveryTime: '5-7 jours ouvrables'
    };
  }
  
  // Vérifier la livraison gratuite
  const freeShipping = selectedRate.freeShippingThreshold && cartTotal >= selectedRate.freeShippingThreshold;
  
  return {
    shippingCost: freeShipping ? 0 : selectedRate.price,
    freeShipping,
    deliveryTime: selectedRate.deliveryTime || '3-5 jours ouvrables',
    rateName: selectedRate.name,
    zoneName: matchedZone.name
  };
};

const getAvailableShippingMethods = async (strapi, destination) => {
  const { city, country = 'Bénin' } = destination;
  
  const zones = await strapi.entityService.findMany('api::shipping-zone.shipping-zone', {
    filters: { isActive: true },
    populate: ['shippingRates']
  });
  
  let matchedZone = zones.find(zone => {
    const cities = zone.cities || [];
    const countries = zone.countries || [];
    return cities.includes(city) || countries.includes(country);
  });
  
  if (!matchedZone) {
    matchedZone = zones.find(z => z.name === 'Reste du Bénin') || zones[0];
  }
  
  if (!matchedZone) {
    return [];
  }
  
  return matchedZone.shippingRates
    ?.filter(r => r.isActive)
    .map(rate => ({
      id: rate.id,
      name: rate.name,
      description: rate.description,
      price: rate.price,
      deliveryTime: rate.deliveryTime,
      freeShippingThreshold: rate.freeShippingThreshold
    })) || [];
};

module.exports = {
  calculateShippingCost,
  getAvailableShippingMethods
};
```

---

## 4. Controllers Custom

### 4.1 Checkout Controller

Créer `src/api/order/controllers/checkout.js` :

```javascript
'use strict';

const { generateOrderNumber, calculateOrderTotal, sendOrderConfirmationEmail } = require('../services/order-service');
const { createPaymentSession } = require('../services/lygos-service');
const { calculateShippingCost } = require('../../shipping-zone/services/shipping-service');

module.exports = {
  async createCheckoutSession(ctx) {
    try {
      const { items, shippingInfo, billingInfo, shippingMethodId, customerNote } = ctx.request.body;
      
      // Validation des données
      if (!items || !items.length) {
        return ctx.badRequest('Le panier est vide');
      }
      
      if (!shippingInfo || !shippingInfo.email || !shippingInfo.firstName || !shippingInfo.lastName || !shippingInfo.phone || !shippingInfo.address || !shippingInfo.city) {
        return ctx.badRequest('Informations de livraison incomplètes');
      }
      
      // Vérifier les stocks et calculer le sous-total
      let subtotal = 0;
      const orderItems = [];
      
      for (const item of items) {
        const product = await strapi.entityService.findOne('api::product.product', item.productId, {
          populate: ['variants']
        });
        
        if (!product) {
          return ctx.badRequest(`Produit ${item.productId} non trouvé`);
        }
        
        let variant = null;
        let unitPrice = product.price;
        let stock = product.stock;
        
        if (item.variantId) {
          variant = await strapi.entityService.findOne('api::product-variant.product-variant', item.variantId);
          if (!variant) {
            return ctx.badRequest(`Variante ${item.variantId} non trouvée`);
          }
          unitPrice = product.price + (variant.additionalPrice || 0);
          stock = variant.stock;
        }
        
        if (stock < item.quantity) {
          return ctx.badRequest(`Stock insuffisant pour ${product.name}`);
        }
        
        subtotal += unitPrice * item.quantity;
        orderItems.push({
          productName: product.name,
          productSku: variant?.sku || product.sku,
          variantInfo: variant ? { size: variant.size, color: variant.color, colorCode: variant.colorCode } : null,
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
          product: product.id,
          variant: variant?.id
        });
      }
      
      // Calculer les frais de livraison
      const shippingResult = await calculateShippingCost(
        strapi,
        { city: shippingInfo.city, country: shippingInfo.country || 'Bénin' },
        subtotal,
        shippingMethodId
      );
      
      // Calculer le total
      const { total } = calculateOrderTotal(orderItems, shippingResult.shippingCost, 0, 0);
      
      // Créer la commande
      const orderNumber = generateOrderNumber();
      
      const order = await strapi.entityService.create('api::order.order', {
        data: {
          orderNumber,
          status: 'pending',
          paymentStatus: 'pending',
          subtotal,
          shippingCost: shippingResult.shippingCost,
          tax: 0,
          discount: 0,
          total,
          customerEmail: shippingInfo.email,
          customerFirstName: shippingInfo.firstName,
          customerLastName: shippingInfo.lastName,
          customerPhone: shippingInfo.phone,
          shippingAddress: shippingInfo.address,
          shippingCity: shippingInfo.city,
          shippingPostalCode: shippingInfo.postalCode || '',
          shippingCountry: shippingInfo.country || 'Bénin',
          shippingAddressLine2: shippingInfo.addressLine2 || '',
          billingAddress: billingInfo?.address || shippingInfo.address,
          billingCity: billingInfo?.city || shippingInfo.city,
          billingPostalCode: billingInfo?.postalCode || shippingInfo.postalCode || '',
          billingCountry: billingInfo?.country || shippingInfo.country || 'Bénin',
          shippingMethod: shippingResult.rateName?.toLowerCase().includes('express') ? 'express' : 'standard',
          customerNote: customerNote || ''
        }
      });
      
      // Créer les items de commande
      for (const item of orderItems) {
        await strapi.entityService.create('api::order-item.order-item', {
          data: {
            ...item,
            order: order.id
          }
        });
      }
      
      // Créer la session de paiement Lygos
      const paymentResult = await createPaymentSession({
        id: order.id,
        orderNumber,
        total,
        customerEmail: shippingInfo.email,
        customerFirstName: shippingInfo.firstName,
        customerLastName: shippingInfo.lastName,
        customerPhone: shippingInfo.phone
      });
      
      if (!paymentResult.success) {
        // Annuler la commande en cas d'erreur
        await strapi.entityService.update('api::order.order', order.id, {
          data: { status: 'cancelled', paymentStatus: 'failed' }
        });
        return ctx.badRequest(paymentResult.error);
      }
      
      // Mettre à jour la commande avec l'ID de transaction
      await strapi.entityService.update('api::order.order', order.id, {
        data: { lygosTransactionId: paymentResult.transactionId }
      });
      
      return ctx.send({
        success: true,
        orderNumber,
        orderId: order.id,
        checkoutUrl: paymentResult.checkoutUrl,
        total
      });
      
    } catch (error) {
      console.error('Erreur checkout:', error);
      return ctx.internalServerError('Erreur lors de la création de la commande');
    }
  }
};
```

### 4.2 Webhook Controller

Créer `src/api/order/controllers/webhook.js` :

```javascript
'use strict';

const { verifyWebhookSignature } = require('../services/lygos-service');
const { decrementStock, sendOrderConfirmationEmail } = require('../services/order-service');

module.exports = {
  async handleLygosWebhook(ctx) {
    try {
      const signature = ctx.request.headers['x-lygos-signature'];
      const payload = ctx.request.body;
      
      // Vérifier la signature
      if (!verifyWebhookSignature(payload, signature)) {
        console.error('Signature Lygos invalide');
        return ctx.unauthorized('Signature invalide');
      }
      
      const { event, data } = payload;
      const transactionId = data.transactionId;
      
      // Trouver la commande
      const orders = await strapi.entityService.findMany('api::order.order', {
        filters: { lygosTransactionId: transactionId },
        populate: ['items', 'items.product', 'items.variant']
      });
      
      if (!orders.length) {
        console.error(`Commande non trouvée pour transaction ${transactionId}`);
        return ctx.notFound('Commande non trouvée');
      }
      
      const order = orders[0];
      
      switch (event) {
        case 'payment.success':
          // Mettre à jour le statut
          await strapi.entityService.update('api::order.order', order.id, {
            data: {
              status: 'paid',
              paymentStatus: 'paid',
              paymentMethod: data.paymentMethod || 'mobile_money',
              lygosPaymentData: data
            }
          });
          
          // Décrémenter les stocks
          await decrementStock(strapi, order.items);
          
          // Envoyer email de confirmation
          await sendOrderConfirmationEmail(order);
          
          console.log(`✅ Commande ${order.orderNumber} payée avec succès`);
          break;
          
        case 'payment.failed':
          await strapi.entityService.update('api::order.order', order.id, {
            data: {
              paymentStatus: 'failed',
              lygosPaymentData: data
            }
          });
          console.log(`❌ Paiement échoué pour commande ${order.orderNumber}`);
          break;
          
        case 'payment.refunded':
          await strapi.entityService.update('api::order.order', order.id, {
            data: {
              status: 'refunded',
              paymentStatus: 'refunded',
              lygosPaymentData: data
            }
          });
          console.log(`🔄 Commande ${order.orderNumber} remboursée`);
          break;
          
        default:
          console.log(`Événement Lygos non géré: ${event}`);
      }
      
      return ctx.send({ received: true });
      
    } catch (error) {
      console.error('Erreur webhook Lygos:', error);
      return ctx.internalServerError('Erreur traitement webhook');
    }
  }
};
```

### 4.3 Shipping Calculator Controller

Créer `src/api/shipping-zone/controllers/calculate.js` :

```javascript
'use strict';

const { calculateShippingCost, getAvailableShippingMethods } = require('../services/shipping-service');

module.exports = {
  async calculateShipping(ctx) {
    try {
      const { city, country, postalCode, shippingMethodId, cartTotal } = ctx.request.body;
      
      if (!city) {
        return ctx.badRequest('Ville requise');
      }
      
      const result = await calculateShippingCost(
        strapi,
        { city, country: country || 'Bénin', postalCode },
        cartTotal || 0,
        shippingMethodId
      );
      
      return ctx.send(result);
      
    } catch (error) {
      console.error('Erreur calcul livraison:', error);
      return ctx.internalServerError('Erreur calcul frais de livraison');
    }
  },
  
  async getShippingMethods(ctx) {
    try {
      const { city, country } = ctx.query;
      
      const methods = await getAvailableShippingMethods(strapi, {
        city: city || '',
        country: country || 'Bénin'
      });
      
      return ctx.send(methods);
      
    } catch (error) {
      console.error('Erreur récupération méthodes:', error);
      return ctx.internalServerError('Erreur récupération méthodes de livraison');
    }
  }
};
```

---

## 5. Routes Custom

### 5.1 Order Routes

Créer `src/api/order/routes/custom-routes.js` :

```javascript
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/orders/create-checkout-session',
      handler: 'checkout.createCheckoutSession',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    }
  ]
};
```

### 5.2 Webhook Routes

Créer `src/api/order/routes/webhook-routes.js` :

```javascript
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/webhooks/lygos',
      handler: 'webhook.handleLygosWebhook',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    }
  ]
};
```

### 5.3 Shipping Routes

Créer `src/api/shipping-zone/routes/custom-routes.js` :

```javascript
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/orders/calculate-shipping',
      handler: 'calculate.calculateShipping',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    },
    {
      method: 'GET',
      path: '/shipping-methods',
      handler: 'calculate.getShippingMethods',
      config: {
        auth: false,
        policies: [],
        middlewares: []
      }
    }
  ]
};
```

### 5.4 Product Custom Routes

Créer `src/api/product/routes/custom-routes.js` :

```javascript
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/products/featured',
      handler: 'product.findFeatured',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/products/new-arrivals',
      handler: 'product.findNewArrivals',
      config: {
        auth: false
      }
    },
    {
      method: 'GET',
      path: '/products/related/:id',
      handler: 'product.findRelated',
      config: {
        auth: false
      }
    }
  ]
};
```

### 5.5 Product Custom Controller

Créer `src/api/product/controllers/product.js` (étendre le controller par défaut) :

```javascript
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::product.product', ({ strapi }) => ({
  async findFeatured(ctx) {
    const products = await strapi.entityService.findMany('api::product.product', {
      filters: { isFeatured: true, isActive: true },
      populate: ['images', 'category', 'variants'],
      publicationState: 'live'
    });
    
    return ctx.send(products);
  },
  
  async findNewArrivals(ctx) {
    const products = await strapi.entityService.findMany('api::product.product', {
      filters: { isNew: true, isActive: true },
      populate: ['images', 'category', 'variants'],
      publicationState: 'live',
      sort: { createdAt: 'desc' },
      limit: 12
    });
    
    return ctx.send(products);
  },
  
  async findRelated(ctx) {
    const { id } = ctx.params;
    
    const product = await strapi.entityService.findOne('api::product.product', id, {
      populate: ['category']
    });
    
    if (!product) {
      return ctx.notFound('Produit non trouvé');
    }
    
    const relatedProducts = await strapi.entityService.findMany('api::product.product', {
      filters: {
        category: product.category?.id,
        id: { $ne: id },
        isActive: true
      },
      populate: ['images', 'category'],
      publicationState: 'live',
      limit: 4
    });
    
    return ctx.send(relatedProducts);
  }
}));
```

### 5.6 Newsletter Routes

Créer `src/api/newsletter-subscriber/routes/custom-routes.js` :

```javascript
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/newsletter/subscribe',
      handler: 'newsletter-subscriber.subscribe',
      config: {
        auth: false
      }
    }
  ]
};
```

### 5.7 Newsletter Controller

Créer `src/api/newsletter-subscriber/controllers/newsletter-subscriber.js` :

```javascript
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::newsletter-subscriber.newsletter-subscriber', ({ strapi }) => ({
  async subscribe(ctx) {
    const { email, firstName } = ctx.request.body;
    
    if (!email) {
      return ctx.badRequest('Email requis');
    }
    
    // Vérifier si déjà inscrit
    const existing = await strapi.entityService.findMany('api::newsletter-subscriber.newsletter-subscriber', {
      filters: { email }
    });
    
    if (existing.length > 0) {
      if (existing[0].isActive) {
        return ctx.badRequest('Déjà inscrit à la newsletter');
      }
      // Réactiver l'inscription
      await strapi.entityService.update('api::newsletter-subscriber.newsletter-subscriber', existing[0].id, {
        data: {
          isActive: true,
          subscribedAt: new Date(),
          unsubscribedAt: null
        }
      });
      return ctx.send({ success: true, message: 'Réinscription réussie' });
    }
    
    // Nouvelle inscription
    await strapi.entityService.create('api::newsletter-subscriber.newsletter-subscriber', {
      data: {
        email,
        firstName: firstName || '',
        isActive: true,
        subscribedAt: new Date()
      }
    });
    
    return ctx.send({ success: true, message: 'Inscription réussie' });
  }
}));
```

### 5.8 Contact Routes

Créer `src/api/contact-message/routes/custom-routes.js` :

```javascript
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/contact/submit',
      handler: 'contact-message.submit',
      config: {
        auth: false
      }
    }
  ]
};
```

### 5.9 Contact Controller

Créer `src/api/contact-message/controllers/contact-message.js` :

```javascript
'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::contact-message.contact-message', ({ strapi }) => ({
  async submit(ctx) {
    const { name, email, subject, message } = ctx.request.body;
    
    if (!name || !email || !subject || !message) {
      return ctx.badRequest('Tous les champs sont requis');
    }
    
    await strapi.entityService.create('api::contact-message.contact-message', {
      data: {
        name,
        email,
        subject,
        message,
        status: 'new'
      }
    });
    
    return ctx.send({ success: true, message: 'Message envoyé' });
  }
}));
```

---

## 6. Lifecycles

### 6.1 Order Lifecycles

Créer `src/api/order/content-types/order/lifecycles.js` :

```javascript
'use strict';

const { generateOrderNumber } = require('../../services/order-service');

module.exports = {
  beforeCreate(event) {
    const { data } = event.params;
    if (!data.orderNumber) {
      data.orderNumber = generateOrderNumber();
    }
  },
  
  async afterUpdate(event) {
    const { result, params } = event;
    
    // Envoyer email de tracking si expédié
    if (result.status === 'shipped' && result.trackingNumber) {
      console.log(`📦 Commande ${result.orderNumber} expédiée - Tracking: ${result.trackingNumber}`);
      // TODO: Envoyer email avec numéro de suivi
    }
  }
};
```

### 6.2 Product Lifecycles

Créer `src/api/product/content-types/product/lifecycles.js` :

```javascript
'use strict';

const slugify = require('slugify');

module.exports = {
  beforeCreate(event) {
    const { data } = event.params;
    
    // Auto-générer SKU si vide
    if (!data.sku) {
      const prefix = data.name ? data.name.substring(0, 3).toUpperCase() : 'PRD';
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      data.sku = `${prefix}-${random}`;
    }
  }
};
```

---

## 7. Seed Data

Créer `src/seeds/initial-data.js` :

```javascript
'use strict';

module.exports = async (strapi) => {
  // Catégories par défaut
  const categories = [
    { name: 'Soutiens-gorge', slug: 'soutiens-gorge', order: 1, isActive: true },
    { name: 'Culottes & Strings', slug: 'culottes-strings', order: 2, isActive: true },
    { name: 'Ensembles', slug: 'ensembles', order: 3, isActive: true },
    { name: 'Nuisettes & Déshabillés', slug: 'nuisettes-deshabilles', order: 4, isActive: true },
    { name: 'Bodys', slug: 'bodys', order: 5, isActive: true },
    { name: 'Accessoires', slug: 'accessoires', order: 6, isActive: true }
  ];
  
  for (const cat of categories) {
    const existing = await strapi.entityService.findMany('api::category.category', {
      filters: { slug: cat.slug }
    });
    
    if (!existing.length) {
      await strapi.entityService.create('api::category.category', { data: cat });
      console.log(`✅ Catégorie créée: ${cat.name}`);
    }
  }
  
  // Zones de livraison
  const zones = [
    {
      name: 'Parakou',
      cities: ['Parakou'],
      countries: ['Bénin'],
      isActive: true
    },
    {
      name: 'Ndali & Tchaorou',
      cities: ['Ndali', 'Tchaorou'],
      countries: ['Bénin'],
      isActive: true
    },
    {
      name: 'Reste du Bénin',
      cities: [],
      countries: ['Bénin'],
      isActive: true
    }
  ];
  
  for (const zone of zones) {
    const existing = await strapi.entityService.findMany('api::shipping-zone.shipping-zone', {
      filters: { name: zone.name }
    });
    
    if (!existing.length) {
      const createdZone = await strapi.entityService.create('api::shipping-zone.shipping-zone', { data: zone });
      
      // Ajouter les tarifs
      const rates = zone.name === 'Parakou' 
        ? [
            { name: 'Standard', price: 500, deliveryTime: '2-3 jours', shippingZone: createdZone.id, isActive: true },
            { name: 'Express', price: 1000, deliveryTime: '24h', shippingZone: createdZone.id, isActive: true }
          ]
        : zone.name === 'Ndali & Tchaorou'
        ? [
            { name: 'Standard', price: 1500, deliveryTime: '3-5 jours', shippingZone: createdZone.id, isActive: true },
            { name: 'Express', price: 2500, deliveryTime: '48h', shippingZone: createdZone.id, isActive: true }
          ]
        : [
            { name: 'Standard', price: 2500, deliveryTime: '5-7 jours', shippingZone: createdZone.id, isActive: true },
            { name: 'Express', price: 3000, deliveryTime: '3-5 jours', shippingZone: createdZone.id, isActive: true }
          ];
      
      for (const rate of rates) {
        await strapi.entityService.create('api::shipping-rate.shipping-rate', { data: rate });
      }
      
      console.log(`✅ Zone créée: ${zone.name} avec ${rates.length} tarifs`);
    }
  }
  
  // Site Settings
  const settings = await strapi.entityService.findMany('api::site-settings.site-settings');
  if (!settings) {
    await strapi.entityService.create('api::site-settings.site-settings', {
      data: {
        siteName: 'Cannesh Lingerie',
        siteDescription: 'Lingerie de luxe au Bénin',
        contactEmail: 'contact@cannesh.bj',
        contactPhone: '+229 97 00 00 00',
        whatsappNumber: '+229 97 00 00 00',
        currency: 'XOF',
        taxRate: 0,
        minimumOrderAmount: 5000,
        maintenanceMode: false
      }
    });
    console.log('✅ Site Settings créés');
  }
  
  console.log('🎉 Seed data terminé!');
};
```

Appeler le seed dans `src/index.js` :

```javascript
'use strict';

module.exports = {
  async bootstrap({ strapi }) {
    // Exécuter les seeds uniquement en développement
    if (process.env.NODE_ENV === 'development') {
      const seedData = require('./seeds/initial-data');
      await seedData(strapi);
    }
  }
};
```

---

## 8. Permissions

Après avoir démarré Strapi, configurer les permissions dans **Settings > Users & Permissions > Roles > Public** :

### Lecture (find, findOne)
- ✅ Product
- ✅ Category
- ✅ Collection
- ✅ Shipping Zone
- ✅ Shipping Rate
- ✅ Legal Page
- ✅ Site Settings

### Endpoints Custom (Public)
- ✅ POST `/api/orders/create-checkout-session`
- ✅ POST `/api/webhooks/lygos`
- ✅ POST `/api/orders/calculate-shipping`
- ✅ GET `/api/shipping-methods`
- ✅ GET `/api/products/featured`
- ✅ GET `/api/products/new-arrivals`
- ✅ GET `/api/products/related/:id`
- ✅ POST `/api/newsletter/subscribe`
- ✅ POST `/api/contact/submit`

---

## 9. Variables d'Environnement

Créer `.env` :

```env
# Strapi
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
TRANSFER_TOKEN_SALT=your-transfer-token-salt
JWT_SECRET=your-jwt-secret

# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=cannesh_db
DATABASE_USERNAME=cannesh_user
DATABASE_PASSWORD=your-db-password
DATABASE_SSL=false

# URLs
STRAPI_URL=https://api.cannesh.bj
FRONTEND_URL=https://cannesh.bj

# Lygos
LYGOS_API_URL=https://api.lygos.bj/v1
LYGOS_API_KEY=your-lygos-api-key
LYGOS_SECRET_KEY=your-lygos-secret-key

# Cloudinary (optionnel)
CLOUDINARY_NAME=your-cloud-name
CLOUDINARY_KEY=your-api-key
CLOUDINARY_SECRET=your-api-secret
```

---

## 10. Déploiement

### Railway

```bash
# Installer Railway CLI
npm install -g @railway/cli

# Login et déployer
railway login
railway init
railway up
```

### Render

1. Connecter le repo GitHub
2. Créer un nouveau Web Service
3. Build command: `npm install && npm run build`
4. Start command: `npm run start`
5. Ajouter les variables d'environnement

### VPS (Ubuntu)

```bash
# Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2
sudo npm install -g pm2

# Cloner et installer
git clone your-repo
cd cannesh-backend
npm install
npm run build

# Démarrer avec PM2
pm2 start npm --name "cannesh-api" -- run start
pm2 save
pm2 startup
```

---

## 11. API Documentation

### Endpoints Publics

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/products` | Liste des produits |
| GET | `/api/products/:id` | Détail produit |
| GET | `/api/products/featured` | Produits vedettes |
| GET | `/api/products/new-arrivals` | Nouveautés |
| GET | `/api/products/related/:id` | Produits similaires |
| GET | `/api/categories` | Liste des catégories |
| GET | `/api/collections` | Liste des collections |
| GET | `/api/shipping-zones` | Zones de livraison |
| GET | `/api/shipping-methods` | Méthodes disponibles |
| POST | `/api/orders/calculate-shipping` | Calculer frais |
| POST | `/api/orders/create-checkout-session` | Créer commande |
| POST | `/api/newsletter/subscribe` | S'inscrire newsletter |
| POST | `/api/contact/submit` | Envoyer message |
| GET | `/api/site-settings` | Paramètres du site |
| GET | `/api/legal-pages` | Pages légales |

---

## 12. Checklist Finale

- [ ] Toutes les collections créées
- [ ] Relations configurées
- [ ] Services Lygos fonctionnels
- [ ] Webhook testé
- [ ] Gestion des stocks automatique
- [ ] Calcul livraison par zone
- [ ] Numéros de commande auto-générés
- [ ] Permissions configurées
- [ ] Seed data importé
- [ ] Variables d'environnement configurées
- [ ] Déployé en production
