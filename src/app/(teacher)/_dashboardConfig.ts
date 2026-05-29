import type { AppRoute } from "@/constants/rolePermissions";
import type { QuickAction, ActivityItem } from "@/components/shared";

export const QUICK_ACTIONS: (QuickAction & { route: AppRoute })[] = [
  { title: "Students", icon: "students", route: "/(admin)/students" },
  { title: "Timetable", icon: "timetable", route: "/(admin)/timetable" },
  { title: "Attendance", icon: "attendance", route: "/(app)/attendance" },
  { title: "Homework", icon: "homework", route: "/(teacher)/homework" },
  { title: "Classwork", icon: "classwork", route: "/(teacher)/classwork" },
  { title: "Notices", icon: "notices", route: "/(app)/notices" },
  { title: "Reports", icon: "reports", route: "/(app)/attendance/reports" },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  { text: "Homework assigned to Grade 5", time: "30m ago" },
  { text: "Attendance marked for today", time: "1h ago" },
  { text: "New notice published", time: "2h ago" },
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
