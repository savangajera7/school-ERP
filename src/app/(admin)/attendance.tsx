import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { 
  useGetApiStudentAttendanceGetStudentAttendanceList, 
  useDeleteApiStudentAttendanceDeleteStudentAttendance 
} from "@/api/generated/student-attendance/student-attendance";
import { parseApiList } from "@/utils/apiResponse";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { IconCircle } from "@/components/icons/AppIcon";
import { formatDisplayDate } from "@/utils/dateHelpers";
import { ResponsiveDataList, EntityActionButtons, type TableColumn } from "@/components/shared";

export default function AdminAttendanceManagementScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useGetApiStudentAttendanceGetStudentAttendanceList();
  const deleteAttendance = useDeleteApiStudentAttendanceDeleteStudentAttendance();

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

  const handleDelete = (record: any) => {
    Alert.alert(
      "Delete Attendance",
      `Are you sure you want to remove the attendance record for ${record.studentName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAttendance.mutateAsync({ 
                data: { attendanceID: record.studentAttendanceID } 
              });
              refetch();
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete record");
            }
          }
        }
      ]
    );
  };

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
    },
    { 
      key: "actions", 
      header: "Actions", 
      width: 100, 
      align: "right", 
      render: (a) => (
        <EntityActionButtons 
          onEdit={() => router.push(`/(admin)/attendance-form?id=${a.studentAttendanceID}`)}
          onDelete={() => handleDelete(a)}
        />
      )
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
        actions={
          <EntityActionButtons 
            onEdit={() => router.push(`/(admin)/attendance-form?id=${item.studentAttendanceID}`)}
            onDelete={() => handleDelete(item)}
          />
        }
      />
    );
  };

  return (
    <PremiumScreenLayout
      title="Attendance"
      subtitle="Daily student tracking"
      scrollable={false}
      flatHeader
      rightAction={
        <HeaderActionButton
          label="+ Mark Attendance"
          shortLabel="+ Mark"
          onPress={() => router.push("/(admin)/attendance-form")}
        />
      }
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
        emptyMessage={searchQuery ? "Try a different search" : "No attendance marked for today"}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search student or status..."
      />
    </PremiumScreenLayout>
  );
}
