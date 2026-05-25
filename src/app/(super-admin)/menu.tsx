import React from "react";
import { View, Text, TouchableOpacity, Platform, StyleSheet } from "react-native";
import { router } from "expo-router";
import { usePermissions } from "@/hooks/usePermissions";
import { IconCircle } from "@/components/icons/AppIcon";
import { TabScreenLayout } from "@/components/layout/TabScreenLayout";
import { TabScreenHeader } from "@/components/layout/TabScreenHeader";
import { useResponsive } from "@/hooks/useResponsive";
import { useTranslation } from "@/hooks/useTranslation";

export default function SuperAdminMenuScreen() {
  const { isMobile } = useResponsive();
  const { roleLabel } = usePermissions();
  const { t } = useTranslation();

  const items = [
    { label: "Dashboard", icon: "home", route: "/(super-admin)/dashboard", desc: "Overview of platform metrics" },
    { label: "User Management", icon: "users", route: "/(super-admin)/users", desc: "Manage platform administrators" },
    { label: "Role Definitions", icon: "roles", route: "/(super-admin)/roles", desc: "Define system access levels" },
    { label: "Global Settings", icon: "settings", route: "/(super-admin)/settings", desc: "Configure system parameters" },
  ];

  return (
    <TabScreenLayout
      header={
        <TabScreenHeader
          eyebrow="Platform Control"
          title="System Menu"
          subtitle={`${roleLabel} · Super Admin Portal`}
        />
      }
    >
      <View style={[styles.grid, isMobile && styles.gridMobile]}>
        {items.map((item) => (
          <TouchableOpacity
            key={item.route}
            onPress={() => router.push(item.route as never)}
            activeOpacity={0.85}
            style={[styles.tile, isMobile ? styles.tileMobile : styles.tileDesktop]}
          >
            <IconCircle name={item.icon as any} size={40} iconSize={20} />
            <Text style={styles.tileLabel}>{item.label}</Text>
            {item.desc ? (
              <Text style={styles.tileDesc} numberOfLines={2}>
                {item.desc}
              </Text>
            ) : null}
          </TouchableOpacity>
        ))}
      </View>
    </TabScreenLayout>
  );
}

const tileShadow =
  Platform.OS === "web"
    ? { boxShadow: "0px 4px 16px rgba(0,0,0,0.06)" }
    : {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
      };

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  gridMobile: {},
  tile: {
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    padding: 16,
    minHeight: 118,
    ...tileShadow,
  },
  tileMobile: { width: "47.5%" },
  tileDesktop: { width: "31%" },
  tileLabel: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    marginTop: 10,
  },
  tileDesc: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 15,
  },
});
