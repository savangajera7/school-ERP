import React from "react";
import { MasterCrudScreen } from "@/components/shared";
import { 
  useGetApiBatchGet, 
  usePostApiBatchAdd,
  usePutApiBatchUpdate,
  useDeleteApiBatchDeleteId 
} from "@/api/generated/2-master-batch/2-master-batch";

export default function BatchScreen() {
  return (
    <MasterCrudScreen
      title="Batches"
      subtitle="Manage student batches"
      entityName="batch"
      idField="batchID"
      nameField="batchName"
      placeholder="e.g. Morning Batch"
      iconName="clock"
      useGetList={useGetApiBatchGet}
      useAdd={usePostApiBatchAdd}
      useUpdate={usePutApiBatchUpdate}
      useDelete={useDeleteApiBatchDeleteId}
      getSubtitle={(item) => (item.isActive ? "Active Batch" : "Inactive")}
    />
  );
}
