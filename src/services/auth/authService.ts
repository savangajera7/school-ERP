import axiosInstance from "@/services/api/axiosInstance";
import { API_ENDPOINTS } from "@/constants/api";
import { postApiLoginForgotPassword } from "@/api/generated/1-login-no-token/1-login-no-token";
import type {
  LoginPayload,
  LoginResponse,
  UserData,
  ApiResult,
  LinkedStudent,
} from "@/types/auth.types";
import { getApiErrorMessage } from "@/utils/recordHelpers";
import { resolveMediaUrl } from "@/services/upload/uploadService";

/** Parse linkedStudents array (parent login) regardless of field casing. */
function parseLinkedStudents(apiData: Record<string, unknown>): LinkedStudent[] | undefined {
  const raw = (apiData.linkedStudents ?? apiData.LinkedStudents) as
    | Array<Record<string, unknown>>
    | undefined;
  if (!Array.isArray(raw)) return undefined;
  const list = raw
    .map((s) => ({
      studentID: Number(s.studentID ?? s.StudentID) || 0,
      studentName: String(s.studentName ?? s.StudentName ?? s.name ?? "").trim(),
      className: s.className ?? s.ClassName ? String(s.className ?? s.ClassName) : undefined,
    }))
    .filter((s) => s.studentID > 0);
  return list.length > 0 ? list : undefined;
}

/**
 * Resolve the studentID used for Parent/Student attendance views:
 * - Student login: studentID = referenceID
 * - Parent login: explicit studentID, else first linked child
 */
function resolveStudentId(
  apiData: Record<string, unknown>,
  role: string | undefined,
  referenceID: number | undefined,
  linkedStudents: LinkedStudent[] | undefined
): number | undefined {
  const direct = Number(apiData.studentID ?? apiData.StudentID) || undefined;
  if (role === "student") return referenceID ?? direct;
  return direct ?? linkedStudents?.[0]?.studentID;
}

export const authService = {
  loginUser: async (data: LoginPayload): Promise<LoginResponse> => {
    const response = await axiosInstance.post<ApiResult<Record<string, unknown>>>(
      API_ENDPOINTS.LOGIN,
      data
    );

    if (response.data.success && response.data.data) {
      const apiData = response.data.data;
      const schoolID = Number(apiData.schoolID ?? apiData.SchoolID) || undefined;
      const role = (apiData.role as UserData["role"]) ?? "parent";
      const referenceID = Number(apiData.referenceID ?? apiData.ReferenceID) || undefined;
      const linkedStudents = parseLinkedStudents(apiData);
      const studentID = resolveStudentId(apiData, role, referenceID, linkedStudents);
      return {
        accessToken: String((response.data as any).token ?? apiData.accessToken ?? apiData.token ?? ""),
        refreshToken: String(apiData.refreshToken ?? ""),
        user: {
          id: apiData.studentID?.toString() ?? apiData.userID?.toString() ?? apiData.id?.toString() ?? "0",
          name:
            String(apiData.studentDisplayName ?? "") ||
            `${apiData.firstName ?? ""} ${apiData.lastName ?? ""}`.trim() ||
            "User",
          email: String(apiData.studentEmail ?? apiData.email ?? ""),
          mobile: String(apiData.studentNumber ?? apiData.mobile ?? ""),
          role,
          roleID: apiData.roleID as number | undefined,
          schoolName: "Little Angel's English School",
          avatar: resolveMediaUrl(apiData.profilePhoto as string) ?? undefined,
          ...apiData,
          schoolID,
          referenceID,
          studentID,
          linkedStudents,
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
      const role = (apiData.role as UserData["role"]) ?? "parent";
      const referenceID = Number(apiData.referenceID ?? apiData.ReferenceID) || undefined;
      const linkedStudents = parseLinkedStudents(apiData);
      const studentID = resolveStudentId(apiData, role, referenceID, linkedStudents);
      return {
        id: apiData.studentID?.toString() ?? apiData.userID?.toString() ?? "0",
        name:
          String(apiData.studentDisplayName ?? "") ||
          `${apiData.firstName ?? ""} ${apiData.lastName ?? ""}`.trim() ||
          "User",
        email: String(apiData.email ?? ""),
        mobile: String(apiData.mobile ?? ""),
        role,
        schoolName: "Little Angel's English School",
        avatar: resolveMediaUrl(apiData.profilePhoto as string) ?? undefined,
        ...apiData,
        schoolID,
        referenceID,
        studentID,
        linkedStudents,
      };
    }
    throw new Error("Failed to fetch profile");
  },
};
