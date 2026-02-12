import type { PayloadHandler } from 'payload'

export const sendNewsletterEmail: PayloadHandler = async (req) => {
  try {
    const { user } = req;

    // Only admins can send newsletters
    if (!user) {
      return Response.json({
        success: false,
        message: 'Unauthorized',
      }, { status: 401 });
    }

    const body = await req.json?.();
    const {
      subject,
      previewText,
      heroImage,
      mainTitle,
      mainContent,
      featuredProducts,
      ctaText,
      ctaUrl,
      targetStatus = 'active',
    } = body || {};

    if (!subject || !mainTitle || !mainContent) {
      return Response.json({
        success: false,
        message: 'Missing required fields',
      }, { status: 400 });
    }

    // Get active subscribers
    const subscribers = await req.payload.find({
      collection: 'newsletter' as any,
      where: {
        status: {
          equals: targetStatus,
        },
      },
      limit: 10000,
    });

    if (subscribers.docs.length === 0) {
      return Response.json({
        success: false,
        message: 'No subscribers found',
      }, { status: 400 });
    }

    // Send newsletter
    const { sendBulkEmails } = await import('@/lib/email');
    const results = await sendBulkEmails(
      subscribers.docs.map((sub: any) => ({
        email: sub.email,
        name: sub.name,
      })),
      'newsletter',
      {
        subject,
        previewText,
        heroImage,
        mainTitle,
        mainContent,
        featuredProducts,
        ctaText,
        ctaUrl,
      }
    );

    return Response.json({
      success: true,
      message: 'Newsletter sent successfully',
      results,
    });
  } catch (error) {
    console.error('Newsletter send error:', error);
    return Response.json({
      success: false,
      message: 'Failed to send newsletter',
    }, { status: 500 });
  }
};
