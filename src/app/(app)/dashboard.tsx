import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface StatItem {
  title: string;
  count: string | number;
  subLeft: string;
  subRight: string;
  icon: string;
  bgColor: string;
  textColor: string;
}

const STATS_DATA: StatItem[] = [
  {
    title: "Total Students",
    count: 218,
    subLeft: "New: 45",
    subRight: "Old: 173",
    icon: "🎓",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-750",
  },
  {
    title: "Student Attendance",
    count: "94.5%",
    subLeft: "Present: 206",
    subRight: "Absent: 12",
    icon: "📝",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
  },
  {
    title: "Total Staff",
    count: 24,
    subLeft: "Teachers: 18",
    subRight: "Admins: 6",
    icon: "👥",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-700",
  },
  {
    title: "Staff Attendance",
    count: "91.6%",
    subLeft: "Present: 22",
    subRight: "Absent: 2",
    icon: "✅",
    bgColor: "bg-sky-50",
    textColor: "text-sky-700",
  },
];

interface ExamItem {
  id: string;
  name: string;
  batch: string;
  date: string;
  status: "Result Declared" | "Ongoing" | "Upcoming";
  statusColor: string;
  statusBg: string;
}

const EXAMS_DATA: ExamItem[] = [
  {
    id: "ex_1",
    name: "First Term Examination",
    batch: "Class X-A",
    date: "May 15, 2026",
    status: "Result Declared",
    statusColor: "text-emerald-700",
    statusBg: "bg-emerald-50",
  },
  {
    id: "ex_2",
    name: "Unit Test II",
    batch: "Class IX-B",
    date: "May 19, 2026",
    status: "Ongoing",
    statusColor: "text-blue-700",
    statusBg: "bg-blue-50",
  },
  {
    id: "ex_3",
    name: "Final Practical",
    batch: "Class XII-Sci",
    date: "June 02, 2026",
    status: "Upcoming",
    statusColor: "text-amber-700",
    statusBg: "bg-amber-50",
  },
];

interface BirthdayItem {
  id: string;
  name: string;
  role: "Student" | "Staff";
  details: string;
  dateText: string;
  isToday: boolean;
}

const BIRTHDAYS_DATA: BirthdayItem[] = [
  {
    id: "bd_1",
    name: "Rahul Sharma",
    role: "Student",
    details: "Class X-A",
    dateText: "Today 🎂",
    isToday: true,
  },
  {
    id: "bd_2",
    name: "Ananya Verma",
    role: "Staff",
    details: "Science Department",
    dateText: "May 20 🎈",
    isToday: false,
  },
  {
    id: "bd_3",
    name: "Rohan Patil",
    role: "Student",
    details: "Class VIII-B",
    dateText: "May 22 🎁",
    isToday: false,
  },
];

interface BatchAttendanceItem {
  batch: string;
  percentage: number;
}

const BATCH_ATTENDANCE_DATA: BatchAttendanceItem[] = [
  { batch: "Class X-A", percentage: 98 },
  { batch: "Class XII-Sci", percentage: 96 },
  { batch: "Class IX-B", percentage: 92 },
  { batch: "Class VIII-A", percentage: 89 },
];

interface TimetableItem {
  time: string;
  subject: string;
  teacher: string;
  classroom: string;
}

const TIMETABLE_DATA: TimetableItem[] = [
  { time: "09:00 AM - 09:50 AM", subject: "Mathematics", teacher: "Priya Sharma", classroom: "Room X-A" },
  { time: "10:00 AM - 10:50 AM", subject: "Physics", teacher: "Ananya Verma", classroom: "Physics Lab" },
  { time: "11:15 AM - 12:00 PM", subject: "English Literature", teacher: "Ramesh Kumar", classroom: "Room X-A" },
];

interface AbsentStudentItem {
  name: string;
  class: string;
  parentContact: string;
}

const ABSENT_STUDENTS_DATA: AbsentStudentItem[] = [
  { name: "Aarav Sharma", class: "Class X-A", parentContact: "9876543212" },
  { name: "Kabir Malhotra", class: "Class XI-Sci", parentContact: "9876543215" },
  { name: "Rohit Patil", class: "Class VIII-B", parentContact: "9876543219" },
];

interface UnpaidFeesItem {
  studentName: string;
  class: string;
  amount: string;
  dueDate: string;
}

const UNPAID_FEES_DATA: UnpaidFeesItem[] = [
  { studentName: "Kabir Verma", class: "Class XI-Sci", amount: "₹15,000", dueDate: "May 10" },
  { studentName: "Pooja Patel", class: "Class X-B", amount: "₹10,000", dueDate: "May 12" },
  { studentName: "Aarav Sharma", class: "Class X-A", amount: "₹12,000", dueDate: "May 14" },
];

interface HomeworkItem {
  title: string;
  class: string;
  dueDate: string;
  subject: string;
}

const HOMEWORK_DATA: HomeworkItem[] = [
  { title: "Solve Chapter 3 problems 1-10", class: "Class X-A", dueDate: "Tomorrow", subject: "Physics" },
  { title: "Write equations of acids", class: "Class IX-B", dueDate: "May 20", subject: "Chemistry" },
  { title: "Complete Integration Worksheet", class: "Class XII-Sci", dueDate: "May 22", subject: "Mathematics" },
];

function SetupShortcut({ label, icon, onPress }: { label: string, icon: string, onPress: () => void }) {
  return (
    <TouchableOpacity 
      onPress={onPress}
      className="flex-row items-center justify-between p-3 bg-white/60 rounded-xl border border-indigo-50"
    >
      <View className="flex-row items-center gap-3">
        <Text className="text-lg">{icon}</Text>
        <Text className="text-sm font-bold text-gray-700">{label}</Text>
      </View>
      <Text className="text-indigo-400 font-bold">→</Text>
    </TouchableOpacity>
  );
}

interface StaffLeaveItem {
  name: string;
  role: string;
  type: string;
}

const STAFF_LEAVES_DATA: StaffLeaveItem[] = [
  { name: "Ramesh Patil", role: "History Teacher", type: "Sick Leave" },
  { name: "Seema Deshmukh", role: "Librarian", type: "Casual Leave" },
];

export default function DashboardScreen() {
  const { userData, handleLogout } = useAuth();
  const { isMobile, isTablet } = useBreakpoint();
  const [selectedYear, setSelectedYear] = useState("2025-2026");

  const renderStats = () => {
    if (isMobile) {
      return (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-5 mb-6"
          contentContainerStyle={{ paddingRight: 40 }}
        >
          {STATS_DATA.map((item, idx) => (
            <View key={idx} className="w-[200px] mr-4">
              <Card className="p-4 bg-white border border-gray-100">
                <View className="flex-row items-center justify-between mb-3">
                  <View className={`w-10 h-10 ${item.bgColor} rounded-xl items-center justify-center`}>
                    <Text className="text-xl">{item.icon}</Text>
                  </View>
                  <Text className={`text-[12px] font-bold ${item.textColor}`}>{item.title}</Text>
                </View>
                <Text className="text-[26px] font-bold text-gray-900 mb-2">{item.count}</Text>
                <View className="flex-row justify-between pt-2 border-t border-gray-50">
                  <Text className="text-[11px] text-gray-400 font-semibold">{item.subLeft}</Text>
                  <Text className="text-[11px] text-gray-450 font-semibold">{item.subRight}</Text>
                </View>
              </Card>
            </View>
          ))}
        </ScrollView>
      );
    }

    return (
      <View className="flex-row flex-wrap gap-4 px-8 mb-8 justify-between">
        {STATS_DATA.map((item, idx) => {
          const isStaff = item.title === "Total Staff";
          const CardContent = (
            <Card className="p-5 bg-white border border-gray-100 shadow-sm hover:translate-y-[-2px] transition-transform duration-200">
              <View className="flex-row items-center justify-between mb-4">
                <View className={`w-12 h-12 ${item.bgColor} rounded-2xl items-center justify-center`}>
                  <Text className="text-2xl">{item.icon}</Text>
                </View>
                <Text className="text-[13px] font-bold text-gray-400 text-right">{item.title}</Text>
              </View>
              <Text className="text-[32px] font-bold text-gray-900 mb-3">{item.count}</Text>
              <View className="flex-row justify-between pt-3 border-t border-gray-50">
                <Text className="text-[12px] text-gray-500 font-semibold">{item.subLeft}</Text>
                <Text className="text-[12px] text-gray-500 font-semibold">{item.subRight}</Text>
              </View>
            </Card>
          );

          if (isStaff) {
            return (
              <TouchableOpacity key={idx} onPress={() => router.push("/(app)/teachers")} className="flex-1 min-w-[200px]">
                {CardContent}
              </TouchableOpacity>
            );
          }

          return (
            <View key={idx} className="flex-1 min-w-[200px]">
              {CardContent}
            </View>
          );
        })}
      </View>
    );
  };

  const renderDetailsSection = () => {
    const isParent = userData?.role === 'parent';
    const isAdmin = userData?.role === 'admin';

    const widgetsRow1 = (
      <>
        {/* Admin Quick Setup */}
        {isAdmin && (
          <View className="flex-1 min-w-[320px]">
            <Card className="bg-white border border-indigo-100 p-5 h-full bg-indigo-50/30">
              <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-indigo-100">
                <Text className="text-[16px] font-bold text-indigo-900">⚙️ Academic Setup</Text>
                <TouchableOpacity onPress={() => router.push("/(app)/academic-setup")}>
                  <Text className="text-xs text-indigo-600 font-bold">Manage</Text>
                </TouchableOpacity>
              </View>
              <View className="gap-3">
                <SetupShortcut label="Academic Years" icon="📅" onPress={() => router.push("/(app)/academic-setup")} />
                <SetupShortcut label="Classes & Sections" icon="🏫" onPress={() => router.push("/(app)/academic-setup")} />
                <SetupShortcut label="Batches" icon="🔢" onPress={() => router.push("/(app)/academic-setup")} />
              </View>
            </Card>
          </View>
        )}

        {/* Parent-specific Results Widget */}
        {isParent && (
          <View className="flex-1 min-w-[320px]">
            <Card className="bg-white border border-indigo-100 p-5 h-full bg-indigo-50/30">
              <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-indigo-100">
                <Text className="text-[16px] font-bold text-indigo-900">🎓 Children's Results</Text>
                <TouchableOpacity onPress={() => router.push("/(app)/parent-results")}>
                  <Text className="text-xs text-indigo-600 font-bold">View Marksheet</Text>
                </TouchableOpacity>
              </View>
              <View className="items-center justify-center py-4">
                <View className="w-16 h-16 bg-white rounded-full items-center justify-center border border-indigo-100 mb-3 shadow-sm">
                  <Text className="text-2xl font-bold text-indigo-600">A+</Text>
                </View>
                <Text className="text-sm font-bold text-gray-800">Latest: First Term Exam</Text>
                <Text className="text-[11px] text-gray-400 font-semibold mt-1">Aggregate: 92.4%</Text>
              </View>
              <Button 
                variant="primary" 
                size="sm" 
                className="mt-2 bg-indigo-600"
                label="Check Detailed Marks"
                onPress={() => router.push("/(app)/parent-results")}
              />
            </Card>
          </View>
        )}

        {/* Exams List Widget */}
        <View className="flex-1 min-w-[320px]">
          <Card className="bg-white border border-gray-100 p-5 h-full">
            <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <Text className="text-[16px] font-bold text-gray-800">📖 Exam List</Text>
              <TouchableOpacity onPress={() => router.push("/(app)/exams")}>
                <Text className="text-xs text-[#0d3666] font-bold">View All</Text>
              </TouchableOpacity>
            </View>
            <View className="gap-4">
              {EXAMS_DATA.map((exam) => (
                <View key={exam.id} className="flex-row justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <View className="flex-1 pr-3">
                    <Text className="text-sm font-bold text-gray-800">{exam.name}</Text>
                    <Text className="text-[11px] text-gray-400 font-semibold mt-1">
                      {exam.batch} • {exam.date}
                    </Text>
                  </View>
                  <View className={`px-2.5 py-1 rounded-full ${exam.statusBg}`}>
                    <Text className={`text-[10px] font-bold ${exam.statusColor}`}>{exam.status}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Birthdays Widget */}
        <View className="flex-1 min-w-[320px]">
          <Card className="bg-white border border-gray-100 p-5 h-full">
            <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <Text className="text-[16px] font-bold text-gray-800">🎂 Birthdays</Text>
              <View className="flex-row gap-2">
                <TouchableOpacity className="px-2 py-1 bg-blue-50 rounded-md">
                  <Text className="text-[10px] text-blue-700 font-bold">Today</Text>
                </TouchableOpacity>
                <TouchableOpacity className="px-2 py-1 rounded-md">
                  <Text className="text-[10px] text-gray-400 font-semibold">Upcoming</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className="gap-4">
              {BIRTHDAYS_DATA.map((bd) => (
                <View key={bd.id} className="flex-row justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-10 h-10 bg-pink-50 rounded-full items-center justify-center">
                      <Text className="text-lg">{bd.role === "Student" ? "👦" : "👩"}</Text>
                    </View>
                    <View>
                      <Text className="text-sm font-bold text-gray-800">{bd.name}</Text>
                      <Text className="text-[11px] text-gray-400 font-semibold mt-0.5">
                        {bd.role} • {bd.details}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-xs font-semibold text-pink-650">{bd.dateText}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Attendance Rates Widget */}
        <View className="flex-1 min-w-[320px]">
          <Card className="bg-white border border-gray-100 p-5 h-full">
            <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <Text className="text-[16px] font-bold text-gray-800">📈 Batch Attendance</Text>
              <TouchableOpacity>
                <Text className="text-xs text-[#0d3666] font-bold">Details</Text>
              </TouchableOpacity>
            </View>
            <View className="gap-4">
              {BATCH_ATTENDANCE_DATA.map((item, idx) => (
                <View key={idx}>
                  <View className="flex-row justify-between items-center mb-1.5">
                    <Text className="text-sm font-bold text-gray-700">{item.batch}</Text>
                    <Text className="text-xs font-bold text-gray-900">{item.percentage}%</Text>
                  </View>
                  <View className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <View
                      className="h-full bg-[#0d3666] rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>
      </>
    );

    const widgetsRow2 = (
      <>
        {/* Today's Timetable Widget */}
        <View className="flex-1 min-w-[320px]">
          <Card className="bg-white border border-gray-100 p-5 h-full">
            <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <Text className="text-[16px] font-bold text-gray-800">📅 Today's Timetable</Text>
              <TouchableOpacity onPress={() => router.push("/(app)/timetable")}>
                <Text className="text-xs text-[#0d3666] font-bold">View Full</Text>
              </TouchableOpacity>
            </View>
            <View className="gap-4">
              {TIMETABLE_DATA.map((slot, idx) => (
                <View key={idx} className="flex-row items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-gray-800">{slot.subject}</Text>
                    <Text className="text-[11px] text-gray-400 font-semibold mt-1">
                      {slot.teacher} • {slot.classroom}
                    </Text>
                  </View>
                  <Text className="text-xs text-blue-700 font-bold">{slot.time}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Absent Students Today Widget */}
        <View className="flex-1 min-w-[320px]">
          <Card className="bg-white border border-gray-100 p-5 h-full">
            <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <Text className="text-[16px] font-bold text-gray-800">🚨 Absent Today</Text>
              <View className="px-2.5 py-1 bg-red-50 rounded-full">
                <Text className="text-[10px] text-red-500 font-bold">Total: {ABSENT_STUDENTS_DATA.length}</Text>
              </View>
            </View>
            <View className="gap-4">
              {ABSENT_STUDENTS_DATA.map((std, idx) => (
                <View key={idx} className="flex-row justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <View>
                    <Text className="text-sm font-bold text-gray-800">{std.name}</Text>
                    <Text className="text-[11px] text-gray-400 font-semibold mt-1">{std.class}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`https://wa.me/91${std.parentContact}`)}
                    className="px-3 py-1.5 bg-emerald-50 rounded-lg flex-row items-center gap-1.5"
                  >
                    <Text className="text-xs text-emerald-600 font-bold">💬 Alert</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Unpaid Student Fees Widget */}
        <View className="flex-1 min-w-[320px]">
          <Card className="bg-white border border-gray-100 p-5 h-full">
            <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <Text className="text-[16px] font-bold text-gray-800">💰 Unpaid Fees</Text>
              <TouchableOpacity onPress={() => router.push("/(app)/fees")}>
                <Text className="text-xs text-[#0d3666] font-bold">Manage</Text>
              </TouchableOpacity>
            </View>
            <View className="gap-4">
              {UNPAID_FEES_DATA.map((fee, idx) => (
                <View key={idx} className="flex-row justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <View>
                    <Text className="text-sm font-bold text-gray-800">{fee.studentName}</Text>
                    <Text className="text-[11px] text-gray-400 font-semibold mt-1">
                      {fee.class} • Due: {fee.dueDate}
                    </Text>
                  </View>
                  <Text className="text-sm font-bold text-red-500">{fee.amount}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      </>
    );

    const widgetsRow3 = (
      <>
        {/* Homework / Assignment Feed */}
        <View className="flex-1 min-w-[320px]">
          <Card className="bg-white border border-gray-100 p-5 h-full">
            <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <Text className="text-[16px] font-bold text-gray-800">📝 Homework Feed</Text>
              <TouchableOpacity>
                <Text className="text-xs text-[#0d3666] font-bold">Upload</Text>
              </TouchableOpacity>
            </View>
            <View className="gap-4">
              {HOMEWORK_DATA.map((hw, idx) => (
                <View key={idx} className="p-3 bg-gray-50 rounded-xl">
                  <View className="flex-row justify-between mb-1">
                    <Text className="text-sm font-bold text-gray-800">{hw.subject}</Text>
                    <Text className="text-[11px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                      Due: {hw.dueDate}
                    </Text>
                  </View>
                  <Text className="text-xs text-gray-500 font-semibold mb-1">{hw.title}</Text>
                  <Text className="text-[10px] text-gray-400 font-bold">{hw.class}</Text>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* Staff Leaves Widget */}
        <View className="flex-1 min-w-[320px]">
          <Card className="bg-white border border-gray-100 p-5 h-full">
            <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <Text className="text-[16px] font-bold text-gray-800">👥 Staff Leaves</Text>
              <Text className="text-xs text-indigo-700 font-bold">Total: {STAFF_LEAVES_DATA.length}</Text>
            </View>
            <View className="gap-4">
              {STAFF_LEAVES_DATA.map((leave, idx) => (
                <View key={idx} className="flex-row justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <View>
                    <Text className="text-sm font-bold text-gray-800">{leave.name}</Text>
                    <Text className="text-[11px] text-gray-400 font-semibold mt-1">{leave.role}</Text>
                  </View>
                  <View className="px-2 py-0.5 bg-indigo-50 rounded-full">
                    <Text className="text-[10px] text-indigo-700 font-bold">{leave.type}</Text>
                  </View>
                </View>
              ))}
            </View>
          </Card>
        </View>

        {/* PDF Import & LC Generator Shortcuts (Notebook Page 1 Header) */}
        <View className="flex-1 min-w-[320px]">
          <Card className="bg-white border border-gray-100 p-5 h-full">
            <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <Text className="text-[16px] font-bold text-gray-800">⚡ Administrative Utilities</Text>
            </View>
            <View className="gap-4">
              <TouchableOpacity
                onPress={() => router.push("/(app)/inquiries")}
                className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex-row items-center gap-3"
              >
                <Text className="text-2xl">👦</Text>
                <View>
                  <Text className="text-sm font-bold text-indigo-800">Online Inquiries</Text>
                  <Text className="text-[11px] text-indigo-500 font-semibold mt-0.5">Manage admissions inquiries</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(app)/admission-form")}
                className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex-row items-center gap-3"
              >
                <Text className="text-2xl">📝</Text>
                <View>
                  <Text className="text-sm font-bold text-[#0d3666]">Admission Form</Text>
                  <Text className="text-[11px] text-[#f5921e] font-semibold mt-0.5">Direct student enrollment</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(app)/student-profile")}
                className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex-row items-center gap-3"
              >
                <Text className="text-2xl">🔍</Text>
                <View>
                  <Text className="text-sm font-bold text-gray-800">Student Profile</Text>
                  <Text className="text-[11px] text-gray-500 font-semibold mt-0.5">View sample admitted student</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(app)/attendance")}
                className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex-row items-center gap-3"
              >
                <Text className="text-2xl">📝</Text>
                <View>
                  <Text className="text-sm font-bold text-emerald-800">Daily Attendance</Text>
                  <Text className="text-[11px] text-emerald-600 font-semibold mt-0.5">Log attendance & send alerts</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(app)/attendance-reports")}
                className="p-4 bg-teal-50 border border-teal-100 rounded-xl flex-row items-center gap-3"
              >
                <Text className="text-2xl">📊</Text>
                <View>
                  <Text className="text-sm font-bold text-teal-800">Attendance Reports</Text>
                  <Text className="text-[11px] text-teal-600 font-semibold mt-0.5">View monthly presence metrics</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.push("/(app)/notices")}
                className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex-row items-center gap-3"
              >
                <Text className="text-2xl">📢</Text>
                <View>
                  <Text className="text-sm font-bold text-amber-800">Notice History</Text>
                  <Text className="text-[11px] text-amber-600 font-semibold mt-0.5">Formal school announcements</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex-row items-center gap-3">
                <Text className="text-2xl">📥</Text>
                <View>
                  <Text className="text-sm font-bold text-brand-navy">PDF Direct Import</Text>
                  <Text className="text-[11px] text-blue-500 font-semibold mt-0.5">Bulk upload Excel/CSV/PDF lists</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex-row items-center gap-3">
                <Text className="text-2xl">📄</Text>
                <View>
                  <Text className="text-sm font-bold text-emerald-800">LC Generator</Text>
                  <Text className="text-[11px] text-[#f5921e] font-semibold mt-0.5">Generate Leaving Certificates</Text>
                </View>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </>
    );

    if (isMobile) {
      return (
        <View className="px-5 gap-6 mb-10">
          {widgetsRow1}
          {widgetsRow2}
          {widgetsRow3}
        </View>
      );
    }

    return (
      <View className="gap-6 px-8 mb-10">
        <View className="flex-row flex-wrap gap-6">{widgetsRow1}</View>
        <View className="flex-row flex-wrap gap-6">{widgetsRow2}</View>
        <View className="flex-row flex-wrap gap-6">{widgetsRow3}</View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View className="flex-1">
        {/* Header Bar */}
        <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <View className="w-[44px] h-[44px] bg-[#EFF6FF] rounded-xl items-center justify-center">
              <Text className="text-xl">🏫</Text>
            </View>
            <View>
              <Text className="text-[16px] font-bold text-gray-900">
                {userData?.schoolName || "Little Angel's English School"}
              </Text>
              <Text className="text-[12px] text-gray-400 font-semibold mt-0.5">
                Dashboard • {userData?.name || "Administrator"}
              </Text>
            </View>
          </View>

          {/* Academic Year Switcher & Logout */}
          <View className="flex-row items-center gap-3">
            {!isMobile && (
              <View className="bg-gray-50 border border-gray-100 rounded-xl px-3 py-1.5 flex-row items-center gap-2">
                <Text className="text-xs text-gray-500 font-bold">Academic Year:</Text>
                <Text className="text-xs text-gray-900 font-bold">{selectedYear}</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={handleLogout}
              className="w-10 h-10 bg-red-50 rounded-xl items-center justify-center"
              style={Platform.OS === "web" ? ({ cursor: "pointer" } as any) : undefined}
            >
              <Text className="text-sm font-bold text-red-500">🚪</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          className="flex-1 pt-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Welcome area */}
          <View className={`${isMobile ? "px-5" : "px-8"} mb-6`}>
            <Text className="text-2xl font-bold text-gray-900">Hello, {userData?.name || "Welcome"} 👋</Text>
            <Text className="text-sm text-gray-400 font-semibold mt-1">
              Here is what's happening at your school today.
            </Text>
          </View>

          {/* Stats widgets */}
          {renderStats()}

          {/* Details widgets */}
          {renderDetailsSection()}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
