import type { Payload, PayloadRequest } from 'payload'

// Données de seed pour Cannesh Lingerie
export const seedCannesh = async ({
  payload,
  req,
}: {
  payload: Payload
  req: PayloadRequest
}): Promise<void> => {
  payload.logger.info('🌱 Seeding Cannesh Lingerie database...')

  // Clear existing data
  payload.logger.info('— Clearing existing data...')
  
  const collectionsToSeed = [
    'products',
    'categories', 
    'productCollections',
    'shippingZones',
    'shippingRates',
  ] as const

  for (const collection of collectionsToSeed) {
    try {
      await payload.db.deleteMany({ collection, req, where: {} })
    } catch (e) {
      // Collection might not exist yet
    }
  }

  // ============================================
  // CATEGORIES
  // ============================================
  payload.logger.info('— Creating categories...')

  const categoriesData = [
    {
      title: 'Soutiens-gorge',
      slug: 'soutiens-gorge',
      description: 'Découvrez notre collection de soutiens-gorge alliant confort et élégance',
      order: 1,
      isActive: true,
    },
    {
      title: 'Culottes',
      slug: 'culottes',
      description: 'Des culottes raffinées pour un confort quotidien',
      order: 2,
      isActive: true,
    },
    {
      title: 'Ensembles',
      slug: 'ensembles',
      description: 'Ensembles coordonnés pour une harmonie parfaite',
      order: 3,
      isActive: true,
    },
    {
      title: 'Nuisettes',
      slug: 'nuisettes',
      description: 'Nuisettes sensuelles pour des nuits de rêve',
      order: 4,
      isActive: true,
    },
  ]

  const categories: Record<string, any> = {}
  
  for (const cat of categoriesData) {
    const created = await payload.create({
      collection: 'categories',
      data: cat,
    })
    categories[cat.slug] = created
    payload.logger.info(`   ✓ Catégorie créée: ${cat.title}`)
  }

  // ============================================
  // COLLECTIONS
  // ============================================
  payload.logger.info('— Creating collections...')

  const collectionsData = [
    { 
      title: 'Collection Saint-Valentin', 
      slug: 'saint-valentin', 
      isFeatured: true,
    },
    { 
      title: 'Essentiels du Quotidien', 
      slug: 'essentiels', 
      isFeatured: true,
    },
    { 
      title: 'Nuits d\'Été', 
      slug: 'nuits-ete', 
      isFeatured: false,
    },
    { 
      title: 'Luxe & Élégance', 
      slug: 'luxe-elegance', 
      isFeatured: true,
    },
  ]

  const productCollections: Record<string, any> = {}
  
  for (const col of collectionsData) {
    const created = await payload.create({
      collection: 'productCollections',
      data: { ...col, isActive: true },
    })
    productCollections[col.slug] = created
  }

  // ============================================
  // PRODUCTS
  // ============================================
  payload.logger.info('— Creating products...')

  const productsData = [
    // Ensembles
    {
      title: 'Ensemble Dentelle Romantique',
      slug: 'ensemble-dentelle-romantique',
      shortDescription: 'Ensemble soutien-gorge et culotte en dentelle fine',
      price: 18500,
      compareAtPrice: 22000,
      stock: 25,
      isNew: true,
      isFeatured: true,
      style: 'elegant',
      composition: '80% Polyamide, 20% Élasthanne',
      careInstructions: 'Lavage à la main recommandé. Ne pas sécher en machine.',
      categories: [categories['ensembles'].id],
      collections: [productCollections['saint-valentin'].id, productCollections['luxe-elegance'].id],
      enableVariants: true,
      variants: [
        { size: 'S', color: 'Noir', colorCode: '#000000', stock: 8 },
        { size: 'M', color: 'Noir', colorCode: '#000000', stock: 10 },
        { size: 'L', color: 'Noir', colorCode: '#000000', stock: 7 },
        { size: 'S', color: 'Rouge', colorCode: '#8B0000', stock: 5 },
        { size: 'M', color: 'Rouge', colorCode: '#8B0000', stock: 8 },
        { size: 'L', color: 'Rouge', colorCode: '#8B0000', stock: 4 },
      ],
    },
    {
      title: 'Ensemble Coton Bio Confort',
      slug: 'ensemble-coton-bio-confort',
      shortDescription: 'Ensemble doux et confortable en coton bio',
      price: 12500,
      stock: 40,
      isNew: false,
      isFeatured: true,
      style: 'confort',
      composition: '95% Coton bio, 5% Élasthanne',
      careInstructions: 'Lavage machine 30°C. Séchage à basse température.',
      categories: [categories['ensembles'].id],
      collections: [productCollections['essentiels'].id],
      enableVariants: true,
      variants: [
        { size: 'S', color: 'Blanc', colorCode: '#FFFFFF', stock: 15 },
        { size: 'M', color: 'Blanc', colorCode: '#FFFFFF', stock: 15 },
        { size: 'L', color: 'Blanc', colorCode: '#FFFFFF', stock: 10 },
        { size: 'S', color: 'Rose poudré', colorCode: '#E8C4C4', stock: 8 },
        { size: 'M', color: 'Rose poudré', colorCode: '#E8C4C4', stock: 10 },
      ],
    },
    {
      title: 'Ensemble Satin Luxe',
      slug: 'ensemble-satin-luxe',
      shortDescription: 'Ensemble raffiné en satin de soie',
      price: 28000,
      compareAtPrice: 35000,
      stock: 15,
      isNew: true,
      isFeatured: true,
      style: 'elegant',
      composition: '100% Soie naturelle',
      careInstructions: 'Nettoyage à sec uniquement.',
      categories: [categories['ensembles'].id],
      collections: [productCollections['luxe-elegance'].id],
      enableVariants: true,
      variants: [
        { size: 'S', color: 'Champagne', colorCode: '#F7E7CE', stock: 5 },
        { size: 'M', color: 'Champagne', colorCode: '#F7E7CE', stock: 6 },
        { size: 'L', color: 'Champagne', colorCode: '#F7E7CE', stock: 4 },
      ],
    },

    // Soutiens-gorge
    {
      title: 'Soutien-gorge Push-up Dentelle',
      slug: 'soutien-gorge-push-up-dentelle',
      shortDescription: 'Push-up avec dentelle délicate et armatures confortables',
      price: 9500,
      stock: 50,
      isNew: false,
      isFeatured: true,
      style: 'sexy',
      composition: '75% Polyamide, 25% Élasthanne',
      careInstructions: 'Lavage à la main. Ne pas essorer.',
      categories: [categories['soutiens-gorge'].id],
      collections: [productCollections['essentiels'].id],
      enableVariants: true,
      variants: [
        { size: '85B', color: 'Noir', colorCode: '#000000', cupSize: 'B', stock: 12 },
        { size: '85C', color: 'Noir', colorCode: '#000000', cupSize: 'C', stock: 10 },
        { size: '90B', color: 'Noir', colorCode: '#000000', cupSize: 'B', stock: 8 },
        { size: '90C', color: 'Noir', colorCode: '#000000', cupSize: 'C', stock: 10 },
        { size: '85B', color: 'Nude', colorCode: '#D2B48C', cupSize: 'B', stock: 10 },
      ],
    },
    {
      title: 'Bralette Sans Armatures',
      slug: 'bralette-sans-armatures',
      shortDescription: 'Bralette confortable sans armatures, idéale pour tous les jours',
      price: 7500,
      stock: 60,
      isNew: true,
      isFeatured: false,
      style: 'confort',
      composition: '90% Coton, 10% Élasthanne',
      careInstructions: 'Lavage machine 30°C.',
      categories: [categories['soutiens-gorge'].id],
      collections: [productCollections['essentiels'].id],
      enableVariants: true,
      variants: [
        { size: 'S', color: 'Noir', colorCode: '#000000', stock: 20 },
        { size: 'M', color: 'Noir', colorCode: '#000000', stock: 20 },
        { size: 'L', color: 'Noir', colorCode: '#000000', stock: 20 },
      ],
    },

    // Culottes
    {
      title: 'Culotte Taille Haute Gainante',
      slug: 'culotte-taille-haute-gainante',
      shortDescription: 'Culotte gainante pour un maintien parfait',
      price: 6500,
      stock: 45,
      isNew: false,
      isFeatured: false,
      style: 'confort',
      composition: '70% Polyamide, 30% Élasthanne',
      careInstructions: 'Lavage machine 30°C.',
      categories: [categories['culottes'].id],
      collections: [productCollections['essentiels'].id],
      enableVariants: true,
      variants: [
        { size: 'S', color: 'Noir', colorCode: '#000000', stock: 15 },
        { size: 'M', color: 'Noir', colorCode: '#000000', stock: 15 },
        { size: 'L', color: 'Noir', colorCode: '#000000', stock: 15 },
      ],
    },
    {
      title: 'String Dentelle Séduction',
      slug: 'string-dentelle-seduction',
      shortDescription: 'String en dentelle fine pour une séduction absolue',
      price: 4500,
      stock: 70,
      isNew: true,
      isFeatured: true,
      style: 'sexy',
      composition: '85% Polyamide, 15% Élasthanne',
      careInstructions: 'Lavage à la main recommandé.',
      categories: [categories['culottes'].id],
      collections: [productCollections['saint-valentin'].id],
      enableVariants: true,
      variants: [
        { size: 'S', color: 'Rouge', colorCode: '#8B0000', stock: 20 },
        { size: 'M', color: 'Rouge', colorCode: '#8B0000', stock: 25 },
        { size: 'L', color: 'Rouge', colorCode: '#8B0000', stock: 15 },
        { size: 'S', color: 'Noir', colorCode: '#000000', stock: 10 },
      ],
    },

    // Nuisettes
    {
      title: 'Nuisette Soie Élégance',
      slug: 'nuisette-soie-elegance',
      shortDescription: 'Nuisette en soie avec finitions dentelle',
      price: 22000,
      compareAtPrice: 28000,
      stock: 20,
      isNew: true,
      isFeatured: true,
      style: 'elegant',
      composition: '100% Soie',
      careInstructions: 'Nettoyage à sec recommandé.',
      categories: [categories['nuisettes'].id],
      collections: [productCollections['luxe-elegance'].id, productCollections['saint-valentin'].id],
      enableVariants: true,
      variants: [
        { size: 'S', color: 'Bordeaux', colorCode: '#722F37', stock: 7 },
        { size: 'M', color: 'Bordeaux', colorCode: '#722F37', stock: 8 },
        { size: 'L', color: 'Bordeaux', colorCode: '#722F37', stock: 5 },
      ],
    },
    {
      title: 'Nuisette Légère Été',
      slug: 'nuisette-legere-ete',
      shortDescription: 'Nuisette légère et respirante pour les nuits chaudes',
      price: 14500,
      stock: 35,
      isNew: false,
      isFeatured: false,
      style: 'confort',
      composition: '100% Coton',
      careInstructions: 'Lavage machine 40°C.',
      categories: [categories['nuisettes'].id],
      collections: [productCollections['nuits-ete'].id],
      enableVariants: true,
      variants: [
        { size: 'S', color: 'Blanc', colorCode: '#FFFFFF', stock: 12 },
        { size: 'M', color: 'Blanc', colorCode: '#FFFFFF', stock: 13 },
        { size: 'L', color: 'Blanc', colorCode: '#FFFFFF', stock: 10 },
      ],
    },

    // Bodies
    {
      title: 'Body Sculptant Invisible',
      slug: 'body-sculptant-invisible',
      shortDescription: 'Body gainant invisible sous les vêtements',
      price: 16000,
      stock: 30,
      isNew: false,
      isFeatured: true,
      style: 'confort',
      composition: '80% Polyamide, 20% Élasthanne',
      careInstructions: 'Lavage à la main.',
      categories: [categories['bodies'].id],
      collections: [productCollections['essentiels'].id],
      enableVariants: true,
      variants: [
        { size: 'S', color: 'Nude', colorCode: '#D2B48C', stock: 10 },
        { size: 'M', color: 'Nude', colorCode: '#D2B48C', stock: 12 },
        { size: 'L', color: 'Nude', colorCode: '#D2B48C', stock: 8 },
      ],
    },
    {
      title: 'Body Dentelle Sensuel',
      slug: 'body-dentelle-sensuel',
      shortDescription: 'Body en dentelle pour des moments intimes',
      price: 19500,
      compareAtPrice: 24000,
      stock: 25,
      isNew: true,
      isFeatured: true,
      style: 'sexy',
      composition: '90% Polyamide, 10% Élasthanne',
      careInstructions: 'Lavage à la main uniquement.',
      categories: [categories['bodies'].id],
      collections: [productCollections['saint-valentin'].id, productCollections['luxe-elegance'].id],
      enableVariants: true,
      variants: [
        { size: 'S', color: 'Noir', colorCode: '#000000', stock: 8 },
        { size: 'M', color: 'Noir', colorCode: '#000000', stock: 10 },
        { size: 'L', color: 'Noir', colorCode: '#000000', stock: 7 },
      ],
    },

    // Pyjamas
    {
      title: 'Pyjama Short Satin',
      slug: 'pyjama-short-satin',
      shortDescription: 'Ensemble pyjama short et top en satin doux',
      price: 15500,
      stock: 40,
      isNew: true,
      isFeatured: false,
      style: 'confort',
      composition: '100% Polyester satiné',
      careInstructions: 'Lavage machine 30°C programme délicat.',
      categories: [categories['pyjamas'].id],
      collections: [productCollections['nuits-ete'].id],
      enableVariants: true,
      variants: [
        { size: 'S', color: 'Rose', colorCode: '#FFC0CB', stock: 12 },
        { size: 'M', color: 'Rose', colorCode: '#FFC0CB', stock: 15 },
        { size: 'L', color: 'Rose', colorCode: '#FFC0CB', stock: 13 },
      ],
    },
  ]

  const products: any[] = []

  for (const productData of productsData) {
    const product = await payload.create({
      collection: 'products',
      data: { ...productData, isActive: true } as any,
    })
    products.push(product)
  }

  // ============================================
  // SHIPPING ZONES & RATES
  // ============================================
  payload.logger.info('— Creating shipping zones and rates...')

  const zoneCotonouData = {
    name: 'Cotonou',
    cities: [{ city: 'Cotonou' }],
    countries: [{ country: 'Bénin' }],
    isActive: true,
  }

  const zoneBenin = {
    name: 'Bénin (hors Cotonou)',
    cities: [
      { city: 'Porto-Novo' },
      { city: 'Parakou' },
      { city: 'Abomey' },
      { city: 'Bohicon' },
      { city: 'Natitingou' },
      { city: 'Ouidah' },
    ],
    countries: [{ country: 'Bénin' }],
    isActive: true,
  }

  const zoneAfrique = {
    name: 'Afrique de l\'Ouest',
    countries: [
      { country: 'Togo' },
      { country: 'Ghana' },
      { country: 'Nigeria' },
      { country: 'Côte d\'Ivoire' },
      { country: 'Sénégal' },
    ],
    isActive: true,
  }

  const zoneCotonou = await payload.create({
    collection: 'shippingZones',
    data: zoneCotonouData,
  })

  const zoneBenins = await payload.create({
    collection: 'shippingZones',
    data: zoneBenin,
  })

  const zoneAfriques = await payload.create({
    collection: 'shippingZones',
    data: zoneAfrique,
  })

  // Shipping Rates
  await payload.create({
    collection: 'shippingRates',
    data: {
      name: 'Livraison Cotonou Standard',
      description: 'Livraison à domicile dans Cotonou',
      shippingZone: zoneCotonou.id,
      price: 1500,
      freeShippingThreshold: 25000,
      deliveryTime: '1-2 jours ouvrés',
      isActive: true,
    },
  })

  await payload.create({
    collection: 'shippingRates',
    data: {
      name: 'Livraison Cotonou Express',
      description: 'Livraison express le même jour',
      shippingZone: zoneCotonou.id,
      price: 3000,
      deliveryTime: 'Même jour',
      isActive: true,
    },
  })

  await payload.create({
    collection: 'shippingRates',
    data: {
      name: 'Livraison Bénin Standard',
      description: 'Livraison dans les principales villes du Bénin',
      shippingZone: zoneBenins.id,
      price: 3500,
      freeShippingThreshold: 40000,
      deliveryTime: '3-5 jours ouvrés',
      isActive: true,
    },
  })

  await payload.create({
    collection: 'shippingRates',
    data: {
      name: 'Livraison Afrique de l\'Ouest',
      description: 'Livraison internationale Afrique de l\'Ouest',
      shippingZone: zoneAfriques.id,
      price: 8000,
      freeShippingThreshold: 75000,
      deliveryTime: '7-14 jours ouvrés',
      isActive: true,
    },
  })

  // ============================================
  // UPDATE SITE SETTINGS
  // ============================================
  payload.logger.info('— Updating site settings...')

  try {
    await payload.updateGlobal({
      slug: 'siteSettings',
      data: {
        siteName: 'Cannesh Lingerie',
        siteDescription: 'Lingerie féminine de qualité au Bénin - Confort, élégance et sensualité',
        currency: 'FCFA',
        minimumOrderAmount: 5000,
        contactEmail: 'contact@cannesh.com',
        contactPhone: '+229 XX XX XX XX',
        whatsappNumber: '+229 XX XX XX XX',
        instagramUrl: 'https://instagram.com/cannesh_lingerie',
        facebookUrl: 'https://facebook.com/canneshlingerie',
        maintenanceMode: false,
        announcementBar: '🎉 Livraison gratuite à partir de 25 000 FCFA sur Cotonou !',
        showNewBadge: true,
        newBadgeDays: 14,
      },
    })
  } catch (e) {
    // Global might not exist yet
  }

  payload.logger.info('✅ Cannesh Lingerie database seeded successfully!')
  payload.logger.info(`   - ${Object.keys(categories).length} categories`)
  payload.logger.info(`   - ${Object.keys(productCollections).length} collections`)
  payload.logger.info(`   - ${products.length} products`)
  payload.logger.info(`   - 3 shipping zones with rates`)
}
