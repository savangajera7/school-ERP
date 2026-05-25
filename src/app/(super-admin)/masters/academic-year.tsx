import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { 
  useGetApiAcademicYearGet, 
  usePostApiAcademicYearAdd,
  useDeleteApiAcademicYearDeleteId 
} from "@/api/generated/2-master-academicyear/2-master-academicyear";
import { parseApiList } from "@/utils/apiResponse";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

export default function AcademicYearScreen() {
  const [newYear, setNewYear] = useState("");
  const { data, isLoading, refetch } = useGetApiAcademicYearGet();
  const addYear = usePostApiAcademicYearAdd();
  const deleteYear = useDeleteApiAcademicYearDeleteId();

  const years = parseApiList(data?.data);

  const handleAdd = async () => {
    if (!newYear.trim()) return;
    try {
      await addYear.mutateAsync({
        data: { academicYearName: newYear, isActive: true }
      });
      setNewYear("");
      refetch();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add academic year");
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await deleteYear.mutateAsync({ id });
            refetch();
          } catch (error: any) {
            Alert.alert("Error", error.message || "Failed to delete");
          }
        }
      }
    ]);
  };

  return (
    <PremiumScreenLayout
      title="Academic Years"
      subtitle="Manage school sessions"
      onBack={() => router.back()}
      scrollable={false}
    >
      <Card className="p-4 mb-6">
        <View className="flex-row gap-3">
          <TextInput
            value={newYear}
            onChangeText={setNewYear}
            placeholder="e.g. 2026-2027"
            className="flex-1 h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
          />
          <Button
            label="Add"
            onPress={handleAdd}
            loading={addYear.isPending}
            style={{ width: 80 }}
          />
        </View>
      </Card>

      {isLoading ? (
        <SkeletonLoader rows={5} />
      ) : (
        <FlatList
          data={years}
          keyExtractor={(item: any) => String(item.academicYearID)}
          renderItem={({ item }: { item: any }) => (
            <View className="flex-row items-center justify-between bg-white p-4 rounded-2xl mb-3 border border-gray-100">
              <Text className="text-sm font-bold text-gray-800">{item.academicYearName}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.academicYearID)}>
                <AppIcon name="delete" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </PremiumScreenLayout>
  );
}
