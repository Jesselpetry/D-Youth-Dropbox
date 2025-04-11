export interface Profile {
    id: number;
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
    sender_id: number;
    color: string | null;
    is_anonymous?: boolean;
    profiles: Profile | Profile[];
    isAnonymous?: boolean;
  }