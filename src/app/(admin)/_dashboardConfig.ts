import type { AppRoute } from "@/constants/rolePermissions";
import type { QuickAction, ActivityItem } from "@/components/shared";

export const QUICK_ACTIONS: (QuickAction & { route: AppRoute })[] = [
  { title: "Admission", icon: "admission", route: "/(admin)/admission-form" as any },
  { title: "Students", icon: "students", route: "/(admin)/students" as any },
  { title: "Masters", icon: "masters", route: "/(admin)/masters" as any },
  { title: "Teachers", icon: "teachers", route: "/(admin)/teachers" as any },
  { title: "Parents", icon: "parents", route: "/(admin)/parents" as any },
  { title: "Timetable", icon: "timetable", route: "/(admin)/timetable" as any },
  { title: "Attendance", icon: "attendance", route: "/(app)/attendance" as any },
  { title: "Exams", icon: "exams", route: "/(admin)/exams" as any },
  { title: "Fees", icon: "fees", route: "/(admin)/fees" as any },
  { title: "Notices", icon: "notices", route: "/(admin)/notices" as any },
  { title: "Reports", icon: "reports", route: "/(app)/reports" as any },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  { text: "New student registered for Grade 1", time: "10m ago" },
  { text: "Notice published: Annual Sports Day", time: "1h ago" },
  { text: "Staff attendance marked for today", time: "2h ago" },
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
export default function DummyRoute() { return null; }
