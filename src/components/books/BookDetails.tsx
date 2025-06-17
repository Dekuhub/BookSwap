import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBook } from '../../api/books';
import { getTags } from '../../api/tags';
import type { Book } from '../../types/book';
import type { Tag } from '../../types/tag';
import LazyImage from '../common/LazyImage';
import EditBook from './EditBook';
import Comments from '../comments/Comments';
import { useUser } from '../../contexts/UserContext';
import { deleteBook } from '../../api/books';
import { addToCart } from '../../api/cart';

interface BookDetailsProps {
  bookId: number;
  onClose: () => void;
}

const BookDetails: React.FC<BookDetailsProps> = ({ bookId, onClose }) => {
  const navigate = useNavigate();
  const { user } = useUser();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const isOwner = user?.id === book?.user_id;

  const fetchBook = async () => {
    if (!bookId || typeof bookId !== 'number') {
      setError('Некорректный идентификатор книги');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [bookData, tags] = await Promise.all([
        getBook(bookId),
        getTags()
      ]);
      console.log('Book data:', bookData);
      console.log('Tags:', tags);
      console.log('Book tags:', bookData.tags);
      setBook(bookData);
      setAvailableTags(tags);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch book:', err);
      setError('Не удалось загрузить информацию о книге');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  const handleAddToCart = async (type: 'buy' | 'exchange') => {
    console.log('handleAddToCart called with type:', type);
    console.log('Current book:', book);
    console.log('Current user:', user);
    
    if (!book) {
      console.log('No book data available');
      return;
    }
    
    if (!user) {
      console.log('No user data available');
      setCartError('Для добавления книги в отложенные необходимо войти в систему');
      return;
    }
    
    console.log('Adding to cart:', { bookId: book.id, type });
    setIsAddingToCart(true);
    setCartError(null);
    
    try {
      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Token value:', token);
      
      if (!token) {
        throw new Error('Требуется авторизация');
      }
      
      console.log('Calling addToCart API...');
      const result = await addToCart(book.id, type);
      console.log('Add to cart result:', result);
      
      setCartError(null);
      alert('Книга добавлена в отложенные');
      
      const cartEvent = new CustomEvent('cartUpdated');
      window.dispatchEvent(cartEvent);
    } catch (err) {
      console.error('Error adding to cart:', err);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
        console.error('Error stack:', err.stack);
        setCartError(err.message);
      } else {
        setCartError('Не удалось добавить книгу в отложенные');
      }
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleDelete = async () => {
    if (book) {
      if (window.confirm('Вы уверены, что хотите удалить эту книгу?')) {
        try {
          await deleteBook(book.id);
          navigate('/profile');
        } catch (error) {
          console.error('Error deleting book:', error);
          alert('Не удалось удалить книгу');
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center">
        <div className="bg-[#2D2D2D] p-6 rounded-lg max-w-md w-full">
          <p className="text-red-400">{error || 'Книга не найдена'}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-[#FF6B00] text-white rounded-full hover:bg-[#E55D00]"
          >
            Закрыть
          </button>
        </div>
      </div>
    );
  }

  if (isEditMode && book) {
    return (
      <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center overflow-y-auto">
        <div className="bg-[#2D2D2D] rounded-lg w-[90%] max-w-4xl p-8 m-4 relative">
          <button
            onClick={() => setIsEditMode(false)}
            className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <EditBook
            book={book}
            onSuccess={() => {
              setIsEditMode(false);
              fetchBook();
            }}
            onCancel={() => setIsEditMode(false)}
          />
        </div>
      </div>
    );
  }

  const mainPhoto = book.photos.find(photo => photo.is_main)?.photo_url || book.photos[0]?.photo_url;
  const otherPhotos = book.photos.filter(photo => !photo.is_main);

  return (
    <div className="fixed inset-0 bg-black/70 z-[1000] flex items-start justify-center overflow-y-auto p-4 sm:p-6">
      <div className="bg-[#2D2D2D] rounded-lg w-full max-w-4xl my-4 sm:my-8 relative">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white/60 hover:text-white transition-colors duration-300 p-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 sm:h-6 sm:w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="p-4 sm:p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
            {/* Галерея изображений */}
            <div className="space-y-3 sm:space-y-4">
              <div 
                className="relative aspect-[3/4] cursor-pointer rounded-lg overflow-hidden"
                onClick={() => {
                  setSelectedImageIndex(0);
                  setShowImageViewer(true);
                }}
              >
                <LazyImage
                  src={mainPhoto}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors rounded-lg" />
                {!isOwner && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Add to cart clicked');
                      if (book) {
                        handleAddToCart('buy');
                      }
                    }}
                    disabled={isAddingToCart}
                    className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-[#FF6B00] transition-all duration-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </button>
                )}
              </div>
              
              {otherPhotos.length > 0 && (
                <div className="grid grid-cols-4 gap-1 sm:gap-2">
                  {otherPhotos.map((photo, index) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square cursor-pointer rounded-lg overflow-hidden"
                      onClick={() => {
                        setSelectedImageIndex(index + 1);
                        setShowImageViewer(true);
                      }}
                    >
                      <LazyImage
                        src={photo.photo_url}
                        alt={`${book.title} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors rounded-lg" />
                    </div>
                  ))}
                </div>
              )}

              {/* Кнопки действий для владельца */}
              {isOwner && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="flex-1 px-4 py-2 bg-[#FF6B00] text-white rounded-full hover:bg-[#E55D00]"
                  >
                    Редактировать
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    Удалить
                  </button>
                </div>
              )}
            </div>

            {/* Информация о книге */}
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{book.title}</h1>
              <p className="text-[#999]">{book.author}</p>
              <p className="text-white">{book.description}</p>
              
              {/* Теги */}
              <div className="flex flex-wrap gap-2 mt-4">
                {book.tags.map(tag => (
                  <span
                    key={tag.id}
                    className="px-3 py-1 bg-[#FF6B00]/10 text-[#FF6B00] rounded-full text-sm"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>

              {/* Информация о владельце */}
              <div className="mt-6 pt-6 border-t border-[#404040]">
                <p className="text-[#999]">Добавил: {book.user?.username || 'Неизвестно'}</p>
                <p className="text-[#999]">Дата добавления: {new Date(book.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Комментарии */}
          <div className="mt-6 sm:mt-8 border-t border-[#444] pt-6 sm:pt-8">
            <Comments bookId={book.id} />
          </div>
        </div>
      </div>

      {/* Полноэкранный просмотр изображений */}
      {showImageViewer && (
        <div className="fixed inset-0 bg-black z-[1100] flex items-center justify-center p-4">
          <button
            onClick={() => setShowImageViewer(false)}
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white/60 hover:text-white p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 sm:h-8 sm:w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <img
            src={selectedImageIndex === 0 ? mainPhoto : otherPhotos[selectedImageIndex - 1].photo_url}
            alt={book.title}
            className="max-h-[85vh] max-w-[85vw] object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default BookDetails; 