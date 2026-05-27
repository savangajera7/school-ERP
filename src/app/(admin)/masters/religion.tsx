import React from "react";
import { MasterCrudScreen } from "@/components/shared";
import { 
  useGetApiReligionGet, 
  usePostApiReligionAdd,
  usePutApiReligionUpdate,
  useDeleteApiReligionDeleteId 
} from "@/api/generated/2-master-religion/2-master-religion";

export default function ReligionScreen() {
  return (
    <MasterCrudScreen
      title="Religions"
      subtitle="Manage demographic options"
      entityName="religion"
      idField="religionID"
      nameField="religionName"
      placeholder="e.g. Hindu"
      iconName="language"
      useGetList={useGetApiReligionGet}
      useAdd={usePostApiReligionAdd}
      useUpdate={usePutApiReligionUpdate}
      useDelete={useDeleteApiReligionDeleteId}
    />
  );
}
