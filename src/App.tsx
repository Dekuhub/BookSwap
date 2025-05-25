import { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './components/Header';
import AppRoutes from './routes/AppRoutes';
import { UserProvider } from './contexts/UserContext';
import AuthModal from './components/auth/AuthModal';

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <UserProvider>
        <div className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed" style={{ backgroundImage: 'url("/images/background.png")' }}>
          <Header onLoginClick={() => setIsAuthModalOpen(true)} />
          <main className="flex-grow">
            <AppRoutes />
          </main>
          {isAuthModalOpen && (
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
            />
          )}
        </div>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
