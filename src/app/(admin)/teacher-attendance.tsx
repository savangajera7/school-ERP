import React, { useMemo, useState } from "react";
import { FlatList, TextInput } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumCard } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Button } from "@/components/ui/Button";
import {
  useGetApiTeacherAttendanceGetTeacherAttendanceList,
  usePostApiTeacherAttendanceInsertOne,
  buildTeacherAttendanceInsertRequest,
} from "@/api/attendance";
import { parseApiList } from "@/utils/apiResponse";
import { recordLabel } from "@/utils/recordHelpers";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/colors";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { PremiumDatePicker } from "@/components/ui/PremiumDatePicker";

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
  const insertMutation = usePostApiTeacherAttendanceInsertOne();
  const rows = useMemo(() => parseApiList<Record<string, unknown>>(data?.data), [data]);

  const handleMark = async () => {
    const tid = parseInt(teacherId, 10);
    if (!tid) {
      showToast("Valid teacher ID is required.", "error");
      return;
    }
    try {
      await insertMutation.mutateAsync({
        data: buildTeacherAttendanceInsertRequest({
          teacherID: tid,
          attendanceDate: date,
          attendanceStatus: status,
          schoolID: userData?.schoolID ?? null,
          addedBy: parseInt(String(userData?.id ?? "0"), 10) || 0,
        }),
      });
      showToast("Attendance saved.", "success");
      refetch();
    } catch {
      showToast("Failed to save attendance.", "error");
    }
  };

  return (
    <PremiumScreenLayout
      title="Staff attendance"
      subtitle="Teacher register"
      onBack={() => router.back()}
      scrollable={false}
      bodyStyle={{ flex: 1, paddingHorizontal: 0, marginTop: -16 }}
    >
      <PremiumCard noAccent style={{ padding: 16, marginHorizontal: 16, marginBottom: 12, gap: 4 }}>
        <TextInput placeholder="Teacher ID" value={teacherId} onChangeText={setTeacherId} keyboardType="number-pad" className="border border-gray-200 rounded-xl px-4 py-3 mb-2 text-sm font-semibold text-gray-800 bg-gray-50" />
        <PremiumDatePicker
          label="Attendance Date"
          value={date}
          onChange={setDate}
        />
        <TextInput placeholder="Status (Present/Absent)" value={status} onChangeText={setStatus} className="border border-gray-200 rounded-xl px-4 py-3 mb-4 text-sm font-semibold text-gray-800 bg-gray-50" />
        <Button label="Add attendance" onPress={handleMark} loading={insertMutation.isPending} />
      </PremiumCard>
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
    </PremiumScreenLayout>
  );
}
