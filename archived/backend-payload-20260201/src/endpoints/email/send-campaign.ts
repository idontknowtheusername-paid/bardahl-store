import type { PayloadHandler } from 'payload'

export const sendEmailCampaign: PayloadHandler = async (req) => {
  try {
    const { user } = req;

    // Only admins can send campaigns
    if (!user) {
      return Response.json({
        success: false,
        message: 'Unauthorized',
      }, { status: 401 });
    }

    const body = await req.json?.();
    const {
      campaignTitle,
      previewText,
      heroImage,
      mainHeading,
      subheading,
      bodyContent,
      promoCode,
      promoDiscount,
      promoExpiry,
      ctaText,
      ctaUrl,
      secondaryContent,
      targetStatus = 'active',
    } = body || {};

    if (!campaignTitle || !mainHeading || !bodyContent || !ctaText || !ctaUrl) {
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

    // Send campaign
    const { sendBulkEmails } = await import('@/lib/email');
    const results = await sendBulkEmails(
      subscribers.docs.map((sub: any) => ({
        email: sub.email,
        name: sub.name,
      })),
      'campaign',
      {
        campaignTitle,
        previewText,
        heroImage,
        mainHeading,
        subheading,
        bodyContent,
        promoCode,
        promoDiscount,
        promoExpiry,
        ctaText,
        ctaUrl,
        secondaryContent,
      }
    );

    return Response.json({
      success: true,
      message: 'Campaign sent successfully',
      results,
    });
  } catch (error) {
    console.error('Campaign send error:', error);
    return Response.json({
      success: false,
      message: 'Failed to send campaign',
    }, { status: 500 });
  }
};
