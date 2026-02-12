import type { PayloadHandler } from 'payload'

export const unsubscribeFromNewsletter: PayloadHandler = async (req) => {
  try {
    const body = await req.json?.();
    const { email } = body || {};

    if (!email) {
      return Response.json({
        success: false,
        message: 'Email is required',
      }, { status: 400 });
    }

    const existing = await req.payload.find({
      collection: 'newsletter' as any,
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (existing.docs.length === 0) {
      return Response.json({
        success: false,
        message: 'Email not found',
      }, { status: 404 });
    }

    const subscriber = existing.docs[0];

    await req.payload.update({
      collection: 'newsletter' as any,
      id: subscriber.id,
      data: {
        status: 'unsubscribed',
        unsubscribedAt: new Date().toISOString(),
      } as any,
    });

    return Response.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
    });
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error);
    return Response.json({
      success: false,
      message: 'Failed to unsubscribe from newsletter',
    }, { status: 500 });
  }
};
