# Photo Service System - Feature Documentation

This document describes the new photo service features added to the D-Youth Dropbox application.

## Features Overview

### 1. Google Drive Integration
- Automatic folder creation for each customer order
- Photo uploads directly to Google Drive
- Public sharing links for easy download
- Organized folder structure

### 2. Staff Dashboard (`/staff/dashboard`)
- View all customer photo orders
- Upload photos to Google Drive
- Confirm payment and send download links
- Toast notifications instead of browser alerts

### 3. Queue System (`/queue`)
- Customers are automatically placed in queue when they have pending orders
- Real-time queue position updates
- Automatic removal from queue after payment confirmation
- Queue restriction guard prevents navigation away from queue

### 4. Customer History (`/history`)
- View all past orders
- Embedded photo previews
- Google Drive download links
- Order status and details

### 5. Queue Restriction Guard
- Prevents customers from leaving the queue until their order is processed
- Allows access to specific pages (login, profile, queue)
- Does not affect staff members

## User Roles

- **Customer** (default): Can create orders, view queue, and access history
- **Staff**: Can access staff dashboard, manage orders, upload photos
- **Admin**: Same as staff with potential for additional permissions

## User Flow

### Customer Flow
1. Customer creates an order (not implemented in this PR - would need order creation page)
2. Customer is automatically added to queue
3. Customer waits in queue while staff processes the order
4. Staff uploads photos to Google Drive
5. Staff confirms payment
6. Customer receives Google Drive link
7. Customer is removed from queue automatically
8. Customer can view order in history page

### Staff Flow
1. Staff logs in and navigates to `/staff/dashboard`
2. Views list of pending orders
3. Selects an order
4. Uploads photos (stored in Google Drive)
5. Confirms payment when ready
6. System automatically sends link to customer and removes them from queue

## API Endpoints

### POST `/api/photos/upload`
Uploads photos to Google Drive for a specific order.

**Request:**
- `orderId`: Order ID
- `photos`: Array of photo files

**Response:**
```json
{
  "success": true,
  "folderLink": "https://drive.google.com/...",
  "photoUrls": ["https://drive.google.com/...", ...],
  "message": "Photos uploaded successfully"
}
```

### POST `/api/orders/confirm-payment`
Confirms payment for an order and completes it.

**Request:**
```json
{
  "orderId": 123
}
```

**Response:**
```json
{
  "success": true,
  "message": "Payment confirmed successfully",
  "driveLink": "https://drive.google.com/..."
}
```

## Components

### QueueRestrictionGuard
Located at: `/src/app/components/guards/QueueRestrictionGuard.tsx`

Wraps the entire application and redirects customers with pending orders to the queue page. Allows access to:
- `/login`
- `/setup-profile`
- `/auth/*`
- `/queue`
- `/profile`
- `/staff/*` (for staff members)

## Setup Instructions

1. **Database Setup**: Follow instructions in `DATABASE_SETUP.md`
2. **Google Drive Setup**: 
   - Create a Google Cloud Project
   - Enable Google Drive API
   - Create a Service Account
   - Download JSON credentials
3. **Environment Variables**: Copy `.env.example` to `.env.local` and fill in values
4. **Install Dependencies**: `npm install` (googleapis already added)
5. **Run Development Server**: `npm run dev`

## Accessing Features

- Staff Dashboard: `/staff/dashboard`
- Queue Page: `/queue`
- History Page: `/history`

## Toast Notifications

The staff dashboard now uses `react-hot-toast` for all notifications instead of browser alerts:
- Success messages (green)
- Error messages (red)
- Loading states

## Security Considerations

- Row Level Security (RLS) enabled on all new tables
- Staff role verification on dashboard pages
- Google Drive folders are set to "anyone with link can view"
- Service account credentials should be kept secure
- API routes verify user permissions

## Future Enhancements

Potential improvements:
- Email notifications when order is complete
- Order creation page for customers
- Payment integration
- Photo upload progress indicators
- Bulk photo processing
- Order search and filtering
- Customer notifications via email/SMS
- Photo editing/cropping before upload
- Multiple photo package options

## Troubleshooting

### Google Drive Upload Fails
- Check service account credentials
- Verify Google Drive API is enabled
- Ensure service account has write permissions to parent folder

### Queue Not Working
- Check database triggers are created
- Verify RLS policies are set correctly
- Check realtime subscriptions are enabled

### Staff Dashboard Access Denied
- Verify user role is set to 'staff' or 'admin' in profiles table
- Check authentication is working

## Dependencies Added

- `googleapis`: ^144.0.0 - Google APIs client library for Node.js
- `react-hot-toast`: ^2.5.2 (already in package.json)
