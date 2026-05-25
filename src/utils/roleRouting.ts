import type { Role } from "@/types/auth.types";

export type LoginIntent = "admin" | "teacher" | "parent";

export function roleToRouteGroup(role: Role | null): "(admin)" | "(teacher)" | "(parent)" | null {
  if (!role) return null;
  if (role === "superadmin" || role === "admin") return "(admin)";
  if (role === "teacher") return "(teacher)";
  if (role === "parent" || role === "student") return "(parent)";
  return null;
}

export function getHomeRoute(role: Role | null): string {
  const group = roleToRouteGroup(role);
  if (!group) return "/(auth)/login";
  return `${group}/dashboard`;
}

export function intentMatchesRole(intent: LoginIntent, role: Role): boolean {
  if (intent === "admin") return role === "admin" || role === "superadmin";
  if (intent === "teacher") return role === "teacher";
  return role === "parent" || role === "student";
}

export function intentLabel(intent: LoginIntent): string {
  switch (intent) {
    case "admin":
      return "Administrator";
    case "teacher":
      return "Teacher";
    case "parent":
      return "Parent / Guardian";
  }
}
