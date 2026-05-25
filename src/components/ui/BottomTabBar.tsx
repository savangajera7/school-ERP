import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";
import { usePermissions } from "@/hooks/usePermissions";
import { useNotifications } from "@/contexts/NotificationContext";
import { AppIcon } from "@/components/icons/AppIcon";

function isTabActive(pathname: string, route: string): boolean {
  const path = pathname.replace(/\/$/, "") || "/";
  const short = route.replace("/(app)", "");

  if (route === "/(app)/dashboard") {
    return path === route || path === short || path === "/" || path === "/dashboard";
  }

  return path === route || path === short || path.endsWith(short);
}

export function BottomTabBar() {
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const { mobileTabs, role } = usePermissions();
  const { unreadCount } = useNotifications();
  const bottomPad = Math.max(insets.bottom, Platform.OS === "ios" ? 8 : 6);

  const tabs = mobileTabs.map((tab) =>
    tab.route === "/(app)/notifications" && unreadCount > 0
      ? { ...tab, badge: unreadCount }
      : tab
  );

  const centerIndex = Math.floor(tabs.length / 2);

  if (!role || tabs.length === 0) return null;

  return (
    <View
      style={{
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#E8ECF1",
        paddingBottom: bottomPad,
        paddingTop: 10,
        paddingHorizontal: 6,
        ...(Platform.OS === "web"
          ? { boxShadow: "0px -8px 32px rgba(13,54,102,0.08)" }
          : {
              shadowColor: Colors.primary,
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 12,
            }),
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
        {tabs.map((tab, index) => {
          const isActive = isTabActive(pathname, tab.route);
          const isCenter = index === centerIndex && tabs.length >= 3;

          if (isCenter) {
            return (
              <TouchableOpacity
                key={tab.route}
                onPress={() => router.push(tab.route as never)}
                activeOpacity={0.85}
                style={{ flex: 1, alignItems: "center", marginTop: -22 }}
              >
                <LinearGradient
                  colors={[Colors.primary, Colors.primaryLight]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 28,
                    alignItems: "center",
                    justifyContent: "center",
                    borderWidth: 4,
                    borderColor: "#ffffff",
                  }}
                >
                  <AppIcon name={tab.icon} size={26} color="#fff" active />
                </LinearGradient>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "900",
                    color: isActive ? Colors.primary : "#9CA3AF",
                    marginTop: 6,
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          }

          return (
            <TouchableOpacity
              key={tab.route}
              onPress={() => router.push(tab.route as never)}
              activeOpacity={0.75}
              style={{ flex: 1, alignItems: "center", paddingBottom: 2 }}
            >
              <View
                style={{
                  width: 42,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: isActive ? `${Colors.primary}18` : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AppIcon
                  name={tab.icon}
                  size={22}
                  color={isActive ? Colors.primary : "#9CA3AF"}
                  active={isActive}
                />
                {"badge" in tab && typeof tab.badge === "number" && tab.badge > 0 ? (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      right: 4,
                      minWidth: 16,
                      height: 16,
                      borderRadius: 8,
                      backgroundColor: Colors.error,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800" }}>
                      {tab.badge > 9 ? "9+" : tab.badge}
                    </Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: isActive ? "900" : "600",
                  color: isActive ? Colors.primary : "#9CA3AF",
                  marginTop: 2,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
