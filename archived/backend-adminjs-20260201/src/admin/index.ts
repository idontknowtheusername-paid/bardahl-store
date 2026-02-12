import { PrismaClient } from '@prisma/client';
import type { ResourceWithOptions } from 'adminjs';

export function setupAdminResources(prisma: PrismaClient): ResourceWithOptions[] {
  return [
    // Products
    {
      resource: { model: prisma.product, client: prisma },
      options: {
        navigation: { name: 'Boutique', icon: 'ShoppingBag' },
        listProperties: ['name', 'price', 'category', 'isNew', 'isBestseller', 'isActive'],
        editProperties: ['name', 'slug', 'description', 'composition', 'care', 'style', 'price', 'originalPrice', 'categoryId', 'collectionId', 'isNew', 'isBestseller', 'isActive'],
        showProperties: ['id', 'name', 'slug', 'description', 'price', 'originalPrice', 'category', 'collection', 'isNew', 'isBestseller', 'isActive', 'createdAt', 'updatedAt'],
        properties: {
          description: { type: 'richtext' },
          composition: { type: 'textarea' },
          care: { type: 'textarea' },
          price: {
            description: 'Prix en FCFA',
          },
          originalPrice: {
            description: 'Prix original en FCFA (pour promotions)',
          },
        },
      },
    },

    // Product Images
    {
      resource: { model: prisma.productImage, client: prisma },
      options: {
        navigation: { name: 'Boutique', icon: 'Image' },
        listProperties: ['url', 'product', 'order'],
        properties: {
          url: {
            description: 'URL de l\'image (Cloudinary)',
          },
        },
      },
    },

    // Product Variants
    {
      resource: { model: prisma.productVariant, client: prisma },
      options: {
        navigation: { name: 'Boutique', icon: 'Layers' },
        listProperties: ['product', 'size', 'color', 'cupSize', 'stock', 'sku'],
        properties: {
          stock: {
            description: 'Quantité en stock',
          },
        },
      },
    },

    // Categories
    {
      resource: { model: prisma.category, client: prisma },
      options: {
        navigation: { name: 'Boutique', icon: 'Folder' },
        listProperties: ['title', 'slug', 'order', 'isActive', 'parent'],
        editProperties: ['title', 'slug', 'description', 'image', 'order', 'parentId', 'isActive'],
      },
    },

    // Collections
    {
      resource: { model: prisma.productCollection, client: prisma },
      options: {
        navigation: { name: 'Boutique', icon: 'Collection' },
        listProperties: ['title', 'slug', 'order', 'isActive'],
        editProperties: ['title', 'slug', 'description', 'image', 'order', 'isActive'],
      },
    },

    // Orders
    {
      resource: { model: prisma.order, client: prisma },
      options: {
        navigation: { name: 'Ventes', icon: 'ShoppingCart' },
        listProperties: ['orderNumber', 'firstName', 'email', 'total', 'status', 'paymentStatus', 'createdAt'],
        showProperties: ['id', 'orderNumber', 'firstName', 'email', 'phone', 'address', 'city', 'subtotal', 'shippingCost', 'total', 'shippingMethod', 'status', 'paymentStatus', 'paymentMethod', 'customerNote', 'adminNote', 'gatewayId', 'transactionId', 'createdAt', 'updatedAt'],
        editProperties: ['status', 'paymentStatus', 'adminNote'],
        properties: {
          total: {
            description: 'Total en FCFA',
          },
          status: {
            availableValues: [
              { value: 'PENDING', label: 'En attente' },
              { value: 'CONFIRMED', label: 'Confirmée' },
              { value: 'PROCESSING', label: 'En préparation' },
              { value: 'SHIPPED', label: 'Expédiée' },
              { value: 'DELIVERED', label: 'Livrée' },
              { value: 'CANCELLED', label: 'Annulée' },
            ],
          },
          paymentStatus: {
            availableValues: [
              { value: 'PENDING', label: 'En attente' },
              { value: 'PAID', label: 'Payée' },
              { value: 'FAILED', label: 'Échouée' },
              { value: 'REFUNDED', label: 'Remboursée' },
            ],
          },
        },
        sort: {
          sortBy: 'createdAt',
          direction: 'desc',
        },
      },
    },

    // Order Items
    {
      resource: { model: prisma.orderItem, client: prisma },
      options: {
        navigation: { name: 'Ventes', icon: 'Package' },
        listProperties: ['order', 'product', 'quantity', 'price', 'size', 'color'],
        properties: {
          price: {
            description: 'Prix unitaire en FCFA',
          },
        },
      },
    },

    // Users
    {
      resource: { model: prisma.user, client: prisma },
      options: {
        navigation: { name: 'Utilisateurs', icon: 'User' },
        listProperties: ['email', 'firstName', 'lastName', 'role', 'isActive', 'createdAt'],
        editProperties: ['email', 'firstName', 'lastName', 'role', 'isActive'],
        properties: {
          password: {
            isVisible: { list: false, show: false, edit: true, filter: false },
          },
          role: {
            availableValues: [
              { value: 'ADMIN', label: 'Administrateur' },
              { value: 'CUSTOMER', label: 'Client' },
            ],
          },
        },
      },
    },

    // Newsletter Subscribers
    {
      resource: { model: prisma.newsletterSubscriber, client: prisma },
      options: {
        navigation: { name: 'Marketing', icon: 'Mail' },
        listProperties: ['email', 'firstName', 'isActive', 'source', 'subscribedAt'],
        editProperties: ['email', 'firstName', 'isActive'],
        sort: {
          sortBy: 'subscribedAt',
          direction: 'desc',
        },
      },
    },

    // Contact Messages
    {
      resource: { model: prisma.contactMessage, client: prisma },
      options: {
        navigation: { name: 'Marketing', icon: 'MessageCircle' },
        listProperties: ['name', 'email', 'subject', 'isRead', 'createdAt'],
        editProperties: ['isRead'],
        properties: {
          message: {
            type: 'textarea',
          },
        },
        sort: {
          sortBy: 'createdAt',
          direction: 'desc',
        },
      },
    },

    // Shipping Zones
    {
      resource: { model: prisma.shippingZone, client: prisma },
      options: {
        navigation: { name: 'Livraison', icon: 'Truck' },
        listProperties: ['name', 'cities', 'isActive'],
        properties: {
          cities: {
            type: 'string',
            description: 'Villes séparées par des virgules',
          },
        },
      },
    },

    // Shipping Rates
    {
      resource: { model: prisma.shippingRate, client: prisma },
      options: {
        navigation: { name: 'Livraison', icon: 'DollarSign' },
        listProperties: ['zone', 'method', 'price', 'estimatedDays', 'isActive'],
        properties: {
          price: {
            description: 'Prix en FCFA',
          },
          method: {
            availableValues: [
              { value: 'STANDARD', label: 'Standard' },
              { value: 'EXPRESS', label: 'Express' },
              { value: 'PICKUP', label: 'Retrait en boutique' },
            ],
          },
        },
      },
    },

    // Site Settings
    {
      resource: { model: prisma.siteSetting, client: prisma },
      options: {
        navigation: { name: 'Configuration', icon: 'Settings' },
        listProperties: ['key', 'value', 'updatedAt'],
      },
    },
  ];
}
