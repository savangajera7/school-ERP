import React from "react";
import ClassroomContentScreen from "@/components/classroom/ClassroomContentScreen";

export default function NotebookScreen() {
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
