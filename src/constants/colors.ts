export const Colors = {
  primary: "#1A3C6E", // Deep School Blue
  accent: "#F5A623",  // Gold
  primaryLight: "#2C5282",
  primaryDark: "#102A43",
  secondary: "#FFFFFF",
  background: "#F8F9FA",
  card: "#FFFFFF",
  border: "#E5E7EB",
  text: "#2C3E50",
  textSecondary: "#4b5563",
  textTertiary: "#95A5A6",
  error: "#E74C3C",
  success: "#27AE60",
  warning: "#F5A623",
  gradientStart: "#1A3C6E",
  gradientEnd: "#2C5282",
  orangeGradientStart: "#F5A623",
  orangeGradientEnd: "#fbbf24",
} as const;

export type ColorKey = keyof typeof Colors;
