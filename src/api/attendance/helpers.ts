import type { AttendanceMarkRequest } from "@/api/model/attendanceMarkRequest";
import type { GetApiAttendanceGetParams } from "@/api/model/getApiAttendanceGetParams";
import type { TeacherAttendanceInsertRequest } from "@/api/model/teacherAttendanceInsertRequest";
import { formatDate } from "@/services/api";
import { parseApiList, toCamelCaseRow } from "@/utils/apiResponse";

/** YYYY-MM-DD for GET ?attendanceDate= and POST mark/update body */
export function toAttendanceIsoDate(isoOrDate: string | Date): string {
  if (isoOrDate instanceof Date) {
    return isoOrDate.toISOString().split("T")[0];
  }
  const trimmed = isoOrDate.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.split("T")[0];
  }
  if (/^\d{2}\/\d{2}\/\d{4}/.test(trimmed)) {
    const [d, m, y] = trimmed.split(/[\/\s]/)[0].split("/");
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return new Date(trimmed).toISOString().split("T")[0];
}

/** Legacy endpoints (teacher attendance insert, etc.) */
export function formatAttendanceApiDate(isoOrDate: string | Date): string {
  if (isoOrDate instanceof Date) {
    return formatDate(isoOrDate);
  }
  const trimmed = isoOrDate.trim();
  if (/^\d{2}\/\d{2}\/\d{4}/.test(trimmed)) {
    return trimmed.includes(":") ? trimmed : `${trimmed} 00:00:00`;
  }
  const isoDay = toAttendanceIsoDate(trimmed);
  const [y, m, d] = isoDay.split("-").map(Number);
  const date = new Date(y, m - 1, d, 0, 0, 0);
  if (Number.isNaN(date.getTime())) {
    return formatDate(new Date());
  }
  return formatDate(date);
}

export function toAttendanceDateParam(isoDate: string): string {
  return toAttendanceIsoDate(isoDate);
}

/** UI label from API status (PRESENT → Present) */
export function normalizeAttendanceStatusFromApi(status?: string | null): string {
  const u = (status || "PRESENT").toUpperCase();
  if (u === "PRESENT") return "Present";
  if (u === "ABSENT") return "Absent";
  if (u === "LATE") return "Late";
  if (u === "LEAVE") return "Leave";
  return status || "Present";
}

/** API status from UI (Present → PRESENT) */
export function toApiAttendanceStatus(uiStatus: string): string {
  return normalizeAttendanceStatusFromApi(uiStatus).toUpperCase();
}

export function isPresentStatus(status?: string | null): boolean {
  return normalizeAttendanceStatusFromApi(status) === "Present";
}

/** GET /api/attendance/get?view=students&classID=&attendanceDate=YYYY-MM-DD */
export function buildClassStudentsLoadParams(
  classID: number,
  attendanceDate: string,
  schoolID?: number
): GetApiAttendanceGetParams {
  return {
    View: "students",
    ClassID: classID,
    AttendanceDate: toAttendanceIsoDate(attendanceDate),
    ...(schoolID != null ? { SchoolID: schoolID } : {}),
  };
}

/** Admin / reports list (not class marking grid) */
export function buildAttendanceListParams(filters: {
  schoolID?: number;
  classID?: number;
  studentID?: number;
  attendanceDate?: string;
  month?: number;
  year?: number;
  view?: string;
  reportType?: string;
}): GetApiAttendanceGetParams {
  const params: GetApiAttendanceGetParams = {};
  if (filters.schoolID != null) params.SchoolID = filters.schoolID;
  if (filters.classID != null) params.ClassID = filters.classID;
  if (filters.studentID != null) params.StudentID = filters.studentID;
  if (filters.attendanceDate) {
    params.AttendanceDate = toAttendanceIsoDate(filters.attendanceDate);
  }
  if (filters.month != null) params.Month = filters.month;
  if (filters.year != null) params.Year = filters.year;
  if (filters.view) params.View = filters.view;
  if (filters.reportType) params.ReportType = filters.reportType;
  return params;
}

export function buildStudentMarkRequest(input: {
  classID: number;
  attendanceDate: string;
  schoolID?: number | null;
  students: Array<{
    studentID: number;
    attendanceStatus: string;
    remark?: string;
  }>;
  /** true = only ABSENT/LEAVE/LATE sent; everyone else PRESENT (recommended) */
  absentOnly?: boolean;
}): AttendanceMarkRequest {
  const absentOnly = input.absentOnly ?? false;
  let students = input.students.map((s) => ({
    studentID: s.studentID,
    attendanceStatus: toApiAttendanceStatus(s.attendanceStatus),
    remark: s.remark ?? "",
  }));

  if (absentOnly) {
    students = students.filter(
      (s) => s.attendanceStatus === "ABSENT" || s.attendanceStatus === "LEAVE"
    );
  }

  return {
    schoolID: input.schoolID ?? null,
    classID: input.classID,
    attendanceDate: toAttendanceIsoDate(input.attendanceDate),
    absentOnly,
    students,
  };
}

/** Class marking: absentOnly + only non-present students */
export function buildClassAbsentOnlyMarkRequest(input: {
  classID: number;
  attendanceDate: string;
  schoolID?: number | null;
  attendanceMap: Record<number, string>;
  studentIds: number[];
  remarks?: Record<number, string>;
}): AttendanceMarkRequest {
  const students = input.studentIds
    .filter((id) => {
      const api = toApiAttendanceStatus(input.attendanceMap[id] ?? "Present");
      return api === "ABSENT" || api === "LEAVE";
    })
    .map((studentID) => ({
      studentID,
      attendanceStatus: toApiAttendanceStatus(input.attendanceMap[studentID]),
      remark: input.remarks?.[studentID] ?? "",
    }));

  return buildStudentMarkRequest({
    classID: input.classID,
    attendanceDate: input.attendanceDate,
    schoolID: input.schoolID,
    absentOnly: true,
    students,
  });
}

/** Single-student update — uses absentOnly (omit student when Present). */
export function buildSingleStudentMarkRequest(input: {
  classID: number;
  studentID: number;
  attendanceDate: string;
  attendanceStatus: string;
  remark?: string;
  schoolID?: number | null;
}): AttendanceMarkRequest {
  const present = isPresentStatus(input.attendanceStatus);
  const students = present
    ? []
    : [
        {
          studentID: input.studentID,
          attendanceStatus: input.attendanceStatus,
          remark: input.remark,
        },
      ];
  return buildStudentMarkRequest({
    classID: input.classID,
    attendanceDate: input.attendanceDate,
    schoolID: input.schoolID,
    absentOnly: true,
    students,
  });
}

export function parseMonthYearLabel(label: string): { month?: number; year?: number } {
  const parts = label.trim().split(/\s+/);
  if (parts.length < 2) return {};
  const parsed = Date.parse(`1 ${parts[0]} ${parts[parts.length - 1]}`);
  if (Number.isNaN(parsed)) return {};
  const d = new Date(parsed);
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

export function buildTeacherAttendanceInsertRequest(input: {
  teacherID: number;
  attendanceDate: string;
  attendanceStatus: string;
  schoolID?: number | null;
  remark?: string;
  addedBy?: number;
}): TeacherAttendanceInsertRequest {
  return {
    schoolID: input.schoolID ?? null,
    teacherID: input.teacherID,
    attendanceDate: formatAttendanceApiDate(input.attendanceDate),
    attendanceStatus: input.attendanceStatus,
    remark: input.remark ?? null,
    addedBy: input.addedBy,
  };
}

function pickString(...values: unknown[]): string | undefined {
  for (const v of values) {
    if (v != null && String(v).trim() !== "") return String(v).trim();
  }
  return undefined;
}

function extractNestedStudent(row: Record<string, unknown>): Record<string, unknown> | null {
  const nested = row.student ?? row.Student ?? row.studentDetail ?? row.StudentDetail;
  if (nested && typeof nested === "object" && !Array.isArray(nested)) {
    return nested as Record<string, unknown>;
  }
  return null;
}

function normalizeAttendanceRow(row: Record<string, unknown>): AttendanceRow {
  const c = toCamelCaseRow<AttendanceRow>(row);
  const nested = extractNestedStudent(row);

  const rawStatus =
    c.attendanceStatus ??
    c.status ??
    (row.Status as string | undefined) ??
    (row.status as string | undefined);
  const recordId =
    c.studentAttendanceID ??
    c.attendanceID ??
    (row.AttendanceID as number | undefined) ??
    (row.attendanceId as number | undefined);

  const studentID =
    c.studentID ??
    (Number(row.StudentID ?? row.studentId) ||
      (nested ? Number(nested.studentID ?? nested.StudentID) : 0) ||
      undefined);

  const studentName = pickString(
    c.studentName,
    c.studentDisplayName,
    row.StudentName,
    row.student_name,
    row.FullName,
    row.fullName,
    nested?.studentName,
    nested?.StudentName,
    nested?.fullName,
    nested?.FullName,
    nested?.name,
    nested?.Name
  );

  const firstName = pickString(c.firstName, row.FirstName, nested?.firstName, nested?.FirstName);
  const lastName = pickString(c.lastName, row.LastName, nested?.lastName, nested?.LastName);

  const classID =
    c.classID ?? (Number(row.ClassID ?? row.classId) || undefined);
  let className = pickString(
    c.className,
    row.ClassName,
    row.class_name,
    nested?.className,
    nested?.ClassName
  );
  if (!className && classID) className = `Class ${classID}`;

  const sectionName = pickString(
    c.sectionName,
    row.SectionName,
    row.section_name,
    nested?.sectionName,
    nested?.SectionName
  );

  const rollRaw =
    c.rollNumber ??
    c.rollNo ??
    row.RollNumber ??
    row.RollNo ??
    nested?.rollNumber ??
    nested?.RollNumber;
  const rollNumber =
    rollRaw != null && rollRaw !== "" ? (Number(rollRaw) || rollRaw) : undefined;

  return {
    ...c,
    studentID: studentID || c.studentID,
    studentName: studentName ?? c.studentName,
    firstName: firstName ?? c.firstName,
    lastName: lastName ?? c.lastName,
    classID: classID ?? c.classID,
    className: className ?? c.className,
    sectionName: sectionName ?? c.sectionName,
    rollNumber: rollNumber != null ? (rollNumber as number) : c.rollNumber,
    rollNo: rollNumber != null ? String(rollNumber) : c.rollNo,
    studentAttendanceID: recordId,
    attendanceID: c.attendanceID ?? recordId,
    attendanceStatus: rawStatus
      ? normalizeAttendanceStatusFromApi(String(rawStatus))
      : "Present",
    remark:
      c.remark ??
      c.remarks ??
      (row.Remarks as string | undefined) ??
      (row.remarks as string | undefined),
    remarks: c.remarks ?? c.remark,
    markedBy: pickString(c.markedBy, row.MarkedBy, row.TakenBy, row.takenBy),
  };
}

export function parseAttendanceList(response: unknown): AttendanceRow[] {
  const raw = parseApiList<Record<string, unknown>>(response);
  return raw.map((row) => normalizeAttendanceRow(row));
}

export function getAttendanceRecordId(
  row: AttendanceRow,
  fallbackIndex?: number
): string {
  return String(
    row.studentAttendanceID ??
      row.attendanceID ??
      row.studentID ??
      fallbackIndex ??
      "unknown"
  );
}

export type AttendanceRow = {
  studentID?: number;
  sectionID?: number;
  studentAttendanceID?: number;
  attendanceID?: number;
  status?: string;
  attendanceDate?: string;
  attendanceStatus?: string;
  remark?: string;
  remarks?: string;
  studentName?: string;
  studentDisplayName?: string;
  firstName?: string;
  lastName?: string;
  rollNo?: string | number;
  rollNumber?: string | number;
  className?: string;
  sectionName?: string;
  classID?: number;
  markedBy?: string;
  gender?: string;
};

export function getAttendanceRowName(row: AttendanceRow): string {
  return (
    row.studentName ||
    row.studentDisplayName ||
    [row.firstName, row.lastName].filter(Boolean).join(" ") ||
    `Student #${row.studentID ?? "?"}`
  );
}

export function getAttendanceRowRoll(row: AttendanceRow): string {
  const roll = row.rollNo ?? row.rollNumber;
  return roll != null ? String(roll) : "—";
}
