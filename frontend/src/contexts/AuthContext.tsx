'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { User, AuthResponse } from '@/types';
import { authAPI, usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; username: string; password: string; firstName?: string; lastName?: string }) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    const token = Cookies.get('token');
    const savedUser = Cookies.get('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
        // Optionally verify token by fetching user profile
        usersAPI.getProfile()
          .then((profile) => {
            setUser(profile);
            Cookies.set('user', JSON.stringify(profile), { expires: 7 });
          })
          .catch(() => {
            // Token is invalid, clear everything
            logout();
          });
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: AuthResponse = await authAPI.login({ email, password });
      
      // Save token and user to cookies
      Cookies.set('token', response.token, { expires: 7 });
      Cookies.set('user', JSON.stringify(response.user), { expires: 7 });
      
      setUser(response.user);
      toast.success('Login successful!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      toast.error(message);
      throw error;
    }
  };

  const register = async (data: { 
    email: string; 
    username: string; 
    password: string; 
    firstName?: string; 
    lastName?: string 
  }) => {
    try {
      const response: AuthResponse = await authAPI.register(data);
      
      // Save token and user to cookies
      Cookies.set('token', response.token, { expires: 7 });
      Cookies.set('user', JSON.stringify(response.user), { expires: 7 });
      
      setUser(response.user);
      toast.success('Registration successful!');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
    toast.success('Logged out successfully');
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
