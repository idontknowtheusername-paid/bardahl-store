import { postgresAdapter } from '@payloadcms/db-postgres'
import {
  BoldFeature,
  EXPERIMENTAL_TableFeature,
  IndentFeature,
  ItalicFeature,
  LinkFeature,
  OrderedListFeature,
  UnderlineFeature,
  UnorderedListFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import { fr } from '@payloadcms/translations/languages/fr'
import { en } from '@payloadcms/translations/languages/en'

// Collections
import { Categories } from '@/collections/Categories'
import { ContactMessages } from '@/collections/ContactMessages'
import { Media } from '@/collections/Media'
import { NewsletterSubscribers } from '@/collections/NewsletterSubscribers'
import { Orders } from '@/collections/Orders'
import { Pages } from '@/collections/Pages'
import { ProductCollections } from '@/collections/ProductCollections'
import { Products } from '@/collections/Products'
import { ShippingRates } from '@/collections/ShippingRates'
import { ShippingZones } from '@/collections/ShippingZones'
import { Users } from '@/collections/Users'

// Globals
import { Footer } from '@/globals/Footer'
import { Header } from '@/globals/Header'
import { SiteSettings } from '@/globals/SiteSettings'

// Endpoints
import { contactEndpoint } from '@/endpoints/contact'
import { featuredProductsEndpoint } from '@/endpoints/products/featured'
import { newArrivalsEndpoint } from '@/endpoints/products/new-arrivals'
import { relatedProductsEndpoint } from '@/endpoints/products/related'
import { newsletterEndpoint } from '@/endpoints/newsletter'
import { subscribeToNewsletter } from '@/endpoints/newsletter/subscribe'
import { unsubscribeFromNewsletter } from '@/endpoints/newsletter/unsubscribe'
import { sendEmailCampaign } from '@/endpoints/email/send-campaign'
import { sendNewsletterEmail } from '@/endpoints/email/send-newsletter'
import { shippingCalculateEndpoint } from '@/endpoints/shipping/calculate'
import { seedCanneshEndpoint } from '@/endpoints/seed/seed-endpoint'
import { createOrderEndpoint } from '@/endpoints/checkout/create-order'
import { createPaymentEndpoint } from '@/endpoints/payment/create-payment'
import { verifyPaymentEndpoint } from '@/endpoints/payment/verify-payment'
import { lygosWebhookEndpoint } from '@/endpoints/webhooks/lygos'

import { migrations } from './migrations'
import { plugins } from './plugins/index'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    dateFormat: 'dd/MM/yyyy',
  },
  cors: [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
    'https://cannesh-lingerie.vercel.app',
    'https://cannesh-lingerie-suite.vercel.app',
    process.env.FRONTEND_URL || '',
    process.env.NEXT_PUBLIC_FRONTEND_URL || '',
  ].filter(Boolean),
  csrf: [
    'http://localhost:5173',
    'http://localhost:8080',
    'http://localhost:3000',
    'https://cannesh-lingerie.vercel.app',
    'https://cannesh-lingerie-suite.vercel.app',
    process.env.FRONTEND_URL || '',
    process.env.NEXT_PUBLIC_FRONTEND_URL || '',
  ].filter(Boolean),
  i18n: {
    supportedLanguages: { fr, en },
    fallbackLanguage: 'fr',
  },
  localization: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    fallback: true,
  },
  collections: [
    Users,
    Pages,
    Products,
    Categories,
    ProductCollections,
    Orders,
    ShippingZones,
    ShippingRates,
    NewsletterSubscribers,
    ContactMessages,
    Media,
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL || '',
    },
    push: false, // Disabled - manual schema management
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
  editor: lexicalEditor({
    features: () => {
      return [
        UnderlineFeature(),
        BoldFeature(),
        ItalicFeature(),
        OrderedListFeature(),
        UnorderedListFeature(),
        LinkFeature({
          enabledCollections: ['pages', 'products'],
          fields: ({ defaultFields }) => {
            const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
              if ('name' in field && field.name === 'url') return false
              return true
            })

            return [
              ...defaultFieldsWithoutUrl,
              {
                name: 'url',
                type: 'text',
                admin: {
                  condition: ({ linkType }) => linkType !== 'internal',
                },
                label: ({ t }) => t('fields:enterURL'),
                required: true,
              },
            ]
          },
        }),
        IndentFeature(),
        EXPERIMENTAL_TableFeature(),
      ]
    },
  }),
  endpoints: [
    featuredProductsEndpoint,
    newArrivalsEndpoint,
    relatedProductsEndpoint,
    newsletterEndpoint,
    contactEndpoint,
    shippingCalculateEndpoint,
    seedCanneshEndpoint,
    createOrderEndpoint,
    createPaymentEndpoint,
    verifyPaymentEndpoint,
    lygosWebhookEndpoint,
    {
      path: '/newsletter/subscribe',
      method: 'post',
      handler: subscribeToNewsletter,
    },
    {
      path: '/newsletter/unsubscribe',
      method: 'post',
      handler: unsubscribeFromNewsletter,
    },
    {
      path: '/email/send-campaign',
      method: 'post',
      handler: sendEmailCampaign,
    },
    {
      path: '/email/send-newsletter',
      method: 'post',
      handler: sendNewsletterEmail,
    },
  ],
  globals: [Header, Footer, SiteSettings],
  plugins,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
})
