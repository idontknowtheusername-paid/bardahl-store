import type { Endpoint } from 'payload'

export const shippingCalculateEndpoint: Endpoint = {
  path: '/shipping/calculate',
  method: 'post',
  handler: async (req) => {
    const payload = req.payload

    try {
      const body = await req.json?.()
      const { city, country = 'Bénin', cartTotal, shippingMethodId } = body || {}

      if (!city) {
        return Response.json(
          { error: 'La ville est requise' },
          { status: 400 }
        )
      }

      // Find matching shipping zone
      const zones = await payload.find({
        collection: 'shippingZones',
        where: {
          and: [
            { isActive: { equals: true } },
            {
              or: [
                { 'cities.city': { equals: city } },
                { 'countries.country': { equals: country } },
              ],
            },
          ],
        },
        limit: 10,
      })

      if (zones.docs.length === 0) {
        return Response.json({
          shippingCost: 0,
          freeShipping: false,
          deliveryTime: 'Non disponible',
          error: 'Aucune zone de livraison trouvée pour votre localisation',
        })
      }

      const zoneIds = zones.docs.map((z) => z.id)

      // Find shipping rates for these zones
      let ratesQuery: any = {
        and: [
          { isActive: { equals: true } },
          { shippingZone: { in: zoneIds } },
        ],
      }

      if (shippingMethodId) {
        ratesQuery = {
          and: [
            ...ratesQuery.and,
            { id: { equals: shippingMethodId } },
          ],
        }
      }

      const rates = await payload.find({
        collection: 'shippingRates',
        where: ratesQuery,
        depth: 1,
        limit: 10,
      })

      if (rates.docs.length === 0) {
        return Response.json({
          shippingCost: 0,
          freeShipping: false,
          deliveryTime: 'Non disponible',
          error: 'Aucun tarif de livraison disponible',
        })
      }

      // Get the first (or selected) rate
      const rate = rates.docs[0]
      const freeShipping = rate.freeShippingThreshold && cartTotal >= rate.freeShippingThreshold

      return Response.json({
        shippingCost: freeShipping ? 0 : rate.price,
        freeShipping,
        deliveryTime: rate.deliveryTime || '2-5 jours ouvrés',
        rateName: rate.name,
        zoneName: typeof rate.shippingZone === 'object' ? rate.shippingZone.name : undefined,
      })
    } catch (error) {
      console.error('Shipping calculation error:', error)
      return Response.json(
        { error: 'Une erreur est survenue' },
        { status: 500 }
      )
    }
  },
}
