import type {LoginFormData, RegisterFormData} from "../types/auth.ts";
import { config } from '../config';

const API_URL = config.API_URL;

export const register = async (data: RegisterFormData): Promise<Response> => {
  return fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export const login = async (data: LoginFormData): Promise<Response> => {
  return fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export const logout = async (): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Токен не найден');
  }

  try {
    const response = await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Ошибка при выходе из системы');
    }

    // Очищаем токен и другие данные пользователя из localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch (error) {
    console.error('Logout error:', error);
    // Всё равно очищаем локальное хранилище, даже если запрос не удался
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    throw error;
  }
}; 