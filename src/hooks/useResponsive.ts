import { useWindowDimensions } from "react-native";
import { Breakpoints } from "@/constants/breakpoints";

export function useResponsive() {
  const { width, height } = useWindowDimensions();
  
  const isDesktop = width >= Breakpoints.web;
  const isTablet = width >= Breakpoints.tablet && width < Breakpoints.web;
  const isMobile = width < Breakpoints.tablet;
  
  // Backwards compatibility
  const isWeb = width >= Breakpoints.web;

  const breakpoint: "mobile" | "tablet" | "desktop" = isDesktop 
    ? "desktop" 
    : isTablet 
    ? "tablet" 
    : "mobile";

  const listMode: "card" | "table" = isMobile ? "card" : "table";

  const padding = isDesktop ? 32 : isTablet ? 24 : 16;
  const titleSize = isDesktop ? 28 : isTablet ? 24 : 20;
  const bodySize = isDesktop ? 16 : isTablet ? 16 : 14;
  const columns = isDesktop ? 3 : isTablet ? 2 : 1;
  const maxContentWidth = isDesktop ? 1200 : undefined;

  return {
    width,
    height,
    isMobile,
    isTablet,
    isDesktop,
    isWeb, // legacy support
    breakpoint,
    listMode,
    padding,
    titleSize,
    bodySize,
    columns,
    maxContentWidth,
  };
}

export function useBreakpoint() {
  const r = useResponsive();
  return {
    isMobile: r.isMobile,
    isTablet: r.isTablet,
    isDesktop: r.isDesktop,
    breakpoint: r.breakpoint,
    listMode: r.listMode,
    columns: r.columns,
    width: r.width,
  };
}
