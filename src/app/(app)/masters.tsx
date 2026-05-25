import React, { useMemo, useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumTabSwitcher, PremiumCard } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Button } from "@/components/ui/Button";
import { useGetApiBloodGroupGet, usePostApiBloodGroupAdd } from "@/api/generated/2-master-bloodgroup/2-master-bloodgroup";
import { useGetApiCategoryGet, usePostApiCategoryAdd } from "@/api/generated/2-master-category/2-master-category";
import { useGetApiReligionGet, usePostApiReligionAdd } from "@/api/generated/2-master-religion/2-master-religion";
import { parseApiList } from "@/utils/apiResponse";
import { recordLabel } from "@/utils/recordHelpers";
import { useToast } from "@/components/ui/Toast";
import { Colors } from "@/constants/colors";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "@/components/auth/AccessDenied";

type Tab = "blood" | "category" | "religion";

export default function MastersScreen() {
  const { can } = usePermissions();
  if (!can("manageMasters")) return <AccessDenied />;

  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>("blood");
  const [name, setName] = useState("");

  const bloodQ = useGetApiBloodGroupGet();
  const catQ = useGetApiCategoryGet();
  const relQ = useGetApiReligionGet();
  const addBlood = usePostApiBloodGroupAdd();
  const addCat = usePostApiCategoryAdd();
  const addRel = usePostApiReligionAdd();

  const { items, loading, refetch, addPending, onAdd } = useMemo(() => {
    if (tab === "blood") {
      return {
        items: parseApiList<Record<string, unknown>>(bloodQ.data?.data),
        loading: bloodQ.isLoading,
        refetch: bloodQ.refetch,
        addPending: addBlood.isPending,
        onAdd: async (n: string) => {
          await addBlood.mutateAsync({ data: { bloodGroupName: n } });
          bloodQ.refetch();
        },
        idKey: "bloodGroupID",
        nameKey: "bloodGroupName",
      };
    }
    if (tab === "category") {
      return {
        items: parseApiList<Record<string, unknown>>(catQ.data?.data),
        loading: catQ.isLoading,
        refetch: catQ.refetch,
        addPending: addCat.isPending,
        onAdd: async (n: string) => {
          await addCat.mutateAsync({ data: { categoryName: n } });
          catQ.refetch();
        },
        idKey: "categoryID",
        nameKey: "categoryName",
      };
    }
    return {
      items: parseApiList<Record<string, unknown>>(relQ.data?.data),
      loading: relQ.isLoading,
      refetch: relQ.refetch,
      addPending: addRel.isPending,
      onAdd: async (n: string) => {
        await addRel.mutateAsync({ data: { religionName: n } });
        relQ.refetch();
      },
      idKey: "religionID",
      nameKey: "religionName",
    };
  }, [tab, bloodQ, catQ, relQ, addBlood, addCat, addRel]);

  const idKey =
    tab === "blood" ? "bloodGroupID" : tab === "category" ? "categoryID" : "religionID";
  const nameKey =
    tab === "blood" ? "bloodGroupName" : tab === "category" ? "categoryName" : "religionName";

  const handleAdd = async () => {
    if (!name.trim()) {
      showToast("Name is required.", "error");
      return;
    }
    try {
      await onAdd(name.trim());
      showToast("Added.", "success");
      setName("");
    } catch {
      showToast("Failed to add.", "error");
    }
  };

  return (
    <PremiumScreenLayout
      title="Master data"
      subtitle="Blood group, category, religion"
      onBack={() => router.back()}
      scrollable={false}
      bodyStyle={{ flex: 1, paddingHorizontal: 0, marginTop: -16 }}
      headerSlot={
        <PremiumTabSwitcher
          tabs={[
            { key: "blood", label: "Blood" },
            { key: "category", label: "Category" },
            { key: "religion", label: "Religion" },
          ]}
          active={tab}
          onChange={(k) => setTab(k as Tab)}
        />
      }
    >
      <PremiumCard noAccent style={{ marginHorizontal: 16, marginBottom: 12, padding: 12, flexDirection: "row", gap: 8 }}>
        <TextInput
          placeholder={`New ${tab} name`}
          value={name}
          onChangeText={setName}
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 bg-white"
        />
        <Button label="Add" onPress={handleAdd} loading={addPending} />
      </PremiumCard>
      {loading ? (
        <PremiumLoader color={Colors.primary} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item, i) => String(item[idKey] ?? i)}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          onRefresh={refetch}
          refreshing={loading}
          ListEmptyComponent={<EmptyState />}
          renderItem={({ item }) => (
            <MobileDataCard title={recordLabel(item, nameKey)} subtitle="" fields={[]} />
          )}
        />
      )}
    </PremiumScreenLayout>
  );
}
