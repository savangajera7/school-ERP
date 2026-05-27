import React from "react";
import { MasterCrudScreen } from "@/components/shared";
import { 
  useGetApiSectionGet, 
  usePostApiSectionAdd,
  usePutApiSectionUpdate,
  useDeleteApiSectionDeleteId 
} from "@/api/generated/master-section/master-section";

export default function SectionScreen() {
  return (
    <MasterCrudScreen
      title="Sections"
      subtitle="Manage class sections"
      entityName="section"
      idField="sectionID"
      nameField="sectionName"
      placeholder="e.g. A"
      iconName="classroom"
      useGetList={useGetApiSectionGet}
      useAdd={usePostApiSectionAdd}
      useUpdate={usePutApiSectionUpdate}
      useDelete={useDeleteApiSectionDeleteId}
    />
  );
}
