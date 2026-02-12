import { Router } from 'express';
import { prisma } from '../server.js';

export const categoryRoutes = Router();

// Get all categories
categoryRoutes.get('/', async (req, res) => {
  try {
    const { active = 'true' } = req.query;

    const where: any = {};
    if (active === 'true') {
      where.isActive = true;
    }

    const categories = await prisma.category.findMany({
      where,
      include: {
        parent: { select: { id: true, title: true, slug: true } },
        children: { 
          where: { isActive: true },
          select: { id: true, title: true, slug: true } 
        },
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
      orderBy: { order: 'asc' },
    });

    const transformed = categories.map(cat => ({
      id: cat.id,
      title: cat.title,
      slug: cat.slug,
      description: cat.description,
      image: cat.image,
      order: cat.order,
      isActive: cat.isActive,
      parent: cat.parent,
      children: cat.children,
      productCount: cat._count.products,
    }));

    res.json({
      success: true,
      docs: transformed,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// Get category by slug
categoryRoutes.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        parent: { select: { id: true, title: true, slug: true } },
        children: { 
          where: { isActive: true },
          select: { id: true, title: true, slug: true, image: true } 
        },
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      doc: {
        id: category.id,
        title: category.title,
        slug: category.slug,
        description: category.description,
        image: category.image,
        order: category.order,
        isActive: category.isActive,
        parent: category.parent,
        children: category.children,
        productCount: category._count.products,
      },
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category' });
  }
});

// Get category by ID
categoryRoutes.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        parent: { select: { id: true, title: true, slug: true } },
        children: { 
          where: { isActive: true },
          select: { id: true, title: true, slug: true, image: true } 
        },
        _count: {
          select: { products: { where: { isActive: true } } },
        },
      },
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      doc: {
        id: category.id,
        title: category.title,
        slug: category.slug,
        description: category.description,
        image: category.image,
        order: category.order,
        isActive: category.isActive,
        parent: category.parent,
        children: category.children,
        productCount: category._count.products,
      },
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category' });
  }
});
