import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { Colors } from "@/constants/colors";
import { 
  useGetApiTeacherClassAssignmentGet,
  useDeleteApiTeacherClassAssignmentRemove 
} from "@/api/generated/6-teacher-class-assignment/6-teacher-class-assignment";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ResponsiveDataList, EntityActionButtons } from "@/components/shared";

export default function TeacherClassAssignmentScreen() {
  const { data, isLoading, refetch } = useGetApiTeacherClassAssignmentGet();
  const deleteAssignment = useDeleteApiTeacherClassAssignmentRemove();
  
  const assignments = useMemo(() => parseApiList<any>(data?.data), [data]);

  const columns = [
    { key: "teacherName", header: "Teacher", flex: 2 },
    { key: "className", header: "Class", flex: 2 },
  ];

  return (
    <PremiumScreenLayout
      title="Class Assignments"
      subtitle="Manage teacher to class assignments"
      onBack={() => {}} 
    >
      {isLoading ? (
        <SkeletonLoader rows={4} />
      ) : assignments.length === 0 ? (
        <EmptyState title="No Assignments found" message="Assign a teacher to a class." />
      ) : (
        <ResponsiveDataList<any>
          data={assignments}
          tableColumns={columns}
          keyExtractor={(item: any) => String(item.id || item.teacherID)}
          renderCard={(item: any) => (
            <View className="bg-white p-4 mb-3 rounded-xl border border-gray-200">
              <Text className="font-bold text-[16px] text-gray-900">{item.teacherName}</Text>
              <Text className="text-gray-500 mb-2">Class: {item.className}</Text>
              <EntityActionButtons
                onDelete={async () => {
                  await deleteAssignment.mutateAsync({
                    data: {
                      teacherID: item.teacherID,
                      classID: item.classID,
                    }
                  });
                  refetch();
                }}
              />
            </View>
          )}
        />
      )}
    </PremiumScreenLayout>
  );
}
