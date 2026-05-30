import React, { useState } from "react";
import { Text, TextInput } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumCard } from "@/components/ui/premium";
import { Button } from "@/components/ui/Button";
import { usePostApiNotificationInsertNotification } from "@/api/generated/15-notifications-parent-student-inbox-admin-send/15-notifications-parent-student-inbox-admin-send";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { useNotifications } from "@/contexts/NotificationContext";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "@/components/auth/AccessDenied";

export default function NotificationComposeScreen() {
  const { canSendBroadcast } = usePermissions();
  if (!canSendBroadcast) {
    return (
      <AccessDenied message="Only school administrators can send broadcast alerts." />
    );
  }

  const { showToast } = useToast();
  const { userData } = useAuthStore();
  const { refetch } = useNotifications();
  const insertMutation = usePostApiNotificationInsertNotification();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [notificationType, setNotificationType] = useState("General");

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      showToast("Title and message are required.", "error");
      return;
    }
    const createdBy = parseInt(userData?.id ?? "0", 10) || 0;
    try {
      await insertMutation.mutateAsync({
        data: {
          title,
          message,
          notificationType,
          deviceType: "All",
          isSent: false,
          createdBy,
          roleID: userData?.roleId || 2,
          userID: createdBy,
        },
      });
      showToast("Notification queued. Backend will deliver push to devices.", "success");
      refetch();
      router.back();
    } catch {
      showToast("Failed to send notification.", "error");
    }
  };

  return (
    <PremiumScreenLayout
      title="Send Notification"
      subtitle="Push + in-app alert"
      flatHeader
      keyboard
    >
      <PremiumCard noAccent style={{ padding: 20, gap: 12 }}>
        <Text className="text-sm font-semibold text-gray-600 dark:text-slate-400">Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 text-gray-800 dark:text-slate-200"
          placeholder="Notification title"
          placeholderTextColor="#9CA3AF"
        />
        <Text className="text-sm font-semibold text-gray-600 dark:text-slate-400 mt-2">Message</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 min-h-[100px] text-gray-800 dark:text-slate-200"
          placeholder="Message body"
          placeholderTextColor="#9CA3AF"
        />
        <Text className="text-sm font-semibold text-gray-600 dark:text-slate-400 mt-2">Type</Text>
        <TextInput
          value={notificationType}
          onChangeText={setNotificationType}
          className="border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl px-4 py-3 text-gray-800 dark:text-slate-200"
          placeholder="General"
          placeholderTextColor="#9CA3AF"
        />
        <Button label="Send notification" onPress={handleSend} loading={insertMutation.isPending} />
      </PremiumCard>
    </PremiumScreenLayout>
  );
}
