import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ResponsiveScreen } from "@/components/layout/ResponsiveScreen";
import { RoleHeader } from "@/components/layout/RoleHeader";
import { ROLE_TAB_BAR_HEIGHT } from "@/components/layout/RoleTabBar";
import { ContentList } from "@/components/lists/ContentList";
import { SchoolTheme } from "@/constants/theme";
import { useClassroomContentList, type ContentKind } from "@/services/classroom/contentService";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

const TITLES: Record<ContentKind, string> = {
  HOMEWORK: "Homework",
  CLASSWORK: "Classwork",
  NOTEBOOK: "Notes",
};

type Props = { kind: ContentKind };

export default function ParentContentScreen({ kind }: Props) {
  const { items, isLoading, isError, refetch, error } = useClassroomContentList(kind);

  return (
    <View style={styles.flex}>
      <RoleHeader
        title={TITLES[kind]}
        subtitle="Published by teachers — read only"
        accentColor={SchoolTheme.parent}
      />
      <ResponsiveScreen tabBarPadding={ROLE_TAB_BAR_HEIGHT}>
        {isLoading ? (
          <SkeletonLoader rows={4} />
        ) : isError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {(error as any)?.message ?? "Could not load content"}
            </Text>
          </View>
        ) : (
          <ContentList items={items} readOnly onRefresh={refetch} loading={isLoading} />
        )}
      </ResponsiveScreen>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  errorBox: { padding: 24, alignItems: "center" },
  errorText: { color: SchoolTheme.error, fontWeight: "600" },
});
