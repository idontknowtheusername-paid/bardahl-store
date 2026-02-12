import type { Endpoint } from 'payload'

export const featuredProductsEndpoint: Endpoint = {
  path: '/products/featured',
  method: 'get',
  handler: async (req) => {
    try {
      const payload = req.payload

      const products = await payload.find({
        collection: 'products',
        where: {
          and: [
            { isFeatured: { equals: true } },
            { isActive: { equals: true } },
          ],
        },
        limit: 8,
        depth: 2,
      })

      return Response.json(products.docs)
    } catch (error) {
      console.error('Error fetching featured products:', error)
      return Response.json([], { status: 200 })
    }
  },
}
