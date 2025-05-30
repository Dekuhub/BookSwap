import { config } from '../config';
import type { Tag, CreateTagData } from '../types/tag';

const API_URL = config.API_URL;

const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const createTag = async (tagData: CreateTagData): Promise<Tag> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Требуется авторизация');
  }

  try {
    const response = await fetch(`${API_URL}/tags`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(tagData)
    });

    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response:', responseText);
      throw new Error('Некорректный ответ сервера');
    }

    if (!response.ok) {
      console.error('Server error response:', responseData);
      throw new Error(responseData.message || 'Не удалось создать тег');
    }

    return responseData;
  } catch (error) {
    console.error('Error in createTag:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Не удалось создать тег');
  }
};

export const getTags = async (): Promise<Tag[]> => {
  const response = await fetch(`${API_URL}/tags`);
  
  if (!response.ok) {
    throw new Error('Не удалось загрузить теги');
  }

  const data = await response.json();
  console.log('API Response - Tags:', data);
  return data;
}; 