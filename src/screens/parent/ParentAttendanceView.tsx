import React, { useMemo } from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { Colors } from "@/constants/colors";
import { useGetApiStudentAttendanceGetStudentAttendanceList } from "@/api/generated/student-attendance/student-attendance";
import { useAuthStore } from "@/store/authStore";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/hooks/useTranslation";

/** Read-only attendance for parent / student */
export default function ParentAttendanceView() {
  const refId = useAuthStore((s) => s.userData?.referenceID);
  const { data, isLoading, refetch, isError } =
    useGetApiStudentAttendanceGetStudentAttendanceList();
  const { isMobile } = useResponsive();
  const { t } = useTranslation();

  const records = useMemo(() => {
    const all = parseApiList<{
      studentID?: number;
      attendanceDate?: string;
      attendanceStatus?: string;
      remarks?: string;
    }>(data?.data);
    
    // Filter by child ID if available
    const filtered = refId ? all.filter((r) => r.studentID === refId) : all;
    
    // Sort by date descending
    return filtered.sort((a, b) => 
      new Date(b.attendanceDate || 0).getTime() - new Date(a.attendanceDate || 0).getTime()
    ).slice(0, 100);
  }, [data, refId]);

  return (
    <PremiumScreenLayout
      title={t.attendance}
      subtitle="View your child's daily presence records"
      withTabBar
      scrollable={false}
      bodyStyle={{ paddingHorizontal: 0, marginTop: -16, flex: 1 }}
    >
        {isLoading ? (
          <View className="px-4 py-4">
            <SkeletonLoader variant={isMobile ? "card" : "table"} rows={5} />
          </View>
        ) : isError ? (
          <View className="px-4 py-4">
            <EmptyState icon="warning" title="Could not load" message="Pull to refresh or try again." />
          </View>
        ) : (
          <FlatList
            data={records}
            keyExtractor={(item, i) => `${item.attendanceDate}-${i}`}
            onRefresh={refetch}
            refreshing={isLoading}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, gap: 12 }}
            ListEmptyComponent={
              <EmptyState title="No records" message="Attendance will appear after teachers mark it." />
            }
            renderItem={({ item }) => {
              const status = item.attendanceStatus || "Pending";
              const dateStr = item.attendanceDate ? new Date(item.attendanceDate).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }) : "—";

              const statusColor = 
                status === "Present" ? Colors.success :
                status === "Absent" ? Colors.error :
                status === "Late" ? Colors.accent : "#94A3B8";

              return (
                <MobileDataCard
                  title={dateStr}
                  subtitle={status}
                  accentColor={statusColor}
                  badge={
                    <View 
                      className="px-2 py-0.5 rounded-lg border"
                      style={{ 
                        backgroundColor: `${statusColor}10`,
                        borderColor: `${statusColor}30`
                      }}
                    >
                      <Text 
                        className="text-[10px] font-black uppercase"
                        style={{ color: statusColor }}
                      >
                        {status}
                      </Text>
                    </View>
                  }
                  fields={item.remarks ? [{ label: "Remarks", value: item.remarks }] : []}
                />
              );
            }}
          />
        )}
    </PremiumScreenLayout>
  );
}
