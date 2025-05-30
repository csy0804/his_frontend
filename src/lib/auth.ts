import { api as axios } from "./axios";
import type { AuthenticatedUser } from '../types';

export interface User extends AuthenticatedUser {}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  username: string;
  phone_number: string;
  email: string;
  date_of_birth: string;
  location: string;
  password: string;
}

export const login = async (credentials: LoginCredentials) => {
  const formBody = new URLSearchParams();
  formBody.append('username', credentials.username);
  formBody.append('password', credentials.password);

  const response = await axios.post("/token", formBody, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });

  if (response.data.access_token) {
    localStorage.setItem("token", response.data.access_token);
  }
  return response.data;
};

export const register = async (data: RegisterData) => {
  const response = await axios.post("/user/create", data);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/user/login";
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const response = await axios.get("/auth/me");
    return response.data;
  } catch (error) {
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};

export const getToken = (): string | null => {
  return localStorage.getItem("token");
}; 