import React from "react";
import { View, FlatList, RefreshControl } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useGetApiUserGetUserList } from "@/api/generated/user/user";
import { parseApiList } from "@/utils/apiResponse";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconCircle } from "@/components/icons/AppIcon";

export default function SuperAdminUsersScreen() {
  const { data, isLoading, refetch } = useGetApiUserGetUserList();
  
  const users = parseApiList(data?.data);

  const renderUserItem = ({ item }: { item: any }) => (
    <MobileDataCard
      title={item.fullName || item.userName || "Unnamed User"}
      subtitle={item.roleName || "No Role"}
      onPress={() => router.push(`/(super-admin)/users/${item.userID}`)}
      icon={<IconCircle name="users" size={40} iconSize={20} />}
      fields={[
        { label: "Email", value: item.email || "N/A" },
        { label: "Mobile", value: item.mobileNo || "N/A" },
        { 
          label: "Status", 
          value: item.isActive ? "Active" : "Inactive", 
          highlight: item.isActive ? "success" : "error" 
        },
      ]}
    />
  );

  return (
    <PremiumScreenLayout
      title="User Management"
      subtitle="Manage platform administrators and staff"
      scrollable={false}
      rightAction={
        <HeaderActionButton 
          label="Add User" 
          shortLabel="Add"
          onPress={() => router.push("/(super-admin)/users/create")} 
        />
      }
    >
      {isLoading ? (
        <SkeletonLoader rows={5} />
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item: any) => String(item.userID)}
          renderItem={renderUserItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState 
              title="No users found" 
              message="Start by adding a new platform user" 
            />
          }
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={refetch} />
          }
        />
      )}
    </PremiumScreenLayout>
  );
}
