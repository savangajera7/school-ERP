import { Redirect, useLocalSearchParams } from "expo-router";

/**
 * Legacy single-student form URL — new flow is class-based marking.
 * Edit links with ?id= still land here; send users to class mark screen when possible.
 */
export default function AttendanceFormRedirect() {
  const { id } = useLocalSearchParams<{ id?: string }>();

  if (!id) {
    return <Redirect href="/(app)/attendance" />;
  }

  return <Redirect href={`/(app)/attendance/records`} />;
}
