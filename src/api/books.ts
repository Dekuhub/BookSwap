import type { Book, BookFormData } from '../types/book';
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

    return response.json();
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

export const updateBook = async (id: number, bookData: BookFormData): Promise<Book> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/books/${id}`, {
      method: 'PUT',
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

export const deleteBook = async (id: number): Promise<void> => {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/books/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw response;
    }
  } catch (error) {
    return handleApiError(error);
  }
}; 