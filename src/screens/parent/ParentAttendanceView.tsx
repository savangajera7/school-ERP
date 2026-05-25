import React, { useMemo, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { ResponsiveScreen } from "@/components/layout/ResponsiveScreen";
import { RoleHeader } from "@/components/layout/RoleHeader";
import { ROLE_TAB_BAR_HEIGHT } from "@/components/layout/RoleTabBar";
import { SchoolTheme } from "@/constants/theme";
import { useGetApiStudentAttendanceGetStudentAttendanceList } from "@/api/generated/student-attendance/student-attendance";
import { useAuthStore } from "@/store/authStore";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useResponsive } from "@/hooks/useResponsive";

/** Read-only attendance for parent / student */
export default function ParentAttendanceView() {
  const refId = useAuthStore((s) => s.userData?.referenceID);
  const { data, isLoading, refetch, isError } =
    useGetApiStudentAttendanceGetStudentAttendanceList();
  const { columns, bodySize } = useResponsive();
  const records = useMemo(() => {
    const all = parseApiList<{
      studentID?: number;
      attendanceDate?: string;
      status?: string;
      remarks?: string;
    }>(data?.data);
    if (!refId) return all.slice(0, 50);
    return all.filter((r) => r.studentID === refId).slice(0, 100);
  }, [data, refId]);

  return (
    <View style={{ flex: 1 }}>
      <RoleHeader
        title="Attendance"
        subtitle="View only — contact school to correct records"
        accentColor={SchoolTheme.parent}
      />
      <ResponsiveScreen tabBarPadding={ROLE_TAB_BAR_HEIGHT}>
        {isLoading ? (
          <SkeletonLoader rows={5} />
        ) : isError ? (
          <EmptyState icon="⚠️" title="Could not load" message="Pull to refresh or try again." />
        ) : (
          <FlatList
            data={records}
            key={`att-${columns}`}
            numColumns={columns}
            keyExtractor={(item, i) => `${item.attendanceDate}-${i}`}
            onRefresh={refetch}
            refreshing={isLoading}
            ListEmptyComponent={
              <EmptyState title="No records" message="Attendance will appear after teachers mark it." />
            }
            renderItem={({ item }) => (
              <View style={[styles.card, columns > 1 && { flex: 1, margin: 4 }]}>
                <Text style={[styles.date, { fontSize: bodySize }]}>
                  {String(item.attendanceDate ?? "").slice(0, 10)}
                </Text>
                <Text style={styles.status}>{item.status ?? "—"}</Text>
              </View>
            )}
          />
        )}
      </ResponsiveScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: SchoolTheme.border,
  },
  date: { fontWeight: "700", color: SchoolTheme.text },
  status: { marginTop: 4, color: SchoolTheme.textSecondary, fontWeight: "600" },
});
