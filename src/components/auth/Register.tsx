import React, { useState } from 'react';
import type { RegisterFormData } from '../../types/auth';
import { register } from '../../api/auth';
import { SHOW_PASSWORD, HIDE_PASSWORD } from '../../constants/images';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    login: '',
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await register(formData);

      if (response.ok) {
        setSuccess(true);
        setError('');
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Ошибка регистрации');
      }
    } catch (err) {
      setError('Ошибка регистрации');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="text-red-500 text-sm text-center">{error}</div>
      )}
      
      {success && (
        <div className="text-green-500 text-sm text-center">
          Регистрация успешна! Сейчас вы будете перенаправлены на страницу входа.
        </div>
      )}

      <input
        type="text"
        name="login"
        placeholder="Логин"
        value={formData.login}
        onChange={handleChange}
        className="w-full px-4 py-3 bg-[#3D3D3D] border border-[#444] rounded-md text-white text-base transition-all duration-300 focus:outline-none focus:border-[#FF6B00]"
        required
      />

      <input
        type="text"
        name="username"
        placeholder="Имя пользователя"
        value={formData.username}
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
          disabled={success}
        >
          Зарегистрироваться
        </button>
      </div>

      <div className="text-center mt-4">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[#FF6B00] bg-transparent border-none text-sm cursor-pointer hover:text-[#E55D00]"
        >
          Уже есть аккаунт? Войти
        </button>
      </div>
    </form>
  );
};

export default Register; 