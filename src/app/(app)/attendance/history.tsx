import React, { useMemo } from "react";
import { View, Text, FlatList } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useGetApiAttendanceGet } from "@/api/attendance";
import { buildAttendanceViewParams, parseHistoryView } from "@/api/attendance";
import { useAuthStore } from "@/store/authStore";
import { useAttendanceAccess } from "@/hooks/useAttendanceAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Colors } from "@/constants/colors";
import { formatDisplayDate } from "@/utils/dateHelpers";
import { getAttendanceRowName } from "@/api/attendance";

export default function AttendanceHistoryScreen() {
  const access = useAttendanceAccess();
  const params = useLocalSearchParams<{ classId?: string; date?: string; studentId?: string }>();
  const classID = parseInt(String(params.classId ?? ""), 10);
  const date = String(params.date ?? "");
  const studentID = params.studentId ? parseInt(String(params.studentId), 10) : undefined;
  const schoolID = useAuthStore((s) => s.userData?.schoolID);

  const queryParams = useMemo(
    () =>
      classID
        ? buildAttendanceViewParams("history", {
            classID,
            attendanceDate: date,
            studentID,
            schoolID,
          })
        : undefined,
    [classID, date, studentID, schoolID]
  );

  const { data, isLoading } = useGetApiAttendanceGet(queryParams, {
    query: { enabled: !!classID },
  });

  const rows = useMemo(() => parseHistoryView(data?.data), [data]);

  if (!access.isSchoolAdmin && !access.canMarkClass(classID)) {
    return <AccessDenied message="No permission to view attendance history." />;
  }

  return (
    <PremiumScreenLayout
      title="Attendance history"
      subtitle={formatDisplayDate(date)}
      onBack={() => router.back()}
      scrollable={false}
    >
      {isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item, i) => String(item.studentAttendanceID ?? item.studentID ?? i)}
          ListEmptyComponent={
            <Text className="text-center text-gray-400 py-10">No history records.</Text>
          }
          renderItem={({ item }) => (
            <View className="bg-white border border-gray-150 rounded-xl p-4 mb-2">
              <Text className="font-black text-gray-900">{getAttendanceRowName(item)}</Text>
              <Text className="text-sm text-gray-600 mt-1">
                Status: {item.attendanceStatus ?? "—"}
              </Text>
              <Text className="text-xs text-gray-400 mt-1">
                By: {item.markedBy ?? "—"} · {formatDisplayDate(item.attendanceDate)}
              </Text>
            </View>
          )}
        />
      )}
    </PremiumScreenLayout>
  );
}
