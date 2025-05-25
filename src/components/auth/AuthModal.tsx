import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [login, setLogin] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { login: loginUser, register } = useUser();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isLogin && password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        await loginUser(login, password);
      } else {
        await register(username, login, password);
      }
      onClose();
    } catch (err) {
      console.error('Auth error:', err);
      setError(err instanceof Error ? err.message : 'Ошибка авторизации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchMode = (mode: boolean) => {
    setIsLogin(mode);
    setError('');
    setLogin('');
    setUsername('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center p-4">
      <div className="bg-[#2D2D2D] rounded-lg w-[90%] max-w-[400px] my-8">
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleSwitchMode(true)}
                className={`text-lg font-medium ${isLogin ? 'text-white' : 'text-[#999]'}`}
              >
                Вход
              </button>
              <span className="text-[#999]">/</span>
              <button
                onClick={() => handleSwitchMode(false)}
                className={`text-lg font-medium ${!isLogin ? 'text-white' : 'text-[#999]'}`}
              >
                Регистрация
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-900/50 text-red-200 rounded-md border border-red-700 text-sm">
                {error}
              </div>
            )}

            {isLogin ? (
              <div>
                <input
                  type="text"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  className="w-full px-4 py-3 bg-[#3D3D3D] rounded-md text-white placeholder-[#999] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  placeholder="Логин"
                />
              </div>
            ) : (
              <>
                <div>
                  <input
                    type="text"
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="w-full px-4 py-3 bg-[#3D3D3D] rounded-md text-white placeholder-[#999] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                    placeholder="Логин"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-[#3D3D3D] rounded-md text-white placeholder-[#999] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                    placeholder="Имя пользователя"
                  />
                </div>
              </>
            )}

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#3D3D3D] rounded-md text-white placeholder-[#999] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                placeholder="Пароль"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z"} />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showPassword ? "M17.25 17.25A9.956 9.956 0 0112 19c-4.418 0-8-2.015-8-4.5 0-1.41 1.409-2.67 3.627-3.47M21.75 12c0 .27-.06.53-.168.78-.107.25-.272.49-.49.71M12 5c4.418 0 8 2.015 8 4.5 0 .596-.252 1.158-.682 1.68" : "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"} />
                </svg>
              </button>
            </div>

            {!isLogin && (
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-[#3D3D3D] rounded-md text-white placeholder-[#999] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
                  placeholder="Подтвердите пароль"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showConfirmPassword ? "M3 3l18 18M10.5 10.677a2 2 0 002.823 2.823" : "M15 12a3 3 0 11-6 0 3 3 0 016 0z"} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showConfirmPassword ? "M17.25 17.25A9.956 9.956 0 0112 19c-4.418 0-8-2.015-8-4.5 0-1.41 1.409-2.67 3.627-3.47M21.75 12c0 .27-.06.53-.168.78-.107.25-.272.49-.49.71M12 5c4.418 0 8 2.015 8 4.5 0 .596-.252 1.158-.682 1.68" : "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"} />
                  </svg>
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-4 py-3 bg-[#FF6B00] text-white rounded-md hover:bg-[#E55D00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? 'Загрузка...' : (isLogin ? 'Продолжить' : 'Зарегистрироваться')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AuthModal; 