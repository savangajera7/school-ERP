export const MOBILE_TAB_ROUTES = [
  "/(app)/menu",
  "/(app)/search",
  "/(app)/dashboard",
  "/(app)/timetable",
  "/(app)/profile",
] as const;

/** Routes where the floating bottom tab bar is shown on mobile */
export function isMobileTabRoute(pathname: string): boolean {
  const path = pathname.replace(/\/$/, "") || "/";
  if (path === "/" || path === "/dashboard") return true;

  return MOBILE_TAB_ROUTES.some((route) => {
    const short = route.replace("/(app)", "");
    return path === route || path === short || path.endsWith(short);
  });
}

export const MOBILE_TAB_BAR_HEIGHT = 72;
