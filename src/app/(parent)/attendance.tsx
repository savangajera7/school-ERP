import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { Redirect } from "expo-router";
import {
  useGetApiAttendanceGet,
  buildAttendanceViewParams,
  parseParentMonthlyView,
  parseParentYearlyView,
} from "@/api/attendance";
import { useAuthStore } from "@/store/authStore";
import { useAttendanceAccess } from "@/hooks/useAttendanceAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Colors } from "@/constants/colors";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export default function ParentAttendanceScreen() {
  const { isAttendanceReadOnly, can, isSchoolAdmin, isTeacher } = useAttendanceAccess();
  const userData = useAuthStore((s) => s.userData);
  const studentId = userData?.studentID ?? userData?.referenceID;
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [tab, setTab] = useState<"monthly" | "yearly">("monthly");

  if (isSchoolAdmin) {
    return <Redirect href="/(app)/attendance" />;
  }
  if (isTeacher) {
    return <Redirect href="/(app)/attendance" />;
  }
  if (!isAttendanceReadOnly || !can("viewStudentAttendance")) {
    return (
      <AccessDenied message="Attendance view is only available for parents and students." />
    );
  }

  if (!studentId) {
    return (
      <AccessDenied message="Student profile link missing — contact your school." />
    );
  }

  const monthlyParams = useMemo(
    () =>
      buildAttendanceViewParams("parent-monthly", {
        studentID: studentId,
        month,
        year,
        schoolID: userData?.schoolID,
      }),
    [studentId, month, year, userData?.schoolID]
  );

  const yearlyParams = useMemo(
    () =>
      buildAttendanceViewParams("parent-yearly", {
        studentID: studentId,
        year,
        schoolID: userData?.schoolID,
      }),
    [studentId, year, userData?.schoolID]
  );

  const monthlyQuery = useGetApiAttendanceGet(monthlyParams, {
    query: { enabled: tab === "monthly" },
  });
  const yearlyQuery = useGetApiAttendanceGet(yearlyParams, {
    query: { enabled: tab === "yearly" },
  });

  const monthly = useMemo(
    () => parseParentMonthlyView(monthlyQuery.data?.data),
    [monthlyQuery.data]
  );
  const yearly = useMemo(
    () => parseParentYearlyView(yearlyQuery.data?.data),
    [yearlyQuery.data]
  );

  const isLoading = tab === "monthly" ? monthlyQuery.isLoading : yearlyQuery.isLoading;

  const shiftMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 1) {
      m = 12;
      y -= 1;
    } else if (m > 12) {
      m = 1;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  };

  return (
    <PremiumScreenLayout
      title="Attendance"
      subtitle="View-only — monthly & yearly summary"
    >
      <View className="flex-row mb-4 bg-gray-100 rounded-xl p-1">
        {(["monthly", "yearly"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg ${tab === t ? "bg-white shadow-sm" : ""}`}
          >
            <Text
              className={`text-center text-xs font-black uppercase ${
                tab === t ? "text-[#1A3C6E]" : "text-gray-400"
              }`}
            >
              {t === "monthly" ? "This month" : "Yearly"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === "monthly" && (
        <View className="flex-row items-center justify-between mb-4">
          <TouchableOpacity onPress={() => shiftMonth(-1)} className="px-4 py-2">
            <Text className="font-black text-[#1A3C6E]">‹</Text>
          </TouchableOpacity>
          <Text className="font-black text-gray-900">
            {MONTH_NAMES[month - 1]} {year}
          </Text>
          <TouchableOpacity onPress={() => shiftMonth(1)} className="px-4 py-2">
            <Text className="font-black text-[#1A3C6E]">›</Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === "yearly" && (
        <View className="flex-row items-center justify-center mb-4 gap-4">
          <TouchableOpacity onPress={() => setYear((y) => y - 1)}>
            <Text className="font-black text-[#1A3C6E]">‹</Text>
          </TouchableOpacity>
          <Text className="font-black text-gray-900">{year}</Text>
          <TouchableOpacity onPress={() => setYear((y) => y + 1)}>
            <Text className="font-black text-[#1A3C6E]">›</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : tab === "monthly" ? (
        <ScrollView>
          <View className="flex-row flex-wrap gap-2">
            <StatCard label="Working days" value={monthly.workingDays} />
            <StatCard label="Present" value={monthly.presentDays} color="#10B981" />
            <StatCard label="Absent" value={monthly.absentDays} color="#EF4444" />
            <StatCard label="Leave" value={monthly.leaveDays} color="#F59E0B" />
          </View>
          <View className="mt-4 bg-white border border-gray-150 rounded-2xl p-6 items-center">
            <Text className="text-[10px] font-black uppercase text-gray-400">
              Attendance %
            </Text>
            <Text className="text-4xl font-black text-[#1A3C6E] mt-1">
              {monthly.attendancePercent?.toFixed(1) ?? "0"}%
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView>
          {yearly.months.length === 0 ? (
            <Text className="text-center text-gray-400 py-10">No yearly data yet.</Text>
          ) : (
            yearly.months.map((m) => {
              const max = Math.max(m.present ?? 0, m.absent ?? 0, m.leave ?? 1, 1);
              return (
                <View
                  key={m.month}
                  className="bg-white border border-gray-100 rounded-xl p-4 mb-3"
                >
                  <View className="flex-row justify-between mb-2">
                    <Text className="font-black text-gray-900">{MONTH_NAMES[m.month - 1]}</Text>
                    <Text className="text-xs font-bold text-[#1A3C6E]">
                      {(m.attendancePercent ?? 0).toFixed(0)}%
                    </Text>
                  </View>
                  <View className="flex-row h-3 rounded-full overflow-hidden bg-gray-100">
                    <View
                      style={{
                        flex: (m.present ?? 0) / max,
                        backgroundColor: "#10B981",
                      }}
                    />
                    <View
                      style={{
                        flex: (m.absent ?? 0) / max,
                        backgroundColor: "#EF4444",
                      }}
                    />
                    <View
                      style={{
                        flex: (m.leave ?? 0) / max,
                        backgroundColor: "#F59E0B",
                      }}
                    />
                  </View>
                  <Text className="text-[10px] text-gray-400 mt-2">
                    P {m.present ?? 0} · A {m.absent ?? 0} · L {m.leave ?? 0}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </PremiumScreenLayout>
  );
}

function StatCard({
  label,
  value,
  color = "#1A3C6E",
}: {
  label: string;
  value?: number;
  color?: string;
}) {
  return (
    <View className="bg-white border border-gray-150 rounded-xl p-4 min-w-[45%] flex-1">
      <Text className="text-[10px] font-black uppercase text-gray-400">{label}</Text>
      <Text className="text-2xl font-black mt-1" style={{ color }}>
        {value ?? 0}
      </Text>
    </View>
  );
}
