import React from "react";
import { Stack } from "expo-router";
import { RoleGuard } from "@/components/RoleGuard";

export default function SuperAdminLayout() {
  return (
    <RoleGuard allowedRoles={["super_admin"]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="dashboard" />
      </Stack>
    </RoleGuard>
  );
}
