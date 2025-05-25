import React, { useState } from 'react';
import { SHOW_PASSWORD, HIDE_PASSWORD } from '../constants/images';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    login: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Добавьте здесь логику входа
    console.log('Login data:', formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 z-[1000] flex items-center justify-center">
      <div className="bg-[#2D2D2D] rounded-lg w-[90%] max-w-[400px] p-8 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors duration-300"
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

        <div className="text-center mb-6">
          <h5 className="text-white text-2xl m-0 pb-3 border-b-2 border-[#FF6B00] inline-block">
            <span className="text-white no-underline px-4 transition-colors duration-300 hover:text-[#FF6B00]">
              Вход
            </span>
          </h5>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="login"
            placeholder="Логин"
            value={formData.login}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#3D3D3D] border border-[#444] rounded-md text-white text-base transition-all duration-300 focus:outline-none focus:border-[#FF6B00]"
            required
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
              className="w-full bg-[#FF6B00] text-white border-none py-3 rounded-md font-bold text-base cursor-pointer transition-colors duration-300 hover:bg-[#E55D00]"
            >
              Войти
            </button>
          </div>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-[#FF6B00] bg-transparent border-none text-sm cursor-pointer hover:text-[#E55D00]"
            >
              Нет аккаунта? Зарегистрироваться
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal; 