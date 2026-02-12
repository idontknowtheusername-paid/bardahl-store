import { Router } from 'express';
import { prisma } from '../server.js';

export const productRoutes = Router();

// Get all products
productRoutes.get('/', async (req, res) => {
  try {
    const { 
      category, 
      collection, 
      isNew, 
      isBestseller, 
      limit = '50',
      page = '1',
      sort = 'newest'
    } = req.query;

    const take = parseInt(limit as string);
    const skip = (parseInt(page as string) - 1) * take;

    const where: any = { isActive: true };
    
    if (category) {
      where.category = { slug: category };
    }
    if (collection) {
      where.collection = { slug: collection };
    }
    if (isNew === 'true') {
      where.isNew = true;
    }
    if (isBestseller === 'true') {
      where.isBestseller = true;
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, title: true, slug: true } },
          collection: { select: { id: true, title: true, slug: true } },
          images: { orderBy: { order: 'asc' } },
          variants: true,
        },
        orderBy,
        take,
        skip,
      }),
      prisma.product.count({ where }),
    ]);

    // Transform to frontend format
    const transformedProducts = products.map(transformProduct);

    res.json({
      success: true,
      docs: transformedProducts,
      totalDocs: total,
      totalPages: Math.ceil(total / take),
      page: parseInt(page as string),
      limit: take,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
});

// Get featured products
productRoutes.get('/featured', async (req, res) => {
  try {
    const { limit = '8' } = req.query;

    const products = await prisma.product.findMany({
      where: { 
        isActive: true,
        isBestseller: true,
      },
      include: {
        category: { select: { id: true, title: true, slug: true } },
        collection: { select: { id: true, title: true, slug: true } },
        images: { orderBy: { order: 'asc' } },
        variants: true,
      },
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      docs: products.map(transformProduct),
    });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch featured products' });
  }
});

// Get new arrivals
productRoutes.get('/new-arrivals', async (req, res) => {
  try {
    const { limit = '8' } = req.query;

    const products = await prisma.product.findMany({
      where: { 
        isActive: true,
        isNew: true,
      },
      include: {
        category: { select: { id: true, title: true, slug: true } },
        collection: { select: { id: true, title: true, slug: true } },
        images: { orderBy: { order: 'asc' } },
        variants: true,
      },
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      docs: products.map(transformProduct),
    });
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch new arrivals' });
  }
});

// Get single product by slug
productRoutes.get('/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { id: true, title: true, slug: true } },
        collection: { select: { id: true, title: true, slug: true } },
        images: { orderBy: { order: 'asc' } },
        variants: true,
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      doc: transformProduct(product),
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

// Get single product by ID
productRoutes.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, title: true, slug: true } },
        collection: { select: { id: true, title: true, slug: true } },
        images: { orderBy: { order: 'asc' } },
        variants: true,
      },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.json({
      success: true,
      doc: transformProduct(product),
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch product' });
  }
});

// Get related products
productRoutes.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = '4' } = req.query;

    const product = await prisma.product.findUnique({
      where: { id },
      select: { categoryId: true, collectionId: true },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        id: { not: id },
        OR: [
          { categoryId: product.categoryId },
          { collectionId: product.collectionId },
        ],
      },
      include: {
        category: { select: { id: true, title: true, slug: true } },
        collection: { select: { id: true, title: true, slug: true } },
        images: { orderBy: { order: 'asc' } },
        variants: true,
      },
      take: parseInt(limit as string),
    });

    res.json({
      success: true,
      docs: products.map(transformProduct),
    });
  } catch (error) {
    console.error('Error fetching related products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch related products' });
  }
});

// Transform product to frontend format
function transformProduct(product: any) {
  // Get unique colors from variants
  const colors = [...new Map(
    product.variants.map((v: any) => [v.color, { name: v.color, hex: v.colorHex || '#000000' }])
  ).values()];

  // Get unique sizes from variants
  const sizes = [...new Set(product.variants.map((v: any) => v.size))].map(size => ({
    size,
    available: product.variants.some((v: any) => v.size === size && v.stock > 0),
  }));

  // Get unique cup sizes
  const cupSizes = [...new Set(product.variants.filter((v: any) => v.cupSize).map((v: any) => v.cupSize))];

  // Calculate stock by variant key
  const stock: Record<string, number> = {};
  product.variants.forEach((v: any) => {
    const key = v.cupSize 
      ? `${v.size}-${v.color}-${v.cupSize}`
      : `${v.size}-${v.color}`;
    stock[key] = v.stock;
  });

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    originalPrice: product.originalPrice,
    images: product.images.map((img: any) => img.url),
    category: product.category?.title || '',
    categorySlug: product.category?.slug || '',
    collection: product.collection?.title || '',
    collectionSlug: product.collection?.slug || '',
    colors,
    sizes,
    cupSizes,
    description: product.description || '',
    composition: product.composition || '',
    care: product.care || '',
    style: product.style || '',
    isNew: product.isNew,
    isBestseller: product.isBestseller,
    stock,
  };
}
