import { API_URL } from '../config';

export interface CartItem {
  id: number;
  book_id: number;
  type: 'buy' | 'exchange';
  created_at: string;
  book: {
    id: number;
    title: string;
    author: string;
    description: string;
    photos: Array<{
      id: number;
      photo_url: string;
      is_main: boolean;
    }>;
  };
}

const getBookDetails = async (bookId: number, token: string) => {
  const url = `${API_URL}/books/${bookId}`;
  console.log('Fetching book details from:', url);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  console.log('Book details response status:', response.status);
  const responseText = await response.text();
  console.log('Book details response text:', responseText);

  if (!response.ok) {
    throw new Error('Не удалось получить информацию о книге');
  }

  try {
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error parsing book details:', error);
    throw new Error('Неверный формат данных о книге');
  }
};

export const addToCart = async (bookId: number, type: 'buy' | 'exchange'): Promise<CartItem> => {
  const token = localStorage.getItem('token');
  console.log('Token:', token);
  
  if (!token) {
    throw new Error('Требуется авторизация');
  }

  try {
    const url = `${API_URL}/cart/items`;
    const body = { book_id: bookId, type };
    
    console.log('Sending request to:', url);
    console.log('Request method:', 'POST');
    console.log('Request headers:', {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    console.log('Request body:', body);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { detail: responseText };
      }
      throw new Error(errorData.detail || 'Не удалось добавить книгу в корзину');
    }

    const cartItem = JSON.parse(responseText);
    const bookDetails = await getBookDetails(bookId, token);
    return {
      ...cartItem,
      book: bookDetails
    };
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error instanceof Error ? error : new Error('Ошибка при добавлении в корзину');
  }
};

export const getCartItems = async (): Promise<CartItem[]> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Требуется авторизация');
  }

  try {
    const url = `${API_URL}/cart`;
    console.log('Fetching cart items from:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('Cart response status:', response.status);
    const responseText = await response.text();
    console.log('Cart response text:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch (e) {
        errorData = { detail: responseText };
      }
      throw new Error(errorData.detail || 'Не удалось получить список книг в корзине');
    }

    const data = JSON.parse(responseText);
    console.log('Parsed cart data:', data);

    // Получаем массив элементов корзины
    const cartItems = Array.isArray(data) ? data : (data.items || []);
    console.log('Cart items before fetching book details:', cartItems);
    
    // Для каждого элемента получаем полную информацию о книге
    const itemsWithBookDetails = await Promise.all(
      cartItems.map(async (item) => {
        try {
          console.log('Fetching details for book_id:', item.book_id);
          const bookDetails = await getBookDetails(item.book_id, token);
          console.log('Received book details:', bookDetails);
          return {
            ...item,
            book: bookDetails
          };
        } catch (error) {
          console.error(`Error fetching book details for book_id ${item.book_id}:`, error);
          return item;
        }
      })
    );

    console.log('Final items with book details:', itemsWithBookDetails);
    return itemsWithBookDetails;
  } catch (error) {
    console.error('Error getting cart items:', error);
    throw error instanceof Error ? error : new Error('Ошибка при получении списка книг в корзине');
  }
};

export const removeFromCart = async (itemId: number): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Требуется авторизация');
  }

  try {
    const response = await fetch(`${API_URL}/cart/items/${itemId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Не удалось удалить книгу из корзины');
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error instanceof Error ? error : new Error('Ошибка при удалении из корзины');
  }
}; 