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
  useGetApiMoneyGetMoneyList,
  usePostApiMoneyInsertMoney,
} from "@/api/generated/money/money";
import { parseApiList } from "@/utils/apiResponse";
import { recordLabel } from "@/utils/recordHelpers";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/colors";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function MoneyScreen() {
  const { canManageMoney } = usePermissions();
  if (!canManageMoney) {
    return <AccessDenied message="Accounts are managed by school administrators." />;
  }
  const { showToast } = useToast();
  const { userData } = useAuthStore();
  const [moneyType, setMoneyType] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [remark, setRemark] = useState("");

  const { data, isLoading, refetch, isRefetching } = useGetApiMoneyGetMoneyList();
  const insertMutation = usePostApiMoneyInsertMoney();
  const rows = useMemo(() => parseApiList<Record<string, unknown>>(data?.data), [data]);

  const handleAdd = async () => {
    const amt = parseFloat(amount);
    if (!moneyType.trim() || !amt) {
      showToast("Type and amount are required.", "error");
      return;
    }
    try {
      await insertMutation.mutateAsync({
        data: {
          moneyType: moneyType.trim(),
          amount: amt,
          paymentMode,
          remark: remark.trim() || undefined,
          transactionDate: new Date().toISOString().slice(0, 10),
          addedBy: parseInt(userData?.id ?? "0", 10) || 0,
        },
      });
      showToast("Transaction recorded.", "success");
      setMoneyType("");
      setAmount("");
      setRemark("");
      refetch();
    } catch {
      showToast("Failed to record transaction.", "error");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#FDFDFD]" edges={["left", "right"]}>
      <StatusBar style="light" />
      <ScreenHeader title="Accounts" subtitle="Money / petty cash" onBack={() => router.back()} />
      <View className="p-4 bg-white border-b border-gray-100 gap-2">
        <TextInput placeholder="Type (e.g. Expense)" value={moneyType} onChangeText={setMoneyType} className="border border-gray-200 rounded-xl px-4 py-2" />
        <TextInput placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" className="border border-gray-200 rounded-xl px-4 py-2" />
        <TextInput placeholder="Payment mode" value={paymentMode} onChangeText={setPaymentMode} className="border border-gray-200 rounded-xl px-4 py-2" />
        <TextInput placeholder="Remark" value={remark} onChangeText={setRemark} className="border border-gray-200 rounded-xl px-4 py-2" />
        <Button label="Add entry" onPress={handleAdd} loading={insertMutation.isPending} />
      </View>
      {isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item, i) => String(item.moneyID ?? i)}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={<EmptyState title="No transactions" />}
          renderItem={({ item }) => (
            <MobileDataCard
              title={recordLabel(item, "moneyType")}
              subtitle={recordLabel(item, "transactionDate")}
              fields={[
                { label: "Amount", value: String(item.amount ?? "—") },
                { label: "Mode", value: recordLabel(item, "paymentMode") },
                { label: "Remark", value: recordLabel(item, "remark") },
              ]}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
