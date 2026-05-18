import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth/authService";
import type { LoginPayload, Role } from "@/types/auth.types";
import { router } from "expo-router";

export const useAuth = () => {
  const { isAuthenticated, userData, role, login, logout: storeLogout } =
    useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginPayload) => authService.loginUser(data),
    onSuccess: (response) => {
      login(
        response.accessToken,
        response.refreshToken,
        response.user,
        response.user.role
      );
      router.replace("/(app)/dashboard");
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (identifier: string) =>
      authService.forgotPassword(identifier),
  });

  const verifyOTPMutation = useMutation({
    mutationFn: ({ identifier, otp }: { identifier: string; otp: string }) =>
      authService.verifyOTP(identifier, otp),
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({
      token,
      password,
    }: {
      token: string;
      password: string;
    }) => authService.resetPassword(token, password),
  });

  const handleLogout = () => {
    storeLogout();
    router.replace("/(auth)/login");
  };

  return {
    // State
    isAuthenticated,
    userData,
    role,

    // Mutations
    loginMutation,
    forgotPasswordMutation,
    verifyOTPMutation,
    resetPasswordMutation,

    // Actions
    handleLogout,
  };
};
