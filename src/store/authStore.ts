import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AuthState, AuthActions, UserData, Role } from "@/types/auth.types";

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  userData: null,
  role: null,
  isAuthenticated: false,
  language: "en",
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      ...initialState,

      login: (
        token: string,
        refreshToken: string,
        user: UserData,
        role: Role
      ) =>
        set({
          accessToken: token,
          refreshToken,
          userData: user,
          role,
          isAuthenticated: true,
        }),

      logout: () => set({ ...initialState }),

      refreshSession: (newToken: string) =>
        set({ accessToken: newToken }),

      setUser: (user: UserData) =>
        set({ userData: user }),

      setLanguage: (lang) =>
        set({ language: lang }),
    }),
    {
      name: "school-erp-auth",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        userData: state.userData,
        role: state.role,
        isAuthenticated: state.isAuthenticated,
        language: state.language,
      }),
    }
  )
);
