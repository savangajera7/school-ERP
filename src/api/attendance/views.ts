import type { GetApiAttendanceGetParams } from "@/api/model/getApiAttendanceGetParams";
import { unwrapApiBody, toCamelCaseRow } from "@/utils/apiResponse";
import {
  normalizeAttendanceStatusFromApi,
  parseAttendanceList,
  toAttendanceIsoDate,
  type AttendanceRow,
} from "./helpers";

export type AttendanceClassSummary = {
  classID: number;
  className: string;
  attendanceMarked: boolean;
};

export type AttendanceStudentsView = {
  classID?: number;
  className?: string;
  attendanceDate?: string;
  students: AttendanceRow[];
};

export type AttendanceDetailView = {
  attendanceDate?: string;
  classID?: number;
  className?: string;
  takenBy?: string;
  lastUpdatedBy?: string;
  students: AttendanceRow[];
};

export type ParentMonthlyView = {
  studentID?: number;
  month?: number;
  year?: number;
  workingDays?: number;
  presentDays?: number;
  absentDays?: number;
  leaveDays?: number;
  attendancePercent?: number;
};

function unwrapPayload(response: unknown): Record<string, unknown> | null {
  let body = unwrapApiBody(response);
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  if (o.success === true || o.Success === true) {
    const nested = o.data ?? o.Data;
    if (nested && typeof nested === "object" && !Array.isArray(nested)) {
      return nested as Record<string, unknown>;
    }
  }
  if ("classes" in o || "students" in o || "workingDays" in o) return o;
  const nested = o.data ?? o.Data;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }
  return o;
}

export function buildAttendanceViewParams(
  view: string,
  filters: {
    schoolID?: number;
    classID?: number;
    studentID?: number;
    attendanceDate?: string;
    month?: number;
    year?: number;
    reportType?: string;
  } = {}
): GetApiAttendanceGetParams {
  const params: GetApiAttendanceGetParams = { View: view };
  if (filters.schoolID != null) params.SchoolID = filters.schoolID;
  if (filters.classID != null) params.ClassID = filters.classID;
  if (filters.studentID != null) params.StudentID = filters.studentID;
  if (filters.attendanceDate) params.AttendanceDate = toAttendanceIsoDate(filters.attendanceDate);
  if (filters.month != null) params.Month = filters.month;
  if (filters.year != null) params.Year = filters.year;
  if (filters.reportType) params.ReportType = filters.reportType;
  return params;
}

export function parseClassesView(response: unknown): {
  attendanceDate?: string;
  classes: AttendanceClassSummary[];
} {
  const payload = unwrapPayload(response);
  if (!payload) return { classes: [] };

  const rawClasses =
    (payload.classes as unknown[]) ??
    (payload.Classes as unknown[]) ??
    parseAttendanceList(response);

  const classes: AttendanceClassSummary[] = [];
  for (const item of rawClasses) {
    if (!item || typeof item !== "object") continue;
    const row = toCamelCaseRow<Record<string, unknown>>(item as Record<string, unknown>);
    const classID = Number(row.classID ?? row.ClassID);
    if (!classID) continue;
    classes.push({
      classID,
      className: String(row.className ?? row.ClassName ?? `Class ${classID}`),
      attendanceMarked: !!(row.attendanceMarked ?? row.AttendanceMarked),
    });
  }

  return {
    attendanceDate: String(payload.attendanceDate ?? payload.AttendanceDate ?? ""),
    classes,
  };
}

export function parseStudentsView(response: unknown): AttendanceStudentsView {
  const payload = unwrapPayload(response);
  const students = payload?.students
    ? parseAttendanceList({ data: payload.students })
    : parseAttendanceList(response);

  return {
    classID: Number(payload?.classID ?? payload?.ClassID) || undefined,
    className: String(payload?.className ?? payload?.ClassName ?? ""),
    attendanceDate: String(payload?.attendanceDate ?? payload?.AttendanceDate ?? ""),
    students,
  };
}

export function parseDetailView(response: unknown): AttendanceDetailView {
  const payload = unwrapPayload(response);
  const students = payload?.students
    ? parseAttendanceList({ data: payload.students })
    : parseAttendanceList(response);

  return {
    attendanceDate: String(payload?.attendanceDate ?? ""),
    classID: Number(payload?.classID) || undefined,
    className: String(payload?.className ?? ""),
    takenBy: String(payload?.takenBy ?? payload?.markedBy ?? ""),
    lastUpdatedBy: String(payload?.lastUpdatedBy ?? ""),
    students,
  };
}

export function parseHistoryView(response: unknown): AttendanceRow[] {
  return parseAttendanceList(response);
}

export function parseParentMonthlyView(response: unknown): ParentMonthlyView {
  const payload = unwrapPayload(response) ?? {};
  const row = toCamelCaseRow<Record<string, unknown>>(payload);
  return {
    studentID: Number(row.studentID) || undefined,
    month: Number(row.month) || undefined,
    year: Number(row.year) || undefined,
    workingDays: Number(row.workingDays ?? row.totalWorkingDays ?? 0) || 0,
    presentDays: Number(row.presentDays ?? row.present ?? 0) || 0,
    absentDays: Number(row.absentDays ?? row.absent ?? 0) || 0,
    leaveDays: Number(row.leaveDays ?? row.leave ?? 0) || 0,
    attendancePercent: Number(row.attendancePercent ?? row.percentage ?? 0) || 0,
  };
}

export type ParentYearlyMonth = {
  month: number;
  present?: number;
  absent?: number;
  leave?: number;
  attendancePercent?: number;
};

export function parseParentYearlyView(response: unknown): {
  year?: number;
  months: ParentYearlyMonth[];
} {
  const payload = unwrapPayload(response) ?? {};
  const row = toCamelCaseRow<Record<string, unknown>>(payload);
  const raw =
    (row.months as unknown[]) ??
    (row.monthly as unknown[]) ??
    (row.data as unknown[]) ??
    (Array.isArray(payload) ? (payload as unknown[]) : []);

  const months: ParentYearlyMonth[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const m = toCamelCaseRow<Record<string, unknown>>(item as Record<string, unknown>);
    const month = Number(m.month ?? m.Month);
    if (!month) continue;
    months.push({
      month,
      present: Number(m.presentDays ?? m.present ?? 0) || 0,
      absent: Number(m.absentDays ?? m.absent ?? 0) || 0,
      leave: Number(m.leaveDays ?? m.leave ?? 0) || 0,
      attendancePercent: Number(m.attendancePercent ?? m.percentage ?? 0) || 0,
    });
  }

  return {
    year: Number(row.year ?? row.Year) || undefined,
    months: months.sort((a, b) => a.month - b.month),
  };
}

export function isExceptionStatus(status?: string | null): boolean {
  const u = normalizeAttendanceStatusFromApi(status).toUpperCase();
  return u === "ABSENT" || u === "LEAVE";
}

export function todayIsoDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function isFutureDate(isoDate: string): boolean {
  return isoDate > todayIsoDate();
}
