import { useWindowDimensions } from "react-native";
import { Breakpoints } from "@/constants/breakpoints";

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= Breakpoints.tablet;
  const isWeb = width >= Breakpoints.web;
  const isMobile = !isTablet;

  const padding = isWeb ? 32 : isTablet ? 24 : 16;
  const titleSize = isWeb ? 28 : isTablet ? 24 : 20;
  const bodySize = isWeb ? 16 : isTablet ? 16 : 14;
  const columns = isWeb ? 3 : isTablet ? 2 : 1;
  const maxContentWidth = isWeb ? 1200 : undefined;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isWeb,
    padding,
    titleSize,
    bodySize,
    columns,
    maxContentWidth,
  };
}

/** @deprecated Use useResponsive — kept for existing screens */
export function useBreakpoint() {
  const r = useResponsive();
  return {
    isMobile: r.isMobile,
    isTablet: r.isTablet,
    isDesktop: r.isWeb,
    width: r.width,
  };
}
