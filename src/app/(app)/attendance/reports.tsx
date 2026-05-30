import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumDatePicker } from "@/components/ui/PremiumDatePicker";
import { useGetApiAttendanceGet } from "@/api/attendance";
import { buildAttendanceViewParams, parseAttendanceList, todayIsoDate } from "@/api/attendance";
import { useAuthStore } from "@/store/authStore";
import { useAttendanceAccess } from "@/hooks/useAttendanceAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Colors } from "@/constants/colors";
import { getAttendanceRowName, normalizeAttendanceStatusFromApi } from "@/api/attendance";

const REPORT_TYPES = [
  { key: "daily-summary", label: "Daily summary" },
  { key: "class-wise", label: "Class wise" },
  { key: "teacher-entry", label: "Teacher entry" },
  { key: "absent-students", label: "Absent students" },
  { key: "leave-students", label: "Leave students" },
] as const;

export default function AdminAttendanceReportsScreen() {
  const access = useAttendanceAccess();
  const schoolID = useAuthStore((s) => s.userData?.schoolID);
  const [date, setDate] = useState(todayIsoDate());
  const [reportType, setReportType] = useState<string>("daily-summary");

  const params = useMemo(
    () => buildAttendanceViewParams("report", { schoolID, attendanceDate: date, reportType }),
    [schoolID, date, reportType]
  );

  const { data, isLoading } = useGetApiAttendanceGet(params, {
    query: { enabled: access.isSchoolAdmin },
  });

  const rows = useMemo(() => parseAttendanceList(data?.data), [data]);

  if (!access.isSchoolAdmin) {
    return <AccessDenied message="Admin dashboard reports are for school admin only." />;
  }

  return (
    <PremiumScreenLayout
      title="Attendance reports"
      subtitle="Admin dashboard"
      onBack={() => router.back()}
    >
      <PremiumDatePicker label="Report date" value={date} onChange={setDate} />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="my-3">
        {REPORT_TYPES.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => setReportType(t.key)}
            className={`mr-2 px-4 py-2 rounded-xl border ${
              reportType === t.key ? "bg-[#1A3C6E] border-[#1A3C6E]" : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600"
            }`}
          >
            <Text
              className={`text-xs font-black ${reportType === t.key ? "text-white" : "text-gray-500 dark:text-slate-400"}`}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : (
        <ScrollView>
          {rows.length === 0 ? (
            <Text className="text-gray-400 dark:text-slate-500 text-center py-8">No data for this report.</Text>
          ) : (
            rows.map((r, i) => (
              <View key={i} className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-3 mb-2">
                <Text className="font-black text-gray-900 dark:text-slate-100">{getAttendanceRowName(r)}</Text>
                <Text className="text-xs text-gray-500 dark:text-slate-400">
                  {r.className} · {normalizeAttendanceStatusFromApi(r.attendanceStatus)} ·{" "}
                  {r.attendanceDate?.slice(0, 10)}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      )}
    </PremiumScreenLayout>
  );
}
