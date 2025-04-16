
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from "sonner";
import { authService } from '@/services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (token) {
        try {
          setIsLoading(true);
          const response = await authService.getProfile();
          
          if (response.data && response.data.user) {
            setUser(response.data.user);
          } else {
            // If token is invalid, clear it
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('authToken');
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    
    try {
      const response = await authService.login(email, password);
      
      if (response.data) {
        setUser(response.data.user);
        localStorage.setItem('authToken', response.data.token);
        toast.success('Logged in successfully!');
      }
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    
    try {
      const response = await authService.register(name, email, password);
      
      if (response.data) {
        setUser(response.data.user);
        localStorage.setItem('authToken', response.data.token);
        toast.success('Account created successfully!');
      }
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    toast.success('Logged out successfully');
  };

  const updateProfile = async (data) => {
    if (!user) return;
    
    try {
      const response = await authService.updateProfile(data);
      
      if (response.data && response.data.user) {
        setUser({ ...user, ...response.data.user });
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Profile update error:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
