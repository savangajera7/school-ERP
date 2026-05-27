import React from "react";
import { MasterCrudScreen } from "@/components/shared";
import { 
  useGetApiCategoryGet, 
  usePostApiCategoryAdd,
  usePutApiCategoryUpdate,
  useDeleteApiCategoryDeleteId 
} from "@/api/generated/2-master-category/2-master-category";

export default function CategoryScreen() {
  return (
    <MasterCrudScreen
      title="Categories"
      subtitle="Manage admission categories"
      entityName="category"
      idField="categoryID"
      nameField="categoryName"
      placeholder="e.g. General"
      iconName="filter"
      useGetList={useGetApiCategoryGet}
      useAdd={usePostApiCategoryAdd}
      useUpdate={usePutApiCategoryUpdate}
      useDelete={useDeleteApiCategoryDeleteId}
    />
  );
}
