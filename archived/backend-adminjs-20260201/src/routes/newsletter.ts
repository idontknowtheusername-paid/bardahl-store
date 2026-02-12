import { Router } from 'express';
import { prisma } from '../server.js';
import { sendWelcomeNewsletter } from '../services/email.js';

export const newsletterRoutes = Router();

// Subscribe to newsletter
newsletterRoutes.post('/subscribe', async (req, res) => {
  try {
    const { email, firstName, source = 'website' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive) {
        return res.json({
          success: true,
          message: 'Vous êtes déjà inscrit à notre newsletter',
          alreadySubscribed: true,
        });
      }

      // Reactivate subscription
      await prisma.newsletterSubscriber.update({
        where: { email },
        data: {
          isActive: true,
          firstName: firstName || existing.firstName,
          unsubscribedAt: null,
        },
      });

      return res.json({
        success: true,
        message: 'Votre inscription a été réactivée',
      });
    }

    // Create new subscriber
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email,
        firstName,
        source,
      },
    });

    // Send welcome email
    try {
      await sendWelcomeNewsletter(email, firstName);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Inscription réussie ! Vérifiez votre email.',
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe',
    });
  }
});

// Unsubscribe from newsletter
newsletterRoutes.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const subscriber = await prisma.newsletterSubscriber.findUnique({
      where: { email },
    });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found',
      });
    }

    await prisma.newsletterSubscriber.update({
      where: { email },
      data: {
        isActive: false,
        unsubscribedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Vous avez été désinscrit de notre newsletter',
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe',
    });
  }
});

// Get unsubscribe page (for email links)
newsletterRoutes.get('/unsubscribe', async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.status(400).send('Email manquant');
  }

  // Simple HTML page
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Désinscription - Cannesh Lingerie</title>
      <style>
        body { font-family: sans-serif; text-align: center; padding: 50px; }
        .btn { background: #d4a574; color: white; padding: 12px 24px; border: none; cursor: pointer; font-size: 16px; }
        .btn:hover { background: #c4956a; }
      </style>
    </head>
    <body>
      <h1>Désinscription Newsletter</h1>
      <p>Cliquez sur le bouton ci-dessous pour vous désinscrire.</p>
      <form action="/api/newsletter/unsubscribe" method="POST">
        <input type="hidden" name="email" value="${email}">
        <button type="submit" class="btn">Se désinscrire</button>
      </form>
    </body>
    </html>
  `);
});
