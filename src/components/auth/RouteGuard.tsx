import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { usePathname, router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { canAccessRoute } from "@/constants/rolePermissions";
import { Colors } from "@/constants/colors";

type Props = { children: React.ReactNode };

function normalizePath(pathname: string): string {
  const p = pathname.replace(/\/$/, "") || "/";
  if (p === "/" || p === "/index") return "/(app)/dashboard";
  if (
    p.startsWith("/(admin)/") ||
    p.startsWith("/(parent)/") ||
    p.startsWith("/(teacher)/") ||
    p.startsWith("/(app)/") ||
    p.startsWith("/(super-admin)/")
  ) {
    return p;
  }
  const segment = p.split("/").filter(Boolean)[0];
  if (segment) return `/(app)/${segment}`;
  return p;
}

/**
 * Redirects unauthorized deep links to dashboard (role-safe home).
 */
export function RouteGuard({ children }: Props) {
  const pathname = usePathname();
  const role = useAuthStore((s) => s.role);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const route = normalizePath(pathname);
  const allowed =
    !isAuthenticated ||
    route === "/(app)/menu" ||
    route === "/(app)/profile" ||
    canAccessRoute(role, route);

  useEffect(() => {
    if (!isAuthenticated || allowed) return;
    router.replace("/(app)/dashboard");
  }, [isAuthenticated, allowed, route]);

  if (!isAuthenticated) return <>{children}</>;

  if (!allowed) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text className="text-gray-500 mt-4 text-sm">Redirecting…</Text>
      </View>
    );
  }

  return <>{children}</>;
}
