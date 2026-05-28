import { Redirect } from "expo-router";

/** Admin sidebar "Attendance" → class-based marking (Screen 1). */
export default function AdminAttendanceRedirect() {
  return <Redirect href="/(app)/attendance" />;
}
