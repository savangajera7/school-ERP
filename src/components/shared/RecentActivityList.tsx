import React from "react";
import { View, Text } from "react-native";

export interface ActivityItem {
  /** Description of the activity */
  text: string;
  /** Relative time label (e.g. "10m ago") */
  time: string;
}

export interface RecentActivityListProps {
  /** List of activity items to display */
  items: ActivityItem[];
  /** Color of the activity indicator dot (default: blue-500) */
  dotColor?: string;
}

/**
 * Reusable recent activity/log list used in dashboard section cards.
 * Displays a list of text + time pairs with a colored indicator dot.
 */
export function RecentActivityList({
  items,
  dotColor = "#3B82F6",
}: RecentActivityListProps) {
  return (
    <>
      {items.map((item, i) => (
        <View
          key={i}
          className={`flex-row items-center justify-between py-3 ${
            i !== items.length - 1 ? "border-b border-gray-50 dark:border-slate-700/50" : ""
          }`}
        >
          <View className="flex-row items-center gap-3 flex-1 mr-3">
            <View
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: dotColor }}
            />
            <Text className="text-xs font-bold text-gray-700 dark:text-slate-300" numberOfLines={2}>
              {item.text}
            </Text>
          </View>
          <Text className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase">
            {item.time}
          </Text>
        </View>
      ))}
    </>
  );
}
