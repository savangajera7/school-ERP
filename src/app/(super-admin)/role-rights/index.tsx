import React, { useMemo } from "react";
import { View, Text, FlatList, Switch, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { 
  useGetApiRoleRightsGetRoleRightsList, 
  usePutApiRoleRightsUpdateRoleRights 
} from "@/api/generated/role-rights/role-rights";
import { parseApiList } from "@/utils/apiResponse";
import { Card } from "@/components/ui/Card";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/colors";

export default function RoleRightsScreen() {
  const { roleID, roleName } = useLocalSearchParams();
  const selectedRoleID = parseInt(typeof roleID === "string" ? roleID : roleID?.[0] || "0");
  const { userData } = useAuthStore();
  
  const { data, isLoading, refetch } = useGetApiRoleRightsGetRoleRightsList();
  const updateRights = usePutApiRoleRightsUpdateRoleRights();

  const allRights = parseApiList(data?.data);
  const roleRights = useMemo(() => {
    return allRights.filter((r: any) => r.roleID === selectedRoleID);
  }, [allRights, selectedRoleID]);

  const handleToggle = async (right: any, value: boolean) => {
    try {
      await updateRights.mutateAsync({
        data: {
          ...right,
          isActive: value,
          updatedBy: parseInt(userData?.id || "0"),
        }
      });
      refetch();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update permission");
    }
  };

  const renderRightItem = ({ item }: { item: any }) => (
    <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
      <View className="flex-1 pr-4">
        <Text className="text-sm font-bold text-gray-800">{item.menuName || "Unnamed Module"}</Text>
        <Text className="text-[10px] text-gray-500 mt-1 uppercase tracking-tighter">
          {item.canView ? "View" : ""} {item.canAdd ? "| Add" : ""} {item.canEdit ? "| Edit" : ""} {item.canDelete ? "| Delete" : ""}
        </Text>
      </View>
      <Switch
        value={item.isActive}
        onValueChange={(val) => handleToggle(item, val)}
        trackColor={{ false: "#E5E7EB", true: Colors.primary + "80" }}
        thumbColor={item.isActive ? Colors.primary : "#9CA3AF"}
      />
    </View>
  );

  return (
    <PremiumScreenLayout
      title="Role Permissions"
      subtitle={`Configuring access for ${roleName || "Role"}`}
      onBack={() => router.back()}
      scrollable={false}
      flatHeader
    >
      {isLoading ? (
        <SkeletonLoader rows={8} />
      ) : (
        <Card className="p-0 overflow-hidden flex-1">
          <FlatList
            data={roleRights}
            keyExtractor={(item: any) => String(item.roleRightsID)}
            renderItem={renderRightItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="p-8 items-center">
                <Text className="text-gray-400 text-sm font-bold">No permissions defined for this role</Text>
              </View>
            }
          />
        </Card>
      )}
    </PremiumScreenLayout>
  );
}
