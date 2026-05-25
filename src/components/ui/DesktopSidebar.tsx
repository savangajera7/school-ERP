import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Platform } from "react-native";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/colors";
import { AppIcon } from "@/components/icons/AppIcon";
import { useAuthStore } from "@/store/authStore";
import { usePermissions } from "@/hooks/usePermissions";
import { useNotifications } from "@/contexts/NotificationContext";
import { ROLE_LABELS } from "@/constants/rolePermissions";

export function DesktopSidebar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { userData, role, roleLabel, navItems } = usePermissions();
  const logout = useAuthStore((s) => s.logout);
  const { unreadCount } = useNotifications();
  const firstName = userData?.name?.split(" ")[0] || "User";

  const visibleNav = navItems.map((item) =>
    item.route === "/(app)/notifications"
      ? { ...item, badge: unreadCount }
      : item
  );

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return localStorage.getItem("sidebar_collapsed") === "true";
    }
    return false;
  });

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      localStorage.setItem("sidebar_collapsed", String(next));
    }
  };

  const sidebarWidth = isCollapsed ? 76 : 240;

  return (
    <View
      className="bg-white border-r border-gray-150 relative transition-all duration-300"
      style={{
        width: sidebarWidth,
        paddingTop: (insets.top || 0) + 16,
        paddingBottom: 16,
      }}
    >
      {/* Integrated Header Toggle controls (No floating overlaps!) */}
      {isCollapsed ? (
        <View className="pb-5 mb-2 border-b border-gray-100 px-2 items-center gap-3">
          <TouchableOpacity
            onPress={toggleCollapse}
            className="w-9 h-9 bg-gray-50 border border-gray-200 rounded-xl items-center justify-center shadow-sm"
            activeOpacity={0.8}
            style={{
              boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <AppIcon name="expand" size={14} color="#6B7280" />
          </TouchableOpacity>
          
          <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 overflow-hidden items-center justify-center p-0.5 shadow-sm">
            <Image
              source={{ uri: "https://little-angle.mahispark.com/images/logo.png" }}
              className="w-8 h-8"
              resizeMode="contain"
            />
          </View>
        </View>
      ) : (
        <View className="flex-row items-center justify-between pb-5 mb-2 border-b border-gray-100 px-5">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 overflow-hidden items-center justify-center p-0.5 shadow-sm">
              <Image
                source={{ uri: "https://little-angle.mahispark.com/images/logo.png" }}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </View>
            <View className="flex-1">
              <Text className="text-[13px] font-black text-gray-900 tracking-wide" style={{ fontFamily: "Outfit" }}>
                Little Angel's
              </Text>
              <Text className="text-[9px] font-black text-[#F5921E] uppercase tracking-widest">
                સાંઈ વિદ્યા મંદિર
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            onPress={toggleCollapse}
            className="w-8 h-8 bg-gray-50 border border-gray-180 rounded-xl items-center justify-center shadow-sm ml-2"
            activeOpacity={0.8}
            style={{
              boxShadow: "0px 1px 3px rgba(0,0,0,0.05)",
            }}
          >
            <AppIcon name="collapse" size={14} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* Navigation Links */}
      <ScrollView
        className={`flex-1 ${isCollapsed ? "px-1.5" : "px-3"}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: isCollapsed ? 6 : 3, paddingBottom: 20 }}
      >
        {visibleNav.map((item) => {
          const isActive =
            pathname === item.route ||
            (item.route === "/(app)/dashboard" && pathname === "/");

          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
              className={`flex-row items-center rounded-xl py-2.5 relative ${
                isCollapsed ? "justify-center px-1" : "px-3 gap-3"
              } ${isActive ? "bg-[#134A8C]/10" : ""}`}
              style={{ minHeight: 44 }}
            >
              <AppIcon
                name={item.icon}
                size={isActive ? 20 : 18}
                color={isActive ? "#134A8C" : "#6B7280"}
                active={isActive}
              />
              {!isCollapsed && (
                <Text
                  className={`text-[13px] font-bold flex-1 ${
                    isActive ? "text-[#134A8C] font-black" : "text-gray-500"
                  }`}
                >
                  {item.label}
                </Text>
              )}
              {!isCollapsed && item.badge ? (
                <View className="bg-rose-500 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1">
                  <Text className="text-white text-[9px] font-black">
                    {item.badge > 9 ? "9+" : item.badge}
                  </Text>
                </View>
              ) : null}
              {isActive && !isCollapsed && (
                <View className="w-1.5 h-5 bg-[#F5921E] rounded-full" />
              )}
              {isActive && isCollapsed && (
                <View className="absolute left-0 top-3 w-1 h-5 bg-[#F5921E] rounded-r-full" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* User Profile + Logout */}
      <View className={`pt-4 border-t border-gray-50 ${isCollapsed ? "px-2 items-center" : "px-4"}`}>
        <View className={`flex-row items-center mb-3 ${isCollapsed ? "justify-center" : "gap-3"}`}>
          <View className="w-9 h-9 rounded-xl bg-[#134A8C]/10 items-center justify-center">
            <Text className="text-sm font-black text-[#134A8C]">
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
          {!isCollapsed && (
            <View className="flex-1">
              <Text className="text-xs font-black text-gray-800">{firstName}</Text>
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                {roleLabel || (role ? ROLE_LABELS[role] : "")}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          onPress={logout}
          className={`flex-row items-center bg-rose-50 rounded-xl border border-rose-100 py-2 ${
            isCollapsed ? "justify-center px-2 w-9 h-9" : "px-3 gap-2"
          }`}
          activeOpacity={0.8}
        >
          <AppIcon name="logout" size={16} color="#E11D48" />
          {!isCollapsed && (
            <Text className="text-[11px] font-black text-rose-600 uppercase tracking-wide">
              Sign Out
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
