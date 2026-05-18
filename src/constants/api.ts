export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

export const API_ENDPOINTS = {
  LOGIN: "/login",
  FORGOT_PASSWORD: "/forgot-password",
  VERIFY_OTP: "/verify-otp",
  RESET_PASSWORD: "/reset-password",
  REFRESH_TOKEN: "/refresh-token",
  PROFILE: "/profile",
} as const;

export const API_TIMEOUT = 15000;
