import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const CLASSES = ["Class I", "Class II", "Class III", "Class IV"];
const MONTHS = ["May 2026", "April 2026", "March 2026"];

const MOCK_REPORTS = [
  { id: "stu_1", name: "Pooja Patel", rollNo: "1", totalDays: 24, present: 23, absent: 1, percentage: 95.8 },
  { id: "stu_2", name: "Rahul Sharma", rollNo: "2", totalDays: 24, present: 22, absent: 2, percentage: 91.6 },
  { id: "stu_3", name: "Aarav Desai", rollNo: "3", totalDays: 24, present: 16, absent: 8, percentage: 66.6 },
  { id: "stu_4", name: "Riya Singh", rollNo: "4", totalDays: 24, present: 24, absent: 0, percentage: 100 },
  { id: "stu_5", name: "Kavya Verma", rollNo: "5", totalDays: 24, present: 18, absent: 6, percentage: 75.0 },
];

export default function AttendanceReportsScreen() {
  const { isMobile } = useBreakpoint();
  const [selectedClass, setSelectedClass] = useState("Class I");
  const [selectedMonth, setSelectedMonth] = useState("May 2026");

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      
      {/* Top Navbar */}
      <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row justify-between items-center z-10">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.push("/(app)/dashboard")}
            className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center"
          >
            <Text className="text-sm font-bold text-gray-700">🔙</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-[18px] font-bold text-gray-900">Attendance Reports</Text>
            <Text className="text-[12px] text-gray-400 font-semibold mt-0.5">
              Monthly student presence summaries
            </Text>
          </View>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 pt-6 md:px-8" showsVerticalScrollIndicator={false}>
        <View className="max-w-[1200px] w-full self-center pb-10">

          {/* Filter Configuration */}
          <Card className="bg-white border border-gray-100 p-5 mb-6">
            <View className={`flex-row gap-6 ${isMobile ? "flex-col" : "items-center"}`}>
              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Select Class</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {CLASSES.map((cls) => (
                    <TouchableOpacity
                      key={cls}
                      onPress={() => setSelectedClass(cls)}
                      className={`px-4 py-2 rounded-lg border ${
                        selectedClass === cls ? "bg-[#0d3666] border-[#0d3666]" : "bg-white border-gray-200"
                      }`}
                    >
                      <Text className={`text-sm font-bold ${selectedClass === cls ? "text-white" : "text-gray-700"}`}>
                        {cls}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="flex-1">
                <Text className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Select Month</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {MONTHS.map((mon) => (
                    <TouchableOpacity
                      key={mon}
                      onPress={() => setSelectedMonth(mon)}
                      className={`px-4 py-2 rounded-lg border ${
                        selectedMonth === mon ? "bg-[#0d3666] border-[#0d3666]" : "bg-white border-gray-200"
                      }`}
                    >
                      <Text className={`text-sm font-bold ${selectedMonth === mon ? "text-white" : "text-gray-700"}`}>
                        {mon}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Card>

          {/* Report Matrix */}
          <Card className="bg-white border border-gray-100 overflow-hidden">
            {/* Header Row */}
            <View className="flex-row items-center px-5 py-3 bg-gray-50 border-b border-gray-100">
              <Text className="w-12 text-xs font-bold text-gray-400 uppercase">Roll</Text>
              <Text className="flex-1 text-xs font-bold text-gray-400 uppercase">Student Name</Text>
              <Text className="w-[80px] text-xs font-bold text-gray-400 uppercase text-center">Total</Text>
              <Text className="w-[80px] text-xs font-bold text-gray-400 uppercase text-center">Present</Text>
              <Text className="w-[80px] text-xs font-bold text-gray-400 uppercase text-center">Absent</Text>
              <Text className="w-[100px] text-xs font-bold text-gray-400 uppercase text-right">Percentage</Text>
            </View>

            {/* Rows */}
            {MOCK_REPORTS.map((report, index) => (
              <View 
                key={report.id} 
                className={`flex-row items-center px-5 py-4 border-b border-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-50/30"}`}
              >
                <Text className="w-12 text-sm font-bold text-gray-400">{report.rollNo}</Text>
                <Text className="flex-1 text-sm font-bold text-gray-800">{report.name}</Text>
                <Text className="w-[80px] text-sm text-gray-500 font-semibold text-center">{report.totalDays}</Text>
                <Text className="w-[80px] text-sm text-green-600 font-bold text-center">{report.present}</Text>
                <Text className="w-[80px] text-sm text-red-650 font-bold text-center">{report.absent}</Text>
                
                <View className="w-[100px] items-end">
                  <Text className={`text-sm font-bold ${report.percentage >= 75 ? "text-gray-800" : "text-red-650"}`}>
                    {report.percentage}%
                  </Text>
                  {report.percentage < 75 && (
                    <Text className="text-[9px] font-bold text-red-500 mt-0.5">⚠️ Low</Text>
                  )}
                </View>
              </View>
            ))}
          </Card>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
