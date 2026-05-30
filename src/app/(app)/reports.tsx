import React, { useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumStatPills } from "@/components/ui/premium";
import { Card } from "@/components/ui/Card";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import { useGetApiFeesGetFeesList } from "@/api/generated/fees/fees";
import { useGetApiAttendanceGet } from "@/api/attendance";
import { useGetApiResultGetResultList } from "@/api/generated/result/result";
import { parseApiList } from "@/utils/apiResponse";
import { Colors } from "@/constants/colors";
import type { AppIconName } from "@/constants/appIcons";
import { IconCircle } from "@/components/icons/AppIcon";

export default function ReportsScreen() {
  const { data: studentsData } = useGetApiStudentGet();
  const { data: feesData } = useGetApiFeesGetFeesList();
  const { data: attendanceData } = useGetApiAttendanceGet();
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
    { title: "Attendance Reports", route: "/(app)/attendance/reports", icon: "attendanceReport" },
    { title: "Fees", route: "/(app)/fees", icon: "fees" },
    { title: "Students", route: "/(admin)/students", icon: "students" },
    { title: "Exams", route: "/(app)/exams", icon: "exams" },
  ];

  return (
    <PremiumScreenLayout
      title="Reports"
      subtitle="Overview & drill-down"
    >
        <PremiumStatPills
          items={[
            { label: "Students", value: String(stats.students), bg: "#E8EEF7", color: Colors.primary },
            { label: "Pending fees", value: String(stats.pendingFees), bg: "#FFF4E6", color: Colors.accent },
            { label: "Attendance", value: String(stats.attendanceRecords), bg: "#ECFDF5" },
            { label: "Results", value: String(stats.resultRecords), bg: "#F3F4F6" },
          ]}
        />

        {links.map((l) => (
          <TouchableOpacity key={l.route} onPress={() => router.push(l.route as never)}>
            <Card className="p-4 mb-3 flex-row items-center gap-3">
              <IconCircle name={l.icon} size={40} iconSize={20} />
              <Text className="font-bold text-gray-800 dark:text-slate-200">{l.title}</Text>
            </Card>
          </TouchableOpacity>
        ))}
    </PremiumScreenLayout>
  );
}
