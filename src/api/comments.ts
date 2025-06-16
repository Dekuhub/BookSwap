import { config } from '../config';
import type { Comment } from '../types/book';
import { handleApiError } from './error';

const API_URL = config.API_URL;

const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

interface CommentsResponse {
  comments: Comment[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export const getBookComments = async (bookId: number, page: number = 0, pageSize: number = 10): Promise<CommentsResponse> => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    const response = await fetch(`${API_URL}/books/${bookId}/comments?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw response;
    }

    const data = await response.json();
    console.log('Полученные комментарии:', data);
    
    // Проверяем структуру ответа и формируем правильный объект
    if (!data.comments || !Array.isArray(data.comments)) {
      console.error('Некорректный формат ответа:', data);
      throw new Error('Некорректный формат ответа от сервера');
    }

    return {
      comments: data.comments,
      pagination: {
        total: data.pagination?.total || data.total || 0,
        page: page,
        pageSize: pageSize
      }
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const createComment = async (bookId: number, text: string): Promise<Comment> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Необходимо войти в систему для добавления комментария');
    }

    console.log('Отправка комментария:', { book_id: bookId, text });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };

    const response = await fetch(`${API_URL}/comments`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        book_id: bookId,
        text: text
      }),
    });

    if (!response.ok) {
      let errorMessage = 'Не удалось создать комментарий';
      try {
        const errorData = await response.json();
        console.error('Детали ошибки:', errorData);
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (e) {
        console.error('Не удалось прочитать ответ сервера:', e);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('Ответ сервера при создании комментария:', data);
    
    if (!data || !data.id) {
      throw new Error('Некорректный ответ от сервера при создании комментария');
    }
    
    return data;
  } catch (error) {
    console.error('Ошибка при создании комментария:', error);
    throw error instanceof Error ? error : new Error('Не удалось создать комментарий');
  }
}; 