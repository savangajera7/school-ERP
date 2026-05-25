import React from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useGetApiRoleGetRoleList } from "@/api/generated/role/role";
import { parseApiList } from "@/utils/apiResponse";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconCircle } from "@/components/icons/AppIcon";

export default function RolesManagementScreen() {
  const { data, isLoading, refetch } = useGetApiRoleGetRoleList();
  const roles = parseApiList(data?.data);

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
