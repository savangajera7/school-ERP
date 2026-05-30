import React, { useMemo } from "react";
import { View, Text, FlatList } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { useGetApiRoleGetRoleList } from "@/api/generated/role/role";
import { useGetApiRoleRightsGetRoleRightsList } from "@/api/generated/role-rights/role-rights";
import { parseApiList } from "@/utils/apiResponse";
import { Colors } from "@/constants/colors";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function RolesScreen() {
  const { can } = usePermissions();
  if (!can("manageRoles")) return <AccessDenied />;
  const { data: rolesData, isLoading: loadingRoles } = useGetApiRoleGetRoleList();
  const { data: rightsData, isLoading: loadingRights } =
    useGetApiRoleRightsGetRoleRightsList();

  const roles = useMemo(() => parseApiList(rolesData?.data), [rolesData]);
  const rights = useMemo(() => parseApiList(rightsData?.data), [rightsData]);

  if (loadingRoles || loadingRights) {
    return (
      <View className="flex-1 items-center justify-center">
        <PremiumLoader color={Colors.primary} />
      </View>
    );
  }

  return (
    <PremiumScreenLayout
      title="Roles & Rights"
      subtitle="Access control"
      onBack={() => router.back()}
      scrollable={false}
      bodyStyle={{ flex: 1, paddingHorizontal: 0, marginTop: -16 }}
    >
      <FlatList
        ListHeaderComponent={
          <Text className="text-lg font-black text-primary dark:text-blue-400 px-4 pt-4 pb-2">Roles</Text>
        }
        data={roles}
        keyExtractor={(item, i) => String((item as { roleID?: number }).roleID ?? i)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={({ item }: { item: Record<string, unknown> }) => (
          <MobileDataCard
            title={String(item.roleName ?? "Role")}
            subtitle={String(item.roleDescription ?? "")}
            fields={[{ label: "ID", value: String(item.roleID ?? "—") }]}
          />
        )}
        ListFooterComponent={
          <>
            <Text className="text-lg font-black text-primary dark:text-blue-400 px-4 pt-6 pb-2">Rights</Text>
            {rights.map((item, i) => (
              <MobileDataCard
                key={String((item as { roleRightsID?: number }).roleRightsID ?? i)}
                title={String((item as { rightName?: string }).rightName ?? "Right")}
                subtitle={`Role ${(item as { roleID?: number }).roleID ?? "—"}`}
              />
            ))}
          </>
        }
      />
    </PremiumScreenLayout>
  );
}
