import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'

export const ShippingRates: CollectionConfig = {
  slug: 'shippingRates',
  labels: {
    singular: 'Tarif de livraison',
    plural: 'Tarifs de livraison',
  },
  access: {
    read: () => true,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'name',
    group: 'Shipping',
    defaultColumns: ['name', 'price', 'shippingZone', 'isActive'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom du tarif',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'shippingZone',
      type: 'relationship',
      relationTo: 'shippingZones',
      required: true,
      label: 'Zone de livraison',
    },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          required: true,
          label: 'Prix (FCFA)',
          min: 0,
          admin: { width: '50%' },
        },
        {
          name: 'freeShippingThreshold',
          type: 'number',
          label: 'Livraison gratuite à partir de (FCFA)',
          min: 0,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'minOrderAmount',
          type: 'number',
          label: 'Commande minimum (FCFA)',
          min: 0,
          admin: { width: '50%' },
        },
        {
          name: 'deliveryTime',
          type: 'text',
          label: 'Délai de livraison',
          admin: { 
            width: '50%',
            placeholder: 'ex: 2-3 jours ouvrés',
          },
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Actif',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
