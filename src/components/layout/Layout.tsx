import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white w-full">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg w-full">
        <nav className="w-full px-4 py-4">
          <div className="container mx-auto flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300">
              BookTrading
            </Link>
            <div className="space-x-6">
              <Link
                to="/books"
                className={`text-lg ${
                  isActive('/books')
                    ? 'text-blue-400'
                    : 'text-gray-300 hover:text-blue-400'
                }`}
              >
                Books
              </Link>
              <Link
                to="/books/add"
                className={`text-lg ${
                  isActive('/books/add')
                    ? 'text-blue-400'
                    : 'text-gray-300 hover:text-blue-400'
                }`}
              >
                Add Book
              </Link>
              <Link
                to="/tags"
                className={`text-lg ${
                  isActive('/tags')
                    ? 'text-blue-400'
                    : 'text-gray-300 hover:text-blue-400'
                }`}
              >
                Tags
              </Link>
              <Link
                to="/profile"
                className={`text-lg ${
                  isActive('/profile')
                    ? 'text-blue-400'
                    : 'text-gray-300 hover:text-blue-400'
                }`}
              >
                Profile
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full px-4 py-8">
        <div className="container mx-auto">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6 w-full">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-xl font-bold text-blue-400">BookTrading</h3>
              <p className="text-sm mt-2">Share your books with the world</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-blue-400">
                About
              </a>
              <a href="#" className="hover:text-blue-400">
                Contact
              </a>
              <a href="#" className="hover:text-blue-400">
                Terms
              </a>
            </div>
          </div>
          <div className="mt-6 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} BookTrading. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 