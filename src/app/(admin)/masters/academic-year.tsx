import React from "react";
import { MasterCrudScreen } from "@/components/shared";
import { 
  useGetApiAcademicYearGet, 
  usePostApiAcademicYearAdd,
  usePutApiAcademicYearUpdate,
  useDeleteApiAcademicYearDeleteId 
} from "@/api/generated/2-master-academicyear/2-master-academicyear";

export default function AcademicYearScreen() {
  return (
    <MasterCrudScreen
      title="Academic Years"
      subtitle="Manage school sessions"
      entityName="academic year"
      idField="academicYearID"
      nameField="academicYearName"
      placeholder="e.g. 2026-2027"
      iconName="academic"
      useGetList={useGetApiAcademicYearGet}
      useAdd={usePostApiAcademicYearAdd}
      useUpdate={usePutApiAcademicYearUpdate}
      useDelete={useDeleteApiAcademicYearDeleteId}
      getSubtitle={(item) => (item.isActive ? "Active Session" : "Inactive")}
    />
  );
}
