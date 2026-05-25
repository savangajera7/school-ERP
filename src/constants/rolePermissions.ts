/**
 * Role & permission matrix aligned with SchoolmanagementNewAPI (AppRoles + ModuleControllers).
 *
 * Backend role IDs (tblRole / login JWT):
 *   1 = Super Admin (platform)
 *   2 = Admin (school)
 *   3 = Teacher
 *   4 = Parent / Guardian
 *   5 = Student
 */
import type { Role } from "@/types/auth.types";
import type { AppIconName } from "@/constants/appIcons";

export const ROLE_IDS = {
  superadmin: 1,
  admin: 2,
  teacher: 3,
  parent: 4,
  student: 5,
} as const;

export type AppRoute =
  | "/(app)/dashboard"
  | "/(app)/menu"
  | "/(app)/search"
  | "/(app)/students"
  | "/(app)/student-profile"
  | "/(app)/attendance"
  | "/(app)/attendance-reports"
  | "/(app)/teacher-attendance"
  | "/(app)/fees"
  | "/(app)/money"
  | "/(app)/exams"
  | "/(app)/subjects"
  | "/(app)/teachers"
  | "/(app)/parents"
  | "/(app)/notices"
  | "/(app)/notice-compose"
  | "/(app)/notifications"
  | "/(app)/notification-compose"
  | "/(app)/timetable"
  | "/(app)/inquiries"
  | "/(app)/reports"
  | "/(app)/academic-setup"
  | "/(app)/masters"
  | "/(app)/admission-form"
  | "/(app)/leave"
  | "/(app)/roles"
  | "/(app)/users"
  | "/(app)/parent-results"
  | "/(app)/profile"
  | "/(app)/change-password";

export type Permission =
  | "viewDashboard"
  | "viewStudents"
  | "manageStudents"
  | "markStudentAttendance"
  | "viewAttendanceReports"
  | "manageStaffAttendance"
  | "viewFees"
  | "manageFees"
  | "viewMoney"
  | "manageMoney"
  | "viewExams"
  | "manageExams"
  | "viewSubjects"
  | "manageSubjects"
  | "viewTeachers"
  | "manageTeachers"
  | "viewParents"
  | "manageParents"
  | "viewNotices"
  | "publishNotices"
  | "viewNotifications"
  | "sendBroadcast"
  | "applyLeave"
  | "reviewLeave"
  | "viewReports"
  | "manageAcademic"
  | "manageMasters"
  | "manageUsers"
  | "manageRoles"
  | "manageInquiries"
  | "viewTimetable"
  | "viewOwnResults"
  | "changeOwnPassword";

const ALL_PERMISSIONS: Permission[] = [
  "viewDashboard",
  "viewStudents",
  "manageStudents",
  "markStudentAttendance",
  "viewAttendanceReports",
  "manageStaffAttendance",
  "viewFees",
  "manageFees",
  "viewMoney",
  "manageMoney",
  "viewExams",
  "manageExams",
  "viewSubjects",
  "manageSubjects",
  "viewTeachers",
  "manageTeachers",
  "viewParents",
  "manageParents",
  "viewNotices",
  "publishNotices",
  "viewNotifications",
  "sendBroadcast",
  "applyLeave",
  "reviewLeave",
  "viewReports",
  "manageAcademic",
  "manageMasters",
  "manageUsers",
  "manageRoles",
  "manageInquiries",
  "viewTimetable",
  "viewOwnResults",
  "changeOwnPassword",
];

const SCHOOL_ADMIN_PERMISSIONS: Permission[] = [...ALL_PERMISSIONS];

/** Maps app role → API capabilities (mirrors backend Authorize attributes). */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  superadmin: SCHOOL_ADMIN_PERMISSIONS,
  admin: SCHOOL_ADMIN_PERMISSIONS,
  teacher: [
    "viewDashboard",
    "viewStudents",
    "markStudentAttendance",
    "viewAttendanceReports",
    "viewExams",
    "manageExams",
    "viewSubjects",
    "viewNotices",
    "publishNotices",
    "viewNotifications",
    "applyLeave",
    "reviewLeave",
    "viewTimetable",
    "changeOwnPassword",
  ],
  parent: [
    "viewDashboard",
    "viewFees",
    "viewNotices",
    "viewNotifications",
    "viewOwnResults",
    "applyLeave",
    "viewTimetable",
    "changeOwnPassword",
  ],
  student: [
    "viewDashboard",
    "viewFees",
    "viewNotices",
    "viewNotifications",
    "viewOwnResults",
    "viewExams",
    "changeOwnPassword",
  ],
};

export function roleFromRoleId(roleId?: number): Role {
  switch (roleId) {
    case ROLE_IDS.superadmin:
      return "superadmin";
    case ROLE_IDS.admin:
      return "admin";
    case ROLE_IDS.teacher:
      return "teacher";
    case ROLE_IDS.parent:
      return "parent";
    case ROLE_IDS.student:
      return "student";
    default:
      return "parent";
  }
}

export function hasPermission(role: Role | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** Routes each role may open (deep links guarded in RouteGuard). */
export const ROUTE_ACCESS: Record<Role, AppRoute[]> = {
  superadmin: [
    "/(app)/dashboard",
    "/(app)/menu",
    "/(app)/search",
    "/(app)/students",
    "/(app)/student-profile",
    "/(app)/attendance",
    "/(app)/attendance-reports",
    "/(app)/teacher-attendance",
    "/(app)/fees",
    "/(app)/money",
    "/(app)/exams",
    "/(app)/subjects",
    "/(app)/teachers",
    "/(app)/parents",
    "/(app)/notices",
    "/(app)/notice-compose",
    "/(app)/notifications",
    "/(app)/notification-compose",
    "/(app)/timetable",
    "/(app)/inquiries",
    "/(app)/reports",
    "/(app)/academic-setup",
    "/(app)/masters",
    "/(app)/admission-form",
    "/(app)/leave",
    "/(app)/roles",
    "/(app)/users",
    "/(app)/profile",
    "/(app)/change-password",
  ],
  admin: [
    "/(app)/dashboard",
    "/(app)/menu",
    "/(app)/search",
    "/(app)/students",
    "/(app)/student-profile",
    "/(app)/attendance",
    "/(app)/attendance-reports",
    "/(app)/teacher-attendance",
    "/(app)/fees",
    "/(app)/money",
    "/(app)/exams",
    "/(app)/subjects",
    "/(app)/teachers",
    "/(app)/parents",
    "/(app)/notices",
    "/(app)/notice-compose",
    "/(app)/notifications",
    "/(app)/notification-compose",
    "/(app)/timetable",
    "/(app)/inquiries",
    "/(app)/reports",
    "/(app)/academic-setup",
    "/(app)/masters",
    "/(app)/admission-form",
    "/(app)/leave",
    "/(app)/roles",
    "/(app)/users",
    "/(app)/profile",
    "/(app)/change-password",
  ],
  teacher: [
    "/(app)/dashboard",
    "/(app)/menu",
    "/(app)/search",
    "/(app)/students",
    "/(app)/student-profile",
    "/(app)/attendance",
    "/(app)/attendance-reports",
    "/(app)/exams",
    "/(app)/subjects",
    "/(app)/notices",
    "/(app)/notice-compose",
    "/(app)/notifications",
    "/(app)/timetable",
    "/(app)/leave",
    "/(app)/profile",
    "/(app)/change-password",
  ],
  parent: [
    "/(app)/dashboard",
    "/(app)/menu",
    "/(app)/notifications",
    "/(app)/notices",
    "/(app)/fees",
    "/(app)/parent-results",
    "/(app)/timetable",
    "/(app)/leave",
    "/(app)/profile",
    "/(app)/change-password",
  ],
  student: [
    "/(app)/dashboard",
    "/(app)/notifications",
    "/(app)/notices",
    "/(app)/fees",
    "/(app)/parent-results",
    "/(app)/profile",
    "/(app)/change-password",
  ],
};

export type NavMenuItem = {
  label: string;
  icon: AppIconName;
  route: AppRoute;
  permission?: Permission;
  desc?: string;
  badge?: number;
};

export const NAV_MENU: NavMenuItem[] = [
  { label: "Dashboard", route: "/(app)/dashboard", icon: "home", permission: "viewDashboard" },
  { label: "Students", route: "/(app)/students", icon: "students", permission: "viewStudents" },
  { label: "Admission", route: "/(app)/admission-form", icon: "admission", permission: "manageStudents" },
  { label: "Attendance", route: "/(app)/attendance", icon: "attendance", permission: "markStudentAttendance" },
  { label: "Att. Reports", route: "/(app)/attendance-reports", icon: "attendanceReport", permission: "viewAttendanceReports" },
  { label: "Staff Attend.", route: "/(app)/teacher-attendance", icon: "staffAttendance", permission: "manageStaffAttendance" },
  { label: "Fees", route: "/(app)/fees", icon: "fees", permission: "viewFees" },
  { label: "Accounts", route: "/(app)/money", icon: "accounts", permission: "viewMoney" },
  { label: "Exams", route: "/(app)/exams", icon: "exams", permission: "viewExams" },
  { label: "Subjects", route: "/(app)/subjects", icon: "subjects", permission: "viewSubjects" },
  { label: "Teachers", route: "/(app)/teachers", icon: "teachers", permission: "viewTeachers" },
  { label: "Parents", route: "/(app)/parents", icon: "parents", permission: "viewParents" },
  { label: "Notices", route: "/(app)/notices", icon: "notices", permission: "viewNotices" },
  { label: "Post Notice", route: "/(app)/notice-compose", icon: "compose", permission: "publishNotices" },
  { label: "Alerts", route: "/(app)/notifications", icon: "notifications", permission: "viewNotifications" },
  { label: "Send Alert", route: "/(app)/notification-compose", icon: "broadcast", permission: "sendBroadcast" },
  { label: "Leave", route: "/(app)/leave", icon: "leave", permission: "applyLeave" },
  { label: "Timetable", route: "/(app)/timetable", icon: "timetable", permission: "viewTimetable" },
  { label: "Inquiries", route: "/(app)/inquiries", icon: "inquiries", permission: "manageInquiries" },
  { label: "Reports", route: "/(app)/reports", icon: "reports", permission: "viewReports" },
  { label: "Academic", route: "/(app)/academic-setup", icon: "academic", permission: "manageAcademic" },
  { label: "Masters", route: "/(app)/masters", icon: "masters", permission: "manageMasters" },
  { label: "Users", route: "/(app)/users", icon: "users", permission: "manageUsers" },
  { label: "Roles", route: "/(app)/roles", icon: "roles", permission: "manageRoles" },
  { label: "My Results", route: "/(app)/parent-results", icon: "results", permission: "viewOwnResults" },
];

export function getNavItemsForRole(role: Role | null): NavMenuItem[] {
  if (!role) return [];
  const allowedRoutes = new Set(ROUTE_ACCESS[role]);
  return NAV_MENU.filter((item) => {
    if (!allowedRoutes.has(item.route)) return false;
    if (item.permission && !hasPermission(role, item.permission)) return false;
    return true;
  });
}

export function canAccessRoute(role: Role | null, route: string): boolean {
  if (!role) return false;
  const normalized = route.replace(/\/$/, "") as AppRoute;
  return ROUTE_ACCESS[role].some(
    (r) => normalized === r || normalized.endsWith(r.replace("/(app)", ""))
  );
}

export function isSchoolAdmin(role: Role | null): boolean {
  return role === "admin" || role === "superadmin";
}

export const ROLE_LABELS: Record<Role, string> = {
  superadmin: "Super Admin",
  admin: "School Admin",
  teacher: "Teacher",
  parent: "Parent / Guardian",
  student: "Student",
};

/** Mobile bottom tabs per role */
export const MOBILE_TABS_BY_ROLE: Record<
  Role,
  { label: string; icon: AppIconName; route: AppRoute }[]
> = {
  superadmin: [
    { label: "Menu", icon: "menu", route: "/(app)/menu" },
    { label: "Search", icon: "search", route: "/(app)/search" },
    { label: "Home", icon: "home", route: "/(app)/dashboard" },
    { label: "Fees", icon: "fees", route: "/(app)/fees" },
    { label: "Profile", icon: "profile", route: "/(app)/profile" },
  ],
  admin: [
    { label: "Menu", icon: "menu", route: "/(app)/menu" },
    { label: "Search", icon: "search", route: "/(app)/search" },
    { label: "Home", icon: "home", route: "/(app)/dashboard" },
    { label: "Fees", icon: "fees", route: "/(app)/fees" },
    { label: "Profile", icon: "profile", route: "/(app)/profile" },
  ],
  teacher: [
    { label: "Menu", icon: "menu", route: "/(app)/menu" },
    { label: "Class", icon: "attendance", route: "/(app)/attendance" },
    { label: "Home", icon: "home", route: "/(app)/dashboard" },
    { label: "Alerts", icon: "notifications", route: "/(app)/notifications" },
    { label: "Profile", icon: "profile", route: "/(app)/profile" },
  ],
  parent: [
    { label: "Home", icon: "home", route: "/(app)/dashboard" },
    { label: "Fees", icon: "fees", route: "/(app)/fees" },
    { label: "Results", icon: "results", route: "/(app)/parent-results" },
    { label: "Alerts", icon: "notifications", route: "/(app)/notifications" },
    { label: "Profile", icon: "profile", route: "/(app)/profile" },
  ],
  student: [
    { label: "Home", icon: "home", route: "/(app)/dashboard" },
    { label: "Results", icon: "results", route: "/(app)/parent-results" },
    { label: "Alerts", icon: "notifications", route: "/(app)/notifications" },
    { label: "Notices", icon: "notices", route: "/(app)/notices" },
    { label: "Profile", icon: "profile", route: "/(app)/profile" },
  ],
};
