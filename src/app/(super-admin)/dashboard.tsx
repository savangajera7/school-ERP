import React, { useState } from "react";
import { View, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { useGetApiUserGetUserList } from "@/api/generated/user/user";
import { useGetApiRoleGetRoleList } from "@/api/generated/role/role";
import { useGetApiAcademicYearGet } from "@/api/generated/2-master-academicyear/2-master-academicyear";
import { parseApiList } from "@/utils/apiResponse";
import type { AppRoute } from "@/constants/rolePermissions";
import { useTranslation } from "@/hooks/useTranslation";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import {
  StatCard,
  SectionCard,
  QuickActionsGrid,
  RecentActivityList,
  DashboardSearchBar,
} from "@/components/shared";
import { QUICK_ACTIONS, RECENT_ACTIVITY, getStats } from "./_dashboardConfig";

export default function SuperAdminDashboard() {
  const { isMobile } = useResponsive();

  const { data: usersData, isLoading: loadingUsers, refetch: refetchUsers } = useGetApiUserGetUserList();
  const { data: rolesData, isLoading: loadingRoles, refetch: refetchRoles } = useGetApiRoleGetRoleList();
  const { data: academicData, isLoading: loadingAcademic, refetch: refetchAcademic } = useGetApiAcademicYearGet();

  const isLoading = loadingUsers || loadingRoles || loadingAcademic;

  const onRefresh = () => {
    refetchUsers();
    refetchRoles();
    refetchAcademic();
  };

  const userCount = parseApiList(usersData?.data).length;
  const roleCount = parseApiList(rolesData?.data).length;

  const { t } = useTranslation();

  return (
    <PremiumScreenLayout
      title=""
      subtitle=""
      showTopBar
      hideBack
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
      }
    >
      {/* Stats Grid */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        {getStats(isLoading, userCount, roleCount).map((stat, i) => (
          <StatCard
            key={i}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            subtitle={stat.subtitle}
            backgroundColor={stat.backgroundColor}
            textColor={stat.textColor}
            onPress={stat.route ? () => router.push(stat.route as any) : undefined}
          />
        ))}
      </View>

      {/* Quick Actions */}
      <SectionCard title="Platform Actions" icon="flash">
        <QuickActionsGrid actions={QUICK_ACTIONS} desktopWidth="20%" />
      </SectionCard>

      {/* Recent System Activity */}
      <SectionCard title="System Activity" icon="clock">
        <RecentActivityList items={RECENT_ACTIVITY} dotColor="#10B981" />
      </SectionCard>
    </PremiumScreenLayout>
  );
}
