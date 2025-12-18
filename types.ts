export interface LinkItem {
  id: string;
  title: string;
  url: string;
  active: boolean;
}

export interface UserProfile {
  id: string; // references auth.users
  username: string;
  full_name: string;
  bio: string;
  avatar_url: string;
  theme_color: string;
  links: LinkItem[];
  updated_at?: string;
}

export interface AuthState {
  session: any | null;
  user: any | null;
  loading: boolean;
}
