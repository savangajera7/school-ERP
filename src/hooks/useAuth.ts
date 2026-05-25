import { useEffect, useCallback } from "react";
import { useRouter, useSegments } from "expo-router";
import { useMutation } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth/authService";
import { roleFromRoleId } from "@/constants/rolePermissions";
import { postApiLoginLogin } from "@/api/generated/1-login-no-token/1-login-no-token";
import type { LoginRequest } from "@/api/model";
import { registerPushToken } from "@/services/notifications/pushService";
import type { LoginPayload, Role } from "@/types/auth.types";
import {
  getHomeRoute,
  intentMatchesRole,
  roleToRouteGroup,
  type LoginIntent,
} from "@/utils/roleRouting";

export function useAuth() {
  const router = useRouter();
  const segments = useSegments();
  const {
    isAuthenticated,
    userData,
    role,
    login,
    logout: storeLogout,
  } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginPayload) => authService.loginUser(data),
  });

  const apiLoginMutation = useMutation({
    mutationFn: (vars: { data?: LoginRequest }) => postApiLoginLogin(vars.data),
  });

  const signInWithApi = useCallback(
    async (
      email: string,
      password: string,
      intent: LoginIntent
    ): Promise<{ ok: boolean; error?: string }> => {
      try {
        const response = await apiLoginMutation.mutateAsync({
          data: { userName: email, email, password },
        });
        const envelope = (response as { data?: Record<string, unknown> })?.data ?? {};
        const token = String(envelope.token ?? "");
        const u = (envelope.data ?? envelope) as {
          userID?: number;
          fullName?: string;
          userName?: string;
          email?: string;
          mobileNo?: string;
          roleID?: number;
          referenceID?: number;
          profilePhoto?: string;
        };

        if (!token || !u.userID) {
          return { ok: false, error: "Invalid login response." };
        }

        const userRole = roleFromRoleId(u.roleID);
        if (!intentMatchesRole(intent, userRole)) {
          return {
            ok: false,
            error: `This account is registered as ${userRole}, not ${intent}.`,
          };
        }

        login(
          token,
          "",
          {
            id: String(u.userID),
            name: u.fullName || u.userName || "User",
            email: String(u.email ?? ""),
            mobile: u.mobileNo || "",
            role: userRole,
            roleID: u.roleID,
            referenceID: u.referenceID,
            schoolName: "Little Angel's English School",
            avatar: u.profilePhoto,
          },
          userRole
        );
        registerPushToken().catch(() => {});
        router.replace(getHomeRoute(userRole) as never);
        return { ok: true };
      } catch (e) {
        return {
          ok: false,
          error: e instanceof Error ? e.message : "Login failed",
        };
      }
    },
    [apiLoginMutation, login, router]
  );

  const handleLogout = useCallback(() => {
    storeLogout();
    router.replace("/(auth)/login");
  }, [storeLogout, router]);

  const forgotPasswordMutation = useMutation({
    mutationFn: (identifier: string) => authService.forgotPassword(identifier),
  });

  return {
    isAuthenticated,
    userData,
    role,
    loginMutation,
    apiLoginMutation,
    signInWithApi,
    forgotPasswordMutation,
    handleLogout,
    getHomeRoute: () => getHomeRoute(role),
    roleGroup: roleToRouteGroup(role),
  };
}

/** Redirect unauthenticated / wrong role group */
export function useAuthGuard() {
  const { isAuthenticated, role } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const inAuth = segments[0] === "(auth)";
    const group = segments[0] as string | undefined;
    const expected = roleToRouteGroup(role);

    if (!isAuthenticated && !inAuth) {
      router.replace("/(auth)/login");
      return;
    }

    if (isAuthenticated && inAuth) {
      router.replace(getHomeRoute(role) as never);
      return;
    }

    if (
      isAuthenticated &&
      expected &&
      group &&
      (group === "(admin)" || group === "(teacher)" || group === "(parent)") &&
      group !== expected
    ) {
      router.replace(getHomeRoute(role) as never);
    }
  }, [isAuthenticated, role, segments, router]);
}
