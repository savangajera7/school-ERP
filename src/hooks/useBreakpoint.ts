import { useWindowDimensions } from 'react-native';
import { Breakpoints } from '../constants/breakpoints';

export function useBreakpoint() {
  const { width } = useWindowDimensions();
  return {
    isMobile: width < Breakpoints.tablet,
    isTablet: width >= Breakpoints.tablet && width < Breakpoints.desktop,
    isDesktop: width >= Breakpoints.desktop,
    width,
  };
}
