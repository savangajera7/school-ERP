import type { StudentModel } from "@/api/model/studentModel";
import { toCamelCaseRow } from "@/utils/apiResponse";

export function normalizeStudent(raw: Record<string, unknown>): StudentModel {
  return toCamelCaseRow(raw) as StudentModel;
}

export function getStudentDisplayName(student: StudentModel): string {
  const display = student.studentDisplayName?.trim();
  if (display && display.toLowerCase() !== "null") return display;

  const parts = [student.firstName, student.middleName, student.lastName]
    .map((p) => (p != null ? String(p).trim() : ""))
    .filter((p) => p && p.toLowerCase() !== "null");

  if (parts.length) return parts.join(" ");
  if (student.studentGRNo) return `Student ${student.studentGRNo}`;
  if (student.rollNo) return `Roll ${student.rollNo}`;
  return "Unnamed student";
}

export function getParentLoginUsername(student: StudentModel): string {
  return formatOptional((student as any).parentUserName || student.fatherNumber, "N/A");
}

export function getParentLoginPassword(student: StudentModel): string {
  const apiPassword = formatOptional((student as any).parentPassword, "");
  if (apiPassword) return apiPassword;

  const firstName = student.firstName?.trim();
  const birthYear = student.dob ? new Date(student.dob).getFullYear() : NaN;

  if (firstName && Number.isFinite(birthYear)) {
    return `${firstName}${birthYear}`;
  }

  return "N/A";
}

export function formatOptional(value: unknown, fallback = "—"): string {
  if (value == null) return fallback;
  const s = String(value).trim();
  if (!s || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return fallback;
  return s;
}
