import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi } from '../api/auth';
import type { TokenResponse } from '../types/auth';
import { config } from '../config';

interface User {
  id: number;
  login: string;
  username: string;
}

interface UserContextType {
  user: User | null;
  login: (login: string, password: string) => Promise<void>;
  register: (username: string, login: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const API_URL = config.API_URL;

async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Ошибка запроса');
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');

      if (token && userId) {
        try {
          // Проверяем валидность токена
          const response = await fetchWithAuth(`${API_URL}/auth/validate`);
          if (!response.ok) {
            throw new Error('Token is invalid');
          }
          setUser({
            id: Number(userId),
            login: localStorage.getItem('login') || '',
            username: localStorage.getItem('username') || ''
          });
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('login');
          localStorage.removeItem('username');
          setUser(null);
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const loginHandler = async (login: string, password: string) => {
    try {
      const response = await loginApi({ login, password });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Неверный логин или пароль');
      }

      const data: TokenResponse = await response.json();
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_id', String(data.user_id));
      localStorage.setItem('login', login);
      localStorage.setItem('username', login); // Используем login как username, если сервер не возвращает отдельно

      setUser({
        id: data.user_id,
        login,
        username: login
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error instanceof Error ? error : new Error('Ошибка при попытке входа');
    }
  };

  const registerHandler = async (username: string, login: string, password: string) => {
    try {
      const response = await registerApi({
        login,
        username,
        password,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Не удалось зарегистрировать пользователя');
      }

      // После успешной регистрации выполняем вход
      await loginHandler(login, password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error instanceof Error ? error : new Error('Ошибка при регистрации');
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('login');
    localStorage.removeItem('username');
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      login: loginHandler, 
      register: registerHandler, 
      logout, 
      isLoading 
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}; 