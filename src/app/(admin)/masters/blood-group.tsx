import React from "react";
import { MasterCrudScreen } from "@/components/shared";
import { 
  useGetApiBloodGroupGet, 
  usePostApiBloodGroupAdd,
  usePutApiBloodGroupUpdate,
  useDeleteApiBloodGroupDeleteId 
} from "@/api/generated/2-master-bloodgroup/2-master-bloodgroup";

export default function BloodGroupScreen() {
  return (
    <MasterCrudScreen
      title="Blood Groups"
      subtitle="Manage medical data"
      entityName="blood group"
      idField="bloodGroupID"
      nameField="bloodGroupName"
      placeholder="e.g. O+"
      iconName="warning"
      useGetList={useGetApiBloodGroupGet}
      useAdd={usePostApiBloodGroupAdd}
      useUpdate={usePutApiBloodGroupUpdate}
      useDelete={useDeleteApiBloodGroupDeleteId}
    />
  );
}
