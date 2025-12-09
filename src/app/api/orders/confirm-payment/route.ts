import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { orderId } = await request.json();

    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      );
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('photo_orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (!order.google_drive_link) {
      return NextResponse.json(
        { error: 'No photos uploaded yet' },
        { status: 400 }
      );
    }

    // Update order status
    await supabase
      .from('photo_orders')
      .update({
        payment_confirmed: true,
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    // Remove from queue
    await supabase
      .from('queue')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', orderId);

    // TODO: Send email/notification to customer with Google Drive link
    // This would require additional email service integration

    return NextResponse.json({
      success: true,
      message: 'Payment confirmed successfully',
      driveLink: order.google_drive_link,
    });
  } catch (error) {
    console.error('Error confirming payment:', error);
    return NextResponse.json(
      { error: 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
