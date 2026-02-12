import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'

export const ContactMessages: CollectionConfig = {
  slug: 'contactMessages',
  labels: {
    singular: 'Message de contact',
    plural: 'Messages de contact',
  },
  access: {
    read: () => true,
    create: () => true,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'subject',
    group: 'Marketing',
    defaultColumns: ['subject', 'name', 'email', 'status', 'createdAt'],
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
          label: 'Nom',
          admin: { width: '50%' },
        },
        {
          name: 'email',
          type: 'email',
          required: true,
          label: 'Email',
          admin: { width: '50%' },
        },
      ],
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      label: 'Sujet',
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      label: 'Message',
    },
    {
      name: 'status',
      type: 'select',
      label: 'Statut',
      defaultValue: 'new',
      options: [
        { label: 'Nouveau', value: 'new' },
        { label: 'En cours', value: 'in_progress' },
        { label: 'Répondu', value: 'replied' },
        { label: 'Fermé', value: 'closed' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'adminReply',
      type: 'textarea',
      label: 'Réponse admin',
    },
    {
      name: 'repliedAt',
      type: 'date',
      label: 'Date de réponse',
      admin: {
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, originalDoc }) => {
        // Set repliedAt when status changes to replied
        if (data.status === 'replied' && originalDoc?.status !== 'replied') {
          data.repliedAt = new Date().toISOString()
        }
        return data
      },
    ],
  },
}
