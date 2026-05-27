import React, { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { ResponsiveScreen } from "@/components/layout/ResponsiveScreen";
import { RoleHeader } from "@/components/layout/RoleHeader";
import { ROLE_TAB_BAR_HEIGHT } from "@/components/layout/RoleTabBar";
import { ContentEditorForm } from "@/components/forms/ContentEditorForm";
import { ContentList } from "@/components/lists/ContentList";
import { SchoolTheme } from "@/constants/theme";
import {
  buildContentTitle,
  useClassroomContentList,
  type ContentKind,
} from "@/services/classroom/contentService";
import { useInsertClassroomContent } from "@/services/classroom/contentService";
import { useToast } from "@/components/ui/Toast";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { useAuthStore } from "@/store/authStore";

const TITLES: Record<ContentKind, string> = {
  HOMEWORK: "Homework",
  CLASSWORK: "Classwork",
  NOTEBOOK: "Notebook",
};

type Props = { kind: ContentKind };

export default function TeacherContentScreen({ kind }: Props) {
  const { items, isLoading, isError, refetch, error } = useClassroomContentList(kind);
  const insert = useInsertClassroomContent();
  const { showToast } = useToast();
  const userId = useAuthStore((s) => s.userData?.id);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (title: string, body: string, date: string) => {
    setSubmitting(true);
    try {
      await insert.mutateAsync({
        data: {
          noticeTitle: buildContentTitle(kind, title),
          noticeDescription: body,
          startDate: date,
          endDate: date,
          addedBy: parseInt(userId ?? "0", 10) || 0,
        },
      });
      showToast(`${TITLES[kind]} saved`, "success");
      refetch();
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Save failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.flex}>
      <RoleHeader title={TITLES[kind]} subtitle="Add and edit for your class" accentColor={SchoolTheme.teacher} />
      <ResponsiveScreen keyboard tabBarPadding={ROLE_TAB_BAR_HEIGHT}>
        {isLoading ? (
          <SkeletonLoader rows={4} />
        ) : isError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>
              {(error as any)?.message ?? "Could not load content"}
            </Text>
          </View>
        ) : (
          <>
            <ContentEditorForm kind={kind} onSubmit={onSubmit} loading={submitting} />
            <ContentList items={items} onRefresh={refetch} loading={isLoading} />
          </>
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
