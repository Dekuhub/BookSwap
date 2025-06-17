import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CartItem } from '../../api/cart';
import { getCartItems, removeFromCart } from '../../api/cart';

interface CartResponse {
  id: number;
  user_id: number;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

const CartPage: React.FC = () => {
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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#2D2D2D] p-6 rounded-lg max-w-md mx-auto">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => navigate('/books')}
            className="mt-4 px-4 py-2 bg-[#FF6B00] text-white rounded-full hover:bg-[#E55D00]"
          >
            Вернуться к списку книг
          </button>
        </div>
      </div>
    );
  }

  if (!Array.isArray(cartItems)) {
    console.error('cartItems is not an array:', cartItems);
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#2D2D2D] p-6 rounded-lg max-w-md mx-auto">
          <p className="text-red-400">Ошибка: неверный формат данных</p>
          <button
            onClick={() => navigate('/books')}
            className="mt-4 px-4 py-2 bg-[#FF6B00] text-white rounded-full hover:bg-[#E55D00]"
          >
            Вернуться к списку книг
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-white">Отложенные книги</h1>
      
      {cartItems.length === 0 ? (
        <div className="bg-[#2D2D2D] p-6 rounded-lg text-center">
          <p className="text-[#999] mb-4">У вас пока нет отложенных книг</p>
          <button
            onClick={() => navigate('/books')}
            className="px-6 py-2 bg-[#FF6B00] text-white rounded-full hover:bg-[#E55D00]"
          >
            Перейти к книгам
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cartItems.map((item) => {
            console.log('Cart item:', item);
            
            if (!item.book) {
              console.error('Book data is missing for item:', item);
              return (
                <div key={item.id} className="bg-[#2D2D2D] rounded-lg overflow-hidden p-4">
                  <div className="flex flex-col items-center justify-center h-48">
                    <p className="text-red-400 mb-4">Книга недоступна</p>
                    <button
                      onClick={() => handleRemoveFromCart(item.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      Удалить из корзины
                    </button>
                  </div>
                </div>
              );
            }

            const mainPhoto = item.book.photos?.find(p => p.is_main)?.photo_url || 
                            item.book.photos?.[0]?.photo_url || 
                            '/placeholder-book.jpg';

            return (
              <div key={item.id} className="bg-[#2D2D2D] rounded-lg overflow-hidden">
                <div className="relative aspect-[3/4]">
                  <img
                    src={mainPhoto}
                    alt={item.book.title || 'Книга'}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2 hover:bg-red-700 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-white mb-2">{item.book.title || 'Без названия'}</h3>
                  <p className="text-[#999] mb-2">{item.book.author || 'Автор не указан'}</p>
                  <p className="text-sm text-[#999] mb-4 line-clamp-2">{item.book.description || 'Описание отсутствует'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#FF6B00]">
                      {item.type === 'buy' ? 'Покупка' : 'Обмен'}
                    </span>
                    <button
                      onClick={() => navigate(`/books/${item.book.id}`)}
                      className="px-4 py-2 bg-[#FF6B00] text-white rounded-full hover:bg-[#E55D00] text-sm"
                    >
                      Подробнее
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CartPage; 