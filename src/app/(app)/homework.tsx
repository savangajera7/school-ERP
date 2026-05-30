import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import ClassroomContentScreen from "@/components/classroom/ClassroomContentScreen";
import ParentContentScreen from "@/screens/classroom/ParentContentScreen";
import { Colors } from "@/constants/colors";
import { Redirect } from "expo-router";

export default function UnifiedHomeworkScreen() {
  const { isParent, isStudent, isSchoolAdmin, isAdmin, isTeacher } = usePermissions();

  if (isParent || isStudent) {
    return <ParentContentScreen kind="HOMEWORK" />;
  }

  if (isSchoolAdmin || isAdmin || isTeacher) {
    return (
      <ClassroomContentScreen
        kind="HOMEWORK"
        title="Homework"
        subtitle="Manage student homework assignments"
        accentColor={Colors.primary}
        iconName="homework"
      />
    );
  }

  return <Redirect href="/(auth)/login" />;
}
