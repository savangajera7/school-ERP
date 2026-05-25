import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Colors } from "@/constants/colors";
import { MOBILE_TAB_BAR_HEIGHT } from "@/constants/mobileTabs";
import { usePermissions } from "@/hooks/usePermissions";
import { useNotifications } from "@/contexts/NotificationContext";
import { ROLE_LABELS } from "@/constants/rolePermissions";
import { IconCircle } from "@/components/icons/AppIcon";

export default function MenuScreen() {
  const { isMobile } = useBreakpoint();
  const { role, roleLabel, navItems } = usePermissions();
  const { unreadCount } = useNotifications();

  const items = navItems.map((item) =>
    item.route === "/(app)/notifications"
      ? { ...item, badge: unreadCount }
      : item
  );

  return (
    <SafeAreaView className="flex-1 bg-[#F4F6FA]" edges={["left", "right"]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={["#134A8C", "#0D3666"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: 40,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <Text className="text-white/60 text-xs font-black uppercase tracking-widest">
            {role ? ROLE_LABELS[role] : "Portal"}
          </Text>
          <Text className="text-white text-2xl font-black mt-1">School Portal Menu</Text>
          <Text className="text-[#F5921E] text-xs font-bold uppercase tracking-wider mt-1">
            {roleLabel} · Little Angel&apos;s ERP
          </Text>
        </LinearGradient>

        <View
          className="px-4 w-full self-center max-w-[800px]"
          style={{ marginTop: -20, paddingBottom: isMobile ? MOBILE_TAB_BAR_HEIGHT + 40 : 40 }}
        >
          <View className="flex-row flex-wrap gap-3.5 justify-between">
            {items.map((item) => (
              <TouchableOpacity
                key={item.route}
                onPress={() => router.push(item.route as never)}
                activeOpacity={0.85}
                className="bg-white rounded-2xl border border-gray-100 p-4"
                style={{
                  width: isMobile ? "47%" : "30%",
                  minHeight: 120,
                  ...(Platform.OS === "web"
                    ? { boxShadow: "0px 4px 16px rgba(0,0,0,0.06)" }
                    : {
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.06,
                        shadowRadius: 8,
                        elevation: 3,
                      }),
                }}
              >
                <View className="mb-2">
                  <IconCircle name={item.icon} size={40} iconSize={20} />
                </View>
                <Text className="text-sm font-black text-gray-900">{item.label}</Text>
                {item.desc ? (
                  <Text className="text-[11px] text-gray-500 mt-1 leading-4">{item.desc}</Text>
                ) : null}
                {"badge" in item && typeof item.badge === "number" && item.badge > 0 ? (
                  <View className="absolute top-3 right-3 bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
                    <Text className="text-white text-[10px] font-black">{item.badge}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
