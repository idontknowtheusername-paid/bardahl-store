import type { Endpoint } from 'payload'

export const relatedProductsEndpoint: Endpoint = {
  path: '/products/related/:id',
  method: 'get',
  handler: async (req) => {
    const payload = req.payload
    const productId = req.routeParams?.id as string

    if (!productId) {
      return Response.json({ error: 'Product ID required' }, { status: 400 })
    }

    // Get the current product to find its categories
    const product = await payload.findByID({
      collection: 'products',
      id: productId,
      depth: 1,
    })

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if relatedProducts are manually set
    if (product.relatedProducts && Array.isArray(product.relatedProducts) && product.relatedProducts.length > 0) {
      // Return manually set related products
      const relatedIds = product.relatedProducts.map((p: any) => 
        typeof p === 'object' ? p.id : p
      )
      
      const relatedProducts = await payload.find({
        collection: 'products',
        where: {
          and: [
            { id: { in: relatedIds } },
            { isActive: { equals: true } },
          ],
        },
        limit: 4,
        depth: 2,
      })

      return Response.json(relatedProducts.docs)
    }

    // Otherwise, find products in the same category
    const categoryIds = product.categories?.map((c: any) =>
      typeof c === 'object' ? c.id : c
    ) || []

    if (categoryIds.length === 0) {
      // No categories, return random active products
      const randomProducts = await payload.find({
        collection: 'products',
        where: {
          and: [
            { id: { not_equals: productId } },
            { isActive: { equals: true } },
          ],
        },
        limit: 4,
        depth: 2,
      })

      return Response.json(randomProducts.docs)
    }

    const relatedProducts = await payload.find({
      collection: 'products',
      where: {
        and: [
          { id: { not_equals: productId } },
          { isActive: { equals: true } },
          { 'categories.id': { in: categoryIds } },
        ],
      },
      limit: 4,
      depth: 2,
    })

    return Response.json(relatedProducts.docs)
  },
}
