import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  label: 'Paramètres du site',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Général',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              required: true,
              label: 'Nom du site',
              defaultValue: 'Cannesh Lingerie',
            },
            {
              name: 'siteDescription',
              type: 'textarea',
              label: 'Description du site',
            },
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo',
            },
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
              label: 'Favicon',
            },
            {
              name: 'currency',
              type: 'text',
              label: 'Devise',
              defaultValue: 'FCFA',
            },
            {
              name: 'minimumOrderAmount',
              type: 'number',
              label: 'Montant minimum de commande (FCFA)',
              min: 0,
              defaultValue: 0,
            },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              name: 'contactEmail',
              type: 'email',
              label: 'Email de contact',
            },
            {
              name: 'contactPhone',
              type: 'text',
              label: 'Téléphone',
            },
            {
              name: 'whatsappNumber',
              type: 'text',
              label: 'Numéro WhatsApp',
            },
            {
              name: 'address',
              type: 'textarea',
              label: 'Adresse',
            },
          ],
        },
        {
          label: 'Réseaux sociaux',
          fields: [
            {
              name: 'facebookUrl',
              type: 'text',
              label: 'Facebook',
            },
            {
              name: 'instagramUrl',
              type: 'text',
              label: 'Instagram',
            },
            {
              name: 'twitterUrl',
              type: 'text',
              label: 'Twitter/X',
            },
            {
              name: 'tiktokUrl',
              type: 'text',
              label: 'TikTok',
            },
          ],
        },
        {
          label: 'Fonctionnalités',
          fields: [
            {
              name: 'maintenanceMode',
              type: 'checkbox',
              label: 'Mode maintenance',
              defaultValue: false,
            },
            {
              name: 'announcementBar',
              type: 'text',
              label: 'Barre d\'annonce',
              admin: {
                description: 'Texte affiché en haut du site (laisser vide pour masquer)',
              },
            },
            {
              name: 'showNewBadge',
              type: 'checkbox',
              label: 'Afficher le badge "Nouveau"',
              defaultValue: true,
            },
            {
              name: 'newBadgeDays',
              type: 'number',
              label: 'Durée du badge "Nouveau" (jours)',
              defaultValue: 14,
              min: 1,
            },
          ],
        },
      ],
    },
  ],
}
