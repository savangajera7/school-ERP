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
import { premiumCardShadow } from "@/constants/premiumStyles";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const MONTH_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function ParentAttendanceScreen() {
  const { isAttendanceReadOnly, can, isSchoolAdmin, isTeacher } = useAttendanceAccess();
  const userData = useAuthStore((s) => s.userData);
  const studentId =
    userData?.studentID ??
    userData?.linkedStudents?.[0]?.studentID ??
    userData?.referenceID;
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [tab, setTab] = useState<"monthly" | "yearly">("monthly");

  if (isSchoolAdmin || isTeacher) {
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
    if (m < 1) { m = 12; y -= 1; }
    else if (m > 12) { m = 1; y += 1; }
    setMonth(m);
    setYear(y);
  };

  const pct = monthly.attendancePercent ?? 0;

  return (
    <PremiumScreenLayout
      title="My Attendance"
      subtitle="View-only — monthly & yearly summary"
    >
      {/* Tab switcher */}
      <View className="flex-row mb-4 bg-gray-100 rounded-xl p-1">
        {(["monthly", "yearly"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            className={`flex-1 py-2.5 rounded-lg ${tab === t ? "bg-white shadow-sm" : ""}`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-center text-xs font-black uppercase ${
                tab === t ? "text-[#1A3C6E]" : "text-gray-400"
              }`}
            >
              {t === "monthly" ? "This Month" : "Yearly"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Month / Year navigator */}
      {tab === "monthly" && (
        <View
          className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex-row items-center justify-between"
          style={premiumCardShadow}
        >
          <TouchableOpacity
            onPress={() => shiftMonth(-1)}
            className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 items-center justify-center"
          >
            <Text className="font-black text-[#1A3C6E] text-lg">‹</Text>
          </TouchableOpacity>
          <View className="items-center">
            <Text className="text-base font-black text-gray-900">{MONTH_NAMES[month - 1]}</Text>
            <Text className="text-xs font-bold text-gray-400">{year}</Text>
          </View>
          <TouchableOpacity
            onPress={() => shiftMonth(1)}
            className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 items-center justify-center"
          >
            <Text className="font-black text-[#1A3C6E] text-lg">›</Text>
          </TouchableOpacity>
        </View>
      )}

      {tab === "yearly" && (
        <View
          className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex-row items-center justify-center gap-6"
          style={premiumCardShadow}
        >
          <TouchableOpacity
            onPress={() => setYear((y) => y - 1)}
            className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 items-center justify-center"
          >
            <Text className="font-black text-[#1A3C6E] text-lg">‹</Text>
          </TouchableOpacity>
          <Text className="text-base font-black text-gray-900">{year}</Text>
          <TouchableOpacity
            onPress={() => setYear((y) => y + 1)}
            className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 items-center justify-center"
          >
            <Text className="font-black text-[#1A3C6E] text-lg">›</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : tab === "monthly" ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Stats grid */}
          <View className="flex-row flex-wrap gap-3 mb-4">
            <StatCard label="Working Days" value={monthly.workingDays ?? 0} color="#1A3C6E" />
            <StatCard label="Present" value={monthly.presentDays ?? 0} color="#059669" />
            <StatCard label="Absent" value={monthly.absentDays ?? 0} color="#DC2626" />
            <StatCard label="Leave" value={monthly.leaveDays ?? 0} color="#D97706" />
          </View>

          {/* Attendance % */}
          <View
            className="bg-white rounded-2xl border border-gray-100 p-5 mb-4 items-center"
            style={premiumCardShadow}
          >
            <Text className="text-[10px] font-black uppercase text-gray-400 mb-2">
              Attendance Rate
            </Text>
            <Text className="text-5xl font-black text-[#1A3C6E]">
              {pct.toFixed(1)}%
            </Text>
            <View className="w-full mt-4 bg-gray-100 rounded-full h-3 overflow-hidden">
              <View
                className="h-full rounded-full"
                style={{
                  width: `${Math.min(pct, 100)}%`,
                  backgroundColor: pct >= 75 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444",
                }}
              />
            </View>
            <Text
              className={`text-xs font-bold mt-2 ${
                pct >= 75 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-rose-600"
              }`}
            >
              {pct >= 75 ? "Good attendance" : pct >= 50 ? "Needs improvement" : "Low attendance"}
            </Text>
          </View>
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {yearly.months.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-gray-400 font-semibold text-sm">No yearly data yet.</Text>
            </View>
          ) : (
            <>
              {/* Yearly totals */}
              {(() => {
                const totPresent = yearly.months.reduce((a, m) => a + (m.present ?? 0), 0);
                const totAbsent = yearly.months.reduce((a, m) => a + (m.absent ?? 0), 0);
                const totLeave = yearly.months.reduce((a, m) => a + (m.leave ?? 0), 0);
                const totDays = totPresent + totAbsent + totLeave;
                const overallPct = totDays > 0 ? Math.round((totPresent / totDays) * 100) : 0;
                return (
                  <View
                    className="bg-white rounded-2xl border border-gray-100 p-4 mb-4"
                    style={premiumCardShadow}
                  >
                    <Text className="text-[10px] font-black uppercase text-gray-400 mb-3">
                      {year} Overview
                    </Text>
                    <View className="flex-row gap-3 mb-3">
                      <StatCard label="Present" value={totPresent} color="#059669" />
                      <StatCard label="Absent" value={totAbsent} color="#DC2626" />
                      <StatCard label="Leave" value={totLeave} color="#D97706" />
                    </View>
                    <View className="items-center">
                      <Text className="text-3xl font-black text-[#1A3C6E]">{overallPct}%</Text>
                      <Text className="text-[10px] font-bold text-gray-400 uppercase">Overall</Text>
                    </View>
                  </View>
                );
              })()}

              {/* Month-wise breakdown */}
              <View
                className="bg-white rounded-2xl border border-gray-100 p-4 mb-4"
                style={premiumCardShadow}
              >
                <Text className="text-[10px] font-black uppercase text-gray-400 mb-3">
                  Month-wise Breakdown
                </Text>
                {yearly.months.map((m) => {
                  const total = (m.present ?? 0) + (m.absent ?? 0) + (m.leave ?? 0);
                  const mPct = total > 0 ? Math.round(((m.present ?? 0) / total) * 100) : 0;
                  const max = Math.max(m.present ?? 0, m.absent ?? 0, m.leave ?? 1, 1);
                  return (
                    <View key={m.month} className="mb-4">
                      <View className="flex-row justify-between mb-1.5">
                        <Text className="text-sm font-black text-gray-900">
                          {MONTH_SHORT[m.month - 1]}
                        </Text>
                        <Text
                          className={`text-xs font-bold ${
                            mPct >= 75 ? "text-emerald-600" : mPct >= 50 ? "text-amber-600" : "text-rose-600"
                          }`}
                        >
                          {mPct}%
                        </Text>
                      </View>
                      <View className="flex-row h-3 rounded-full overflow-hidden bg-gray-100">
                        <View style={{ flex: (m.present ?? 0) / max, backgroundColor: "#10B981" }} />
                        <View style={{ flex: (m.absent ?? 0) / max, backgroundColor: "#EF4444" }} />
                        <View style={{ flex: (m.leave ?? 0) / max, backgroundColor: "#F59E0B" }} />
                      </View>
                      <Text className="text-[10px] text-gray-400 mt-1">
                        P {m.present ?? 0} · A {m.absent ?? 0} · L {m.leave ?? 0}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </>
          )}
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
      className="bg-white border border-gray-100 rounded-xl px-4 py-3 min-w-[45%] flex-1"
      style={premiumCardShadow}
    >
      <Text className="text-[10px] font-black uppercase text-gray-400">{label}</Text>
      <Text className="text-2xl font-black mt-1" style={{ color }}>
        {value}
      </Text>
    </View>
  );
}
