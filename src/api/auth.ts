import type {LoginFormData, RegisterFormData} from "../types/auth.ts";
import { config } from '../config';

const API_URL = config.API_URL;

export const register = async (data: RegisterFormData): Promise<Response> => {
  return fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
};

export const login = async (data: LoginFormData): Promise<Response> => {
  return fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}; 