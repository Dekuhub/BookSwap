import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Book } from '../../types/book';
import { getBooks } from '../../api/books';
import BookCard from './BookCard';
import { preloadImages } from '../../utils/imagePreloader';

const BookList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const pageSize = 10; // 5x2 grid

  const tagFilter = searchParams.get('tag');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError('');

        const { books: fetchedBooks, total: totalBooks } = await getBooks(currentPage, pageSize, tagFilter);
        
        const booksWithCovers = fetchedBooks.map(book => ({
          ...book,
          coverUrl: book.photos.find(photo => photo.is_main)?.photo_url || book.photos[0]?.photo_url || '',
          thumbnailUrl: book.photos.find(photo => photo.is_main)?.photo_url || book.photos[0]?.photo_url || ''
        }));

        setBooks(booksWithCovers);
        setTotal(totalBooks);

        // Предварительно загружаем изображения только для книг с фотографиями
        const firstSixBooks = booksWithCovers
          .slice(0, 6)
          .filter(book => book.coverUrl);

        if (firstSixBooks.length > 0) {
          try {
            await preloadImages(firstSixBooks.map(book => book.coverUrl));
          } catch (preloadError) {
            console.warn('Error preloading images:', preloadError);
            // Не прерываем работу компонента при ошибке предзагрузки
          }
        }
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(err instanceof Error ? err.message : 'Ошибка загрузки книг');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [currentPage, tagFilter]);

  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl text-white text-center mb-12">Предложения</h1>
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
        <h1 className="text-4xl text-white text-center mb-12">Предложения</h1>
        <div className="p-4 bg-red-900/50 text-red-200 rounded-md border border-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-white mb-4">
          {tagFilter ? `Книги с тегом "${tagFilter}" не найдены` : 'Книги не найдены'}
        </h2>
        <p className="text-white/60 mb-6">Станьте первым, кто добавит книгу!</p>
        <Link
          to="/books/add"
          className="inline-flex items-center px-4 py-2 border-2 border-[#FF6B00] text-sm font-medium rounded-md text-white hover:bg-[#FF6B00]/10 transition-all duration-300"
        >
          Добавить книгу
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl text-white text-center mb-12">Предложения</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {books.map((book, index) => (
          <BookCard
            key={book.id}
            {...book}
            isPriority={index < 6}
          />
        ))}
      </div>
      
      {totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-md text-sm ${
                currentPage === page
                  ? 'bg-[#FF6B00] text-white'
                  : 'bg-[#3D3D3D] text-[#999] hover:bg-[#FF6B00]/10'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookList; 