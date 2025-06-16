import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Book } from '../../types/book';
import { getBooks } from '../../api/books';
import BookCard from './BookCard';
import { preloadImages } from '../../utils/imagePreloader';

const BookSearch: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = searchParams.get('q') || '';

        // Если запрос является тегом, передаем его как tagFilter в getBooks
        // Если это просто поисковый запрос, getBooks будет фильтровать по нему, если API поддерживает
        const { books: searchResults } = await getBooks(1, 20, query); // Передаем query как tagFilter
        
        const booksWithCovers = searchResults.map(book => ({
          ...book,
          coverUrl: book.photos.find(photo => photo.is_main)?.photo_url || book.photos[0]?.photo_url || '',
          thumbnailUrl: book.photos.find(photo => photo.is_main)?.photo_url || book.photos[0]?.photo_url || ''
        }));

        // Фильтруем книги на стороне клиента по запросу (если это не тег)
        const filteredBooks = booksWithCovers.filter(book => {
          const searchLower = query.toLowerCase();
          // Проверяем, соответствует ли книга поисковому запросу ИЛИ любому из ее тегов
          return (
            book.title.toLowerCase().includes(searchLower) ||
            book.author.toLowerCase().includes(searchLower) ||
            book.description.toLowerCase().includes(searchLower) ||
            book.tags.some(tag => tag.name.toLowerCase().includes(searchLower))
          );
        });

        setBooks(filteredBooks);

        // Предварительная загрузка изображений
        const firstSixBooks = filteredBooks
          .slice(0, 6)
          .filter(book => book.coverUrl);

        if (firstSixBooks.length > 0) {
          try {
            await preloadImages(firstSixBooks.map(book => book.coverUrl));
          } catch (preloadError) {
            console.warn('Error preloading images:', preloadError);
          }
        }

      } catch (err) {
        console.error('Search failed:', err);
        setError('Не удалось выполнить поиск');
      } finally {
        setLoading(false);
      }
    };

    searchBooks();
  }, [searchParams]);

  return (
    <div className="container mx-auto px-4 py-8">
      {loading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-center mb-4">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              {...book}
            />
          ))}
        </div>
      )}

      {!loading && !error && books.length === 0 && (
        <div className="text-center text-gray-400">
          Книги не найдены
        </div>
      )}
    </div>
  );
};

export default BookSearch; 