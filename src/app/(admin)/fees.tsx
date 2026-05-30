import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useDialog } from "@/components/ui/AppDialog";
import { useToast } from "@/components/ui/Toast";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { useGetApiFeesGetFeesList, useDeleteApiFeesDeleteFees } from "@/api/generated/fees/fees";
import { parseApiList } from "@/utils/apiResponse";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { IconCircle } from "@/components/icons/AppIcon";
import { formatDisplayDate } from "@/utils/dateHelpers";
import { ResponsiveDataList, EntityActionButtons, type TableColumn } from "@/components/shared";

export default function AdminFeesManagementScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const { confirm, alert } = useDialog();
  const { showToast } = useToast();

  const { data, isLoading, isError, error, refetch } = useGetApiFeesGetFeesList();
  const deleteFees = useDeleteApiFeesDeleteFees();

  const fees = useMemo(() => {
    return parseApiList<any>(data?.data);
  }, [data]);

  const filteredFees = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return fees;
    return fees.filter((f) => {
      const studentName = (f.studentName || "").toLowerCase();
      return (
        studentName.includes(q) ||
        (f.feesType || "").toLowerCase().includes(q) ||
        (f.invoiceNo || "").toLowerCase().includes(q)
      );
    });
  }, [fees, searchQuery]);

  const handleDelete = async (fee: any) => {
    const ok = await confirm(
      "Delete Fee Record",
      `Are you sure you want to remove the fee record for ${fee.studentName}?`,
      { confirmLabel: "Delete", destructive: true }
    );
    if (!ok) return;
    try {
      await deleteFees.mutateAsync({ data: { feesID: fee.feesID } });
      showToast("Fee record deleted successfully", "success");
      refetch();
    } catch (err: any) {
      await alert("Error", err.message || "Failed to delete fee record", "error");
    }
  };

  const tableColumns: TableColumn<any>[] = [
    { key: "invoiceNo", header: "Invoice", width: 90 },
    { key: "studentName", header: "Student Name", flex: 2 },
    { key: "feesType", header: "Fee Type", flex: 1 },
    { 
      key: "amount", 
      header: "Amount", 
      width: 90, 
      align: "right",
      render: (f) => <Text className="text-sm font-bold text-gray-800 dark:text-slate-200">₹{f.amount || 0}</Text>
    },
    { 
      key: "paymentDate", 
      header: "Date", 
      width: 100, 
      render: (f) => <Text className="text-sm text-gray-600 dark:text-slate-400">{formatDisplayDate(f.paymentDate)}</Text>
    },
    { 
      key: "status", 
      header: "Status", 
      width: 90, 
      align: "center",
      render: (f) => (
        <View className="px-2 py-1 bg-green-50 dark:bg-green-950/30 rounded-md border border-green-100 dark:border-green-800">
          <Text className="text-[10px] font-bold text-green-700 dark:text-green-400">{f.status || "Paid"}</Text>
        </View>
      )
    },
    { 
      key: "actions", 
      header: "Actions", 
      width: 100, 
      align: "right", 
      render: (f) => (
        <EntityActionButtons 
          onEdit={() => router.push(`/(admin)/fees-form?id=${f.feesID}`)}
          onDelete={() => handleDelete(f)}
        />
      )
    }
  ];

  const renderFeeItem = (item: any) => {
    return (
      <MobileDataCard
        title={item.studentName || "Unknown Student"}
        subtitle={item.feesType || "General Fees"}
        accentColor={Colors.primary}
        icon={<IconCircle name="fees" size={44} iconSize={22} />}
        badge={
          <View className="bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg">
            <Text className="text-emerald-700 font-black text-[10px]">
              ₹{item.amount || 0}
            </Text>
          </View>
        }
        fields={[
          { label: "Date", value: formatDisplayDate(item.paymentDate) },
          { label: "Method", value: item.paymentMethod || "N/A" },
          { label: "Status", value: item.status || "Paid", highlight: "success" },
        ]}
        actions={
          <EntityActionButtons 
            onEdit={() => router.push(`/(admin)/fees-form?id=${item.feesID}`)}
            onDelete={() => handleDelete(item)}
          />
        }
      />
    );
  };

  return (
    <PremiumScreenLayout
      title="Fee Records"
      subtitle="Manage school revenue"
      scrollable={false}
      flatHeader
      rightAction={
        <HeaderActionButton
          label="+ Collect Fees"
          shortLabel="+ Add"
          onPress={() => router.push("/(admin)/fees-form")}
        />
      }
    >
      <ResponsiveDataList
        data={filteredFees}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRefresh={refetch}
        renderCard={renderFeeItem}
        tableColumns={tableColumns}
        keyExtractor={(item) => String(item.feesID)}
        emptyIcon="fees"
        emptyTitle="No records found"
        emptyMessage={searchQuery ? "Try a different search" : "No fee payments recorded yet"}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search student or invoice..."
      />
    </PremiumScreenLayout>
  );
}
