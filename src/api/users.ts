import type { User } from '../types/user'; // Assume a User type exists
import { config } from '../config';
import type { Book } from '../types/book';

const API_URL = config.API_URL;

const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

interface UpdateUserData {
  username?: string;
  avatar?: string;
}

export const updateUser = async (userId: number, userData: UpdateUserData): Promise<User> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Требуется авторизация');
  }

  const response = await fetch(`${API_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(userData)
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Не удалось обновить профиль');
  }

  return response.json();
};

export const getUserBooks = async (userId: number, page: number = 1, pageSize: number = 10): Promise<{ books: Book[], total: number }> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Требуется авторизация');
  }

  const response = await fetch(
    `${API_URL}/users/${userId}/books?page=${page}&pageSize=${pageSize}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );

  if (!response.ok) {
    throw new Error('Не удалось загрузить книги пользователя');
  }

  return response.json();
};

export const getUserById = async (userId: number): Promise<User> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Требуется авторизация');
  }

  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 401) {
      throw new Error('Требуется авторизация');
    }

    if (!response.ok) {
      const text = await response.text();
      let errorMessage = 'Ошибка при получении данных пользователя';
      try {
        const errorData = JSON.parse(text);
        errorMessage = errorData.error || errorData.detail || errorMessage;
      } catch (e) {
        console.error('Failed to parse error response:', text);
      }
      throw new Error(errorMessage);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
}; 