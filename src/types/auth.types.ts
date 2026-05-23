export type Role = "admin" | "teacher" | "parent";

export interface UserData {
  studentID?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  studentEmail?: string;
  role: Role;
  // Legacy fields for compatibility
  id: string;
  name: string;
  mobile: string;
  schoolName: string;
  avatar?: string;
}

export interface ApiResult<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  statusCode: number;
  statusValueCode: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: UserData;
}

export interface ForgotPasswordPayload {
  identifier: string;
}

export interface VerifyOTPPayload {
  identifier: string;
  otp: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}

export type Language = "en" | "gu";

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userData: UserData | null;
  role: Role | null;
  isAuthenticated: boolean;
  language: Language;
}

export interface AuthActions {
  login: (
    token: string,
    refreshToken: string,
    user: UserData,
    role: Role
  ) => void;
  logout: () => void;
  refreshSession: (newToken: string) => void;
  setUser: (user: UserData) => void;
  setLanguage: (lang: Language) => void;
}
