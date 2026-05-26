import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { useGetApiNotificationGetNotificationList, useDeleteApiNotificationDeleteNotification, usePostApiNotificationInsertNotification } from "@/api/generated/notification/notification";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumSearchField } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { useAuthStore } from "@/store/authStore";
import { Card } from "@/components/ui/Card";

export default function AdminNotificationsManagementScreen() {
  const { isMobile } = useResponsive();
  const { userData } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notificationType, setNotificationType] = useState("General");

  const { data, isLoading, isError, error, refetch } = useGetApiNotificationGetNotificationList();
  const deleteNotification = useDeleteApiNotificationDeleteNotification();
  const insertNotification = usePostApiNotificationInsertNotification();

  const notifications = useMemo(() => {
    return parseApiList<any>(data?.data);
  }, [data]);

  const filteredNotifications = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return notifications;
    return notifications.filter((n) => {
      const title = (n.title || "").toLowerCase();
      return (
        title.includes(q) ||
        (n.notificationType || "").toLowerCase().includes(q)
      );
    });
  }, [notifications, searchQuery]);

  const handleDelete = (notification: any) => {
    Alert.alert(
      "Delete Notification",
      `Are you sure you want to remove "${notification.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteNotification.mutateAsync({ 
                data: { notificationID: notification.notificationID } 
              });
              refetch();
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete notification");
            }
          }
        }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!title || !message) {
      Alert.alert("Missing Fields", "Please complete title and message.");
      return;
    }

    const payload = {
      title,
      message,
      notificationType,
      deviceType: "All",
      isSent: false,
      createdBy: parseInt(userData?.id || "0"),
      roleID: userData?.roleId || 2,
      userID: parseInt(userData?.id || "0"),
    };

    try {
      setLoading(true);
      await insertNotification.mutateAsync({ data: payload });
      Alert.alert("Success", "Notification queued successfully!");
      setLoading(false);
      // Reset form
      setTitle("");
      setMessage("");
      setNotificationType("General");
      setShowForm(false);
      refetch();
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message || "Failed to send notification");
    }
  };

  const renderNotificationItem = ({ item }: { item: any }) => {
    return (
      <MobileDataCard
        title={item.title || "Untitled Notification"}
        subtitle={item.notificationType || "General Notification"}
        accentColor={Colors.primary}
        icon={<IconCircle name="notifications" size={44} iconSize={22} />}
        fields={[
          { label: "Type", value: item.notificationType || "General" },
          { label: "Status", value: item.isSent ? "Sent" : "Queued", highlight: item.isSent ? "success" : "muted" },
          { label: "Screen", value: item.screenName || "Dashboard" },
        ]}
        actions={
          <View className="flex-row gap-2 ml-auto">
            <TouchableOpacity 
              onPress={() => handleDelete(item)}
              className="bg-red-50 p-2 rounded-lg"
            >
              <AppIcon name="delete" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        }
      />
    );
  };

  return (
    <PremiumScreenLayout
      title="Notifications"
      subtitle="Send push & in-app alerts"
      scrollable={false}
      flatHeader
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Toggle Form Button */}
        <TouchableOpacity
          onPress={() => setShowForm(!showForm)}
          className="bg-[#134A8C] rounded-xl p-4 mb-4 flex-row items-center justify-between"
        >
          <View className="flex-row items-center gap-3">
            <AppIcon name="broadcast" size={20} color="white" />
            <Text className="text-white font-bold text-sm">
              {showForm ? "Cancel" : "+ Send New Notification"}
            </Text>
          </View>
          <AppIcon name={showForm ? "chevronRight" : "chevronDown"} size={18} color="white" />
        </TouchableOpacity>

        {/* Notification Form */}
        {showForm && (
          <Card className="p-5 mb-4">
            <View className="flex-row items-center gap-3 mb-4 border-b border-gray-100 pb-3">
              <AppIcon name="notifications" size={20} color={Colors.primary} active />
              <Text className="text-[14px] font-black text-gray-900 uppercase tracking-wide">New Notification</Text>
            </View>

            <View className="gap-3">
              <View>
                <Text className="text-[10px] font-black text-gray-600 uppercase mb-1.5">Title *</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. School Closed Tomorrow"
                  className="h-[44px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                />
              </View>

              <View>
                <Text className="text-[10px] font-black text-gray-600 uppercase mb-1.5">Message *</Text>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Write the notification message..."
                  multiline
                  numberOfLines={4}
                  className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800"
                  style={{ minHeight: 100, textAlignVertical: "top" }}
                />
              </View>

              <View>
                <Text className="text-[10px] font-black text-gray-600 uppercase mb-1.5">Type</Text>
                <TextInput
                  value={notificationType}
                  onChangeText={setNotificationType}
                  placeholder="General"
                  className="h-[44px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className="h-[48px] rounded-xl items-center justify-center shadow-lg"
                style={{ backgroundColor: Colors.primary }}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-white font-black text-xs uppercase tracking-widest">
                    Send Notification
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Card>
        )}

        {/* Search */}
        <PremiumSearchField
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search notifications..."
          onClear={() => setSearchQuery("")}
        />

        {/* Notifications List */}
        {isLoading ? (
          <SkeletonLoader rows={5} />
        ) : isError ? (
          <ErrorState
            message={error instanceof Error ? error.message : "Could not load notifications"}
          />
        ) : (
          <FlatList
            data={filteredNotifications}
            renderItem={renderNotificationItem}
            keyExtractor={(item) => String(item.notificationID)}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <EmptyState
                icon="notifications"
                title="No notifications found"
                message={searchQuery ? "Try a different search" : "No notifications sent yet"}
              />
            }
            onRefresh={refetch}
            refreshing={isLoading}
            scrollEnabled={false}
          />
        )}
      </ScrollView>
    </PremiumScreenLayout>
  );
}
