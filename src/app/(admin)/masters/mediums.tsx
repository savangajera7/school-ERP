import React from "react";
import { MasterCrudScreen } from "@/components/shared";
import { 
  useGetApiMediumGet, 
  usePostApiMediumAdd,
  usePutApiMediumUpdate,
  useDeleteApiMediumDeleteId 
} from "@/api/generated/master-medium/master-medium";

export default function MediumsScreen() {
  return (
    <MasterCrudScreen
      title="Mediums"
      subtitle="Manage school mediums"
      entityName="medium"
      idField="mediumID"
      nameField="mediumName"
      placeholder="e.g. Gujarati Medium"
      iconName="subjects"
      useGetList={useGetApiMediumGet}
      useAdd={usePostApiMediumAdd}
      useUpdate={usePutApiMediumUpdate}
      useDelete={useDeleteApiMediumDeleteId}
    />
  );
}
