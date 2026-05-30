import React, { useMemo, useState } from "react";
import { View, FlatList, TextInput } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumCard } from "@/components/ui/premium";
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
    <PremiumScreenLayout
      title="Accounts"
      subtitle="Money / petty cash"
      scrollable={false}
      bodyStyle={{ flex: 1, paddingHorizontal: 0, marginTop: -16 }}
    >
      <PremiumCard noAccent style={{ padding: 16, marginHorizontal: 16, marginBottom: 12, gap: 8 }}>
        <TextInput placeholder="Type (e.g. Expense)" value={moneyType} onChangeText={setMoneyType} className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2 text-gray-800 dark:text-slate-200" placeholderTextColor="#9CA3AF" />
        <TextInput placeholder="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2 text-gray-800 dark:text-slate-200" placeholderTextColor="#9CA3AF" />
        <TextInput placeholder="Payment mode" value={paymentMode} onChangeText={setPaymentMode} className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2 text-gray-800 dark:text-slate-200" placeholderTextColor="#9CA3AF" />
        <TextInput placeholder="Remark" value={remark} onChangeText={setRemark} className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-2 text-gray-800 dark:text-slate-200" placeholderTextColor="#9CA3AF" />
        <Button label="Add entry" onPress={handleAdd} loading={insertMutation.isPending} />
      </PremiumCard>
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
    </PremiumScreenLayout>
  );
}
