export type Role = 'super_admin' | 'admin' | 'teacher' | 'parent' | 'student';

export interface TeacherClassPermission {
  teacherID: number;
  classID: number;
  className: string;
  canNotice: boolean;
  canAttendance: boolean;
  canHomework: boolean;
  canClasswork: boolean;
  canTimetable: boolean;
  canExam: boolean;
}

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  roleId: number;
  token: string;
}

export interface LinkedStudent {
  studentID: number;
  studentName: string;
  className?: string;
}

export interface UserData extends Partial<AuthUser> {
  studentID?: number;
  /** Children linked to a parent account (parent login). */
  linkedStudents?: LinkedStudent[];
  firstName?: string;
  lastName?: string;
  studentEmail?: string;
  // Legacy fields for compatibility
  id?: any;
  name?: any;
  mobile?: string;
  schoolName?: string;
  avatar?: string;
  roleID?: number;
  referenceID?: number;
  schoolID?: number;
  // Teacher per-class module permissions (only set when role = teacher)
  teacherPermissions?: TeacherClassPermission[];
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
