import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'

export const ShippingZones: CollectionConfig = {
  slug: 'shippingZones',
  labels: {
    singular: 'Zone de livraison',
    plural: 'Zones de livraison',
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
    defaultColumns: ['name', 'isActive'],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nom de la zone',
    },
    {
      name: 'countries',
      type: 'array',
      label: 'Pays',
      fields: [
        {
          name: 'country',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'cities',
      type: 'array',
      label: 'Villes',
      fields: [
        {
          name: 'city',
          type: 'text',
          required: true,
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
