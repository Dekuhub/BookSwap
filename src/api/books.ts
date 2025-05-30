import type { Book, BookFormData, CreateBookData, UpdateBookData } from '../types/book';
import { config } from '../config';

const API_URL = config.API_URL;

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  if (error instanceof Response) {
    throw new Error(`API error: ${error.status}`);
  }
  throw new Error(error.message || 'Network error');
};

export const getBooks = async (page: number = 1, pageSize: number = 9, tagFilter?: string | null) => {
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString(),
    });

    if (tagFilter) {
      queryParams.append('tag', tagFilter);
    }

    const response = await fetch(`${API_URL}/books?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw response;
    }

    const data = await response.json();
    return {
      books: data.books as Book[],
      total: data.total as number
    };
  } catch (error) {
    return handleApiError(error);
  }
};

export const getBook = async (id: number): Promise<Book> => {
  if (!id || typeof id !== 'number' || isNaN(id)) {
    throw new Error('Invalid book ID');
  }

  try {
    const response = await fetch(`${API_URL}/books/${id}`);
    
    if (!response.ok) {
      throw response;
    }

    const data = await response.json();
    console.log('API Response - Book:', data);
    return data;
  } catch (error) {
    return handleApiError(error);
  }
};

export const createBook = async (bookData: BookFormData): Promise<Book> => {
  try {
    const token = getAuthToken();
    
    if (!token) {
      throw new Error('No authentication token');
    }

    const response = await fetch(`${API_URL}/books`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(bookData),
    });

    if (!response.ok) {
      throw response;
    }

    return response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

export const updateBook = async (bookId: number, data: UpdateBookData): Promise<Book> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Требуется авторизация');
  }

  try {
    console.log('Updating book with data:', data);
    const response = await fetch(`${API_URL}/books/${bookId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Не удалось обновить книгу');
    }

    const updatedBook = await response.json();
    console.log('Server response after update:', updatedBook);
    return updatedBook;
  } catch (error) {
    console.error('Error updating book:', error);
    throw error instanceof Error ? error : new Error('Ошибка при обновлении книги');
  }
};

export interface BookDependencies {
  hasActiveExchanges: boolean;
  hasExchangeRequests: boolean;
  hasExchangeHistory: boolean;
}

export const checkBookDependencies = async (bookId: number): Promise<BookDependencies> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('Требуется авторизация');
  }

  try {
    const response = await fetch(`${API_URL}/books/${bookId}/dependencies`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Не удалось проверить зависимости книги');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking book dependencies:', error);
    throw error instanceof Error ? error : new Error('Ошибка при проверке зависимостей книги');
  }
}; 