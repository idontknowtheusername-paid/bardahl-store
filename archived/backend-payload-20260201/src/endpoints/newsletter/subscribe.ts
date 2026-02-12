import type { PayloadHandler } from 'payload'

export const subscribeToNewsletter: PayloadHandler = async (req) => {
  try {
    const body = await req.json?.();
    const { email, name, source = 'website' } = body || {};

    if (!email) {
      return Response.json({
        success: false,
        message: 'Email is required',
      }, { status: 400 });
    }

    // Check if email already exists
    const existing = await req.payload.find({
      collection: 'newsletter' as any,
      where: {
        email: {
          equals: email,
        },
      },
    });

    if (existing.docs.length > 0) {
      const subscriber = existing.docs[0] as any;
      
      // If unsubscribed, reactivate
      if (subscriber.status === 'unsubscribed') {
        await req.payload.update({
          collection: 'newsletter' as any,
          id: subscriber.id,
          data: {
            status: 'active',
            subscribedAt: new Date().toISOString(),
            unsubscribedAt: null,
          } as any,
        });

        return Response.json({
          success: true,
          message: 'Subscription reactivated successfully',
        });
      }

      return Response.json({
        success: false,
        message: 'Email already subscribed',
      }, { status: 400 });
    }

    // Create new subscriber
    await req.payload.create({
      collection: 'newsletter' as any,
      data: {
        email,
        name,
        source,
        status: 'active',
        subscribedAt: new Date().toISOString(),
      } as any,
    });

    return Response.json({
      success: true,
      message: 'Successfully subscribed to newsletter',
    }, { status: 201 });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return Response.json({
      success: false,
      message: 'Failed to subscribe to newsletter',
    }, { status: 500 });
  }
};
