import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { router, usePathname } from "expo-router";

interface TabItem {
  label: string;
  icon: string;
  activeIcon: string;
  route: string;
}

const TABS: TabItem[] = [
  { label: "Home",       icon: "🏠", activeIcon: "🏠", route: "/(app)/dashboard"   },
  { label: "Students",   icon: "🎓", activeIcon: "🎓", route: "/(app)/students"    },
  { label: "Attendance", icon: "📝", activeIcon: "📝", route: "/(app)/attendance"  },
  { label: "Fees",       icon: "💰", activeIcon: "💰", route: "/(app)/fees"        },
  { label: "More",       icon: "⚙️", activeIcon: "⚙️", route: "/(app)/academic-setup" },
];

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
        paddingBottom: Platform.OS === "ios" ? 28 : 10,
        paddingTop: 10,
        paddingHorizontal: 8,
        boxShadow: "0px -4px 16px rgba(0,0,0,0.06)",
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
            style={{ flex: 1, alignItems: "center", gap: 4 }}
          >
            {/* Active indicator pill behind icon */}
            <View
              style={{
                width: 44,
                height: 36,
                borderRadius: 12,
                backgroundColor: isActive ? "#0d3666" + "12" : "transparent",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: isActive ? 20 : 18 }}>{tab.icon}</Text>
            </View>
            <Text
              style={{
                fontSize: 10,
                fontWeight: isActive ? "900" : "600",
                color: isActive ? "#0d3666" : "#9CA3AF",
                letterSpacing: 0.3,
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
