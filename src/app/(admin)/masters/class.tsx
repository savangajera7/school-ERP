import React from "react";
import { MasterCrudScreen } from "@/components/shared";
import { 
  useGetApiClassGet, 
  usePostApiClassAdd,
  usePutApiClassUpdate,
  useDeleteApiClassDeleteId 
} from "@/api/generated/master-class/master-class";

export default function ClassScreen() {
  return (
    <MasterCrudScreen
      title="Classes"
      subtitle="Manage school classes"
      entityName="class"
      idField="classID"
      nameField="className"
      placeholder="e.g. Class 10"
      iconName="school"
      useGetList={useGetApiClassGet}
      useAdd={usePostApiClassAdd}
      useUpdate={usePutApiClassUpdate}
      useDelete={useDeleteApiClassDeleteId}
    />
  );
}
