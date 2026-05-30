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
  super_admin: 1,
  admin: 2,
  teacher: 3,
  parent: 4,
  student: 5,
} as const;

export type AppRoute =
  | "/(app)/homework"
  | "/(app)/classwork"
  | "/(app)/notebook"
  | "/(app)/notices"
  | "/(app)/dashboard"
  | "/(app)/menu"
  | "/(app)/student-profile"
  | "/(app)/attendance"
  | "/(app)/attendance/reports"
  | "/(app)/fees"
  | "/(app)/exams"
  | "/(app)/subjects"
  | "/(app)/notices"
  | "/(app)/notice-compose"
  | "/(app)/notifications"
  | "/(app)/reports"
  | "/(app)/leave"
  | "/(app)/parent-results"
  | "/(app)/profile"
  | "/(app)/change-password"
  | "/(teacher)/homework"
  | "/(teacher)/classwork"
  | "/(teacher)/notebook"
  | "/(teacher)/exam-marks"
  | "/(parent)/homework"
  | "/(parent)/syllabus"
  | "/(parent)/attendance"
  | "/(parent)/fees"
  | "/(parent)/exam"
  | "/(parent)/result"
  | "/(parent)/notices"
  | "/(admin)/dashboard"
  | "/(admin)/students"
  | "/(admin)/teachers"
  | "/(admin)/parents"
  | "/(admin)/fees"
  | "/(admin)/exams"
  | "/(admin)/notices"
  | "/(admin)/notifications"
  | "/(admin)/timetable"
  | "/(admin)/masters"
  | "/(admin)/roles"
  | "/(admin)/users"
  | "/(admin)/money"
  | "/(admin)/admission-form"
  | "/(admin)/inquiries"
  | "/(admin)/academic-setup"
  | "/(admin)/teacher-attendance"
  | "/(admin)/notification-compose"
  | "/(admin)/settings"
  | "/(super-admin)/dashboard"
  | "/(super-admin)/menu"
  | "/(super-admin)/schools"
  | "/(super-admin)/add-school"
  | "/(super-admin)/edit-school/[id]"
  | "/(super-admin)/settings"
  | "/(super-admin)/role-rights"
  | "/(super-admin)/roles"
  | "/(super-admin)/roles/create"
  | "/(super-admin)/users"
  | "/(super-admin)/users/create"
  | "/(super-admin)/users/[id]";

export type Permission =
  | "viewDashboard"
  | "viewStudents"
  | "manageStudents"
  | "markStudentAttendance"
  | "viewStudentAttendance"
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
  | "changeOwnPassword"
  | "manageHomework"
  | "viewHomework"
  | "manageClasswork"
  | "viewClasswork"
  | "manageNotebook"
  | "viewNotebook"
  | "viewSyllabus";

const ALL_PERMISSIONS: Permission[] = [
  "viewDashboard",
  "viewStudents",
  "manageStudents",
  "markStudentAttendance",
  "viewStudentAttendance",
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
  "manageHomework",
  "viewHomework",
  "manageClasswork",
  "viewClasswork",
  "manageNotebook",
  "viewNotebook",
  "viewSyllabus",
];

const SUPER_ADMIN_PERMISSIONS: Permission[] = [...ALL_PERMISSIONS];

const SCHOOL_ADMIN_PERMISSIONS: Permission[] = ALL_PERMISSIONS.filter(
  (p) => p !== "manageUsers" && p !== "manageRoles"
);

/** Maps app role → API capabilities (mirrors backend Authorize attributes). */
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  super_admin: SUPER_ADMIN_PERMISSIONS,
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
    "manageHomework",
    "manageClasswork",
    "manageNotebook",
  ],
  parent: [
    "viewDashboard",
    "viewFees",
    "viewNotices",
    "viewNotifications",
    "viewOwnResults",
    "viewStudentAttendance",
    "applyLeave",
    "viewTimetable",
    "changeOwnPassword",
    "viewHomework",
    "viewClasswork",
    "viewNotebook",
    "viewSyllabus",
  ],
  student: [
    "viewDashboard",
    "viewFees",
    "viewNotices",
    "viewNotifications",
    "viewOwnResults",
    "viewStudentAttendance",
    "viewExams",
    "changeOwnPassword",
    "viewHomework",
    "viewSyllabus",
  ],
};

export function roleFromRoleId(roleId?: number): Role {
  switch (roleId) {
    case ROLE_IDS.super_admin:
      return "super_admin";
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
  super_admin: [
    "/(app)/dashboard",
    "/(app)/menu",
    "/(app)/student-profile",
    "/(app)/attendance",
    "/(app)/attendance/reports",
    "/(admin)/teacher-attendance",
    "/(admin)/money",
    "/(app)/subjects",
    "/(admin)/admission-form",
    "/(app)/leave",
    "/(admin)/roles",
    "/(admin)/users",
    "/(app)/profile",
    "/(app)/change-password",
    "/(admin)/academic-setup",
    "/(admin)/inquiries",
    "/(admin)/teachers",
    "/(admin)/parents",
    "/(admin)/fees",
    "/(admin)/exams",
    "/(admin)/notices",
    "/(admin)/notifications",
    "/(admin)/timetable",
    "/(app)/reports",
    "/(admin)/masters",
    "/(admin)/dashboard",
    "/(admin)/students",
    "/(super-admin)/dashboard",
    "/(super-admin)/menu",
    "/(super-admin)/schools",
    "/(super-admin)/add-school",
    "/(super-admin)/edit-school/[id]",
    "/(super-admin)/settings",
    "/(super-admin)/role-rights",
    "/(super-admin)/roles",
    "/(super-admin)/roles/create",
    "/(super-admin)/users",
    "/(super-admin)/users/create",
    "/(super-admin)/users/[id]",
  ],
  admin: [
    "/(app)/dashboard",
    "/(app)/menu",
    "/(app)/student-profile",
    "/(app)/attendance",
    "/(app)/attendance/reports",
    "/(admin)/teacher-attendance",
    "/(admin)/money",
    "/(app)/subjects",
    "/(admin)/admission-form",
    "/(app)/leave",
    "/(app)/profile",
    "/(app)/change-password",
    "/(admin)/academic-setup",
    "/(admin)/inquiries",
    "/(admin)/teachers",
    "/(admin)/parents",
    "/(admin)/fees",
    "/(admin)/exams",
    "/(admin)/notices",
    "/(admin)/notifications",
    "/(admin)/timetable",
    "/(app)/reports",
    "/(admin)/masters",
    "/(admin)/dashboard",
    "/(admin)/students",
  ],
  teacher: [
    "/(app)/dashboard",
    "/(app)/menu",
    "/(admin)/students",
    "/(app)/student-profile",
    "/(app)/attendance",
    "/(app)/attendance/reports",
    "/(app)/exams",
    "/(app)/subjects",
    "/(app)/notices",
    "/(app)/notice-compose",
    "/(app)/notifications",
    "/(app)/leave",
    "/(app)/profile",
    "/(app)/change-password",
    "/(teacher)/homework",
    "/(teacher)/classwork",
    "/(teacher)/notebook",
    "/(teacher)/exam-marks",
    "/(admin)/notices",
    "/(admin)/notifications",
    "/(admin)/timetable",
  ],
  parent: [
    "/(app)/dashboard",
    "/(app)/menu",
    "/(app)/notifications",
    "/(app)/notices",
    "/(app)/fees",
    "/(app)/parent-results",
    "/(app)/leave",
    "/(app)/profile",
    "/(app)/change-password",
    "/(parent)/homework",
    "/(parent)/syllabus",
    "/(parent)/attendance",
    "/(parent)/fees",
    "/(parent)/exam",
    "/(parent)/result",
    "/(parent)/notices",
    "/(admin)/notices",
    "/(admin)/notifications",
    "/(admin)/timetable",
  ],
  student: [
    "/(app)/dashboard",
    "/(app)/menu",
    "/(app)/notifications",
    "/(app)/notices",
    "/(app)/fees",
    "/(app)/parent-results",
    "/(app)/profile",
    "/(app)/change-password",
    "/(parent)/homework",
    "/(parent)/syllabus",
    "/(parent)/attendance",
    "/(admin)/notices",
    "/(admin)/notifications",
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
  { label: "Dashboard",    route: "/(app)/dashboard",          icon: "home",            permission: "viewDashboard" },
  { label: "Students",     route: "/(admin)/students",           icon: "students",        permission: "viewStudents" },
  { label: "Admission",    route: "/(admin)/admission-form",     icon: "admission",       permission: "manageStudents" },
  { label: "Teachers",     route: "/(admin)/teachers",         icon: "teachers",        permission: "viewTeachers" },
  { label: "Attendance",   route: "/(app)/attendance",         icon: "attendance",      permission: "markStudentAttendance" },
  { label: "Att. Reports", route: "/(app)/attendance/reports", icon: "attendanceReport",permission: "viewAttendanceReports" },
  { label: "Staff Attend.",route: "/(admin)/teacher-attendance", icon: "staffAttendance", permission: "manageStaffAttendance" },
  { label: "Fees",         route: "/(admin)/fees",             icon: "fees",            permission: "viewFees" },
  { label: "Accounts",     route: "/(admin)/money",              icon: "accounts",        permission: "viewMoney" },
  { label: "Exams",        route: "/(admin)/exams",            icon: "exams",           permission: "viewExams" },
  { label: "Subjects",     route: "/(app)/subjects",           icon: "subjects",        permission: "viewSubjects" },
  { label: "Notices",      route: "/(admin)/notices",          icon: "notices",         permission: "viewNotices" },
  { label: "Notifications",route: "/(admin)/notifications",    icon: "notifications",   permission: "viewNotifications" },
  { label: "Timetable",    route: "/(admin)/timetable",        icon: "timetable",       permission: "viewTimetable" },
  { label: "Leave",        route: "/(app)/leave",              icon: "leave",           permission: "applyLeave" },
  { label: "Inquiries",    route: "/(admin)/inquiries",          icon: "inquiries",       permission: "manageInquiries" },
  { label: "Reports",      route: "/(app)/reports",          icon: "reports",         permission: "viewReports" },
  { label: "Academic",     route: "/(admin)/academic-setup",     icon: "academic",        permission: "manageAcademic" },
  { label: "Masters",      route: "/(admin)/masters",          icon: "masters",         permission: "manageMasters" },
  { label: "Users",        route: "/(admin)/users",              icon: "users",           permission: "manageUsers" },
  { label: "Roles",        route: "/(admin)/roles",              icon: "roles",           permission: "manageRoles" },
  { label: "My Results",   route: "/(app)/parent-results",     icon: "results",         permission: "viewOwnResults" },
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
  const normalized = route.replace(/\/$/, "");
  const allowed = ROUTE_ACCESS[role] ?? [];
  return allowed.some((r) => {
    if (normalized === r) return true;
    if (normalized.startsWith(`${r}/`)) return true;
    const rTail = r.replace(/^\([^)]+\)/, "");
    const nTail = normalized.replace(/^\([^)]+\)/, "");
    if (!rTail.length) return false;
    return nTail === rTail || nTail.startsWith(`${rTail}/`);
  });
}

export function isSchoolAdmin(role: Role | null): boolean {
  return role === "admin" || role === "super_admin";
}

export const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "School Admin",
  teacher: "Teacher",
  parent: "Parent / Guardian",
  student: "Student",
};

export const MOBILE_TABS_BY_ROLE: Record<
  Role,
  { label: string; icon: AppIconName; route: AppRoute }[]
> = {
  super_admin: [
    { label: "Menu", icon: "menu", route: "/(app)/menu" },
    { label: "Search", icon: "search", route: "/(admin)/students" },
    { label: "Home", icon: "home", route: "/(app)/dashboard" },
    { label: "Time Table", icon: "timetable", route: "/(admin)/timetable" },
    { label: "Profile", icon: "profile", route: "/(app)/profile" },
  ],
  admin: [
    { label: "Menu", icon: "menu", route: "/(app)/menu" },
    { label: "Search", icon: "search", route: "/(admin)/students" },
    { label: "Home", icon: "home", route: "/(app)/dashboard" },
    { label: "Time Table", icon: "timetable", route: "/(admin)/timetable" },
    { label: "Profile", icon: "profile", route: "/(app)/profile" },
  ],
  teacher: [
    { label: "Menu", icon: "menu", route: "/(app)/menu" },
    { label: "Search", icon: "search", route: "/(admin)/students" },
    { label: "Home", icon: "home", route: "/(app)/dashboard" },
    { label: "Time Table", icon: "timetable", route: "/(admin)/timetable" },
    { label: "Profile", icon: "profile", route: "/(app)/profile" },
  ],
  parent: [
    { label: "Menu", icon: "menu", route: "/(app)/menu" },
    { label: "Notices", icon: "notices", route: "/(app)/notices" },
    { label: "Home", icon: "home", route: "/(app)/dashboard" },
    { label: "Time Table", icon: "timetable", route: "/(admin)/timetable" },
    { label: "Profile", icon: "profile", route: "/(app)/profile" },
  ],
  student: [
    { label: "Menu", icon: "menu", route: "/(app)/menu" },
    { label: "Notices", icon: "notices", route: "/(app)/notices" },
    { label: "Home", icon: "home", route: "/(app)/dashboard" },
    { label: "Time Table", icon: "timetable", route: "/(admin)/timetable" },
    { label: "Profile", icon: "profile", route: "/(app)/profile" },
  ],
};
