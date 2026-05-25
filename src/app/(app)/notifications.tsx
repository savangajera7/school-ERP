import React from "react";
import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { router } from "expo-router";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useNotifications } from "@/contexts/NotificationContext";
import { Colors } from "@/constants/colors";
import { isAdminRole } from "@/hooks/useRoleAccess";
import { useAuthStore } from "@/store/authStore";

export default function NotificationsScreen() {
  const { role } = useAuthStore();
  const { notifications, isLoading, openNotification, refetch } = useNotifications();

  return (
    <PremiumScreenLayout
      title="Notifications"
      subtitle="Alerts and reminders"
      onBack={() => router.back()}
      scrollable={false}
      bodyStyle={{ flex: 1, paddingHorizontal: 0, marginTop: -16 }}
      rightAction={
        isAdminRole(role) ? (
          <TouchableOpacity
            onPress={() => router.push("/(app)/notification-compose")}
            className="bg-white/20 px-3 py-1.5 rounded-lg"
          >
            <Text className="text-white font-bold text-xs">Send</Text>
          </TouchableOpacity>
        ) : undefined
      }
    >
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <PremiumLoader color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, i) => String(item.notificationID ?? i)}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          onRefresh={refetch}
          refreshing={isLoading}
          ListEmptyComponent={
            <View className="p-8 items-center">
              <Text className="text-gray-500 text-center">No notifications yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => openNotification(item)} className="mb-3">
              <MobileDataCard
                title={item.title || "Notification"}
                subtitle={item.message || ""}
                accentColor={item.isSent ? Colors.primary : "#F59E0B"}
                badge={
                  <View
                    className={`px-2 py-0.5 rounded-lg ${item.isRead ? "bg-gray-100" : "bg-amber-50"}`}
                  >
                    <Text
                      className={`text-[10px] font-bold ${item.isRead ? "text-gray-500" : "text-amber-700"}`}
                    >
                      {item.isRead ? "Read" : "New"}
                    </Text>
                  </View>
                }
                fields={[
                  { label: "Type", value: item.notificationType || "General" },
                  { label: "Screen", value: item.screenName || "—" },
                ]}
              />
            </TouchableOpacity>
          )}
        />
      )}
    </PremiumScreenLayout>
  );
}
