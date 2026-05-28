import { useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { usePermissions } from "@/hooks/usePermissions";
import { useGetApiTeacherPermissionsTeacherId } from "@/api/generated/6-teacher-permissions-admin-assigns-module-access-per-class/6-teacher-permissions-admin-assigns-module-access-per-class";
import { parseApiList } from "@/utils/apiResponse";
import type { TeacherClassPermission } from "@/types/auth.types";

function mapPermissionRow(row: Record<string, unknown>): TeacherClassPermission | null {
  const classID = Number(row.classID ?? row.ClassID);
  if (!classID) return null;
  return {
    teacherID: Number(row.teacherID ?? row.TeacherID ?? 0),
    classID,
    className: String(row.className ?? row.ClassName ?? ""),
    canNotice: !!(row.canNotice ?? row.CanNotice),
    canAttendance: !!(row.canAttendance ?? row.CanAttendance),
    canHomework: !!(row.canHomework ?? row.CanHomework),
    canClasswork: !!(row.canClasswork ?? row.CanClasswork),
    canTimetable: !!(row.canTimetable ?? row.CanTimetable),
    canExam: !!(row.canExam ?? row.CanExam),
  };
}

/**
 * Role-based attendance access:
 * - Admin: all classes, list + mark + staff + reports
 * - Teacher: only classes with canAttendance
 * - Parent/Student: read-only child records
 */
export function useAttendanceAccess() {
  const perms = usePermissions();
  const userData = useAuthStore((s) => s.userData);

  const teacherId = useMemo(() => {
    if (!perms.isTeacher) return 0;
    const ref = userData?.referenceID;
    if (ref) return ref;
    const id = parseInt(String(userData?.id ?? "0"), 10);
    return Number.isNaN(id) ? 0 : id;
  }, [perms.isTeacher, userData?.referenceID, userData?.id]);

  const { data: teacherPermApi, isLoading: loadingTeacherPerms } =
    useGetApiTeacherPermissionsTeacherId(teacherId, {
      query: { enabled: perms.isTeacher && teacherId > 0 },
    });

  const teacherAttendanceClasses = useMemo((): TeacherClassPermission[] => {
    if (!perms.isTeacher) return [];

    const fromLogin = (userData?.teacherPermissions ?? []).filter(
      (p) => p.canAttendance
    );
    if (fromLogin.length > 0) return fromLogin;

    const fromApi = parseApiList<Record<string, unknown>>(teacherPermApi?.data)
      .map(mapPermissionRow)
      .filter((p): p is TeacherClassPermission => p != null && p.canAttendance);

    return fromApi;
  }, [perms.isTeacher, userData?.teacherPermissions, teacherPermApi?.data]);

  /** null = all classes allowed (admin) */
  const allowedClassIds = useMemo((): Set<number> | null => {
    if (perms.isSchoolAdmin) return null;
    if (perms.isTeacher) {
      return new Set(teacherAttendanceClasses.map((p) => p.classID));
    }
    return new Set();
  }, [perms.isSchoolAdmin, perms.isTeacher, teacherAttendanceClasses]);

  const canMarkClass = (classId: number) => {
    if (perms.isSchoolAdmin) return true;
    if (perms.isTeacher) return allowedClassIds?.has(classId) ?? false;
    return false;
  };

  const filterAllowedClasses = <T extends { classID?: number }>(classes: T[]): T[] => {
    if (allowedClassIds === null) return classes;
    return classes.filter((c) => c.classID != null && allowedClassIds.has(c.classID));
  };

  return {
    ...perms,
    teacherId,
    teacherAttendanceClasses,
    allowedClassIds,
    loadingTeacherPerms: perms.isTeacher && loadingTeacherPerms,
    canMarkClass,
    filterAllowedClasses,

    /** Parent / student — view only */
    isAttendanceReadOnly: perms.isParent || perms.isStudent,

    /** Full school attendance management */
    canManageAttendanceList: perms.isSchoolAdmin,

    /** Class marking screen */
    canAccessMarkingScreen: perms.canMarkStudentAttendance && !perms.isParent && !perms.isStudent,

    canAccessReports: perms.can("viewAttendanceReports") && !perms.isParent && !perms.isStudent,

    canAccessStaffAttendance: perms.canManageStaffAttendance,

    childStudentId: userData?.studentID ?? userData?.referenceID,
  };
}
