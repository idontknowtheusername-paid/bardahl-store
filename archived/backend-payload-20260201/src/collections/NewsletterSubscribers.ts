import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'

export const NewsletterSubscribers: CollectionConfig = {
  slug: 'newsletterSubscribers',
  labels: {
    singular: 'Abonné newsletter',
    plural: 'Abonnés newsletter',
  },
  access: {
    read: () => true,
    create: () => true,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'email',
    group: 'Marketing',
    defaultColumns: ['email', 'firstName', 'isActive', 'subscribedAt'],
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      label: 'Email',
    },
    {
      name: 'firstName',
      type: 'text',
      label: 'Prénom',
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
    {
      name: 'subscribedAt',
      type: 'date',
      label: 'Date d\'inscription',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create') {
          data.subscribedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
}
