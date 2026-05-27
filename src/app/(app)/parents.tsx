import React, { useMemo, useState } from "react";
import { FlatList, TextInput, TouchableOpacity, Text, ActivityIndicator, View } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumCard } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import {
  useGetApiParentGetParentList,
} from "@/api/generated/parent/parent";
import { customInstance } from "@/services/api/axiosInstance";
import { parseApiList } from "@/utils/apiResponse";
import { recordLabel } from "@/utils/recordHelpers";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/colors";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "@/components/auth/AccessDenied";

import { useResponsive } from "@/hooks/useResponsive";

export default function ParentsScreen() {
  const { isMobile } = useResponsive();
  const { canManageParents } = usePermissions();
  if (!canManageParents) {
    return <AccessDenied message="Parent records are managed by school administrators." />;
  }
  const { showToast } = useToast();
  const { userData } = useAuthStore();
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [fatherMobile, setFatherMobile] = useState("");
  const [address, setAddress] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useGetApiParentGetParentList();
  const parents = useMemo(() => parseApiList<Record<string, unknown>>(data?.data), [data]);

  const handleAdd = async () => {
    if (!fatherName.trim()) {
      showToast("Father name is required.", "error");
      return;
    }
    setIsAdding(true);
    try {
      await customInstance("/api/Parent/InsertParent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fatherName: fatherName.trim(),
          motherName: motherName.trim() || undefined,
          fatherMobileNo: fatherMobile.trim() || undefined,
          address: address.trim() || undefined,
          createdBy: parseInt(userData?.id ?? "0", 10) || 0,
        }),
      });
      showToast("Parent added.", "success");
      setFatherName("");
      setMotherName("");
      setFatherMobile("");
      setAddress("");
      refetch();
    } catch {
      showToast("Failed to add parent.", "error");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <PremiumScreenLayout
      title="Parents"
      subtitle="Guardian records"
      onBack={() => router.back()}
      scrollable={false}
      bodyStyle={{ flex: 1, paddingHorizontal: 0, marginTop: -16 }}
    >
      <PremiumCard noAccent style={{ padding: 16, marginHorizontal: 16, marginBottom: 12, gap: 8 }}>
        <TextInput 
          placeholder="Father name *" 
          value={fatherName} 
          onChangeText={setFatherName} 
          className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50" 
          placeholderTextColor="#9CA3AF"
          style={{ outlineWidth: 0 } as any}
        />
        <TextInput 
          placeholder="Mother name" 
          value={motherName} 
          onChangeText={setMotherName} 
          className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50" 
          placeholderTextColor="#9CA3AF"
          style={{ outlineWidth: 0 } as any}
        />
        <TextInput 
          placeholder="Father mobile" 
          value={fatherMobile} 
          onChangeText={setFatherMobile} 
          className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50" 
          keyboardType="phone-pad" 
          placeholderTextColor="#9CA3AF"
          style={{ outlineWidth: 0 } as any}
        />
        <TextInput 
          placeholder="Address" 
          value={address} 
          onChangeText={setAddress} 
          className="border border-gray-200 rounded-xl px-4 py-3 bg-gray-50/50" 
          placeholderTextColor="#9CA3AF"
          style={{ outlineWidth: 0 } as any}
        />
        <TouchableOpacity
          onPress={handleAdd}
          disabled={isAdding}
          className="h-[52px] rounded-xl justify-center items-center mt-2 shadow-lg"
          style={{ backgroundColor: Colors.accent }}
          activeOpacity={0.8}
        >
          {isAdding ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text className="text-white font-black text-xs uppercase tracking-widest">Add Parent</Text>
          )}
        </TouchableOpacity>
      </PremiumCard>
      {isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : (
        <FlatList
          data={parents}
          keyExtractor={(item, i) => String(item.parentID ?? i)}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={<EmptyState title="No parents" />}
          renderItem={({ item }) => (
            <MobileDataCard
              title={recordLabel(item, "fatherName", "parentName")}
              subtitle={recordLabel(item, "motherName")}
              fields={[
                { label: "Mobile", value: recordLabel(item, "fatherMobileNo", "mobileNo") },
                { label: "Address", value: recordLabel(item, "address") },
              ]}
            />
          )}
        />
      )}
    </PremiumScreenLayout>
  );
}
