import React, { useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumCard } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import {
  useGetApiLeaveApplicationGetLeaveApplicationList,
  usePostApiLeaveApplicationInsertLeaveApplication,
} from "@/api/generated/leave-application/leave-application";
import { parseApiList } from "@/utils/apiResponse";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/colors";
import { Button } from "@/components/ui/Button";
import { usePermissions } from "@/hooks/usePermissions";
import { PremiumDatePicker } from "@/components/ui/PremiumDatePicker";
import { formatDisplayDate } from "@/utils/dateHelpers";

export default function LeaveScreen() {
  const { showToast } = useToast();
  const { userData } = useAuthStore();
  const { canReviewLeave, isTeacher, isParent } = usePermissions();
  const [reason, setReason] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data, isLoading, refetch } = useGetApiLeaveApplicationGetLeaveApplicationList({
    query: { enabled: canReviewLeave },
  });
  const insertMutation = usePostApiLeaveApplicationInsertLeaveApplication();

  const leaves = useMemo(() => parseApiList(data?.data), [data]);

  const handleApply = async () => {
    if (!reason || !fromDate) {
      showToast("Reason and from date are required.", "error");
      return;
    }
    try {
      await insertMutation.mutateAsync({
        data: {
          leaveTitle: "Leave Request",
          leaveReason: reason,
          fromDate,
          toDate: toDate || fromDate,
          leaveStatus: "Pending",
          createdBy: parseInt(userData?.id ?? "0", 10) || 0,
        },
      });
      showToast("Leave application submitted.", "success");
      setReason("");
      setFromDate("");
      setToDate("");
      refetch();
    } catch {
      showToast("Failed to submit leave.", "error");
    }
  };

  return (
    <PremiumScreenLayout
      title="Leave"
      subtitle={
        isTeacher
          ? "Apply for leave — student attendance is under Class Attendance"
          : isParent
            ? "Apply for leave for your ward"
            : "Review and track leave applications"
      }
      onBack={() => router.back()}
      scrollable={false}
      bodyStyle={{ flex: 1, paddingHorizontal: 0, marginTop: -16 }}
    >
      <PremiumCard noAccent style={{ marginHorizontal: 16, marginBottom: 12, padding: 16, gap: 4 }}>
        <PremiumDatePicker
          label="From Date"
          value={fromDate}
          onChange={setFromDate}
        />
        <PremiumDatePicker
          label="To Date"
          value={toDate}
          onChange={setToDate}
        />
        <Text style={{ fontSize: 10, fontWeight: "900", color: "#6B7280", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>Reason</Text>
        <TextInput
          placeholder="Reason for leave..."
          value={reason}
          onChangeText={setReason}
          className="border border-gray-200 rounded-xl px-4 py-3 mb-3 text-sm font-semibold text-gray-800 bg-gray-50"
        />
        <Button label="Apply Leave" onPress={handleApply} loading={insertMutation.isPending} />
      </PremiumCard>

      {!canReviewLeave ? (
        <Text className="text-center text-gray-500 px-6 py-8 text-sm">
          Your leave request was submitted. The school office will update the status.
        </Text>
      ) : isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : (
        <FlatList
          data={leaves}
          keyExtractor={(item, i) => String((item as { leaveApplicationID?: number }).leaveApplicationID ?? i)}
          contentContainerStyle={{ padding: 16 }}
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={({ item }: { item: any }) => (
            <MobileDataCard
              title={String(item.leaveReason ?? "Leave")}
              subtitle={`${formatDisplayDate(item.fromDate)} → ${formatDisplayDate(item.toDate)}`}
              fields={[
                { label: "Status", value: String(item.leaveStatus ?? "Pending") },
              ]}
            />
          )}
          ListEmptyComponent={
            <Text className="text-center text-gray-500 py-8">No leave applications.</Text>
          }
        />
      )}
    </PremiumScreenLayout>
  );
}
