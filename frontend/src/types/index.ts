export interface UserType {
  id: number;
  username: string;
  email: string;
  display_name: string;
  is_admin: boolean;
  is_approved: boolean;
  created_at: string;
}

export interface EventType {
  id: number;
  title: string;
  date: string;
  description: string;
  donation_purpose: string;
  status: "Upcoming" | "Active" | "Closed";
  created_at: string;
  updated_at: string;
  photo_count: number;
}

export interface PhotoType {
  id: number;
  event_id: number;
  user_id: number | null;
  title: string;
  uploaded_by: string;
  story: string;
  filename: string;
  upload_date: string;
  view_count: number;
  share_count: number;
  donate_count: number;
  donation_amount: number;
  is_removed: boolean;
  event_title?: string;
  image_data?: string | null;
}

export interface DashboardData {
  total_events: number;
  total_photos: number;
  total_donations: number;
  total_donation_amount: number;
  most_viewed_photo: TopPhoto | null;
  most_shared_photo: TopPhoto | null;
}

export interface TopPhoto {
  id: number;
  title: string;
  filename: string;
  view_count: number;
  share_count: number;
  donate_count: number;
  donation_amount: number;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: UserType;
}