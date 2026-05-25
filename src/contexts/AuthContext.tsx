import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/services/api";
import { getHomeRoute } from "@/utils/roleRouting";
import type { AuthUser, Role } from "@/types/auth.types";

interface AuthContextType {
  user: AuthUser | null;
  role: Role | null;
  isLoading: boolean;
  login: (userName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Section 2 — AUTH FLOW (Backend-Driven Role)
 * Context provider to manage global authentication state and routing.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const store = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        // Section 2: GET /api/Login/Profile to validate
        const profile = await api.get('/Login/Profile');
        if (profile) {
          // Restore session
          // store.login(...) - assuming store update logic
        }
      }
    } catch (e) {
      // If 401, clear storage -> redirect to /login
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userName: string, password: string) => {
    // Section 2: POST /api/Login/Login
    const response = await api.post('/Login/Login', { userName, password });
    
    if (response) {
      const { token, user, role } = response;
      await AsyncStorage.setItem('token', token);
      
      // Update store and context
      // store.login(token, refreshToken, user, role);
      
      // Section 2: router.replace() to correct dashboard
      router.replace(getHomeRoute(role) as any);
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    store.logout();
    router.replace('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user: store.userData as any,
        role: store.role,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
