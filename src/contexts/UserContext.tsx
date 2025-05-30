import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as loginApi, register as registerApi } from '../api/auth';
import type { TokenResponse } from '../types/auth';
import { config } from '../config';

interface User {
  id: number;
  login: string;
  username: string;
  email?: string;
  avatar?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
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
  const [user, setUser] = useState<User | null>(() => {
    // Инициализируем состояние из localStorage при первой загрузке
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('user_id');
    const userDataStr = localStorage.getItem('userData');
    
    if (token && userId && userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        return userData;
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const updateUserData = async () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('user_id');

      if (token && userId) {
        try {
        // Получаем актуальные данные пользователя
        const response = await fetchWithAuth(`${API_URL}/users/${userId}`);
        const userData = await response.json();
        
        // Обновляем данные в localStorage и состоянии
        const userToSave = {
          id: userData.id,
          login: userData.login || userData.email,
          username: userData.username,
          email: userData.email,
          avatar: userData.avatar
        };
        
        localStorage.setItem('userData', JSON.stringify(userToSave));
        setUser(userToSave);
        } catch (error) {
        console.error('Failed to fetch user data:', error);
        // Если не удалось получить данные, но токен есть, оставляем текущего пользователя
        }
      }
      setIsLoading(false);
    };

  useEffect(() => {
    updateUserData();
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

      // После успешного входа получаем данные пользователя
      await updateUserData();
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
    localStorage.removeItem('userData');
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser,
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