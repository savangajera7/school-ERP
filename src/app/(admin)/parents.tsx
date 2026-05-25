import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { useGetApiParentGetParentList, useDeleteApiParentDeleteParent } from "@/api/generated/parent/parent";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { PremiumSearchField } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { usePermissions } from "@/hooks/usePermissions";

export default function AdminParentManagementScreen() {
  const { isMobile } = useResponsive();
  const { canManageStudents } = usePermissions(); // Assuming parents are managed with students
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useGetApiParentGetParentList();
  const deleteParent = useDeleteApiParentDeleteParent();

  const parents = useMemo(() => {
    return parseApiList<any>(data?.data);
  }, [data]);

  const filteredParents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return parents;
    return parents.filter((p) => {
      const name = `${p.firstName} ${p.lastName}`.toLowerCase();
      return (
        name.includes(q) ||
        (p.mobileNo || "").toLowerCase().includes(q) ||
        (p.email || "").toLowerCase().includes(q)
      );
    });
  }, [parents, searchQuery]);

  const handleDelete = (parent: any) => {
    Alert.alert(
      "Delete Parent",
      `Are you sure you want to remove ${parent.firstName} ${parent.lastName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteParent.mutateAsync({ 
                data: { parentID: parent.parentID } 
              });
              refetch();
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete parent");
            }
          }
        }
      ]
    );
  };

  const renderParentItem = ({ item }: { item: any }) => {
    const fullName = `${item.firstName} ${item.lastName}`;
    return (
      <MobileDataCard
        title={fullName}
        subtitle={item.mobileNo || "No Contact"}
        accentColor={Colors.accent}
        icon={<IconCircle name="parents" size={44} iconSize={22} />}
        fields={[
          { label: "Email", value: item.email || "N/A" },
          { label: "Occupation", value: item.occupation || "N/A" },
          { label: "Relation", value: item.relation || "Parent" },
        ]}
        actions={
          <View className="flex-row gap-2 ml-auto">
            <TouchableOpacity 
              onPress={() => router.push(`/(admin)/parent-form?id=${item.parentID}`)}
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
      title="Parents"
      subtitle="Manage guardian records"
      scrollable={false}
      flatHeader
      rightAction={
        canManageStudents ? (
          <HeaderActionButton
            label="+ New Parent"
            shortLabel="+ New"
            onPress={() => router.push("/(admin)/parent-form")}
          />
        ) : undefined
      }
    >
      <PremiumSearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search parents..."
        onClear={() => setSearchQuery("")}
      />

      {isLoading ? (
        <SkeletonLoader rows={5} />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Could not load parents"}
        />
      ) : (
        <FlatList
          data={filteredParents}
          renderItem={renderParentItem}
          keyExtractor={(item) => String(item.parentID)}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <EmptyState
              icon="parents"
              title="No parents found"
              message={searchQuery ? "Try a different search" : "Add your first parent record"}
            />
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </PremiumScreenLayout>
  );
}
