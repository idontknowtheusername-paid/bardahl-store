import { slugField } from 'payload'
import type { CollectionConfig } from 'payload'
import {
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from '@payloadcms/plugin-seo/fields'
import { generatePreviewPath } from '@/utilities/generatePreviewPath'

export const Products: CollectionConfig = {
  slug: 'products',
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => true,
  },
  admin: {
    useAsTitle: 'title',
    group: 'Shop',
    defaultColumns: ['title', 'price', 'stock', 'isActive', 'isFeatured', 'isNew'],
    livePreview: {
      url: ({ data, req }) =>
        generatePreviewPath({
          slug: data?.slug,
          collection: 'products',
          req,
        }),
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Nom du produit',
    },
    {
      name: 'shortDescription',
      type: 'textarea',
      label: 'Description courte',
      maxLength: 300,
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Contenu',
          fields: [
            {
              name: 'description',
              type: 'richText',
              label: 'Description complète',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => [
                  ...rootFeatures,
                  HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                  FixedToolbarFeature(),
                  InlineToolbarFeature(),
                  HorizontalRuleFeature(),
                ],
              }),
            },
            {
              name: 'gallery',
              type: 'array',
              label: 'Galerie d\'images',
              minRows: 1,
              fields: [
                {
                  name: 'image',
                  type: 'upload',
                  relationTo: 'media',
                  required: true,
                },
              ],
            },
            {
              name: 'composition',
              type: 'textarea',
              label: 'Composition',
            },
            {
              name: 'careInstructions',
              type: 'textarea',
              label: 'Entretien',
            },
          ],
        },
        {
          label: 'Prix & Stock',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  type: 'number',
                  required: true,
                  label: 'Prix (FCFA)',
                  min: 0,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'compareAtPrice',
                  type: 'number',
                  label: 'Prix barré (FCFA)',
                  min: 0,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'sku',
                  type: 'text',
                  label: 'SKU',
                  unique: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'stock',
                  type: 'number',
                  label: 'Stock',
                  min: 0,
                  defaultValue: 0,
                  admin: {
                    width: '50%',
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Variantes',
          fields: [
            {
              name: 'enableVariants',
              type: 'checkbox',
              label: 'Activer les variantes',
              defaultValue: false,
            },
            {
              name: 'variants',
              type: 'array',
              label: 'Variantes',
              admin: {
                condition: (data) => data?.enableVariants === true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'size',
                      type: 'text',
                      label: 'Taille',
                      admin: { width: '25%' },
                    },
                    {
                      name: 'color',
                      type: 'text',
                      label: 'Couleur',
                      admin: { width: '25%' },
                    },
                    {
                      name: 'colorCode',
                      type: 'text',
                      label: 'Code couleur (hex)',
                      admin: { width: '25%' },
                    },
                    {
                      name: 'cupSize',
                      type: 'text',
                      label: 'Taille bonnet',
                      admin: { width: '25%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'stock',
                      type: 'number',
                      label: 'Stock variante',
                      min: 0,
                      defaultValue: 0,
                      admin: { width: '50%' },
                    },
                    {
                      name: 'additionalPrice',
                      type: 'number',
                      label: 'Prix additionnel (FCFA)',
                      defaultValue: 0,
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'SEO',
          name: 'meta',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({ hasGenerateFn: true }),
            MetaImageField({ relationTo: 'media' }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
    // Sidebar fields
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'categories',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'collections',
      type: 'relationship',
      relationTo: 'productCollections',
      hasMany: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'relatedProducts',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      filterOptions: ({ id }) => ({
        id: { not_equals: id },
      }),
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
      name: 'isFeatured',
      type: 'checkbox',
      label: 'Mis en avant',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'isNew',
      type: 'checkbox',
      label: 'Nouveau',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'style',
      type: 'select',
      label: 'Style',
      options: [
        { label: 'Classique', value: 'classique' },
        { label: 'Sexy', value: 'sexy' },
        { label: 'Sport', value: 'sport' },
        { label: 'Confort', value: 'confort' },
        { label: 'Élégant', value: 'elegant' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    slugField(),
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Auto-generate SKU if not provided
        if (!data.sku && data.title) {
          data.sku = `SKU-${data.title.substring(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
        }
        return data
      },
    ],
  },
}

// Export for ecommerce plugin
export const ProductsCollection = Products
