import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { postApiUserDeviceTokenInsertUserDeviceToken } from "@/api/generated/user-device-token/user-device-token";
import type { UserDeviceTokenInsertRequest } from "@/api/model";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function mapDeviceType(): string {
  if (Platform.OS === "ios") return "iOS";
  if (Platform.OS === "android") return "Android";
  return "Web";
}

export async function registerPushToken(): Promise<void> {
  const { isAuthenticated, userData, role } = useAuthStore.getState();
  if (!isAuthenticated || !userData) return;

  if (Platform.OS === "web") return;

  if (!Device.isDevice) return;

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;
  if (existing !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") return;

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  const tokenData = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );
  const token = tokenData.data;
  if (!token) return;

  const userId = parseInt(userData.id, 10) || 0;
  const roleMap: Record<string, number> = {
    superadmin: 1,
    admin: 2,
    teacher: 3,
    parent: 4,
    student: 5,
  };
  const roleID =
    userData.roleID ??
    roleMap[role ?? "parent"] ??
    4;

  const body: UserDeviceTokenInsertRequest = {
    userID: userId,
    roleID,
    deviceToken: token,
    deviceType: mapDeviceType(),
    deviceName: Device.modelName ?? Platform.OS,
    appVersion: Constants.expoConfig?.version ?? "1.0.0",
    isLogin: true,
    createdBy: userId,
  };

  try {
    await postApiUserDeviceTokenInsertUserDeviceToken(body);
  } catch (e) {
    console.warn("Failed to register device token:", e);
  }
}

export function setupNotificationListeners(): () => void {
  const received = Notifications.addNotificationReceivedListener(() => {});

  const response = Notifications.addNotificationResponseReceivedListener((res) => {
    const data = res.notification.request.content.data as {
      screenName?: string;
      jsonData?: string;
    };
    if (data?.screenName) {
      try {
        const params = data.jsonData ? JSON.parse(data.jsonData) : {};
        router.push({ pathname: data.screenName as never, params });
      } catch {
        router.push(data.screenName as never);
      }
    }
  });

  return () => {
    received.remove();
    response.remove();
  };
}
