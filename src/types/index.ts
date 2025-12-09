export interface Profile {
  id: number;
  user_name: string;
  profile_img: string;
  year?: string;
  province?: string;
  isAnonymous?: boolean;
  role?: 'customer' | 'staff' | 'admin';
}

export interface Wall {
  id: number;
  content: string;
  created_at: string;
  sender_id: number;
  color: string | null;
  is_anonymous?: boolean;
  profiles: Profile | Profile[];
  isAnonymous?: boolean;
}

export interface PhotoOrder {
  id: number;
  customer_id: number;
  customer_name: string;
  customer_email: string;
  status: 'pending' | 'uploading' | 'payment_pending' | 'completed' | 'cancelled';
  google_drive_folder_id?: string;
  google_drive_link?: string;
  photo_urls?: string[];
  payment_confirmed: boolean;
  queue_position?: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  notes?: string;
}

export interface QueueEntry {
  id: number;
  customer_id: number;
  order_id: number;
  position: number;
  status: 'waiting' | 'processing' | 'completed';
  created_at: string;
  updated_at: string;
}
