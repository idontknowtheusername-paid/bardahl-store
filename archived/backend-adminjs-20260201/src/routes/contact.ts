import { Router } from 'express';
import { prisma } from '../server.js';
import { sendContactNotification } from '../services/email.js';

export const contactRoutes = Router();

// Submit contact message
contactRoutes.post('/', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: name, email, message',
      });
    }

    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone,
        subject,
        message,
      },
    });

    // Send notification to admin
    try {
      await sendContactNotification(contactMessage);
    } catch (emailError) {
      console.error('Failed to send contact notification:', emailError);
    }

    res.status(201).json({
      success: true,
      message: 'Message envoyé avec succès',
    });
  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message',
    });
  }
});

// Get all messages (admin)
contactRoutes.get('/', async (req, res) => {
  try {
    const { unreadOnly = 'false' } = req.query;

    const where: any = {};
    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const messages = await prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      messages,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch messages',
    });
  }
});

// Mark message as read
contactRoutes.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { isRead: true },
    });

    res.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update message',
    });
  }
});
