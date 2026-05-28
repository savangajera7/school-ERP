import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { fetchMyNotifications, fetchUnreadCount, markNotificationRead } from "@/services/notifications/notificationApi";
import { useAuthStore } from "@/store/authStore";

export interface AppNotification {
  notificationID?: number;
  title?: string | null;
  message?: string | null;
  screenName?: string | null;
  jsonData?: string | null;
  notificationType?: string | null;
  isSent?: boolean;
  isRead?: boolean;
  userID?: number;
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  refetch: () => void;
  openNotification: (n: AppNotification) => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const MY_NOTIFICATIONS_KEY = ["notifications", "my"] as const;
const UNREAD_COUNT_KEY = ["notifications", "unreadCount"] as const;

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const queryClient = useQueryClient();

  // Full notification list (for the inbox screen)
  const { data, isLoading, refetch } = useQuery({
    queryKey: MY_NOTIFICATIONS_KEY,
    queryFn: fetchMyNotifications,
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 60_000 : false,
    refetchOnWindowFocus: true,
  });

  // Separate lightweight query for unread badge count
  // This uses the dedicated backend endpoint that only returns a number,
  // so the badge reflects the true server-side unread state.
  const { data: serverUnreadCount } = useQuery({
    queryKey: UNREAD_COUNT_KEY,
    queryFn: fetchUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: isAuthenticated ? 30_000 : false,
    refetchOnWindowFocus: true,
  });

  const notifications = useMemo(() => data ?? [], [data]);

  // Use the server-side count as the source of truth for the badge.
  // Fall back to computing from the list if the endpoint hasn't responded yet.
  const unreadCount = useMemo(() => {
    if (typeof serverUnreadCount === "number") return serverUnreadCount;
    return notifications.filter((n) => !n.isRead).length;
  }, [serverUnreadCount, notifications]);

  const openNotification = useCallback(
    async (n: AppNotification) => {
      if (n.notificationID) {
        try {
          await markNotificationRead(n.notificationID);
          // Invalidate both the list and the count so badge updates immediately
          queryClient.invalidateQueries({ queryKey: MY_NOTIFICATIONS_KEY });
          queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
        } catch {
          // still navigate if mark-read fails offline
        }
      }

      if (n.screenName) {
        try {
          const params = n.jsonData ? JSON.parse(n.jsonData) : {};
          router.push({ pathname: n.screenName as never, params });
        } catch {
          router.push(n.screenName as never);
        }
      }
    },
    [queryClient]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      isLoading,
      refetch: () => {
        refetch();
        queryClient.invalidateQueries({ queryKey: MY_NOTIFICATIONS_KEY });
        queryClient.invalidateQueries({ queryKey: UNREAD_COUNT_KEY });
      },
      openNotification,
    }),
    [notifications, unreadCount, isLoading, refetch, queryClient, openNotification]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}
