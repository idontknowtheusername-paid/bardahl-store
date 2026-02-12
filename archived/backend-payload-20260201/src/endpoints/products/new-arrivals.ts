import type { Endpoint } from 'payload'

export const newArrivalsEndpoint: Endpoint = {
  path: '/products/new-arrivals',
  method: 'get',
  handler: async (req) => {
    try {
      const payload = req.payload

      const products = await payload.find({
        collection: 'products',
        where: {
          and: [
            { isNew: { equals: true } },
            { isActive: { equals: true } },
          ],
        },
        limit: 8,
        sort: '-createdAt',
        depth: 2,
      })

      return Response.json(products.docs)
    } catch (error) {
      console.error('Error fetching new arrivals:', error)
      return Response.json([], { status: 200 })
    }
  },
}
