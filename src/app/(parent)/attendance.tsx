import React, { useState, useMemo } from "react";
import { View, Text } from "react-native";
import { Colors } from "@/constants/colors";
import { useGetApiStudentAttendanceGetStudentAttendanceList } from "@/api/generated/student-attendance/student-attendance";
import { parseApiList } from "@/utils/apiResponse";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { IconCircle } from "@/components/icons/AppIcon";
import { formatDisplayDate } from "@/utils/dateHelpers";
import { ResponsiveDataList, type TableColumn } from "@/components/shared";

export default function ParentAttendanceScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useGetApiStudentAttendanceGetStudentAttendanceList();

  const attendance = useMemo(() => {
    return parseApiList<any>(data?.data);
  }, [data]);

  const filteredAttendance = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return attendance;
    return attendance.filter((a) => {
      const studentName = (a.studentName || "").toLowerCase();
      return (
        studentName.includes(q) ||
        (a.className || "").toLowerCase().includes(q) ||
        (a.attendanceStatus || "").toLowerCase().includes(q)
      );
    });
  }, [attendance, searchQuery]);

  const tableColumns: TableColumn<any>[] = [
    { key: "studentName", header: "Student Name", flex: 2 },
    { key: "className", header: "Class", flex: 1, render: (a) => <Text className="text-sm font-semibold text-gray-700">{a.className} - {a.sectionName}</Text> },
    { key: "attendanceDate", header: "Date", width: 120, render: (a) => <Text className="text-sm font-semibold text-gray-700">{formatDisplayDate(a.attendanceDate)}</Text> },
    { 
      key: "status", 
      header: "Status", 
      width: 100, 
      align: "center", 
      render: (a) => {
        const isPresent = (a.attendanceStatus || "").toLowerCase() === "present";
        return (
          <View className={`px-2 py-1 rounded-md border ${isPresent ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}>
            <Text className={`text-[10px] font-bold ${isPresent ? "text-green-700" : "text-red-700"}`}>{a.attendanceStatus || "N/A"}</Text>
          </View>
        );
      }
    }
  ];

  const renderAttendanceItem = (item: any) => {
    const status = (item.attendanceStatus || "Present").toLowerCase();
    const isPresent = status === "present";
    
    return (
      <MobileDataCard
        title={item.studentName || "Unknown Student"}
        subtitle={`${item.className || "N/A"} - ${item.sectionName || ""}`}
        accentColor={isPresent ? "#10B981" : "#EF4444"}
        icon={<IconCircle name="attendance" size={44} iconSize={22} />}
        badge={
          <View className={`${isPresent ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"} border px-2 py-1 rounded-lg`}>
            <Text className={`${isPresent ? "text-emerald-700" : "text-red-700"} font-black text-[10px] uppercase`}>
              {item.attendanceStatus || "N/A"}
            </Text>
          </View>
        }
        fields={[
          { label: "Date", value: formatDisplayDate(item.attendanceDate) },
          { label: "Marked By", value: item.markedBy || "Teacher" },
        ]}
      />
    );
  };

  return (
    <PremiumScreenLayout
      title="Attendance"
      subtitle="View your child's attendance records"
      scrollable={false}
      flatHeader
    >
      <ResponsiveDataList
        data={filteredAttendance}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRefresh={refetch}
        renderCard={renderAttendanceItem}
        tableColumns={tableColumns}
        keyExtractor={(item) => String(item.studentAttendanceID)}
        emptyIcon="attendance"
        emptyTitle="No records found"
        emptyMessage={searchQuery ? "Try a different search" : "No attendance records available"}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search records..."
      />
    </PremiumScreenLayout>
  );
}
