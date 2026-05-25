import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { useGetApiFeesGetFeesList, useDeleteApiFeesDeleteFees } from "@/api/generated/fees/fees";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { PremiumSearchField } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";

export default function AdminFeesManagementScreen() {
  const { isMobile } = useResponsive();
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleDelete = (fee: any) => {
    Alert.alert(
      "Delete Fee Record",
      `Are you sure you want to remove the fee record for ${fee.studentName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteFees.mutateAsync({ 
                data: { feesID: fee.feesID } 
              });
              refetch();
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete fee record");
            }
          }
        }
      ]
    );
  };

  const renderFeeItem = ({ item }: { item: any }) => {
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
          { label: "Date", value: item.paymentDate ? String(item.paymentDate).slice(0, 10) : "N/A" },
          { label: "Method", value: item.paymentMethod || "N/A" },
          { label: "Status", value: item.status || "Paid", highlight: "success" },
        ]}
        actions={
          <View className="flex-row gap-2 ml-auto">
            <TouchableOpacity 
              onPress={() => router.push(`/(admin)/fees-form?id=${item.feesID}`)}
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
      <PremiumSearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search student or invoice..."
        onClear={() => setSearchQuery("")}
      />

      {isLoading ? (
        <SkeletonLoader rows={5} />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Could not load fee records"}
        />
      ) : (
        <FlatList
          data={filteredFees}
          renderItem={renderFeeItem}
          keyExtractor={(item) => String(item.feesID)}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <EmptyState
              icon="fees"
              title="No records found"
              message={searchQuery ? "Try a different search" : "No fee payments recorded yet"}
            />
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </PremiumScreenLayout>
  );
}
