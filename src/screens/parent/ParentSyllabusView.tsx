import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ResponsiveScreen } from "@/components/layout/ResponsiveScreen";
import { RoleHeader } from "@/components/layout/RoleHeader";
import { ROLE_TAB_BAR_HEIGHT } from "@/components/layout/RoleTabBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGetApiSubjectGetSubjectList } from "@/api/generated/subject/subject";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { SchoolTheme } from "@/constants/theme";
import { useResponsive } from "@/hooks/useResponsive";
import { FlatList } from "react-native";

export default function ParentSyllabusView() {
  const { data, isLoading } = useGetApiSubjectGetSubjectList();
  const subjects = parseApiList<{ subjectID?: number; subjectName?: string }>(data?.data);
  const { columns, bodySize } = useResponsive();

  return (
    <View style={{ flex: 1 }}>
      <RoleHeader title="Syllabus" subtitle="Subjects for your class" accentColor={SchoolTheme.parent} />
      <ResponsiveScreen tabBarPadding={ROLE_TAB_BAR_HEIGHT}>
        {isLoading ? (
          <SkeletonLoader rows={4} />
        ) : subjects.length === 0 ? (
          <EmptyState
            title="Syllabus coming soon"
            message="Subject list will appear when configured in academic setup."
          />
        ) : (
          <FlatList
            data={subjects}
            key={`sub-${columns}`}
            numColumns={columns}
            keyExtractor={(s) => String(s.subjectID)}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={[styles.name, { fontSize: bodySize }]}>{item.subjectName}</Text>
              </View>
            )}
          />
        )}
      </ResponsiveScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: SchoolTheme.border,
  },
  name: { fontWeight: "700", color: SchoolTheme.text },
});
