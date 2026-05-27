import React from "react";
import ClassroomContentScreen from "@/components/classroom/ClassroomContentScreen";
import { Colors } from "@/constants/colors";

export default function HomeworkScreen() {
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
