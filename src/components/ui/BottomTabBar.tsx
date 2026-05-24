import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { router, usePathname } from "expo-router";
import { Colors } from "@/constants/colors";

interface TabItem {
  label: string;
  icon: string;
  activeIcon: string;
  route: string;
}

const TABS: TabItem[] = [
  { label: "Menu",      icon: "☰", activeIcon: "☰", route: "/(app)/menu"         },
  { label: "Search",    icon: "🔍", activeIcon: "🔍", route: "/(app)/search"       },
  { label: "Home",      icon: "🏠", activeIcon: "🏠", route: "/(app)/dashboard"    },
  { label: "Timetable", icon: "🗓️", activeIcon: "🗓️", route: "/(app)/timetable"    },
  { label: "Profile",   icon: "👤", activeIcon: "👤", route: "/(app)/profile"      },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#F1F3F5",
        paddingBottom: Platform.OS === "ios" ? 28 : 10,
        paddingTop: 8,
        paddingHorizontal: 8,
        boxShadow: "0px -4px 20px rgba(0,0,0,0.06)",
      }}
    >
      {TABS.map((tab) => {
        const isActive =
          pathname === tab.route ||
          (tab.route === "/(app)/dashboard" && pathname === "/");

        return (
          <TouchableOpacity
            key={tab.route}
            onPress={() => router.push(tab.route as any)}
            activeOpacity={0.8}
            style={{ flex: 1, alignItems: "center", gap: 3 }}
          >
            {/* Active indicator pill */}
            <View
              style={{
                width: 44,
                height: 34,
                borderRadius: 12,
                backgroundColor: isActive ? Colors.primary + "14" : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: isActive ? 19 : 17 }}>{tab.icon}</Text>
            </View>
            <Text
              style={{
                fontSize: 10,
                fontWeight: isActive ? "900" : "600",
                color: isActive ? Colors.primary : "#9CA3AF",
                letterSpacing: 0.3,
              }}
            >
              {tab.label}
            </Text>
            {/* Active dot indicator */}
            {isActive && (
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: Colors.accent,
                  marginTop: -1,
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
