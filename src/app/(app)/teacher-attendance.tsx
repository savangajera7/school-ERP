import React, { useMemo, useState } from "react";
import { View, FlatList, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Button } from "@/components/ui/Button";
import {
  useGetApiTeacherAttendanceGetTeacherAttendanceList,
  usePostApiTeacherAttendanceInsertTeacherAttendance,
} from "@/api/generated/teacher-attendance/teacher-attendance";
import { parseApiList } from "@/utils/apiResponse";
import { recordLabel } from "@/utils/recordHelpers";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/colors";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function TeacherAttendanceScreen() {
  const { canManageStaffAttendance } = usePermissions();
  if (!canManageStaffAttendance) {
    return (
      <AccessDenied message="Staff attendance register is managed by school admin. Teachers can apply for leave from the Leave screen." />
    );
  }
  const { showToast } = useToast();
  const { userData } = useAuthStore();
  const [teacherId, setTeacherId] = useState("");
  const [status, setStatus] = useState("Present");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const { data, isLoading, refetch, isRefetching } =
    useGetApiTeacherAttendanceGetTeacherAttendanceList();
  const insertMutation = usePostApiTeacherAttendanceInsertTeacherAttendance();
  const rows = useMemo(() => parseApiList<Record<string, unknown>>(data?.data), [data]);

  const handleMark = async () => {
    const tid = parseInt(teacherId, 10);
    if (!tid) {
      showToast("Valid teacher ID is required.", "error");
      return;
    }
    try {
      await insertMutation.mutateAsync({
        data: {
          teacherID: tid,
          attendanceDate: date,
          attendanceStatus: status,
          addedBy: parseInt(userData?.id ?? "0", 10) || 0,
        },
      });
      showToast("Attendance saved.", "success");
      refetch();
    } catch {
      showToast("Failed to save attendance.", "error");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFDFD]" edges={["left", "right"]}>
      <StatusBar style="light" />
      <ScreenHeader title="Staff attendance" subtitle="Teacher register" onBack={() => router.back()} />
      <View className="p-4 bg-white border-b border-gray-100 gap-2">
        <TextInput placeholder="Teacher ID" value={teacherId} onChangeText={setTeacherId} keyboardType="number-pad" className="border border-gray-200 rounded-xl px-4 py-2" />
        <TextInput placeholder="Date YYYY-MM-DD" value={date} onChangeText={setDate} className="border border-gray-200 rounded-xl px-4 py-2" />
        <TextInput placeholder="Status (Present/Absent)" value={status} onChangeText={setStatus} className="border border-gray-200 rounded-xl px-4 py-2" />
        <Button label="Mark attendance" onPress={handleMark} loading={insertMutation.isPending} />
      </View>
      {isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item, i) => String(item.teacherAttendanceID ?? i)}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={<EmptyState title="No staff attendance records" />}
          renderItem={({ item }) => (
            <MobileDataCard
              title={`Teacher #${item.teacherID ?? "—"}`}
              subtitle={recordLabel(item, "attendanceDate")}
              fields={[
                { label: "Status", value: recordLabel(item, "attendanceStatus", "status") },
              ]}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
