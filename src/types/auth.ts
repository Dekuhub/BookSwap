export interface RegisterFormData {
  login: string;
  username: string;
  password: string;
}

export interface LoginFormData {
  login: string;
  password: string;
}

export interface TokenResponse {
  token: string;
  refresh_token: string;
  user_id: number;
} 