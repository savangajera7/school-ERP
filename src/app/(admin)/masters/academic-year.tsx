import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { 
  useGetApiAcademicYearGet, 
  usePostApiAcademicYearAdd,
  usePutApiAcademicYearUpdate,
  useDeleteApiAcademicYearDeleteId 
} from "@/api/generated/2-master-academicyear/2-master-academicyear";
import { parseApiList } from "@/utils/apiResponse";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { MobileDataCard } from "@/components/ui/MobileDataCard";

export default function AcademicYearScreen() {
  const [newYear, setNewYear] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);
  
  const { data, isLoading, refetch } = useGetApiAcademicYearGet();
  const addYear = usePostApiAcademicYearAdd();
  const updateYear = usePutApiAcademicYearUpdate();
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

  const handleUpdate = async () => {
    if (!newYear.trim() || !editingItem) return;
    try {
      await updateYear.mutateAsync({
        data: { 
          ...editingItem,
          academicYearName: newYear 
        }
      });
      setNewYear("");
      setEditingItem(null);
      refetch();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update academic year");
    }
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setNewYear(item.academicYearName);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setNewYear("");
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
      flatHeader
    >
      <Card className="p-4 mb-6" style={premiumCardShadow}>
        <View className="flex-row gap-3">
          <TextInput
            value={newYear}
            onChangeText={setNewYear}
            placeholder="e.g. 2026-2027"
            className="flex-1 h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
          />
          {editingItem ? (
            <View className="flex-row gap-2">
              <Button
                label="Save"
                onPress={handleUpdate}
                loading={updateYear.isPending}
                style={{ width: 70 }}
              />
              <TouchableOpacity 
                onPress={cancelEdit}
                className="bg-gray-100 h-[48px] w-[48px] items-center justify-center rounded-xl"
              >
                <AppIcon name="close" size={20} color="#6B7280" />
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              label="Add"
              onPress={handleAdd}
              loading={addYear.isPending}
              style={{ width: 80 }}
            />
          )}
        </View>
      </Card>

      {isLoading ? (
        <SkeletonLoader rows={5} />
      ) : (
        <FlatList
          data={years}
          keyExtractor={(item: any) => String(item.academicYearID)}
          renderItem={({ item }: { item: any }) => (
            <MobileDataCard
              title={item.academicYearName}
              subtitle={item.isActive ? "Active Session" : "Inactive"}
              icon={<IconCircle name="academic" size={40} iconSize={20} />}
              actions={
                <View className="flex-row gap-2 ml-auto">
                  <TouchableOpacity 
                    onPress={() => startEdit(item)}
                    className="bg-blue-50 p-2 rounded-lg"
                  >
                    <AppIcon name="edit" size={18} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDelete(item.academicYearID)}
                    className="bg-red-50 p-2 rounded-lg"
                  >
                    <AppIcon name="delete" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              }
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </PremiumScreenLayout>
  );
}
