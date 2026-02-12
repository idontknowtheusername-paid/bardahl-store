import type { Endpoint } from 'payload'

export const contactEndpoint: Endpoint = {
  path: '/contact/submit',
  method: 'post',
  handler: async (req) => {
    const payload = req.payload

    try {
      const body = await req.json?.()
      const { name, email, subject, message } = body || {}

      if (!name || !email || !subject || !message) {
        return Response.json(
          { success: false, message: 'Tous les champs sont requis' },
          { status: 400 }
        )
      }

      // Create contact message
      await payload.create({
        collection: 'contactMessages',
        data: {
          name,
          email,
          subject,
          message,
          status: 'new',
        },
      })

      return Response.json({
        success: true,
        message: 'Votre message a été envoyé avec succès !',
      })
    } catch (error) {
      console.error('Contact form error:', error)
      return Response.json(
        { success: false, message: 'Une erreur est survenue' },
        { status: 500 }
      )
    }
  },
}
