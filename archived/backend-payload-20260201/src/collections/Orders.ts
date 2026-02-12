import type { CollectionConfig } from 'payload'
import { sendOrderEmails } from '@/hooks/orders/sendOrderEmails'
import { adminOnly } from '@/access/adminOnly'

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: {
    singular: 'Commande',
    plural: 'Commandes',
  },
  access: {
    read: () => true,
    create: () => true,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'orderNumber',
    group: 'Shop',
    defaultColumns: ['orderNumber', 'customer', 'total', 'status', 'createdAt'],
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      required: true,
      unique: true,
      label: 'Numéro de commande',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'users',
      label: 'Client',
    },
    {
      name: 'items',
      type: 'array',
      label: 'Articles',
      required: true,
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
        },
        {
          name: 'productTitle',
          type: 'text',
          label: 'Nom du produit (snapshot)',
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          label: 'Prix unitaire (FCFA)',
        },
        {
          name: 'size',
          type: 'text',
          label: 'Taille',
        },
        {
          name: 'color',
          type: 'text',
          label: 'Couleur',
        },
        {
          name: 'cupSize',
          type: 'text',
          label: 'Taille bonnet',
        },
      ],
    },
    {
      name: 'shippingInfo',
      type: 'group',
      label: 'Adresse de livraison',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'firstName', type: 'text', label: 'Prénom', admin: { width: '50%' } },
            { name: 'lastName', type: 'text', label: 'Nom', admin: { width: '50%' } },
          ],
        },
        { name: 'email', type: 'email', label: 'Email' },
        { name: 'phone', type: 'text', label: 'Téléphone' },
        { name: 'address', type: 'text', label: 'Adresse' },
        { name: 'addressLine2', type: 'text', label: 'Complément d\'adresse' },
        {
          type: 'row',
          fields: [
            { name: 'city', type: 'text', label: 'Ville', admin: { width: '50%' } },
            { name: 'postalCode', type: 'text', label: 'Code postal', admin: { width: '50%' } },
          ],
        },
        { name: 'country', type: 'text', label: 'Pays', defaultValue: 'Bénin' },
      ],
    },
    {
      name: 'billingInfo',
      type: 'group',
      label: 'Adresse de facturation',
      admin: {
        condition: (data) => data?.useDifferentBillingAddress,
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'firstName', type: 'text', label: 'Prénom', admin: { width: '50%' } },
            { name: 'lastName', type: 'text', label: 'Nom', admin: { width: '50%' } },
          ],
        },
        { name: 'address', type: 'text', label: 'Adresse' },
        { name: 'city', type: 'text', label: 'Ville' },
        { name: 'country', type: 'text', label: 'Pays' },
      ],
    },
    {
      name: 'useDifferentBillingAddress',
      type: 'checkbox',
      label: 'Adresse de facturation différente',
      defaultValue: false,
    },
    {
      type: 'row',
      fields: [
        {
          name: 'subtotal',
          type: 'number',
          label: 'Sous-total (FCFA)',
          admin: { width: '33%', readOnly: true },
        },
        {
          name: 'shippingCost',
          type: 'number',
          label: 'Frais de livraison (FCFA)',
          admin: { width: '33%', readOnly: true },
        },
        {
          name: 'total',
          type: 'number',
          required: true,
          label: 'Total (FCFA)',
          admin: { width: '33%', readOnly: true },
        },
      ],
    },
    {
      name: 'shippingMethod',
      type: 'relationship',
      relationTo: 'shippingRates',
      label: 'Méthode de livraison',
    },
    {
      name: 'customerNote',
      type: 'textarea',
      label: 'Note du client',
    },
    {
      name: 'adminNote',
      type: 'textarea',
      label: 'Note interne',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      defaultValue: 'pending',
      required: true,
      options: [
        { label: 'En attente', value: 'pending' },
        { label: 'Confirmée', value: 'confirmed' },
        { label: 'En préparation', value: 'processing' },
        { label: 'Expédiée', value: 'shipped' },
        { label: 'Livrée', value: 'delivered' },
        { label: 'Annulée', value: 'cancelled' },
        { label: 'Remboursée', value: 'refunded' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'paymentStatus',
      type: 'select',
      label: 'Statut paiement',
      defaultValue: 'pending',
      options: [
        { label: 'En attente', value: 'pending' },
        { label: 'Payé', value: 'paid' },
        { label: 'Échoué', value: 'failed' },
        { label: 'Remboursé', value: 'refunded' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'paymentMethod',
      type: 'text',
      label: 'Méthode de paiement',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'trackingNumber',
      type: 'text',
      label: 'Numéro de suivi',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && !data.orderNumber) {
          data.orderNumber = `CMD-${Date.now().toString(36).toUpperCase()}`
        }

        // Calculate totals
        if (data.items && Array.isArray(data.items)) {
          data.subtotal = data.items.reduce((sum: number, item: any) => {
            return sum + (item.unitPrice * item.quantity)
          }, 0)
          data.total = data.subtotal + (data.shippingCost || 0)
        }

        return data
      },
    ],
    afterChange: [sendOrderEmails],
  },
}
