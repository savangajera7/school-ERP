import type { AppRoute } from "@/constants/rolePermissions";
import type { QuickAction, ActivityItem } from "@/components/shared";
import type { AppIconName } from "@/constants/appIcons";

export const QUICK_ACTIONS: (QuickAction & { route: AppRoute })[] = [
  { title: "Admission", icon: "admission", route: "/(app)/admission-form" as any },
  { title: "Students", icon: "students", route: "/(app)/students" as any },
  { title: "Masters", icon: "masters", route: "/(admin)/masters" as any },
  { title: "Teachers", icon: "teachers", route: "/(admin)/teachers" as any },
  { title: "Attendance", icon: "attendance", route: "/(admin)/attendance" as any },
  { title: "Exams", icon: "exams", route: "/(admin)/exams" as any },
  { title: "Fees", icon: "fees", route: "/(admin)/fees" as any },
  { title: "Notices", icon: "notices", route: "/(app)/notices" as any },
  { title: "Reports", icon: "reports", route: "/(app)/attendance-reports" as any },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  { text: "New student registered", time: "10m ago" },
  { text: "Notice published: Sports Day", time: "1h ago" },
  { text: "Staff attendance marked", time: "2h ago" },
];

export function getAttendanceTodayVal(attendance: any[]) {
  const presentToday = attendance.filter(
    (a) =>
      (a.attendanceStatus || "").toLowerCase() === "present" &&
      String(a.attendanceDate || "").slice(0, 10) === new Date().toISOString().slice(0, 10)
  ).length;

  return attendance.length > 0
    ? `${Math.round((presentToday / attendance.length) * 100)}%`
    : "—";
}

export type IndicatorData = {
  icon: AppIconName;
  iconBgClass: string;
  iconColorHex: string;
  title: string;
  desc: string;
  value: string | number;
  valueColorClass: string;
  target: string;
  btnText: string;
  route: AppRoute;
  rowBgClass: string;
};

export const getOperationalIndicators = (
  isLoading: boolean,
  totalStudentsVal: number,
  attendanceTodayVal: string,
  totalStaffVal: number,
  staffAttendanceVal: string
): IndicatorData[] => [
  {
    icon: "students",
    iconBgClass: "bg-sky-50 border-sky-100",
    iconColorHex: "#0369A1",
    title: "Total Enrolled Students",
    desc: "Active student admissions",
    value: isLoading ? "..." : totalStudentsVal,
    valueColorClass: "text-sky-600",
    target: "1,500 Max Cap",
    btnText: "Manage",
    route: "/(app)/students" as any,
    rowBgClass: "bg-white",
  },
  {
    icon: "check",
    iconBgClass: "bg-emerald-50 border-emerald-100",
    iconColorHex: "#15803D",
    title: "Student Attendance Today",
    desc: "Daily present percentage",
    value: isLoading ? "..." : attendanceTodayVal,
    valueColorClass: "text-emerald-600",
    target: "100% Target",
    btnText: "Registry",
    route: "/(app)/attendance" as any,
    rowBgClass: "bg-gray-50/10",
  },
  {
    icon: "teachers",
    iconBgClass: "bg-purple-50 border-purple-100",
    iconColorHex: "#7E22CE",
    title: "Total Faculty & Staff",
    desc: "Registered faculty",
    value: isLoading ? "..." : totalStaffVal,
    valueColorClass: "text-purple-600",
    target: "50 Optimal",
    btnText: "Directory",
    route: "/(app)/teachers" as any,
    rowBgClass: "bg-white",
  },
  {
    icon: "clock",
    iconBgClass: "bg-cyan-50 border-cyan-100",
    iconColorHex: "#0E7490",
    title: "Staff Attendance",
    desc: "Faculty daily register",
    value: isLoading ? "..." : staffAttendanceVal,
    valueColorClass: "text-cyan-600",
    target: "100% Target",
    btnText: "Reports",
    route: "/(app)/attendance-reports" as any,
    rowBgClass: "bg-gray-50/10",
  },
];
export default function DummyRoute() { return null; }
