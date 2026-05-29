import type { AppRoute } from "@/constants/rolePermissions";
import type { QuickAction, ActivityItem } from "@/components/shared";

export const QUICK_ACTIONS: (QuickAction & { route: AppRoute })[] = [
  { title: "My Children", icon: "students", route: "/(admin)/students" as any },
  { title: "Timetable", icon: "timetable", route: "/(parent)/timetable" as any },
  { title: "Attendance", icon: "attendance", route: "/(parent)/attendance" as any },
  { title: "Homework", icon: "homework", route: "/(parent)/homework" as any },
  { title: "Notices", icon: "notices", route: "/(app)/notices" as any },
  { title: "Reports", icon: "reports", route: "/(app)/attendance/reports" as any },
  { title: "Fees", icon: "fees", route: "/(parent)/fees" as any },
];

export const RECENT_ACTIVITY: ActivityItem[] = [
  { text: "New homework assigned", time: "1h ago" },
  { text: "Attendance updated", time: "2h ago" },
  { text: "New notice: Parent-Teacher Meeting", time: "3h ago" },
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
