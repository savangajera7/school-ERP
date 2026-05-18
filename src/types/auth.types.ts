export type Role = "admin" | "teacher" | "parent";

export interface UserData {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  schoolName: string;
  avatar?: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
  role?: Role;
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

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userData: UserData | null;
  role: Role | null;
  isAuthenticated: boolean;
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
}
