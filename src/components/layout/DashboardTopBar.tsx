import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useNotifications } from "@/contexts/NotificationContext";
import { useTranslation, getGreetingKey } from "@/hooks/useTranslation";
import { roleToRouteGroup } from "@/utils/roleRouting";
import { AppIcon } from "@/components/icons/AppIcon";

type Props = {
  /** Override notification route (defaults by role group) */
  notificationsHref?: string;
};

function notificationsRouteForRole(role: ReturnType<typeof useAuthStore.getState>["role"]): string {
  const group = roleToRouteGroup(role);
  if (group === "(admin)") return "/(admin)/notifications";
  if (group === "(teacher)") return "/(teacher)/notice";
  if (group === "(parent)") return "/(parent)/notices";
  return "/(app)/notifications";
}

export function DashboardTopBar({ notificationsHref }: Props) {
  const { userData, role } = useAuthStore();
  const { unreadCount } = useNotifications();
  const { t, language, toggleLanguage } = useTranslation();
  const greeting = t[getGreetingKey()];
  const displayName = (userData?.name || "User").toUpperCase();
  const notifRoute = notificationsHref ?? notificationsRouteForRole(role);

  return (
    <View style={styles.row}>
      <View style={styles.userBlock}>
        <View style={styles.avatarWrap}>
          {userData?.avatar ? (
            <Image source={{ uri: userData.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <AppIcon name="profile" size={22} color="#1A3C6E" />
            </View>
          )}
        </View>
        <View style={styles.nameCol}>
          <Text style={styles.name} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={styles.greeting}>{greeting}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => router.push(notifRoute as never)}
          activeOpacity={0.8}
        >
          <AppIcon name="notifications" size={22} color="#111827" />
          {unreadCount > 0 ? (
            <View style={styles.dot}>
              <Text style={styles.dotText}>{unreadCount > 9 ? "9+" : unreadCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={toggleLanguage}
          activeOpacity={0.8}
        >
          <AppIcon name="language" size={22} color="#111827" />
          <Text style={styles.langHint}>{language === "gu" ? "ગુ" : "EN"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  userBlock: { flexDirection: "row", alignItems: "center", flex: 1, gap: 10, marginRight: 8 },
  avatarWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
    overflow: "hidden",
  },
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E8F0FA",
  },
  nameCol: { flex: 1 },
  name: { color: "#fff", fontWeight: "900", fontSize: 14, letterSpacing: 0.5 },
  greeting: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontWeight: "600", marginTop: 2 },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  dotText: { color: "#fff", fontSize: 8, fontWeight: "900" },
  langHint: {
    position: "absolute",
    bottom: 2,
    right: 4,
    fontSize: 7,
    fontWeight: "900",
    color: "#1A3C6E",
  },
});
