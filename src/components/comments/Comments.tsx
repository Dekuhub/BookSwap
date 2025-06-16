import React, { useState, useEffect } from 'react';
import { useUser } from '../../contexts/UserContext';
import { getBookComments, createComment } from '../../api/comments';
import type { Comment } from '../../types/book';
import { DEFAULT_AVATAR } from '../../constants/images';

interface CommentsProps {
  bookId: number;
}

const Comments: React.FC<CommentsProps> = ({ bookId }) => {
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [error, setError] = useState<string | null>(null);
  const pageSize = 10;

  const fetchComments = async (page: number = 0) => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching comments for page:', page);
      const result = await getBookComments(bookId, page, pageSize);
      console.log('Received comments:', result);
      setComments(result.comments);
      setTotal(result.pagination.total);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setError(error instanceof Error ? error.message : 'Не удалось загрузить комментарии');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Effect triggered with page:', currentPage);
    fetchComments(currentPage);
  }, [bookId, currentPage]);

  const totalPages = Math.ceil(total / pageSize);

  const handlePageChange = (page: number) => {
    console.log('Changing page to:', page);
    setCurrentPage(page);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedComment = newComment.trim();
    if (!trimmedComment || !user || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      console.log('Attempting to create comment:', { bookId, text: trimmedComment });
      const createdComment = await createComment(bookId, trimmedComment);
      console.log('Comment created successfully:', createdComment);
      
      setNewComment('');
      setTotal(prev => prev + 1);
      
      if (currentPage === 0) {
        setComments(prev => [createdComment, ...prev.slice(0, pageSize - 1)]);
      } else {
        setCurrentPage(0);
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
      setError(error instanceof Error ? error.message : 'Не удалось добавить комментарий');
      
      // Показываем ошибку пользователю
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Не удалось добавить комментарий. Пожалуйста, попробуйте позже.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    console.log('Rendering pagination. Total pages:', totalPages, 'Current page:', currentPage);

    const pages = [];
    const maxVisiblePages = 10;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    // Кнопка "Назад"
    if (currentPage > 0) {
      pages.push(
        <button
          key="prev"
          onClick={() => handlePageChange(currentPage - 1)}
          className="px-3 py-2 bg-[#2D2D2D] text-[#999] hover:bg-[#3D3D3D] rounded-l-md border-r border-[#444]"
        >
          ←
        </button>
      );
    }

    // Первая страница
    if (startPage > 0) {
      pages.push(
        <button
          key={0}
          onClick={() => handlePageChange(0)}
          className="px-3 py-2 bg-[#2D2D2D] text-[#999] hover:bg-[#3D3D3D] border-r border-[#444]"
        >
          1
        </button>
      );
      if (startPage > 1) {
        pages.push(
          <span key="dots1" className="px-3 py-2 bg-[#2D2D2D] text-[#999] border-r border-[#444]">
            ...
          </span>
        );
      }
    }

    // Номера страниц
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 ${
            currentPage === i
              ? 'bg-[#FF6B00] text-white'
              : 'bg-[#2D2D2D] text-[#999] hover:bg-[#3D3D3D]'
          } border-r border-[#444]`}
        >
          {i + 1}
        </button>
      );
    }

    // Последняя страница
    if (endPage < totalPages - 1) {
      if (endPage < totalPages - 2) {
        pages.push(
          <span key="dots2" className="px-3 py-2 bg-[#2D2D2D] text-[#999] border-r border-[#444]">
            ...
          </span>
        );
      }
      pages.push(
        <button
          key={totalPages - 1}
          onClick={() => handlePageChange(totalPages - 1)}
          className="px-3 py-2 bg-[#2D2D2D] text-[#999] hover:bg-[#3D3D3D] border-r border-[#444]"
        >
          {totalPages}
        </button>
      );
    }

    // Кнопка "Вперед"
    if (currentPage < totalPages - 1) {
      pages.push(
        <button
          key="next"
          onClick={() => handlePageChange(currentPage + 1)}
          className="px-3 py-2 bg-[#2D2D2D] text-[#999] hover:bg-[#3D3D3D] rounded-r-md"
        >
          →
        </button>
      );
    }

    return (
      <div className="flex justify-center mt-6 border border-[#444] rounded-md overflow-hidden">
        {pages}
      </div>
    );
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4 text-white">
        Комментарии {total > 0 && `(${total})`}
      </h3>
      
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 text-red-200 rounded-md border border-red-700">
          {error}
        </div>
      )}

      {user && (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-4 border rounded-md resize-none bg-[#3D3D3D] border-[#444] text-white min-h-[100px]"
            placeholder="Напишите комментарий..."
            disabled={submitting}
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="mt-2 px-6 py-2 bg-[#FF6B00] text-white rounded-md hover:bg-[#E55D00] disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {submitting ? 'Отправка...' : 'Добавить комментарий'}
          </button>
        </form>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#FF6B00]"></div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="p-6 border border-[#444] rounded-md bg-[#2D2D2D] w-full">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <img
                      src={comment.user?.avatar || DEFAULT_AVATAR}
                      alt={comment.user?.username || 'Пользователь'}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 mb-2">
                      <span className="font-medium text-white text-base sm:text-lg">
                        {comment.user?.username || 'Пользователь'}
                      </span>
                      <span className="text-xs sm:text-sm text-gray-400">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-300 break-words whitespace-pre-wrap">
                      {comment.text}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default Comments; 