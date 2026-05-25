import React from "react";
import { View, Text, ScrollView } from "react-native";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { Card } from "@/components/ui/Card";
import { AppIcon } from "@/components/icons/AppIcon";
import { Colors } from "@/constants/colors";

export default function SuperAdminSettingsScreen() {
  return (
    <PremiumScreenLayout
      title="Platform Settings"
      subtitle="Configure global system parameters"
    >
      <ScrollView showsVerticalScrollIndicator={false}>
        <Card className="p-6">
          <View className="items-center justify-center p-12">
            <AppIcon name="settings" size={64} color={Colors.primary} />
            <Text className="text-lg font-bold text-gray-800 mt-4">Settings Under Construction</Text>
            <Text className="text-sm text-gray-500 text-center mt-2">
              Global platform configurations will be available here.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </PremiumScreenLayout>
  );
}
