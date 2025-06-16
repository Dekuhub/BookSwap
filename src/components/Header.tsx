import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

interface HeaderProps {
  onLoginClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLoginClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/books/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="border-b border-[#2D2D2D] py-4">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Логотип */}
          <Link to="/" className="flex items-center">
            <img 
              src="/images/Logo.png" 
              alt="BookSwap" 
              className="h-16 w-auto object-contain"
            />
          </Link>

          {/* Навигация */}
          <nav className="flex items-center space-x-8 ml-8">
            <Link
              to="/main"
              className={`text-base transition-colors ${
                location.pathname === '/main'
                  ? 'text-[#FF6B00]'
                  : 'text-[#999999] hover:text-[#FF6B00]'
              }`}
            >
              Главная
            </Link>
            <Link
              to="/catalog"
              className={`text-base transition-colors ${
                location.pathname === '/catalog'
                  ? 'text-[#FF6B00]'
                  : 'text-[#999999] hover:text-[#FF6B00]'
              }`}
            >
              Каталог
            </Link>
            <Link
              to="/contacts"
              className={`text-base transition-colors ${
                location.pathname === '/contacts'
                  ? 'text-[#FF6B00]'
                  : 'text-[#999999] hover:text-[#FF6B00]'
              }`}
            >
              Контакты
            </Link>
          </nav>

          {/* Поиск */}
          <div className="flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск..."
                className="w-full bg-transparent border border-[#2D2D2D] rounded-full px-4 py-2 text-white placeholder-[#999999] focus:outline-none focus:border-[#FF6B00]"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#999999] hover:text-[#FF6B00]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Отложенные и Профиль */}
          <div className="flex items-center space-x-4">
            <Link
              to="/favorites"
              className="flex items-center px-4 py-2 text-white hover:text-[#FF6B00] transition-colors border border-[#2D2D2D] rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              Отложенные
            </Link>
            {user ? (
              <Link
                to={`/users/${user.id}`}
                className="flex items-center px-4 py-2 text-white hover:text-[#FF6B00] transition-colors border border-[#2D2D2D] rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Профиль
              </Link>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center px-4 py-2 text-white hover:text-[#FF6B00] transition-colors border border-[#2D2D2D] rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Войти
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}; 