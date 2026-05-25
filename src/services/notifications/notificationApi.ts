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

export async function markNotificationRead(notificationId: number): Promise<void> {
  await axiosInstance.post("/api/Notification/MarkNotificationRead", {
    notificationID: notificationId,
  });
}
