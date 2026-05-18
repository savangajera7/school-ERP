export const Colors = {
  primary: "#0d3666",
  primaryLight: "#f5921e",
  primaryDark: "#0a264a",
  secondary: "#FFFFFF",
  background: "#F3F4F6",
  card: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textSecondary: "#6B7280",
  textTertiary: "#9CA3AF",
  error: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
  gradientStart: "#0a264a",
  gradientEnd: "#0d3666",
} as const;

export type ColorKey = keyof typeof Colors;
