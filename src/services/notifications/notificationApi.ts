import axiosInstance from "@/services/api/axiosInstance";
import { parseApiList } from "@/utils/apiResponse";
import type { AppNotification } from "@/contexts/NotificationContext";

interface ApiEnvelope {
  success?: boolean;
  data?: unknown;
}

export async function fetchMyNotifications(): Promise<AppNotification[]> {
  const response = await axiosInstance.get<ApiEnvelope>("/api/Notification/GetMyNotificationList");
  return parseApiList<AppNotification>(response.data);
}

export async function fetchUnreadCount(): Promise<number> {
  try {
    const response = await axiosInstance.get<ApiEnvelope>("/api/Notification/GetUnreadCount");
    const body = response.data as any;
    // Response shape: { success, data: { unreadCount: N } }
    const data = body?.data ?? body;
    return data?.unreadCount ?? data?.data?.unreadCount ?? 0;
  } catch {
    return 0;
  }
}

export async function markNotificationRead(notificationId: number): Promise<void> {
  await axiosInstance.post("/api/Notification/MarkNotificationRead", {
    notificationID: notificationId,
  });
}
