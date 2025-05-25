import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BookDetails from '../components/books/BookDetails';

const BookDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Проверяем, что id существует и является числом
  const bookId = id ? parseInt(id, 10) : undefined;

  if (!bookId || isNaN(bookId)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-[#2D2D2D] p-6 rounded-lg max-w-md mx-auto">
          <p className="text-red-400">Некорректный идентификатор книги</p>
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
    <BookDetails
      bookId={bookId}
      onClose={() => navigate('/books')}
    />
  );
};

export default BookDetailsPage; 