import React, { useState } from "react";
import {
  View, Text, TouchableOpacity,
  TextInput, RefreshControl
} from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useResponsive } from "@/hooks/useResponsive";
import { useGetApiUserGetUserList } from "@/api/generated/user/user";
import { useGetApiRoleGetRoleList } from "@/api/generated/role/role";
import { useGetApiAcademicYearGet } from "@/api/generated/2-master-academicyear/2-master-academicyear";
import { parseApiList } from "@/utils/apiResponse";
import type { AppRoute } from "@/constants/rolePermissions";
import type { AppIconName } from "@/constants/appIcons";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { useTranslation } from "@/hooks/useTranslation";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { OVERLAP_MARGIN, premiumCardShadow } from "@/constants/premiumStyles";

const QUICK_ACTIONS: {
  title: string;
  icon: AppIconName;
  route: AppRoute;
}[] = [
  { title: "User Management", icon: "users", route: "/(super-admin)/users" as any },
  { title: "Role Definitions", icon: "roles", route: "/(super-admin)/roles" as any },
  { title: "Platform Settings", icon: "settings", route: "/(super-admin)/settings" as any },
];

export default function SuperAdminDashboard() {
  const { userData } = useAuthStore();
  const { isMobile } = useResponsive();
  const [searchQuery, setSearchQuery] = useState("");

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
  const academicYearCount = parseApiList(academicData?.data).length;

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
      headerSlot={
        /* Search */
        <View className="mb-6 bg-white/10 border border-white/20 rounded-2xl h-[46px] px-4 flex-row items-center gap-2" 
              style={{ backgroundColor: "rgba(0,0,0,0.03)", borderColor: "rgba(0,0,0,0.05)" }}>
          <AppIcon name="search" size={18} color="rgba(0,0,0,0.4)" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search platform..."
            placeholderTextColor="rgba(0,0,0,0.3)"
            className="flex-1 text-gray-800 text-[13px] font-semibold h-full"
            style={{ outlineWidth: 0 } as any}
          />
        </View>
      }
    >
      {/* Stats Grid */}
      <View className="flex-row flex-wrap gap-3 mb-6">
        <StatCard
          isMobile={isMobile}
          icon="users"
          label="Total Users"
          value={isLoading ? "..." : userCount.toString()}
          sub="Platform accounts"
          bg="#E0F2FE"
          textColor="#0369A1"
          onPress={() => router.push("/(super-admin)/users")}
        />
        <StatCard
          isMobile={isMobile}
          icon="roles"
          label="Total Roles"
          value={isLoading ? "..." : roleCount.toString()}
          sub="Permission groups"
          bg="#F3E8FF"
          textColor="#7E22CE"
          onPress={() => router.push("/(super-admin)/roles")}
        />
        <StatCard
          isMobile={isMobile}
          icon="settings"
          label="System Config"
          value="Active"
          sub="Global parameters"
          bg="#FEF3C7"
          textColor="#B45309"
          onPress={() => router.push("/(super-admin)/settings")}
        />
        <StatCard
          isMobile={isMobile}
          icon="check"
          label="System Health"
          value="99.9%"
          sub="All services active"
          bg="#DCFCE7"
          textColor="#15803D"
        />
      </View>

      {/* Quick Actions */}
      <SectionCard title="Platform Actions" icon="flash">
        <View className="flex-row flex-wrap">
          {QUICK_ACTIONS.map((action, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.75}
              style={{ width: isMobile ? "25%" : "20%" }}
              className="items-center mb-6"
            >
              <View className="mb-2">
                <IconCircle name={action.icon} size={52} iconSize={24} />
              </View>
              <Text
                className="text-gray-700 font-bold text-[10px] text-center"
                style={{ lineHeight: 13 }}
                numberOfLines={2}
              >
                {action.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SectionCard>

      {/* Recent System Activity */}
      <SectionCard title="System Activity" icon="clock">
        {[1, 2, 3].map((_, i) => (
          <View 
            key={i} 
            className={`flex-row items-center justify-between py-3 ${
              i !== 2 ? 'border-b border-gray-50' : ''
            }`}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <Text className="text-xs font-bold text-gray-700">
                {i === 0 ? "New school admin account created" : 
                 i === 1 ? "Academic year 2026-27 initialized" : 
                 "System configuration updated"}
              </Text>
            </View>
            <Text className="text-[9px] font-black text-gray-400 uppercase">
              {i === 0 ? "2h ago" : i === 1 ? "5h ago" : "1d ago"}
            </Text>
          </View>
        ))}
      </SectionCard>
    </PremiumScreenLayout>
  );
}

function StatCard({
  isMobile, icon, label, value, sub, bg, textColor, onPress,
}: {
  isMobile: boolean; icon: AppIconName; label: string; value: string;
  sub: string; bg: string; textColor: string; onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      className="bg-white border border-gray-100 rounded-2xl p-4"
      style={{
        width: isMobile ? "47.5%" : "23.5%",
        ...premiumCardShadow,
      }}
    >
      <View className="flex-row justify-between items-start mb-3">
        <IconCircle name={icon} size={44} backgroundColor={bg} color={textColor} />
      </View>
      <Text className="text-gray-400 text-[10px] font-black uppercase tracking-wider mb-0.5">
        {label}
      </Text>
      <Text className="text-2xl font-black" style={{ color: textColor }}>
        {value}
      </Text>
      <Text className="text-[11px] font-semibold text-gray-400 mt-1" numberOfLines={1}>
        {sub}
      </Text>
    </TouchableOpacity>
  );
}

function SectionCard({
  title, icon, children,
}: {
  title: string; icon: AppIconName; children: React.ReactNode;
}) {
  return (
    <View
      className="bg-white border border-gray-100 rounded-2xl mb-4 overflow-hidden"
      style={{
        ...premiumCardShadow,
      }}
    >
      <View className="flex-row items-center gap-2 px-5 pt-5 pb-4 border-b border-gray-50">
        <AppIcon name={icon} size={20} color="#134A8C" active />
        <Text className="text-gray-900 font-black text-[14px] uppercase tracking-wide flex-1">
          {title}
        </Text>
        <View className="w-1 h-4 bg-[#F5921E] rounded-full" />
      </View>
      <View className="p-5">{children}</View>
    </View>
  );
}
