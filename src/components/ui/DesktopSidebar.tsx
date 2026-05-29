import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView, Platform } from "react-native";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppIcon } from "@/components/icons/AppIcon";
import { useAuthStore } from "@/store/authStore";
import { usePermissions } from "@/hooks/usePermissions";
import { useNotifications } from "@/contexts/NotificationContext";
import { ROLE_LABELS } from "@/constants/rolePermissions";
import { formatDisplayName } from "@/utils/helpers";

// ─── Active state helper ──────────────────────────────────────────────────────
// Strips the route group prefix so /(admin)/teachers and /(app)/teachers both
// resolve to the same segment for comparison.
function routeSegment(route: string): string {
  return route.replace(/^\/\([^)]+\)\//, "");
}

function isRouteActive(pathname: string, route: string): boolean {
  if (pathname === route) return true;
  const seg = routeSegment(route);
  const pathSeg = routeSegment(pathname);
  return pathSeg === seg || pathSeg.startsWith(seg + "/");
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DesktopSidebar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { userData, role, roleLabel, navItems } = usePermissions();
  const logout = useAuthStore((s) => s.logout);
  const { unreadCount } = useNotifications();
  const firstName = userData?.name?.split(" ")[0] || "User";

  // Inject notification badge
  const visibleNav = navItems.map((item) =>
    item.route.endsWith("/notifications")
      ? { ...item, badge: unreadCount }
      : item
  );

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      return localStorage.getItem("sidebar_collapsed") === "true";
    }
    return false;
  });

  const toggleCollapse = () => {
    const next = !isCollapsed;
    setIsCollapsed(next);
    if (Platform.OS === "web" && typeof window !== "undefined") {
      localStorage.setItem("sidebar_collapsed", String(next));
    }
  };

  const sidebarWidth = isCollapsed ? 76 : 240;

  return (
    <View
      className="bg-white border-r border-gray-150"
      style={{
        width: sidebarWidth,
        paddingTop: (insets.top || 0) + 16,
        paddingBottom: 16,
      }}
    >
      {/* ── Brand / collapse header ── */}
      {isCollapsed ? (
        <View className="pb-5 mb-2 border-b border-gray-100 px-2 items-center gap-3">
          <TouchableOpacity
            onPress={toggleCollapse}
            className="w-9 h-9 bg-gray-50 border border-gray-200 rounded-xl items-center justify-center"
            activeOpacity={0.8}
          >
            <AppIcon name="expand" size={14} color="#6B7280" />
          </TouchableOpacity>
          <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 overflow-hidden items-center justify-center p-0.5">
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
            <View className="w-10 h-10 rounded-xl bg-white border border-gray-100 overflow-hidden items-center justify-center p-0.5">
              <Image
                source={{ uri: "https://little-angle.mahispark.com/images/logo.png" }}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </View>
            <View className="flex-1">
              <Text className="text-[13px] font-black text-gray-900 tracking-wide">
                Little Angel's
              </Text>
              <Text className="text-[9px] font-black text-[#F5921E] uppercase tracking-widest">
                સાંઈ વિદ્યા મંદિર
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={toggleCollapse}
            className="w-8 h-8 bg-gray-50 border border-gray-200 rounded-xl items-center justify-center ml-2"
            activeOpacity={0.8}
          >
            <AppIcon name="collapse" size={14} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Nav items ── */}
      <ScrollView
        className={`flex-1 ${isCollapsed ? "px-1.5" : "px-3"}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ gap: isCollapsed ? 6 : 3, paddingBottom: 20 }}
      >
        {visibleNav.map((item) => {
          const active = isRouteActive(pathname, item.route);
          return (
            <TouchableOpacity
              key={item.route}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.7}
              className={`flex-row items-center rounded-xl py-2.5 relative ${
                isCollapsed ? "justify-center px-1" : "px-3 gap-3"
              } ${active ? "bg-[#134A8C]/10" : ""}`}
              style={{ minHeight: 44 }}
            >
              <AppIcon
                name={item.icon}
                size={active ? 20 : 18}
                color={active ? "#134A8C" : "#6B7280"}
                active={active}
              />
              {!isCollapsed && (
                <Text
                  className={`text-[13px] flex-1 ${
                    active ? "font-black text-[#134A8C]" : "font-bold text-gray-500"
                  }`}
                >
                  {item.label}
                </Text>
              )}
              {/* Notification badge */}
              {!isCollapsed && !!item.badge && (
                <View className="bg-rose-500 min-w-[18px] h-[18px] rounded-full items-center justify-center px-1">
                  <Text className="text-white text-[9px] font-black">
                    {item.badge > 9 ? "9+" : item.badge}
                  </Text>
                </View>
              )}
              {/* Active indicator */}
              {active && !isCollapsed && (
                <View className="w-1.5 h-5 bg-[#F5921E] rounded-full" />
              )}
              {active && isCollapsed && (
                <View className="absolute left-0 top-3 w-1 h-5 bg-[#F5921E] rounded-r-full" />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── User + logout ── */}
      <View
        className={`pt-4 border-t border-gray-50 ${
          isCollapsed ? "px-2 items-center" : "px-4"
        }`}
      >
        <View
          className={`flex-row items-center mb-3 ${
            isCollapsed ? "justify-center" : "gap-3"
          }`}
        >
          <View className="w-9 h-9 rounded-xl bg-[#134A8C]/10 items-center justify-center">
            <Text className="text-sm font-black text-[#134A8C]">
              {firstName.charAt(0).toUpperCase()}
            </Text>
          </View>
          {!isCollapsed && (
            <View className="flex-1">
              <Text className="text-xs font-black text-gray-800" numberOfLines={1}>
                {formatDisplayName(userData?.name)}
              </Text>
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
