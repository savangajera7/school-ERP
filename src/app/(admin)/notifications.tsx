import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput, ScrollView, ActivityIndicator } from "react-native";
import { useDialog } from "@/components/ui/AppDialog";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { useGetApiNotificationGetNotificationList, useDeleteApiNotificationDeleteNotification, usePostApiNotificationInsertNotification } from "@/api/generated/15-notifications-parent-student-inbox-admin-send/15-notifications-parent-student-inbox-admin-send";
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
  const { userData, role } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { confirm, alert } = useDialog();

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

  const isSuperAdmin = role === "super_admin";

  const filteredNotifications = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let base = notifications;
    if (isSuperAdmin) {
      base = base.filter((n) => n.notificationType === "App Update" || n.notificationType === "System");
    } else {
      base = base.filter((n) => n.notificationType !== "App Update" && n.notificationType !== "System");
    }

    if (!q) return base;
    return base.filter((n) => {
      const title = (n.title || "").toLowerCase();
      return (
        title.includes(q) ||
        (n.notificationType || "").toLowerCase().includes(q)
      );
    });
  }, [notifications, searchQuery, isSuperAdmin]);

  const handleDelete = async (notification: any) => {
    const ok = await confirm(
      "Delete Notification",
      `Are you sure you want to remove "${notification.title}"?`,
      { confirmLabel: "Delete", destructive: true }
    );
    if (!ok) return;
    try {
      await deleteNotification.mutateAsync({ data: { notificationID: notification.notificationID } });
      refetch();
    } catch (err: any) {
      await alert("Error", err.message || "Failed to delete notification", "error");
    }
  };

  const handleSubmit = async () => {
    if (!title || !message) {
      await alert("Missing Fields", "Please complete title and message.", "warning");
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
      await alert("Success", "Notification queued successfully!", "success");
      setLoading(false);
      setTitle("");
      setMessage("");
      setNotificationType("General");
      setShowForm(false);
      refetch();
    } catch (error: any) {
      setLoading(false);
      await alert("Error", error.message || "Failed to send notification", "error");
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
              className="bg-red-50 dark:bg-red-950/30 p-2 rounded-lg"
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
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
            <View className="flex-row items-center gap-3 mb-4 border-b border-gray-100 dark:border-slate-700 pb-3">
              <AppIcon name="notifications" size={20} color={Colors.primary} active />
              <Text className="text-[14px] font-black text-gray-900 dark:text-slate-100 uppercase tracking-wide">New Notification</Text>
            </View>

            <View className="gap-3">
              <View>
                <Text className="text-[10px] font-black text-gray-600 dark:text-slate-400 uppercase mb-1.5">Title *</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g. School Closed Tomorrow"
                  placeholderTextColor="#9CA3AF"
                  className="h-[44px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 text-sm font-semibold text-gray-800 dark:text-slate-200"
                />
              </View>

              <View>
                <Text className="text-[10px] font-black text-gray-600 dark:text-slate-400 uppercase mb-1.5">Message *</Text>
                <TextInput
                  value={message}
                  onChangeText={setMessage}
                  placeholder="Write the notification message..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold text-gray-800 dark:text-slate-200"
                  style={{ minHeight: 100, textAlignVertical: "top" }}
                />
              </View>

              <View>
                <Text className="text-[10px] font-black text-gray-600 dark:text-slate-400 uppercase mb-1.5">Type *</Text>
                {isSuperAdmin ? (
                  <View className="flex-row gap-2">
                    {["App Update", "System"].map(type => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setNotificationType(type)}
                        className={`flex-1 items-center justify-center h-[44px] rounded-xl border ${notificationType === type ? 'border-primary bg-[#134A8C]/10 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800'}`}
                      >
                        <Text className={`text-xs font-bold ${notificationType === type ? 'text-primary' : 'text-gray-600 dark:text-slate-400'}`}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View className="flex-row gap-2">
                    {["General", "Event", "Alert"].map(type => (
                      <TouchableOpacity
                        key={type}
                        onPress={() => setNotificationType(type)}
                        className={`flex-1 items-center justify-center h-[44px] rounded-xl border ${notificationType === type ? 'border-primary bg-[#134A8C]/10 dark:bg-blue-900/20' : 'border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800'}`}
                      >
                        <Text className={`text-xs font-bold ${notificationType === type ? 'text-primary' : 'text-gray-600 dark:text-slate-400'}`}>{type}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
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
