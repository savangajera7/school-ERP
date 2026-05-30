import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useGetApiAttendanceGet } from "@/api/attendance";
import { buildAttendanceViewParams, normalizeAttendanceStatusFromApi } from "@/api/attendance";
import { useAuthStore } from "@/store/authStore";
import { useAttendanceAccess } from "@/hooks/useAttendanceAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Colors } from "@/constants/colors";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { AppIcon } from "@/components/icons/AppIcon";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function ClassMonthlyReportScreen() {
  const access = useAttendanceAccess();
  const params = useLocalSearchParams<{ classId?: string; className?: string }>();
  const classID = parseInt(String(params.classId ?? ""), 10);
  const className = String(params.className ?? "Class");
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
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

  // The class-monthly view returns a summary object, not a list
  const summary = useMemo(() => {
    const raw = (data?.data as any)?.data ?? data?.data ?? {};
    return {
      totalStudents: Number(raw?.totalStudents ?? raw?.TotalStudents ?? 0),
      present: Number(raw?.summary?.present ?? raw?.Present ?? 0),
      absent: Number(raw?.summary?.absent ?? raw?.Absent ?? 0),
      leave: Number(raw?.summary?.leave ?? raw?.Leave ?? raw?.leave ?? 0),
      month: String(raw?.month ?? raw?.Month ?? MONTH_NAMES[month - 1]),
      year: Number(raw?.year ?? raw?.Year ?? year),
    };
  }, [data, month, year]);

  const total = summary.present + summary.absent + summary.leave;
  const pct = total > 0 ? Math.round((summary.present / total) * 100) : 0;

  const shiftMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) { m = 12; y -= 1; }
    else if (m > 12) { m = 1; y += 1; }
    setMonth(m);
    setYear(y);
  };

  if (!access.isSchoolAdmin && !access.canMarkClass(classID)) {
    return <AccessDenied />;
  }

  return (
    <PremiumScreenLayout
      title={`${className} — Monthly`}
      subtitle="Class attendance summary"
      onBack={() => router.back()}
    >
      {/* Month navigator */}
      <View
        className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 mb-4"
        style={premiumCardShadow}
      >
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => shiftMonth(-1)}
            className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 items-center justify-center"
          >
            <Text className="font-black text-[#1A3C6E] text-lg">‹</Text>
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-base font-black text-gray-900 dark:text-slate-100">
              {MONTH_NAMES[month - 1]}
            </Text>
            <Text className="text-xs font-bold text-gray-400 dark:text-slate-500">{year}</Text>
          </View>
          <TouchableOpacity
            onPress={() => shiftMonth(1)}
            className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 items-center justify-center"
          >
            <Text className="font-black text-[#1A3C6E] text-lg">›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Stats grid */}
          <View className="flex-row flex-wrap gap-3 mb-4">
            <StatCard label="Total Students" value={summary.totalStudents} color="#1A3C6E" />
            <StatCard label="Present" value={summary.present} color="#059669" />
            <StatCard label="Absent" value={summary.absent} color="#DC2626" />
            <StatCard label="Leave" value={summary.leave} color="#D97706" />
          </View>

          {/* Attendance % card */}
          <View
            className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-5 mb-4 items-center"
            style={premiumCardShadow}
          >
            <Text className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 mb-2">
              Attendance Rate
            </Text>
            <Text className="text-5xl font-black text-[#1A3C6E]">{pct}%</Text>
            <View className="w-full mt-4 bg-gray-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <View
                className="h-full rounded-full bg-emerald-500"
                style={{ width: `${pct}%` }}
              />
            </View>
            <View className="flex-row justify-between w-full mt-2">
              <Text className="text-[10px] font-bold text-gray-400 dark:text-slate-500">0%</Text>
              <Text className="text-[10px] font-bold text-gray-400 dark:text-slate-500">100%</Text>
            </View>
          </View>

          {/* Breakdown bar */}
          {total > 0 && (
            <View
              className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-4 mb-4"
              style={premiumCardShadow}
            >
              <Text className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-500 mb-3">
                Breakdown
              </Text>
              <View className="flex-row h-4 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-700">
                <View style={{ flex: summary.present / total, backgroundColor: "#10B981" }} />
                <View style={{ flex: summary.absent / total, backgroundColor: "#EF4444" }} />
                <View style={{ flex: summary.leave / total, backgroundColor: "#F59E0B" }} />
              </View>
              <View className="flex-row justify-between mt-2">
                <Text className="text-[10px] font-bold text-emerald-600">
                  P {summary.present}
                </Text>
                <Text className="text-[10px] font-bold text-rose-600">
                  A {summary.absent}
                </Text>
                <Text className="text-[10px] font-bold text-amber-600">
                  L {summary.leave}
                </Text>
              </View>
            </View>
          )}

          {/* Quick actions */}
          <View className="flex-row gap-2 mb-4">
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(app)/attendance/mark",
                  params: {
                    classId: String(classID),
                    className,
                    date: new Date().toISOString().split("T")[0],
                    marked: "0",
                  },
                })
              }
              className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl bg-[#1A3C6E] border border-[#1A3C6E]"
              activeOpacity={0.85}
            >
              <AppIcon name="attendance" size={14} color="#fff" />
              <Text className="text-white text-xs font-black uppercase">Mark Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: "/(app)/attendance/history",
                  params: { classId: String(classID) },
                })
              }
              className="flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600"
              activeOpacity={0.85}
            >
              <AppIcon name="reports" size={14} color="#6B7280" />
              <Text className="text-gray-600 dark:text-slate-400 text-xs font-black uppercase">History</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}
    </PremiumScreenLayout>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <View
      className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-3 min-w-[45%] flex-1"
      style={premiumCardShadow}
    >
      <Text className="text-[10px] font-black uppercase text-gray-400 dark:text-slate-500">{label}</Text>
      <Text className="text-2xl font-black mt-1" style={{ color }}>
        {value}
      </Text>
    </View>
  );
}
