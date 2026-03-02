export interface Profile {
  id: string;
  user_name: string;
  profile_img: string;
  year?: string;
  province?: string;
  isAnonymous?: boolean;
}

export interface Wall {
  id: number;
  content: string;
  created_at: string;
  sender_id: string | null;
  color: string | null;
  is_anonymous?: boolean;
  profiles: Profile | Profile[];
  isAnonymous?: boolean;
}
