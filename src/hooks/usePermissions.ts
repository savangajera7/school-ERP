import { useAuthStore } from "@/store/authStore";
import {
  canAccessRoute,
  getNavItemsForRole,
  hasPermission,
  isSchoolAdmin,
  ROLE_LABELS,
  MOBILE_TABS_BY_ROLE,
  type Permission,
  type AppRoute,
} from "@/constants/rolePermissions";
import type { Role } from "@/types/auth.types";

export function usePermissions() {
  const role = useAuthStore((s) => s.role);
  const userData = useAuthStore((s) => s.userData);

  return {
    role,
    userData,
    roleLabel: role ? ROLE_LABELS[role] : "",
    referenceId: userData?.referenceID,
    isSchoolAdmin: isSchoolAdmin(role),
    isTeacher: role === "teacher",
    isParent: role === "parent",
    isStudent: role === "student",
    isPlatformAdmin: role === "super_admin",
    isAdmin: role === "admin",

    can: (permission: Permission) => hasPermission(role, permission),
    canAccessRoute: (route: string) => canAccessRoute(role, route),
    navItems: getNavItemsForRole(role),
    mobileTabs: role ? MOBILE_TABS_BY_ROLE[role] : [],

    /** Fees: only school admin can add/collect (InsertFees / UpdateFees = AdminOnly). */
    canManageFees: hasPermission(role, "manageFees"),
    /** Student attendance: teacher + admin mark (InsertStudentAttendance). */
    canMarkStudentAttendance: hasPermission(role, "markStudentAttendance"),
    canViewStudentAttendance: hasPermission(role, "viewStudentAttendance"),
    /** Staff attendance register: admin only on API. */
    canManageStaffAttendance: hasPermission(role, "manageStaffAttendance"),
    canPublishNotices: hasPermission(role, "publishNotices"),
    canSendBroadcast: hasPermission(role, "sendBroadcast"),
    canReviewLeave: hasPermission(role, "reviewLeave"),
    canManageStudents: hasPermission(role, "manageStudents"),
    canManageSubjects: hasPermission(role, "manageSubjects"),
    canManageParents: hasPermission(role, "manageParents"),
    canManageTeachers: hasPermission(role, "manageTeachers"),
    canManageMoney: hasPermission(role, "manageMoney"),
    canManageMasters: hasPermission(role, "manageMasters"),
    canManageUsers: hasPermission(role, "manageUsers"),
    canManageRoles: hasPermission(role, "manageRoles"),
  };
}

export type { Permission, AppRoute };
