import React, { useMemo, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Colors } from "@/constants/colors";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { useAttendanceMonthlyReport } from "@/api/generated/erp-attendance/erp-attendance";
import { useGetApiClassGetAll } from "@/api/generated/class/class";

const CLASSES = ["Class I", "Class II", "Class III", "Class IV"];
const MONTHS = ["May 2026", "April 2026", "March 2026"];

const MOCK_REPORTS = [
  { id: "stu_1", name: "Pooja Patel",  rollNo: "1", totalDays: 24, present: 23, absent: 1,  percentage: 95.8 },
  { id: "stu_2", name: "Rahul Sharma", rollNo: "2", totalDays: 24, present: 22, absent: 2,  percentage: 91.6 },
  { id: "stu_3", name: "Aarav Desai",  rollNo: "3", totalDays: 24, present: 16, absent: 8,  percentage: 66.6 },
  { id: "stu_4", name: "Riya Singh",   rollNo: "4", totalDays: 24, present: 24, absent: 0,  percentage: 100  },
  { id: "stu_5", name: "Kavya Verma",  rollNo: "5", totalDays: 24, present: 18, absent: 6,  percentage: 75.0 },
];

export default function AttendanceReportsScreen() {
  const { isMobile } = useBreakpoint();
  const [selectedClass, setSelectedClass] = useState("Class I");
  const [selectedMonth, setSelectedMonth] = useState("May 2026");

  const { data: classesData } = useGetApiClassGetAll();
  const { data: reportData, isLoading } = useAttendanceMonthlyReport({
    Search: selectedClass,
  });

  // Resolve to API data if available, else use mock
  const reports = useMemo(() => {
    const list = (reportData?.data as any)?.data || (reportData?.data as any) || [];
    if (!Array.isArray(list) || list.length === 0) return MOCK_REPORTS;
    return list.map((item: any, idx: number) => ({
      id: item.studentID?.toString() || `stu_${idx + 1}`,
      name: item.studentName || "Unknown Student",
      rollNo: item.rollNo?.toString() || String(idx + 1),
      totalDays: item.totalDays ?? 24,
      present: item.presentDays ?? 0,
      absent: item.absentDays ?? 0,
      percentage: item.attendancePercentage ?? 0,
    }));
  }, [reportData]);

  // Summary stats
  const avgPct = useMemo(() => {
    if (!reports.length) return 0;
    return Math.round(reports.reduce((a, r) => a + r.percentage, 0) / reports.length);
  }, [reports]);
  const lowCount = reports.filter(r => r.percentage < 75).length;
  const perfectCount = reports.filter(r => r.percentage === 100).length;

  const getBarColor = (pct: number) => {
    if (pct >= 90) return "#10B981";
    if (pct >= 75) return "#F59E0B";
    return "#EF4444";
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFDFD]" edges={["top", "left", "right"]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ScreenHeader
        title="Attendance Reports"
        subtitle="Monthly student presence summaries"
        onBack={() => router.push("/(app)/dashboard")}
      />

      <ScrollView
        className="flex-1 px-4 mt-6 md:px-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="max-w-[1200px] w-full self-center pb-10">

          {/* Summary Stats */}
          <View className={`flex-row gap-3 mb-6 ${isMobile ? "flex-row" : ""}`}>
            <Card className="flex-1 bg-white border border-gray-150 p-4 items-center">
              <Text className="text-2xl font-black text-[#0d3666]">{avgPct}%</Text>
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1">Avg Attendance</Text>
            </Card>
            <Card className="flex-1 bg-white border border-gray-150 p-4 items-center">
              <Text className="text-2xl font-black text-emerald-600">{perfectCount}</Text>
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1">Perfect Record</Text>
            </Card>
            <Card className="flex-1 bg-white border border-gray-150 p-4 items-center">
              <Text className="text-2xl font-black text-red-500">{lowCount}</Text>
              <Text className="text-[10px] font-black text-gray-400 uppercase tracking-wider mt-1">Below 75%</Text>
            </Card>
          </View>

          {/* Filter Configuration */}
          <Card className="bg-white border border-gray-150 p-5 mb-6">
            <View className={`gap-5 ${isMobile ? "" : "flex-row items-start"}`}>
              <View className="flex-1">
                <Text className="text-[11px] font-black text-gray-400 mb-2.5 uppercase tracking-wider">Select Class</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {CLASSES.map((cls) => (
                    <TouchableOpacity
                      key={cls}
                      onPress={() => setSelectedClass(cls)}
                      activeOpacity={0.8}
                      className={`px-4 py-2.5 rounded-xl border-[1.5px] ${
                        selectedClass === cls
                          ? "bg-[#0d3666] border-[#0d3666]"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <Text className={`text-xs font-black uppercase tracking-wider ${
                        selectedClass === cls ? "text-white" : "text-gray-500"
                      }`}>
                        {cls}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="flex-1">
                <Text className="text-[11px] font-black text-gray-400 mb-2.5 uppercase tracking-wider">Select Month</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {MONTHS.map((mon) => (
                    <TouchableOpacity
                      key={mon}
                      onPress={() => setSelectedMonth(mon)}
                      activeOpacity={0.8}
                      className={`px-4 py-2.5 rounded-xl border-[1.5px] ${
                        selectedMonth === mon
                          ? "bg-[#0d3666] border-[#0d3666]"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <Text className={`text-xs font-black uppercase tracking-wider ${
                        selectedMonth === mon ? "text-white" : "text-gray-500"
                      }`}>
                        {mon}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Card>

          {/* Report Matrix */}
          {isLoading ? (
            <View className="py-20">
              <PremiumLoader color={Colors.primary} size={36} />
            </View>
          ) : isMobile ? (
            <View className="gap-0">
              {reports.map((report) => (
                <MobileDataCard
                  key={report.id}
                  title={report.name}
                  subtitle={`Roll No: ${report.rollNo}`}
                  badge={
                    report.percentage < 75 ? (
                      <View className="bg-red-50 border border-red-100 px-2 py-0.5 rounded">
                        <Text className="text-[10px] font-black text-red-600 uppercase">⚠ Low</Text>
                      </View>
                    ) : report.percentage === 100 ? (
                      <View className="bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                        <Text className="text-[10px] font-black text-emerald-600 uppercase">Perfect</Text>
                      </View>
                    ) : null
                  }
                  fields={[
                    { label: "Total Days",  value: String(report.totalDays) },
                    { label: "Present",     value: String(report.present),  highlight: "success" },
                    { label: "Absent",      value: String(report.absent),   highlight: report.absent > 0 ? "error" : "muted" },
                  ]}
                  actions={
                    <View className="flex-1 pt-1">
                      {/* Progress bar */}
                      <View className="flex-row justify-between mb-1.5">
                        <Text className="text-[11px] font-black text-gray-400 uppercase">Attendance</Text>
                        <Text className={`text-[11px] font-black ${report.percentage < 75 ? "text-red-500" : "text-gray-700"}`}>
                          {report.percentage}%
                        </Text>
                      </View>
                      <View className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${report.percentage}%`,
                            backgroundColor: getBarColor(report.percentage),
                          }}
                        />
                      </View>
                    </View>
                  }
                />
              ))}
            </View>
          ) : (
            <Card noPadding className="bg-white border border-gray-150 overflow-hidden shadow-sm">
              {/* Header Row */}
              <View className="flex-row items-center px-6 py-4 bg-gray-50 border-b border-gray-150">
                <Text className="w-14 text-[11px] font-black text-gray-400 uppercase">Roll</Text>
                <Text className="flex-1 text-[11px] font-black text-gray-400 uppercase">Student Name</Text>
                <Text className="w-[90px] text-[11px] font-black text-gray-400 uppercase text-center">Total</Text>
                <Text className="w-[90px] text-[11px] font-black text-gray-400 uppercase text-center">Present</Text>
                <Text className="w-[90px] text-[11px] font-black text-gray-400 uppercase text-center">Absent</Text>
                <Text className="w-[140px] text-[11px] font-black text-gray-400 uppercase text-right">Attendance</Text>
              </View>

              {reports.map((report, index) => (
                <View
                  key={report.id}
                  className={`flex-row items-center px-6 py-4 border-b border-gray-100 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                  }`}
                >
                  <Text className="w-14 text-sm font-extrabold text-gray-400">{report.rollNo}</Text>
                  <Text className="flex-1 text-sm font-black text-gray-900">{report.name}</Text>
                  <Text className="w-[90px] text-sm text-gray-500 font-bold text-center">{report.totalDays}</Text>
                  <Text className="w-[90px] text-sm text-emerald-600 font-extrabold text-center">{report.present}</Text>
                  <Text className="w-[90px] text-sm text-red-500 font-extrabold text-center">{report.absent}</Text>

                  <View className="w-[140px] items-end gap-1">
                    <View className="flex-row items-center gap-2">
                      <View className="h-1.5 w-[60px] bg-gray-100 rounded-full overflow-hidden">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${report.percentage}%`,
                            backgroundColor: getBarColor(report.percentage),
                          }}
                        />
                      </View>
                      <Text className={`text-sm font-black ${
                        report.percentage < 75 ? "text-red-500" : "text-gray-800"
                      }`}>
                        {report.percentage}%
                      </Text>
                    </View>
                    {report.percentage < 75 && (
                      <Text className="text-[9px] font-black text-red-400 uppercase tracking-wide">⚠ Below threshold</Text>
                    )}
                  </View>
                </View>
              ))}
            </Card>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
