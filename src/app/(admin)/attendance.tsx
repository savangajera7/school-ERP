import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { 
  useGetApiStudentAttendanceGetStudentAttendanceList, 
  useDeleteApiStudentAttendanceDeleteStudentAttendance 
} from "@/api/generated/student-attendance/student-attendance";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { PremiumSearchField } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";

import { formatDisplayDate } from "@/utils/dateHelpers";

export default function AdminAttendanceManagementScreen() {
  const { isMobile } = useResponsive();
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

  const renderAttendanceItem = ({ item }: { item: any }) => {
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
          <View className="flex-row gap-2 ml-auto">
            <TouchableOpacity 
              onPress={() => router.push(`/(admin)/attendance-form?id=${item.studentAttendanceID}`)}
              className="bg-blue-50 p-2 rounded-lg"
            >
              <AppIcon name="edit" size={18} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDelete(item)}
              className="bg-red-50 p-2 rounded-lg"
            >
              <AppIcon name="delete" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
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
      <PremiumSearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search student or status..."
        onClear={() => setSearchQuery("")}
      />

      {isLoading ? (
        <SkeletonLoader rows={5} />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Could not load attendance"}
        />
      ) : (
        <FlatList
          data={filteredAttendance}
          renderItem={renderAttendanceItem}
          keyExtractor={(item) => String(item.studentAttendanceID)}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <EmptyState
              icon="attendance"
              title="No records found"
              message={searchQuery ? "Try a different search" : "No attendance marked for today"}
            />
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </PremiumScreenLayout>
  );
}
