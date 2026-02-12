import type { Endpoint } from 'payload'
import { seedCannesh } from './cannesh-seed'

export const seedCanneshEndpoint: Endpoint = {
  path: '/seed-cannesh',
  method: 'post',
  handler: async (req) => {
    const payload = req.payload

    // Optional: Check for admin authentication
    // if (!req.user || !req.user.roles?.includes('admin')) {
    //   return Response.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    try {
      await seedCannesh({ payload, req })

      return Response.json({
        success: true,
        message: 'Base de données Cannesh Lingerie initialisée avec succès !',
      })
    } catch (error) {
      console.error('Seed error:', error)
      return Response.json(
        { 
          success: false, 
          error: error instanceof Error ? error.message : 'Erreur lors du seed' 
        },
        { status: 500 }
      )
    }
  },
}
