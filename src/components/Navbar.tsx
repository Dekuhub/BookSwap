import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

const Navbar: React.FC = () => {
  const { user, logout } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-[#2D2D2D] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex items-center">
              <span className="text-white text-xl font-bold">BookSwap</span>
            </Link>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-4">
            <Link
              to="/books"
              className="text-[#999] hover:text-white px-3 py-2 rounded-md text-sm font-medium"
            >
              Книги
            </Link>
            {user && (
              <>
                <Link
                  to="/cart"
                  className="text-[#999] hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Отложенные
                </Link>
                <Link
                  to="/profile"
                  className="text-[#999] hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Профиль
                </Link>
                <button
                  onClick={logout}
                  className="text-[#999] hover:text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Выйти
                </button>
              </>
            )}
            {!user && (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="text-[#999] hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Войти
              </button>
            )}
          </div>

          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-[#999] hover:text-white p-2 rounded-md"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/books"
              className="text-[#999] hover:text-white block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Книги
            </Link>
            {user && (
              <>
                <Link
                  to="/cart"
                  className="text-[#999] hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Отложенные
                </Link>
                <Link
                  to="/profile"
                  className="text-[#999] hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Профиль
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="text-[#999] hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                >
                  Выйти
                </button>
              </>
            )}
            {!user && (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="text-[#999] hover:text-white block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                Войти
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 