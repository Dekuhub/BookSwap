export interface User {
  id: number;
  login: string;
  username: string;
  avatar?: string; // Base64 string
  book_ids: number[];
  created_at: string;
  updated_at: string;
} 