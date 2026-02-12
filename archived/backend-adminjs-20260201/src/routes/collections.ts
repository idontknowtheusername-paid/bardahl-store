import { Router } from 'express';
import { prisma } from '../server.js';

export const collectionRoutes = Router();

// Get all collections
collectionRoutes.get('/', async (req, res) => {
  try {
    const { active = 'true' } = req.query;

    const where: any = {};
    if (active === 'true') {
      where.isActive = true;
    }

    const collections = await prisma.productCollection.findMany({
      where,
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { order: 'asc' },
    });

    const transformed = collections.map(col => ({
      id: col.id,
      title: col.title,
      slug: col.slug,
      description: col.description,
      image: col.image,
      order: col.order,
      isActive: col.isActive,
      productCount: col._count.products,
    }));

    res.json({
      success: true,
      docs: transformed,
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch collections' });
  }
});

// Get collection by slug
collectionRoutes.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const collection = await prisma.productCollection.findUnique({
      where: { slug },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    res.json({
      success: true,
      doc: {
        id: collection.id,
        title: collection.title,
        slug: collection.slug,
        description: collection.description,
        image: collection.image,
        order: collection.order,
        isActive: collection.isActive,
        productCount: collection._count.products,
      },
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch collection' });
  }
});

// Get collection by ID
collectionRoutes.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await prisma.productCollection.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found' });
    }

    res.json({
      success: true,
      doc: {
        id: collection.id,
        title: collection.title,
        slug: collection.slug,
        description: collection.description,
        image: collection.image,
        order: collection.order,
        isActive: collection.isActive,
        productCount: collection._count.products,
      },
    });
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch collection' });
  }
});
