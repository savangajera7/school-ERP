export const Colors = {
  primary: "#0d3666", // Deep Blue
  accent: "#f5921e",  // Orange
  primaryLight: "#1e40af",
  primaryDark: "#0a264a",
  secondary: "#FFFFFF",
  background: "#fdfdfd",
  card: "#FFFFFF",
  border: "#E5E7EB",
  text: "#111827",
  textSecondary: "#4b5563",
  textTertiary: "#9CA3AF",
  error: "#EF4444",
  success: "#10B981",
  warning: "#F59E0B",
  gradientStart: "#0d3666",
  gradientEnd: "#1e40af",
  orangeGradientStart: "#f5921e",
  orangeGradientEnd: "#fbbf24",
} as const;

export type ColorKey = keyof typeof Colors;
