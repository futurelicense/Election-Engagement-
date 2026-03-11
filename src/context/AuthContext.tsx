import React, { useEffect, useState, createContext, useContext } from 'react';
import { User } from '../utils/types';
import { authService } from '../services/authService';
import { apiClient } from '../services/apiClient';
import { voteService } from '../services/voteService';
import { getOrCreateGuestId } from '../utils/guestId';

interface AuthContextType {
  user: User | null;
  login: (email: string, pin: string) => Promise<void>;
  signup: (name: string, email: string, phone: string, pin: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    // Validate token server-side and get fresh user data (catches expired tokens and role changes)
    apiClient.get<{ user: User }>('/auth/me')
      .then(({ user }) => {
        setUser(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
      .catch(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email: string, pin: string) => {
    try {
      const response = await authService.login({ email, pin });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      const guestId = getOrCreateGuestId();
      if (guestId) {
        try {
          await voteService.claimGuestVotes(guestId);
        } catch {
          /* ignore */
        }
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Extract error message from response
      const errorMessage = error.message || 'Failed to login. Please check your credentials.';
      throw new Error(errorMessage);
    }
  };

  const signup = async (name: string, email: string, phone: string, pin: string) => {
    try {
      const response = await authService.register({ name, email, phone, pin });
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
      const guestId = getOrCreateGuestId();
      if (guestId) {
        try {
          await voteService.claimGuestVotes(guestId);
        } catch {
          /* ignore */
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Failed to sign up');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
