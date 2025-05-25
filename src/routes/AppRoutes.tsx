import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { CatalogPage } from '../components/CatalogPage';
import BookList from '../components/books/BookList';
import AddBook from '../components/books/AddBook';
import BookDetailsPage from '../pages/BookDetailsPage';
import ProfilePage from '../components/user/ProfilePage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/main" replace />} />
      <Route path="/main" element={
        <>
          <h1 className="text-4xl text-white text-center mb-12 font-light">Предложения</h1>
          <BookList />
        </>
      } />
      <Route path="/catalog" element={<CatalogPage />} />
      <Route path="/books" element={<BookList />} />
      <Route path="/books/add" element={<AddBook />} />
      <Route path="/books/:id" element={<BookDetailsPage />} />
      <Route path="/users/:id" element={<ProfilePage />} />
      <Route path="/contacts" element={
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl text-white text-center mb-12 font-light">Контакты</h1>
          {/* Здесь будет содержимое страницы контактов */}
        </div>
      } />
    </Routes>
  );
};

export default AppRoutes; 