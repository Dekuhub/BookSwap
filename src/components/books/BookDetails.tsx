import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBook } from '../../api/books';
import { getTags } from '../../api/tags';
import type { Book } from '../../types/book';
import type { Tag } from '../../types/tag';
import LazyImage from '../common/LazyImage';
import EditBook from './EditBook';
import { useUser } from '../../contexts/UserContext';

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
    <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center overflow-y-auto">
      <div className="bg-[#2D2D2D] rounded-lg w-[90%] max-w-4xl p-8 m-4 relative">
        {/* Кнопка закрытия */}
        <button
          onClick={onClose}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Галерея изображений */}
          <div className="space-y-4">
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
                className="w-full h-full"
              />
              <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors rounded-lg flex items-center justify-center opacity-0 hover:opacity-100">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            {otherPhotos.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
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
                      className="w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/20 hover:bg-black/40 transition-colors rounded-lg" />
                  </div>
                ))}
              </div>
            )}
            {isOwner && (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditMode(true)}
                  className="flex-1 px-4 py-2 bg-[#FF6B00] text-white rounded-full hover:bg-[#E55D00] transition-colors"
                >
                  Редактировать
                </button>
              </div>
            )}
          </div>

          {/* Информация о книге */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{book.title}</h2>
              <p className="text-xl text-[#999]">{book.author}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white">Описание</h3>
              <p className="text-[#999] leading-relaxed">{book.description}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white">Состояние</h3>
              <p className="text-[#999]">
                {book.state_id === 1 && 'Отличное'}
                {book.state_id === 2 && 'Хорошее'}
                {book.state_id === 3 && 'Удовлетворительное'}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-medium text-white">Теги</h3>
              <div className="flex flex-wrap gap-2">
                {(book.tags || []).length > 0 ? (
                  book.tags.map(tag => (
                    <span
                      key={tag.id}
                      className="px-3 py-1 bg-[#3D3D3D] text-white rounded-full text-sm"
                    >
                      {tag.name}
                    </span>
                  ))
                ) : (
                  <span className="text-[#999]">Нет тегов</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Полноэкранный просмотр изображений */}
      {showImageViewer && (
        <div className="fixed inset-0 bg-black z-[1100] flex items-center justify-center">
          <button
            onClick={() => setShowImageViewer(false)}
            className="absolute top-4 right-4 text-white/60 hover:text-white"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
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
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default BookDetails; 