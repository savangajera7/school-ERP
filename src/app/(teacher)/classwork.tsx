import React from "react";
import ClassroomContentScreen from "@/components/classroom/ClassroomContentScreen";

export default function ClassworkScreen() {
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
