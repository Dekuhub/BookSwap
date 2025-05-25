import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LoginFormData, TokenResponse } from '../../types/auth';
import { login } from '../../api/auth';
import { SHOW_PASSWORD, HIDE_PASSWORD } from '../../constants/images';
import { useUser } from '../../contexts/UserContext';
import { getUserById } from '../../api/users';

interface LoginProps {
  onSwitchToRegister: () => void;
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ onSwitchToRegister, onClose }) => {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    login: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await login(formData);
      const data = await response.json();

      if (response.ok) {
        // Сохраняем токены и ID пользователя
        localStorage.setItem('token', data.token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_id', data.user_id.toString());
        
        // Получаем данные пользователя
        const userData = await getUserById(data.user_id);
        setUser(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        // Закрываем модальное окно
        onClose();
        
        // Перенаправляем на страницу книг
        navigate('/books');
      } else {
        setError(data.error || 'Ошибка входа');
      }
    } catch (err) {
      setError('Ошибка входа');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center">
      <div className="bg-[#2D2D2D] rounded-lg w-[90%] max-w-[400px] p-8 shadow-lg relative">
        <div className="text-center mb-6">
          <h5 className="text-white text-2xl m-0 pb-3 border-b-2 border-[#FF6B00] inline-block">
            <span className="text-white no-underline px-4 transition-colors duration-300 hover:text-[#FF6B00]">
              Вход
            </span>
          </h5>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <input
            type="text"
            name="login"
            placeholder="Логин"
            value={formData.login}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#3D3D3D] border border-[#444] rounded-md text-white text-base transition-all duration-300 focus:outline-none focus:border-[#FF6B00]"
            required
            disabled={isLoading}
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Пароль"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#3D3D3D] border border-[#444] rounded-md text-white text-base transition-all duration-300 focus:outline-none focus:border-[#FF6B00]"
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0 m-0"
            >
              <img
                src={showPassword ? HIDE_PASSWORD : SHOW_PASSWORD}
                alt={showPassword ? "Скрыть пароль" : "Показать пароль"}
                className="w-5 h-5 invert-[0.8] hover:invert-100"
              />
            </button>
          </div>

          <div className="text-center mt-5">
            <button
              type="submit"
              className="w-full bg-[#FF6B00] text-white border-none py-3 rounded-md font-bold text-base cursor-pointer transition-colors duration-300 hover:bg-[#E55D00] disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Вход...' : 'Войти'}
            </button>
          </div>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-[#FF6B00] bg-transparent border-none text-sm cursor-pointer hover:text-[#E55D00]"
              disabled={isLoading}
            >
              Нет аккаунта? Зарегистрироваться
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login; 