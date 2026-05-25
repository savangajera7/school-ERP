import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { Card } from "@/components/ui/Card";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import { useGetApiFeesGetFeesList } from "@/api/generated/fees/fees";
import { useGetApiStudentAttendanceGetStudentAttendanceList } from "@/api/generated/student-attendance/student-attendance";
import { useGetApiResultGetResultList } from "@/api/generated/result/result";
import { parseApiList } from "@/utils/apiResponse";
import { Colors } from "@/constants/colors";
import type { AppIconName } from "@/constants/appIcons";
import { IconCircle } from "@/components/icons/AppIcon";

export default function ReportsScreen() {
  const { data: studentsData } = useGetApiStudentGet();
  const { data: feesData } = useGetApiFeesGetFeesList();
  const { data: attendanceData } = useGetApiStudentAttendanceGetStudentAttendanceList();
  const { data: resultsData } = useGetApiResultGetResultList();

  const stats = useMemo(() => {
    const students = parseApiList(studentsData?.data);
    const fees = parseApiList(feesData?.data);
    const attendance = parseApiList(attendanceData?.data);
    const results = parseApiList(resultsData?.data);
    const pendingFees = fees.filter(
      (f: { pendingAmount?: number }) => (f.pendingAmount ?? 0) > 0
    ).length;
    return {
      students: students.length,
      pendingFees,
      attendanceRecords: attendance.length,
      resultRecords: results.length,
    };
  }, [studentsData, feesData, attendanceData, resultsData]);

  const links: { title: string; route: string; icon: AppIconName }[] = [
    { title: "Attendance Reports", route: "/(app)/attendance-reports", icon: "attendanceReport" },
    { title: "Fees", route: "/(app)/fees", icon: "fees" },
    { title: "Students", route: "/(app)/students", icon: "students" },
    { title: "Exams", route: "/(app)/exams", icon: "exams" },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#F4F6FA]" edges={["left", "right"]}>
      <StatusBar style="light" />
      <ScreenHeader title="Reports" subtitle="Overview & drill-down" onBack={() => router.back()} />

      <ScrollView className="p-4 md:p-8" contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="flex-row flex-wrap gap-3 mb-6">
          {[
            { label: "Students", value: stats.students },
            { label: "Pending fees", value: stats.pendingFees },
            { label: "Attendance rows", value: stats.attendanceRecords },
            { label: "Result rows", value: stats.resultRecords },
          ].map((s) => (
            <Card key={s.label} className="flex-1 min-w-[140px] p-4">
              <Text className="text-2xl font-black" style={{ color: Colors.primary }}>
                {s.value}
              </Text>
              <Text className="text-gray-500 text-sm">{s.label}</Text>
            </Card>
          ))}
        </View>

        {links.map((l) => (
          <TouchableOpacity key={l.route} onPress={() => router.push(l.route as never)}>
            <Card className="p-4 mb-3 flex-row items-center gap-3">
              <IconCircle name={l.icon} size={40} iconSize={20} />
              <Text className="font-bold text-gray-800">{l.title}</Text>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
