import React from "react";
import { View, Text, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { Colors } from "@/constants/colors";
import { useGetApiSchoolGet, usePostApiSchoolAdd, useDeleteApiSchoolDeleteId } from "@/api/generated/0-schools-super-admin/0-schools-super-admin";
import { parseApiList } from "@/utils/apiResponse";
import { useQueryClient } from "@tanstack/react-query";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { IconCircle } from "@/components/icons/AppIcon";

export default function SchoolsManagementScreen() {
  const { data, isLoading } = useGetApiSchoolGet();
  const queryClient = useQueryClient();
  const addSchoolMutation = usePostApiSchoolAdd();
  const deleteSchoolMutation = useDeleteApiSchoolDeleteId();

  const schools = React.useMemo(() => parseApiList<any>(data?.data), [data]);

  const handleAddSchool = () => {
    addSchoolMutation.mutate(
      { data: { schoolName: "New School", email: "info@newschool.com" } },
      {
        onSuccess: () => {
          Alert.alert("Success", "School added successfully.");
          queryClient.invalidateQueries({ queryKey: ["/api/School/Get"] });
        },
        onError: () => {
          Alert.alert("Error", "Failed to add school.");
        }
      }
    );
  };

  const handleDeleteSchool = (id: number) => {
    Alert.alert(
      "Delete School",
      "Are you sure you want to delete this school?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => {
            deleteSchoolMutation.mutate(
              { id },
              {
                onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["/api/School/Get"] });
                },
                onError: () => {
                  Alert.alert("Error", "Failed to delete school.");
                }
              }
            );
          }
        }
      ]
    );
  };

  return (
    <PremiumScreenLayout
      title="Schools"
      subtitle="Manage registered schools"
      onBack={() => {}} // or use router
      rightAction={
        <TouchableOpacity 
          className="bg-primary px-4 py-2 rounded-full flex-row items-center"
          onPress={handleAddSchool}
        >
          <Text className="text-white font-bold text-sm">+ Add School</Text>
        </TouchableOpacity>
      }
    >
      {isLoading ? (
        <SkeletonLoader rows={4} />
      ) : schools.length === 0 ? (
        <EmptyState title="No schools found" message="No schools registered yet." />
      ) : (
        schools.map((school) => (
          <Card key={school.id || school.schoolID} className="p-4 mb-4">
            <View className="flex-row items-center justify-between mb-2">
              <View>
                <Text className="text-[16px] font-black text-gray-900">
                  {school.schoolName || school.name || "Unnamed School"}
                </Text>
                <Text className="text-xs text-gray-500 font-medium">
                  {school.email || school.schoolEmail || "No Email"}
                </Text>
              </View>
              <View className="flex-row items-center">
                <IconCircle name="school" size={40} iconSize={20} />
                <TouchableOpacity 
                  onPress={() => handleDeleteSchool(school.id || school.schoolID)}
                  className="ml-4 bg-red-100 p-2 rounded-full"
                >
                  <IconCircle name="delete" size={32} iconSize={16} />
                </TouchableOpacity>
              </View>
            </View>
            <Text className="text-sm text-gray-600 mt-2">
              Phone: {school.contactNo || school.phone || "N/A"}
            </Text>
          </Card>
        ))
      )}
    </PremiumScreenLayout>
  );
}
