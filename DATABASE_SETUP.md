# Database Setup for Photo Service System

This document describes the database schema changes needed for the photo service features.

## Tables

### 1. profiles (existing table - needs update)
Add a new column:
```sql
ALTER TABLE profiles
ADD COLUMN role TEXT DEFAULT 'customer' CHECK (role IN ('customer', 'staff', 'admin'));
```

### 2. photo_orders (new table)
```sql
CREATE TABLE photo_orders (
  id BIGSERIAL PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'uploading', 'payment_pending', 'completed', 'cancelled')),
  google_drive_folder_id TEXT,
  google_drive_link TEXT,
  photo_urls TEXT[],
  payment_confirmed BOOLEAN DEFAULT FALSE,
  queue_position INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_photo_orders_customer_id ON photo_orders(customer_id);
CREATE INDEX idx_photo_orders_status ON photo_orders(status);
CREATE INDEX idx_photo_orders_created_at ON photo_orders(created_at DESC);
```

### 3. queue (new table)
```sql
CREATE TABLE queue (
  id BIGSERIAL PRIMARY KEY,
  customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id BIGINT REFERENCES photo_orders(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'processing', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_queue_customer_id ON queue(customer_id);
CREATE INDEX idx_queue_order_id ON queue(order_id);
CREATE INDEX idx_queue_status ON queue(status);
CREATE INDEX idx_queue_position ON queue(position);

-- Unique constraint to prevent duplicate active queue entries
CREATE UNIQUE INDEX idx_queue_active_order 
ON queue(order_id) 
WHERE status IN ('waiting', 'processing');
```

## Row Level Security (RLS)

### photo_orders
```sql
-- Enable RLS
ALTER TABLE photo_orders ENABLE ROW LEVEL SECURITY;

-- Policy for customers to view their own orders
CREATE POLICY "Customers can view own orders"
ON photo_orders FOR SELECT
USING (
  auth.uid() = customer_id
);

-- Policy for staff/admin to view all orders
CREATE POLICY "Staff can view all orders"
ON photo_orders FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin')
  )
);

-- Policy for staff/admin to update orders
CREATE POLICY "Staff can update orders"
ON photo_orders FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin')
  )
);

-- Policy for creating orders (if needed)
CREATE POLICY "Users can create orders"
ON photo_orders FOR INSERT
WITH CHECK (auth.uid() = customer_id);
```

### queue
```sql
-- Enable RLS
ALTER TABLE queue ENABLE ROW LEVEL SECURITY;

-- Policy for customers to view their own queue entries
CREATE POLICY "Customers can view own queue"
ON queue FOR SELECT
USING (
  auth.uid() = customer_id
);

-- Policy for staff/admin to view all queue entries
CREATE POLICY "Staff can view all queue"
ON queue FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin')
  )
);

-- Policy for staff/admin to update queue
CREATE POLICY "Staff can update queue"
ON queue FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('staff', 'admin')
  )
);

-- Policy for creating queue entries
CREATE POLICY "Users can create queue entries"
ON queue FOR INSERT
WITH CHECK (auth.uid() = customer_id);
```

## Realtime Subscriptions

Enable realtime for the queue table so customers can see updates:

```sql
-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE queue;
ALTER PUBLICATION supabase_realtime ADD TABLE photo_orders;
```

## Functions (Optional but recommended)

### Auto-update queue positions
```sql
CREATE OR REPLACE FUNCTION update_queue_positions()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate positions for all waiting/processing entries
  WITH numbered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as new_position
    FROM queue
    WHERE status IN ('waiting', 'processing')
  )
  UPDATE queue
  SET position = numbered.new_position
  FROM numbered
  WHERE queue.id = numbered.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update positions
CREATE TRIGGER trigger_update_queue_positions
AFTER INSERT OR UPDATE OR DELETE ON queue
FOR EACH STATEMENT
EXECUTE FUNCTION update_queue_positions();
```

### Auto-update updated_at timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_photo_orders_updated_at
BEFORE UPDATE ON photo_orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_queue_updated_at
BEFORE UPDATE ON queue
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## Environment Variables

Add these to your `.env.local` file:

```env
# Existing Supabase credentials
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Drive API credentials
GOOGLE_DRIVE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_DRIVE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_PARENT_FOLDER_ID=optional_parent_folder_id
```

## Google Drive Setup

1. Go to Google Cloud Console (https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google Drive API
4. Create a Service Account:
   - Go to IAM & Admin > Service Accounts
   - Create a new service account
   - Generate a JSON key
5. Share your Google Drive folder with the service account email
6. Copy the client_email and private_key from the JSON to your environment variables

## Initial Data

To test the system, you may want to create a staff user:

```sql
-- First, create a user through the Supabase Auth UI or signup flow
-- Then update their role:
UPDATE profiles
SET role = 'staff'
WHERE user_name = 'staff_username';
-- or
WHERE id = 'user_uuid';
```
