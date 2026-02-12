import type { CollectionConfig } from 'payload';

export const Newsletter: CollectionConfig = {
  slug: 'newsletter',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'status', 'subscribedAt'],
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => !!user,
    delete: ({ req: { user } }) => !!user,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Unsubscribed',
          value: 'unsubscribed',
        },
        {
          label: 'Bounced',
          value: 'bounced',
        },
      ],
    },
    {
      name: 'subscribedAt',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'dd/MM/yyyy HH:mm',
        },
      },
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'unsubscribedAt',
      type: 'date',
      admin: {
        date: {
          displayFormat: 'dd/MM/yyyy HH:mm',
        },
        condition: (data) => data.status === 'unsubscribed',
      },
    },
    {
      name: 'source',
      type: 'select',
      options: [
        {
          label: 'Website',
          value: 'website',
        },
        {
          label: 'Checkout',
          value: 'checkout',
        },
        {
          label: 'Manual',
          value: 'manual',
        },
        {
          label: 'Import',
          value: 'import',
        },
      ],
      defaultValue: 'website',
    },
    {
      name: 'preferences',
      type: 'group',
      fields: [
        {
          name: 'newArrivals',
          type: 'checkbox',
          label: 'New Arrivals',
          defaultValue: true,
        },
        {
          name: 'promotions',
          type: 'checkbox',
          label: 'Promotions',
          defaultValue: true,
        },
        {
          name: 'tips',
          type: 'checkbox',
          label: 'Tips & Advice',
          defaultValue: true,
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, operation, req }) => {
        // Send welcome email on new subscription
        if (operation === 'create' && doc.status === 'active') {
          try {
            const { sendWelcomeNewsletter } = await import('@/lib/email');
            await sendWelcomeNewsletter(doc.email, doc.name);
          } catch (error) {
            console.error('Failed to send welcome email:', error);
          }
        }
      },
    ],
  },
};
