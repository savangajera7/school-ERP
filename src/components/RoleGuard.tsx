import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/colors";

type Role = 'super_admin' | 'admin' | 'teacher' | 'parent' | 'student';

type Props = {
  allowedRoles: Role[];
  children: React.ReactNode;
};

/**
 * Section 8 — ROLE GUARD COMPONENT
 * Ensures the user has one of the allowed roles before rendering children.
 */
export function RoleGuard({ allowedRoles, children }: Props) {
  const role = useAuthStore((s) => s.role) as Role;
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // If we're not authenticated, we should probably just let it be handled by root layout
  // but for strict guarding:
  if (!isAuthenticated) {
    return null; 
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to unauthorized screen as per spec
    router.replace('/unauthorized');
    return null;
  }

  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background }}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}
