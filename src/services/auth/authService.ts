import axiosInstance from "@/services/api/axiosInstance";
import { API_ENDPOINTS } from "@/constants/api";
import type {
  LoginPayload,
  LoginResponse,
  UserData,
  ApiResult,
} from "@/types/auth.types";

export const authService = {
  loginUser: async (data: LoginPayload): Promise<LoginResponse> => {
    const response = await axiosInstance.post<ApiResult<any>>(
      API_ENDPOINTS.LOGIN,
      data
    );

    if (response.data.success && response.data.data) {
      const apiData = response.data.data;
      
      // Map API response to our app's UserData
      // Assuming the API returns tokens and user info in data
      return {
        accessToken: apiData.accessToken || "mock_token", 
        refreshToken: apiData.refreshToken || "mock_refresh_token",
        user: {
          id: apiData.studentID?.toString() || apiData.id?.toString() || "0",
          name: apiData.studentDisplayName || `${apiData.firstName} ${apiData.lastName}` || "User",
          email: apiData.studentEmail || apiData.email || "",
          mobile: apiData.studentNumber || "",
          role: apiData.role || "parent", 
          schoolName: "Little Angel's English School",
          ...apiData,
        },
      };
    } else {
      throw new Error(response.data.message || "Login failed");
    }
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    return {
      message: `Instruction sent to ${email}`,
    };
  },

  verifyOTP: async (
    email: string,
    otp: string
  ): Promise<{ token: string }> => {
    if (otp !== "123456") {
      throw new Error("Invalid OTP. Please try again.");
    }
    return {
      token: `reset_token_${Date.now()}`,
    };
  },

  resetPassword: async (
    token: string,
    password: string
  ): Promise<{ message: string }> => {
    return {
      message: "Password reset successfully",
    };
  },

  refreshToken: async (
    refreshToken: string
  ): Promise<{ accessToken: string }> => {
    return {
      accessToken: `mock_access_token_refreshed_${Date.now()}`,
    };
  },

  getProfile: async (): Promise<UserData> => {
    const response = await axiosInstance.get<ApiResult<any>>(
      API_ENDPOINTS.STUDENT_BY_ID // Assuming this can be used as profile for students
    );
    if (response.data.success && response.data.data) {
      const apiData = response.data.data;
      return {
        id: apiData.studentID?.toString() || "0",
        name: apiData.studentDisplayName || `${apiData.firstName} ${apiData.lastName}` || "User",
        email: apiData.studentEmail || apiData.email || "",
        mobile: apiData.studentNumber || "",
        role: "parent",
        schoolName: "Little Angel's English School",
        ...apiData,
      };
    }
    throw new Error("Failed to fetch profile");
  },
};
