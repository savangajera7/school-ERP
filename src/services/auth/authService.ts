import type {
  LoginPayload,
  LoginResponse,
  UserData,
  Role,
} from "@/types/auth.types";

// Simulated network delay
const delay = (ms: number = 1200) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Mock user data for different roles
const MOCK_USERS: Record<string, UserData> = {
  admin: {
    id: "usr_001",
    name: "Rajesh Kumar",
    email: "admin@schoolerp.com",
    mobile: "9876543210",
    role: "admin",
    schoolName: "Little Angel's English School",
  },
  teacher: {
    id: "usr_002",
    name: "Priya Sharma",
    email: "teacher@schoolerp.com",
    mobile: "9876543211",
    role: "teacher",
    schoolName: "Little Angel's English School",
  },
  parent: {
    id: "usr_003",
    name: "Amit Patel",
    email: "parent@schoolerp.com",
    mobile: "9876543212",
    role: "parent",
    schoolName: "Little Angel's English School",
  },
};

export const authService = {
  loginUser: async (data: LoginPayload): Promise<LoginResponse> => {
    await delay();
    
    // Determine mock role based on identifier content to simulate backend resolving role from credentials
    let resolvedRole: Role = "admin";
    const lowerId = data.identifier.toLowerCase();
    if (lowerId.includes("teacher")) {
      resolvedRole = "teacher";
    } else if (lowerId.includes("parent")) {
      resolvedRole = "parent";
    }
    
    const user = MOCK_USERS[resolvedRole];
    return {
      accessToken: `mock_access_token_${Date.now()}`,
      refreshToken: `mock_refresh_token_${Date.now()}`,
      user: { ...user, role: resolvedRole },
    };
  },

  forgotPassword: async (
    identifier: string
  ): Promise<{ message: string }> => {
    await delay();
    return {
      message: `OTP sent to ${identifier}`,
    };
  },

  verifyOTP: async (
    identifier: string,
    otp: string
  ): Promise<{ token: string }> => {
    await delay();
    // Accept "123456" as valid OTP for mock
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
    await delay();
    return {
      message: "Password reset successfully",
    };
  },

  refreshToken: async (
    refreshToken: string
  ): Promise<{ accessToken: string }> => {
    await delay(500);
    return {
      accessToken: `mock_access_token_refreshed_${Date.now()}`,
    };
  },

  getProfile: async (): Promise<UserData> => {
    await delay(800);
    return MOCK_USERS.admin;
  },
};
