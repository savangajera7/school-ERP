import React from "react";
import { MasterCrudScreen } from "@/components/shared";
import { 
  useGetApiSubjectGetSubjectList, 
  usePostApiSubjectInsertSubject,
  usePutApiSubjectUpdateSubject,
  useDeleteApiSubjectDeleteSubject 
} from "@/api/generated/subject/subject";

export default function SubjectScreen() {
  const useDeleteWrapped = () => {
    const mutation = useDeleteApiSubjectDeleteSubject();
    return {
      mutateAsync: (payload: { id: number }) => mutation.mutateAsync({ data: { subjectID: payload.id } }),
      isPending: mutation.isPending
    };
  };

  return (
    <MasterCrudScreen
      title="Subjects"
      subtitle="Manage school subjects"
      entityName="subject"
      idField="subjectID"
      nameField="subjectName"
      placeholder="e.g. Mathematics"
      iconName="subjects"
      useGetList={useGetApiSubjectGetSubjectList}
      useAdd={usePostApiSubjectInsertSubject}
      useUpdate={usePutApiSubjectUpdateSubject}
      useDelete={useDeleteWrapped}
    />
  );
}
