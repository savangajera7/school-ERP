import { Redirect } from "expo-router";

/** Legacy route — admin reports live under attendance stack. */
export default function AttendanceReportsRedirect() {
  return <Redirect href="/(app)/attendance/reports" />;
}
