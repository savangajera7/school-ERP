import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { router, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Colors } from "@/constants/colors";

interface TabItem {
  label: string;
  icon: string;
  route: string;
  isCenter?: boolean;
}

const TABS: TabItem[] = [
  { label: "Menu", icon: "☰", route: "/(app)/menu" },
  { label: "Search", icon: "🔍", route: "/(app)/search" },
  { label: "Home", icon: "🏠", route: "/(app)/dashboard", isCenter: true },
  { label: "Timetable", icon: "📅", route: "/(app)/timetable" },
  { label: "Profile", icon: "👤", route: "/(app)/profile" },
];

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
  const bottomPad = Math.max(insets.bottom, Platform.OS === "ios" ? 8 : 6);

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
        {TABS.map((tab) => {
          const isActive = isTabActive(pathname, tab.route);

          if (tab.isCenter) {
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
                    ...(Platform.OS === "web"
                      ? { boxShadow: "0px 8px 24px rgba(13,54,102,0.35)" }
                      : {
                          shadowColor: Colors.primary,
                          shadowOffset: { width: 0, height: 6 },
                          shadowOpacity: 0.35,
                          shadowRadius: 10,
                          elevation: 8,
                        }),
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{tab.icon}</Text>
                </LinearGradient>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "900",
                    color: isActive ? Colors.primary : "#9CA3AF",
                    marginTop: 6,
                    letterSpacing: 0.2,
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
                <Text style={{ fontSize: isActive ? 20 : 18, opacity: isActive ? 1 : 0.65 }}>
                  {tab.icon}
                </Text>
              </View>
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: isActive ? "900" : "600",
                  color: isActive ? Colors.primary : "#9CA3AF",
                  marginTop: 2,
                  letterSpacing: 0.2,
                }}
              >
                {tab.label}
              </Text>
              {isActive && (
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: Colors.accent,
                    marginTop: 3,
                  }}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
