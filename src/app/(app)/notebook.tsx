import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import ClassroomContentScreen from "@/components/classroom/ClassroomContentScreen";
import ParentContentScreen from "@/screens/classroom/ParentContentScreen";
import { Redirect } from "expo-router";

export default function UnifiedNotebookScreen() {
  const { isParent, isStudent, isSchoolAdmin, isAdmin, isTeacher } = usePermissions();

  if (isParent || isStudent) {
    return <ParentContentScreen kind="NOTEBOOK" />;
  }

  if (isSchoolAdmin || isAdmin || isTeacher) {
    return (
      <ClassroomContentScreen
        kind="NOTEBOOK"
        title="Notebook"
        subtitle="Track student notebook status and notes"
        accentColor="#6366F1"
        iconName="notebook"
      />
    );
  }

  return <Redirect href="/(auth)/login" />;
}
