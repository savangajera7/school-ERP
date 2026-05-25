import React, { useMemo, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
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
    <SafeAreaView className="flex-1 bg-[#FDFDFD]" edges={["left", "right"]}>
      <StatusBar style="light" />
      <ScreenHeader
        title="Leave"
        subtitle={
          isTeacher
            ? "Apply for leave — student attendance is under Class Attendance"
            : isParent
              ? "Apply for leave for your ward"
              : "Review and track leave applications"
        }
        onBack={() => router.back()}
      />

      <View className="p-4 border-b border-gray-100 bg-white">
        <TextInput
          placeholder="From date (YYYY-MM-DD)"
          value={fromDate}
          onChangeText={setFromDate}
          className="border border-gray-200 rounded-xl px-4 py-2 mb-2"
        />
        <TextInput
          placeholder="To date (optional)"
          value={toDate}
          onChangeText={setToDate}
          className="border border-gray-200 rounded-xl px-4 py-2 mb-2"
        />
        <TextInput
          placeholder="Reason"
          value={reason}
          onChangeText={setReason}
          className="border border-gray-200 rounded-xl px-4 py-2 mb-3"
        />
        <Button label="Apply Leave" onPress={handleApply} loading={insertMutation.isPending} />
      </View>

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
          renderItem={({ item }: { item: Record<string, unknown> }) => (
            <MobileDataCard
              title={String(item.leaveReason ?? "Leave")}
              subtitle={`${item.fromDate ?? ""} → ${item.toDate ?? ""}`}
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
    </SafeAreaView>
  );
}
