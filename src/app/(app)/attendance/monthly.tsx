import React, { useMemo } from "react";
import { View, Text, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useGetApiAttendanceGet } from "@/api/attendance";
import { buildAttendanceViewParams, parseAttendanceList } from "@/api/attendance";
import { useAuthStore } from "@/store/authStore";
import { useAttendanceAccess } from "@/hooks/useAttendanceAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Colors } from "@/constants/colors";
import { getAttendanceRowName, normalizeAttendanceStatusFromApi } from "@/api/attendance";

export default function ClassMonthlyReportScreen() {
  const access = useAttendanceAccess();
  const params = useLocalSearchParams<{ classId?: string; className?: string }>();
  const classID = parseInt(String(params.classId ?? ""), 10);
  const className = String(params.className ?? "Class");
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const schoolID = useAuthStore((s) => s.userData?.schoolID);

  const queryParams = useMemo(
    () =>
      classID
        ? buildAttendanceViewParams("class-monthly", { classID, month, year, schoolID })
        : undefined,
    [classID, month, year, schoolID]
  );

  const { data, isLoading } = useGetApiAttendanceGet(queryParams, {
    query: { enabled: !!classID },
  });

  const rows = useMemo(() => parseAttendanceList(data?.data), [data]);

  const summary = useMemo(() => {
    let present = 0;
    let absent = 0;
    let leave = 0;
    rows.forEach((r) => {
      const s = normalizeAttendanceStatusFromApi(r.attendanceStatus);
      if (s === "Present") present++;
      else if (s === "Absent") absent++;
      else if (s === "Leave") leave++;
    });
    return { present, absent, leave, total: rows.length };
  }, [rows]);

  if (!access.isSchoolAdmin && !access.canMarkClass(classID)) {
    return <AccessDenied />;
  }

  return (
    <PremiumScreenLayout
      title={`${className} — Monthly`}
      subtitle={`${month}/${year}`}
      onBack={() => router.back()}
    >
      {isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : (
        <ScrollView>
          <View className="flex-row flex-wrap gap-2 mb-4">
            <Stat label="Records" value={String(summary.total)} />
            <Stat label="Present" value={String(summary.present)} />
            <Stat label="Absent" value={String(summary.absent)} />
            <Stat label="Leave" value={String(summary.leave)} />
          </View>
          {rows.map((r, i) => (
            <View key={i} className="bg-white border border-gray-100 rounded-xl px-4 py-3 mb-2">
              <Text className="font-black text-gray-900">{getAttendanceRowName(r)}</Text>
              <Text className="text-xs text-gray-500">
                {r.attendanceDate?.slice(0, 10)} · {normalizeAttendanceStatusFromApi(r.attendanceStatus)}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </PremiumScreenLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="bg-white border border-gray-150 rounded-xl px-4 py-3 min-w-[45%] flex-1">
      <Text className="text-[10px] font-black uppercase text-gray-400">{label}</Text>
      <Text className="text-xl font-black text-gray-900">{value}</Text>
    </View>
  );
}
