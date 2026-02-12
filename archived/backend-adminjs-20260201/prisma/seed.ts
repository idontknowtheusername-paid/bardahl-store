import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'soutiens-gorge' },
      update: {},
      create: {
        title: 'Soutiens-gorge',
        slug: 'soutiens-gorge',
        description: 'Collection de soutiens-gorge élégants et confortables',
        order: 1,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'culottes' },
      update: {},
      create: {
        title: 'Culottes',
        slug: 'culottes',
        description: 'Culottes confortables pour tous les jours',
        order: 2,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'ensembles' },
      update: {},
      create: {
        title: 'Ensembles',
        slug: 'ensembles',
        description: 'Ensembles coordonnés pour un look parfait',
        order: 3,
        isActive: true,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'nuisettes' },
      update: {},
      create: {
        title: 'Nuisettes',
        slug: 'nuisettes',
        description: 'Nuisettes légères et séduisantes',
        order: 4,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create collections
  const collections = await Promise.all([
    prisma.productCollection.upsert({
      where: { slug: 'nouvelle-collection' },
      update: {},
      create: {
        title: 'Nouvelle Collection',
        slug: 'nouvelle-collection',
        description: 'Découvrez nos dernières créations',
        order: 1,
        isActive: true,
      },
    }),
    prisma.productCollection.upsert({
      where: { slug: 'bestsellers' },
      update: {},
      create: {
        title: 'Bestsellers',
        slug: 'bestsellers',
        description: 'Nos produits les plus populaires',
        order: 2,
        isActive: true,
      },
    }),
  ]);

  console.log(`✅ Created ${collections.length} collections`);

  // Create shipping zones
  const zones = await Promise.all([
    prisma.shippingZone.upsert({
      where: { id: 'zone-cotonou' },
      update: {},
      create: {
        id: 'zone-cotonou',
        name: 'Cotonou & environs',
        cities: ['Cotonou', 'Abomey-Calavi', 'Porto-Novo', 'Ouidah'],
        isActive: true,
        rates: {
          create: [
            { method: 'STANDARD', price: 1500, estimatedDays: '2-3 jours' },
            { method: 'EXPRESS', price: 3000, estimatedDays: '24h' },
            { method: 'PICKUP', price: 0, estimatedDays: 'Disponible sous 24h' },
          ],
        },
      },
    }),
    prisma.shippingZone.upsert({
      where: { id: 'zone-autres' },
      update: {},
      create: {
        id: 'zone-autres',
        name: 'Autres villes',
        cities: ['Parakou', 'Djougou', 'Bohicon', 'Natitingou', 'Lokossa', 'Kandi'],
        isActive: true,
        rates: {
          create: [
            { method: 'STANDARD', price: 2500, estimatedDays: '3-5 jours' },
            { method: 'EXPRESS', price: 5000, estimatedDays: '1-2 jours' },
          ],
        },
      },
    }),
  ]);

  console.log(`✅ Created ${zones.length} shipping zones`);

  // Create sample products
  const product1 = await prisma.product.upsert({
    where: { slug: 'soutien-gorge-dentelle-noir' },
    update: {},
    create: {
      name: 'Soutien-gorge Dentelle Noir',
      slug: 'soutien-gorge-dentelle-noir',
      description: 'Élégant soutien-gorge en dentelle noire, parfait pour toutes les occasions.',
      composition: '80% Polyamide, 20% Élasthanne',
      care: 'Lavage à la main recommandé. Ne pas utiliser de sèche-linge.',
      style: 'Romantique',
      price: 15000,
      originalPrice: 18000,
      isNew: true,
      isBestseller: true,
      isActive: true,
      categoryId: categories[0].id,
      collectionId: collections[0].id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1617331140180-e8262094733a?w=800', alt: 'Soutien-gorge dentelle noir', order: 0 },
        ],
      },
      variants: {
        create: [
          { size: 'S', color: 'Noir', colorHex: '#000000', cupSize: 'A', stock: 10 },
          { size: 'S', color: 'Noir', colorHex: '#000000', cupSize: 'B', stock: 15 },
          { size: 'M', color: 'Noir', colorHex: '#000000', cupSize: 'B', stock: 20 },
          { size: 'M', color: 'Noir', colorHex: '#000000', cupSize: 'C', stock: 12 },
          { size: 'L', color: 'Noir', colorHex: '#000000', cupSize: 'C', stock: 8 },
        ],
      },
    },
  });

  const product2 = await prisma.product.upsert({
    where: { slug: 'ensemble-dentelle-rouge' },
    update: {},
    create: {
      name: 'Ensemble Dentelle Rouge',
      slug: 'ensemble-dentelle-rouge',
      description: 'Ensemble coordonné en dentelle rouge, pour une allure séduisante.',
      composition: '85% Polyamide, 15% Élasthanne',
      care: 'Lavage délicat à 30°C. Pas de javel.',
      style: 'Séduisant',
      price: 25000,
      isNew: false,
      isBestseller: true,
      isActive: true,
      categoryId: categories[2].id,
      collectionId: collections[1].id,
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1616530940355-351fabd9524b?w=800', alt: 'Ensemble dentelle rouge', order: 0 },
        ],
      },
      variants: {
        create: [
          { size: 'S', color: 'Rouge', colorHex: '#DC2626', stock: 5 },
          { size: 'M', color: 'Rouge', colorHex: '#DC2626', stock: 10 },
          { size: 'L', color: 'Rouge', colorHex: '#DC2626', stock: 7 },
        ],
      },
    },
  });

  console.log('✅ Created sample products');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
