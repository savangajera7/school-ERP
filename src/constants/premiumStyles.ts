import { Platform, type ViewStyle } from "react-native";
import { SchoolTheme } from "@/constants/theme";

export const premiumCardShadow: ViewStyle =
  Platform.OS === "web"
    ? { boxShadow: "0px 4px 20px rgba(13,74,140,0.06)" }
    : {
        shadowColor: SchoolTheme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
      };

export const premiumTileShadow: ViewStyle =
  Platform.OS === "web"
    ? { boxShadow: "0px 2px 12px rgba(0,0,0,0.05)" }
    : {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      };

export const OVERLAP_MARGIN = -28;
