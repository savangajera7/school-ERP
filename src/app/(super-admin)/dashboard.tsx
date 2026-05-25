import React from "react";
import { View, Text, ScrollView } from "react-native";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumCard } from "@/components/ui/premium";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { AppIcon } from "@/components/icons/AppIcon";

export default function SuperAdminDashboard() {
  const { isMobile } = useResponsive();

  const stats = [
    { label: "Total Schools", value: "24", icon: "school", color: "#6366F1" },
    { label: "Active Users", value: "1.2k", icon: "people", color: "#10B981" },
    { label: "Platform Revenue", value: "₹4.2M", icon: "money", color: "#F59E0B" },
    { label: "System Health", value: "99.9%", icon: "success", color: "#3B82F6" },
  ];

  return (
    <PremiumScreenLayout
      title="Platform Overview"
      subtitle="Super Admin Control Center"
      withTabBar
    >
      <View className={`flex-row flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}>
        {stats.map((stat, i) => (
          <PremiumCard 
            key={i} 
            style={{ flex: 1, minWidth: isMobile ? '100%' : 200, padding: 20 }}
          >
            <View className="flex-row items-center gap-4">
              <View 
                style={{ backgroundColor: `${stat.color}15`, padding: 12, borderRadius: 16 }}
              >
                <AppIcon name={stat.icon as any} size={24} color={stat.color} active />
              </View>
              <View>
                <Text className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                  {stat.label}
                </Text>
                <Text className="text-2xl font-black text-gray-900 mt-0.5">
                  {stat.value}
                </Text>
              </View>
            </View>
          </PremiumCard>
        ))}
      </View>

      <Text className="text-sm font-black text-gray-900 uppercase tracking-widest mt-8 mb-4">
        Recent System Logs
      </Text>
      <PremiumCard noAccent style={{ padding: 0, overflow: 'hidden' }}>
        {[1, 2, 3, 4, 5].map((_, i) => (
          <View 
            key={i} 
            className={`flex-row items-center justify-between p-4 border-b border-gray-50 ${
              i % 2 === 1 ? 'bg-gray-50/30' : 'bg-white'
            }`}
          >
            <View className="flex-row items-center gap-3">
              <View className="w-2 h-2 rounded-full bg-emerald-500" />
              <Text className="text-xs font-bold text-gray-700">
                New school registration: "Little Angel's Primary"
              </Text>
            </View>
            <Text className="text-[10px] font-black text-gray-400 uppercase">
              2h ago
            </Text>
          </View>
        ))}
      </PremiumCard>
    </PremiumScreenLayout>
  );
}
