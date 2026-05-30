import React from "react";
import { View, Text } from "react-native";

type Props = {
  present: number;
  absent: number;
  leave: number;
};

export function AttendanceSummaryChips({ present, absent, leave }: Props) {
  const chips = [
    { label: "Present", value: present, bg: "bg-emerald-50 dark:bg-emerald-900/30", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-800" },
    { label: "Absent", value: absent, bg: "bg-rose-50 dark:bg-rose-900/30", text: "text-rose-700 dark:text-rose-400", border: "border-rose-100 dark:border-rose-800" },
    { label: "Leave", value: leave, bg: "bg-amber-50 dark:bg-amber-900/30", text: "text-amber-700 dark:text-amber-400", border: "border-amber-100 dark:border-amber-800" },
  ];

  return (
    <View className="flex-row flex-wrap gap-2 mb-3">
      {chips.map((c) => (
        <View key={c.label} className={`px-3 py-2 rounded-xl border ${c.bg} ${c.border}`}>
          <Text className={`text-[10px] font-black uppercase ${c.text}`}>{c.label}</Text>
          <Text className={`text-lg font-black ${c.text}`}>{c.value}</Text>
        </View>
      ))}
    </View>
  );
}
