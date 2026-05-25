import React from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { 
  useGetApiRoleGetRoleList, 
  useDeleteApiRoleDeleteRole 
} from "@/api/generated/role/role";
import { parseApiList } from "@/utils/apiResponse";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { Alert, TouchableOpacity } from "react-native";

export default function RolesManagementScreen() {
  const { data, isLoading, refetch } = useGetApiRoleGetRoleList();
  const deleteRole = useDeleteApiRoleDeleteRole();
  const roles = parseApiList(data?.data);

  const handleDelete = (role: any) => {
    Alert.alert(
      "Delete Role",
      `Are you sure you want to delete "${role.roleName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRole.mutateAsync({ 
                data: { roleID: role.roleID } 
              });
              refetch();
            } catch (error: any) {
              Alert.alert("Error", error.message || "Failed to delete role");
            }
          }
        }
      ]
    );
  };

  const renderRoleItem = ({ item }: { item: any }) => (
    <MobileDataCard
      title={item.roleName}
      subtitle={`Level: ${item.roleLevel || "N/A"}`}
      icon={<IconCircle name="roles" size={40} iconSize={20} />}
      onPress={() => router.push({
        pathname: "/(super-admin)/role-rights",
        params: { roleID: item.roleID, roleName: item.roleName }
      })}
      fields={[
        { label: "Code", value: item.roleCode || "N/A" },
        { label: "Description", value: item.description || "No description" },
      ]}
      actions={
        <View className="flex-row gap-2 ml-auto">
          <TouchableOpacity 
            onPress={() => router.push(`/(super-admin)/roles/create?id=${item.roleID}`)}
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

  return (
    <PremiumScreenLayout
      title="Role Management"
      subtitle="Define user roles and access levels"
      showTopBar
      scrollable={false}
      rightAction={
        <HeaderActionButton 
          label="Add Role" 
          shortLabel="Add"
          onPress={() => router.push("/(super-admin)/roles/create")} 
        />
      }
    >
      {isLoading ? (
        <SkeletonLoader rows={4} />
      ) : (
        <FlatList
          data={roles}
          keyExtractor={(item: any) => String(item.roleID)}
          renderItem={renderRoleItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<EmptyState title="No roles defined" message="Create roles to manage user access" />}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        />
      )}
    </PremiumScreenLayout>
  );
}
