import React, { useMemo } from "react";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { ScreenHeader } from "@/components/ui/ScreenHeader";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { useGetApiUserGetUserList } from "@/api/generated/user/user";
import { parseApiList } from "@/utils/apiResponse";
import { Colors } from "@/constants/colors";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function UsersScreen() {
  const { can } = usePermissions();
  if (!can("manageUsers")) return <AccessDenied />;
  const { data, isLoading, refetch } = useGetApiUserGetUserList();
  const users = useMemo(() => parseApiList(data?.data), [data]);

  return (
    <SafeAreaView className="flex-1 bg-[#FDFDFD]" edges={["left", "right"]}>
      <StatusBar style="light" />
      <ScreenHeader title="Users" subtitle="System accounts" onBack={() => router.back()} />

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <PremiumLoader color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item, i) => String((item as { userID?: number }).userID ?? i)}
          contentContainerStyle={{ padding: 16 }}
          onRefresh={refetch}
          refreshing={isLoading}
          renderItem={({ item }: { item: Record<string, unknown> }) => (
            <MobileDataCard
              title={String(item.userName ?? item.fullName ?? "User")}
              subtitle={String(item.email ?? "")}
              fields={[
                { label: "Mobile", value: String(item.mobileNo ?? "—") },
                { label: "Role", value: String(item.roleID ?? "—") },
              ]}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
