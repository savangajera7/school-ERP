import React from "react";
import { usePermissions } from "@/hooks/usePermissions";
import ClassroomContentScreen from "@/components/classroom/ClassroomContentScreen";
import ParentContentScreen from "@/screens/classroom/ParentContentScreen";
import { Redirect } from "expo-router";

export default function UnifiedClassworkScreen() {
  const { isParent, isStudent, isSchoolAdmin, isAdmin, isTeacher } = usePermissions();

  if (isParent || isStudent) {
    return <ParentContentScreen kind="CLASSWORK" />;
  }

  if (isSchoolAdmin || isAdmin || isTeacher) {
    return (
      <ClassroomContentScreen
        kind="CLASSWORK"
        title="Classwork"
        subtitle="Manage student classwork records"
        accentColor="#10B981"
        iconName="classwork"
      />
    );
  }

  return <Redirect href="/(auth)/login" />;
}
