import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { useGetApiParentGetParentList, useDeleteApiParentDeleteParent } from "@/api/generated/parent/parent";
import { parseApiList } from "@/utils/apiResponse";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { usePermissions } from "@/hooks/usePermissions";
import { ResponsiveDataList, EntityActionButtons, type TableColumn } from "@/components/shared";

export default function AdminParentManagementScreen() {
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

  const tableColumns: TableColumn<any>[] = [
    { 
      key: "name", 
      header: "Parent Name", 
      flex: 2, 
      render: (p) => (
        <View className="flex-row items-center gap-2">
          <IconCircle name="parents" size={24} iconSize={14} />
          <Text className="text-sm font-bold text-gray-800">{`${p.firstName} ${p.lastName}`}</Text>
        </View>
      )
    },
    { key: "mobileNo", header: "Phone", width: 120 },
    { key: "email", header: "Email", flex: 2 },
    { key: "occupation", header: "Occupation", flex: 1 },
    { key: "relation", header: "Relation", width: 100 },
    { 
      key: "actions", 
      header: "Actions", 
      width: 80, 
      align: "right", 
      render: (p) => (
        <EntityActionButtons 
          onDelete={() => handleDelete(p)}
          showEdit={false} // There was no edit button on the original screen either
        />
      )
    }
  ];

  const renderParentItem = (item: any) => {
    const fullName = `${item.firstName} ${item.lastName}`;
    return (
      <MobileDataCard
        title={fullName}
        subtitle={item.mobileNo || "No Contact"}
        accentColor={Colors.primary}
        icon={<IconCircle name="parents" size={44} iconSize={22} />}
        fields={[
          { label: "Email", value: item.email || "N/A" },
          { label: "Occupation", value: item.occupation || "N/A" },
          { label: "Relation", value: item.relation || "Parent" },
        ]}
        actions={
          <EntityActionButtons 
            onDelete={() => handleDelete(item)}
            showEdit={false}
          />
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
    >
      <ResponsiveDataList
        data={filteredParents}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRefresh={refetch}
        renderCard={renderParentItem}
        tableColumns={tableColumns}
        keyExtractor={(item) => String(item.parentID)}
        emptyIcon="parents"
        emptyTitle="No parents found"
        emptyMessage={searchQuery ? "Try a different search" : "Add your first parent record"}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, phone, or email..."
      />
    </PremiumScreenLayout>
  );
}
