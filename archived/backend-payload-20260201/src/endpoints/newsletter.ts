import type { Endpoint } from 'payload'

export const newsletterEndpoint: Endpoint = {
  path: '/newsletter/subscribe',
  method: 'post',
  handler: async (req) => {
    const payload = req.payload

    try {
      const body = await req.json?.()
      const { email, firstName } = body || {}

      if (!email) {
        return Response.json(
          { success: false, message: 'Email requis' },
          { status: 400 }
        )
      }

      // Check if already subscribed
      const existing = await payload.find({
        collection: 'newsletterSubscribers',
        where: {
          email: { equals: email },
        },
        limit: 1,
      })

      if (existing.docs.length > 0) {
        // Reactivate if inactive
        if (!existing.docs[0].isActive) {
          await payload.update({
            collection: 'newsletterSubscribers',
            id: existing.docs[0].id,
            data: { isActive: true },
          })
          return Response.json({
            success: true,
            message: 'Vous êtes à nouveau inscrit à notre newsletter !',
          })
        }
        return Response.json({
          success: true,
          message: 'Vous êtes déjà inscrit à notre newsletter.',
        })
      }

      // Create new subscriber
      await payload.create({
        collection: 'newsletterSubscribers',
        data: {
          email,
          firstName: firstName || undefined,
          isActive: true,
        },
      })

      return Response.json({
        success: true,
        message: 'Merci pour votre inscription !',
      })
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      return Response.json(
        { success: false, message: 'Une erreur est survenue' },
        { status: 500 }
      )
    }
  },
}
