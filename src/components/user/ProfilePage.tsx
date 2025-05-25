import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getUserById, getUserBooks } from '../../api/users';
import type { User } from '../../types/user';
import type { Book } from '../../types/book';
import { DEFAULT_AVATAR } from '../../constants/images';
import AddBook from '../books/AddBook';
import BookCard from '../books/BookCard';
import EditProfileModal from './EditProfileModal';
import { useUser } from '../../contexts/UserContext';

interface StatBlockProps {
  label: string;
  value: number;
}

const StatBlock: React.FC<StatBlockProps> = ({ label, value }) => (
  <div className="text-center p-3 bg-[#3D3D3D] rounded-lg">
    <div className="text-2xl sm:text-3xl md:text-4xl font-light text-white mb-2">{value}</div>
    <div className="text-[#999] text-xs sm:text-sm">{label}</div>
  </div>
);

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useUser();
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const pageSize = 8;
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);

  const isCurrentUserProfile = currentUser?.id === Number(id);

  const loadUserData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const userData = await getUserById(parseInt(id));
      setUser(userData);
      
      const { books: userBooks, total } = await getUserBooks(parseInt(id), currentPage, pageSize);
      setBooks(userBooks);
      setTotalBooks(total);
      setError(null);
    } catch (err) {
      console.error('Error loading user data:', err);
      setError(err instanceof Error ? err.message : 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [id, currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-900/50 text-red-200 rounded-md border border-red-700">
        {error}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center text-white">
        Пользователь не найден
      </div>
    );
  }

  const totalPages = Math.ceil(totalBooks / pageSize);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-4 sm:py-8">
      <div className="bg-[#2D2D2D] rounded-lg p-4 sm:p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-8">
          <div className="w-full md:w-[200px] max-w-[200px] mx-auto md:mx-0 flex-shrink-0">
            <div className="aspect-square relative">
              <img 
                src={user?.avatar || DEFAULT_AVATAR} 
                alt={user?.username} 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          </div>
          <div className="flex-grow">
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 mb-6">
              <div className="text-center sm:text-left">
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{user?.username}</h1>
                <p className="text-[#999]">{user?.email}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                {isCurrentUserProfile && (
                  <>
                    <button
                      onClick={() => setIsEditProfileModalOpen(true)}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 border-2 border-[#FF6B00] text-white rounded-full hover:bg-[#FF6B00]/10 transition-colors text-sm sm:text-base"
                    >
                      Редактировать профиль
                    </button>
                    <button
                      onClick={() => setIsAddBookModalOpen(true)}
                      className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-[#FF6B00] text-white rounded-full hover:bg-[#E55D00] transition-colors text-sm sm:text-base"
                    >
                      Опубликовать книгу
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
              <StatBlock label="Книги" value={totalBooks} />
              <StatBlock label="Подписчики" value={user?.followers_count || 0} />
              <StatBlock label="Подписки" value={user?.following_count || 0} />
              <StatBlock label="Рейтинг" value={user?.rating || 0} />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Книги пользователя</h2>
        
        {books.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  {...book}
                  coverUrl={book.photos.find(photo => photo.is_main)?.photo_url || book.photos[0]?.photo_url}
                  thumbnailUrl={book.photos.find(photo => photo.is_main)?.photo_url || book.photos[0]?.photo_url}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-6 sm:mt-8 space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base ${
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
          </>
        ) : (
          <div className="text-center py-8 sm:py-12 text-[#999]">
            <p className="mb-4">У пользователя пока нет книг</p>
            {isCurrentUserProfile && (
              <button
                onClick={() => setIsAddBookModalOpen(true)}
                className="px-6 py-2 bg-[#FF6B00] text-white rounded-full hover:bg-[#E55D00] transition-colors text-sm sm:text-base"
              >
                Опубликовать первую книгу
              </button>
            )}
          </div>
        )}
      </div>

      {/* Модальные окна */}
      {isEditProfileModalOpen && user && (
        <EditProfileModal
          userId={user.id}
          currentUsername={user.username}
          currentAvatar={user.avatar}
          onClose={() => setIsEditProfileModalOpen(false)}
          onSuccess={() => {
            loadUserData();
            setIsEditProfileModalOpen(false);
          }}
        />
      )}

      {isAddBookModalOpen && (
        <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#2D2D2D] rounded-lg w-[90%] max-w-[800px] my-8">
            <div className="p-4 sm:p-8 relative">
              <button
                onClick={() => setIsAddBookModalOpen(false)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white/60 hover:text-white transition-colors duration-300"
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
              <AddBook onSuccess={() => {
                setIsAddBookModalOpen(false);
                loadUserData();
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage; 