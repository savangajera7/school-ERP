import axiosInstance from "@/services/api/axiosInstance";
import { API_ENDPOINTS } from "@/constants/api";
import { postApiLoginForgotPassword } from "@/api/generated/1-login-no-token/1-login-no-token";
import type { LoginPayload, LoginResponse, UserData, ApiResult } from "@/types/auth.types";
import { getApiErrorMessage } from "@/utils/recordHelpers";
import { resolveMediaUrl } from "@/services/upload/uploadService";

export const authService = {
  loginUser: async (data: LoginPayload): Promise<LoginResponse> => {
    const response = await axiosInstance.post<ApiResult<Record<string, unknown>>>(
      API_ENDPOINTS.LOGIN,
      data
    );

    if (response.data.success && response.data.data) {
      const apiData = response.data.data;
      const schoolID = Number(apiData.schoolID ?? apiData.SchoolID) || undefined;
      return {
        accessToken: String(apiData.accessToken ?? apiData.token ?? ""),
        refreshToken: String(apiData.refreshToken ?? ""),
        user: {
          id: apiData.studentID?.toString() ?? apiData.userID?.toString() ?? apiData.id?.toString() ?? "0",
          name:
            String(apiData.studentDisplayName ?? "") ||
            `${apiData.firstName ?? ""} ${apiData.lastName ?? ""}`.trim() ||
            "User",
          email: String(apiData.studentEmail ?? apiData.email ?? ""),
          mobile: String(apiData.studentNumber ?? apiData.mobile ?? ""),
          role: (apiData.role as UserData["role"]) ?? "parent",
          roleID: apiData.roleID as number | undefined,
          schoolName: "Little Angel's English School",
          avatar: resolveMediaUrl(apiData.profilePhoto as string) ?? undefined,
          ...apiData,
          schoolID,
        },
      };
    }
    throw new Error(response.data.message || "Login failed");
  },

  forgotPassword: async (identifier: string): Promise<{ message: string }> => {
    const email = identifier.includes("@") ? identifier : `${identifier}@placeholder.local`;
    try {
      await postApiLoginForgotPassword({ email });
      return {
        message: "If this email is registered, password reset instructions have been sent.",
      };
    } catch (e) {
      throw new Error(getApiErrorMessage(e, "Failed to send reset request"));
    }
  },

  getProfile: async (): Promise<UserData> => {
    const response = await axiosInstance.get<ApiResult<Record<string, unknown>>>(
      "/api/Login/Profile"
    );
    if (response.data.success && response.data.data) {
      const apiData = response.data.data;
      const schoolID = Number(apiData.schoolID ?? apiData.SchoolID) || undefined;
      return {
        id: apiData.studentID?.toString() ?? apiData.userID?.toString() ?? "0",
        name:
          String(apiData.studentDisplayName ?? "") ||
          `${apiData.firstName ?? ""} ${apiData.lastName ?? ""}`.trim() ||
          "User",
        email: String(apiData.email ?? ""),
        mobile: String(apiData.mobile ?? ""),
        role: (apiData.role as UserData["role"]) ?? "parent",
        schoolName: "Little Angel's English School",
        avatar: resolveMediaUrl(apiData.profilePhoto as string) ?? undefined,
        ...apiData,
        schoolID,
      };
    }
    throw new Error("Failed to fetch profile");
  },
};
