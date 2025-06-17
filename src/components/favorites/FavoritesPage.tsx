import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CartItem } from '../../api/cart';
import { getCartItems, removeFromCart } from '../../api/cart';
import BookCard from '../books/BookCard';

const FavoritesPage: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCartItems = async () => {
    try {
      const items = await getCartItems();
      console.log('Received cart items:', items);
      
      if (!Array.isArray(items)) {
        console.error('Invalid cart items:', items);
        setError('Неверный формат данных от сервера');
        return;
      }
      
      setCartItems(items);
      setError(null);
    } catch (err) {
      console.error('Error fetching cart items:', err);
      setError('Не удалось загрузить отложенные книги');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleRemoveFromCart = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
      setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing from cart:', err);
      setError('Не удалось удалить книгу из отложенных');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl text-white text-center mb-12">Отложенные книги</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {[...Array(10)].map((_, index) => (
            <div key={index} className="aspect-[3/4] bg-[#2D2D2D] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl text-white text-center mb-12">Отложенные книги</h1>
        <div className="p-4 bg-red-900/50 text-red-200 rounded-md border border-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">
          У вас пока нет отложенных книг
        </h2>
        <p className="text-white/60 mb-6">Добавьте книги в отложенные, чтобы вернуться к ним позже</p>
        <button
          onClick={() => navigate('/books')}
          className="inline-flex items-center px-4 py-2 border-2 border-[#FF6B00] text-sm font-medium rounded-md text-white hover:bg-[#FF6B00]/10 transition-all duration-300"
        >
          Перейти к книгам
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl text-white text-center mb-12">Отложенные книги</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {cartItems.map((item) => {
          if (!item.book) {
            console.error('Book data is missing for item:', item);
            return null;
          }

          console.log('Book data:', item.book);
          const mainPhoto = item.book.photos?.find(p => p.is_main)?.photo_url || 
                          item.book.photos?.[0]?.photo_url || 
                          '/placeholder-book.jpg';
          console.log('Main photo URL:', mainPhoto);

          return (
            <div key={item.id} className="relative group">
              <BookCard
                {...item.book}
                coverUrl={mainPhoto}
                isPriority={false}
              />
              <button
                onClick={() => handleRemoveFromCart(item.id)}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FavoritesPage; 