import { NextRequest, NextResponse } from 'next/server';
import { initGoogleDrive } from '@/lib/googleDrive';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client inside the handler
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const formData = await request.formData();
    const orderId = formData.get('orderId') as string;
    const files = formData.getAll('photos') as File[];

    if (!orderId || files.length === 0) {
      return NextResponse.json(
        { error: 'Missing orderId or photos' },
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

    // Initialize Google Drive
    const drive = initGoogleDrive();

    // Create or get folder
    let folderId = order.google_drive_folder_id;
    let folderLink = order.google_drive_link;

    if (!folderId) {
      const folderName = `Order_${orderId}_${order.customer_name}_${new Date().toISOString().split('T')[0]}`;
      const folder = await drive.createFolder(folderName);
      folderId = folder.id;
      folderLink = folder.webViewLink;

      // Update order with folder info
      await supabase
        .from('photo_orders')
        .update({
          google_drive_folder_id: folderId,
          google_drive_link: folderLink,
          status: 'uploading',
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);
    }

    // Upload files to Google Drive
    const uploadPromises = files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploadedFile = await drive.uploadFile(
        file.name,
        buffer,
        file.type,
        folderId!
      );
      return uploadedFile.webViewLink;
    });

    const photoUrls = await Promise.all(uploadPromises);

    // Update order with photo URLs
    const existingPhotoUrls = order.photo_urls || [];
    const allPhotoUrls = [...existingPhotoUrls, ...photoUrls];

    await supabase
      .from('photo_orders')
      .update({
        photo_urls: allPhotoUrls,
        status: 'payment_pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return NextResponse.json({
      success: true,
      folderLink,
      photoUrls,
      message: 'Photos uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading photos:', error);
    return NextResponse.json(
      { error: 'Failed to upload photos' },
      { status: 500 }
    );
  }
}
