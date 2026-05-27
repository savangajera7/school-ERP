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
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";

export default function NotificationsScreen() {
  const { role } = useAuthStore();
  const { notifications, isLoading, openNotification, refetch } = useNotifications();

  return (
    <PremiumScreenLayout
      title="Notifications"
      subtitle="In-app alerts & reminders"
      onBack={() => router.back()}
      scrollable={false}
      bodyStyle={{ flex: 1, paddingHorizontal: 0 }}
      flatHeader
      rightAction={
        isAdminRole(role) ? (
          <HeaderActionButton
            label="Send Alert"
            shortLabel="Send"
            onPress={() => router.push("/(app)/notification-compose")}
          />
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
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100, paddingTop: 10 }}
          onRefresh={refetch}
          refreshing={isLoading}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View className="py-20 items-center justify-center bg-white rounded-3xl border border-gray-150 p-8 mt-2">
              <EmptyState icon="bell" title="Inbox empty" message="You have no new notifications" />
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => openNotification(item)} 
              activeOpacity={0.7}
              className="mb-3"
            >
              <MobileDataCard
                title={item.title || "Notification"}
                subtitle={item.message || ""}
                accentColor={item.isRead ? "#94A3B8" : Colors.primary}
                icon={
                  <View className={`w-10 h-10 rounded-xl items-center justify-center ${item.isRead ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-100'} border`}>
                    <IconCircle 
                      name={item.notificationType === 'Alert' ? 'warning' : 'bell'} 
                      size={40} 
                      iconSize={20} 
                      color={item.isRead ? "#94A3B8" : Colors.primary}
                    />
                  </View>
                }
                badge={
                  !item.isRead && (
                    <View className="bg-amber-500 rounded-full w-2 h-2 absolute -right-1 -top-1 border border-white" />
                  )
                }
                fields={[
                  { label: "Category", value: item.notificationType || "General" },
                  { label: "Action", value: item.screenName ? "View Details" : "Dismiss", highlight: item.screenName ? "primary" : "muted" },
                ]}
              />
            </TouchableOpacity>
          )}
        />
      )}
    </PremiumScreenLayout>
  );
}
