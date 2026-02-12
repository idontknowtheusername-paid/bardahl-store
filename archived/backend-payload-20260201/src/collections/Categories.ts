import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'
import { adminOnly } from '@/access/adminOnly'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    read: () => true,
    create: adminOnly,
    update: adminOnly,
    delete: adminOnly,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Shop',
    defaultColumns: ['title', 'order', 'isActive'],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Nom',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Description',
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Image',
    },
    {
      name: 'order',
      type: 'number',
      label: 'Ordre d\'affichage',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
      },
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
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      label: 'Catégorie parente',
      admin: {
        position: 'sidebar',
      },
      filterOptions: ({ id }) => ({
        id: { not_equals: id },
      }),
    },
    slugField(),
  ],
}
