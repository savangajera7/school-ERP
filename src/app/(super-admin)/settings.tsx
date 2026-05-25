import React, { useState } from "react";
import { View, Text, ScrollView, Switch, TouchableOpacity, Platform, Alert } from "react-native";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { Card } from "@/components/ui/Card";
import { AppIcon } from "@/components/icons/AppIcon";
import { Colors } from "@/constants/colors";
import { IconCircle } from "@/components/icons/AppIcon";
import { useAuth } from "@/hooks/useAuth";

export default function SuperAdminSettingsScreen() {
  const { handleLogout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <PremiumScreenLayout
      title="Platform Settings"
      subtitle="Configure global system parameters"
      showTopBar
    >
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* General Settings */}
        <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-3 ml-1">
          System Configuration
        </Text>
        
        <Card className="mb-6 overflow-hidden">
          <SettingItem
            icon="notifications"
            title="System Notifications"
            subtitle="Enable global alert system"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            type="switch"
          />
          <View className="h-[1px] bg-gray-50 mx-4" />
          <SettingItem
            icon="settings"
            title="Maintenance Mode"
            subtitle="Restrict access for maintenance"
            value={maintenanceMode}
            onValueChange={setMaintenanceMode}
            type="switch"
          />
          <View className="h-[1px] bg-gray-50 mx-4" />
          <SettingItem
            icon="language"
            title="Default Language"
            subtitle="System-wide default locale"
            value="English (US)"
            type="value"
          />
        </Card>

        <Text className="text-gray-400 font-black text-[10px] uppercase tracking-widest mb-3 ml-1">
          Appearance & Security
        </Text>

        <Card className="mb-6 overflow-hidden">
          <SettingItem
            icon="masters"
            title="Dark Mode"
            subtitle="Toggle system visual theme"
            value={darkMode}
            onValueChange={setDarkMode}
            type="switch"
          />
          <View className="h-[1px] bg-gray-50 mx-4" />
          <TouchableOpacity className="flex-row items-center p-4">
            <IconCircle name="roles" size={36} iconSize={18} backgroundColor="#F3E8FF" color="#7E22CE" />
            <View className="flex-1 ml-3">
              <Text className="text-sm font-bold text-gray-800">Security Audit Logs</Text>
              <Text className="text-xs text-gray-400 font-semibold">View system access history</Text>
            </View>
            <AppIcon name="chevronRight" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        </Card>

        <TouchableOpacity 
          className="bg-red-50 border border-red-100 rounded-2xl p-4 flex-row items-center justify-center gap-2 mb-4"
          activeOpacity={0.7}
        >
          <AppIcon name="delete" size={18} color="#EF4444" />
          <Text className="text-red-600 font-bold">Purge System Cache</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          className="bg-white border border-gray-100 rounded-2xl p-4 flex-row items-center justify-center gap-2"
          activeOpacity={0.7}
          onPress={() => {
            Alert.alert("Sign Out", "Are you sure you want to sign out?", [
              { text: "Cancel", style: "cancel" },
              { text: "Sign Out", style: "destructive", onPress: handleLogout }
            ]);
          }}
        >
          <AppIcon name="logout" size={18} color="#EF4444" />
          <Text className="text-red-600 font-bold">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </PremiumScreenLayout>
  );
}

function SettingItem({ 
  icon, title, subtitle, value, onValueChange, type 
}: { 
  icon: any; title: string; subtitle: string; value?: any; onValueChange?: (v: any) => void; type: "switch" | "value" 
}) {
  return (
    <View className="flex-row items-center p-4">
      <IconCircle name={icon} size={36} iconSize={18} />
      <View className="flex-1 ml-3">
        <Text className="text-sm font-bold text-gray-800">{title}</Text>
        <Text className="text-xs text-gray-400 font-semibold">{subtitle}</Text>
      </View>
      {type === "switch" ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: "#E5E7EB", true: Colors.primary }}
          thumbColor={Platform.OS === "ios" ? undefined : "#fff"}
        />
      ) : (
        <View className="flex-row items-center gap-1">
          <Text className="text-xs font-bold text-gray-500">{value}</Text>
          <AppIcon name="chevronRight" size={16} color="#D1D5DB" />
        </View>
      )}
    </View>
  );
}
