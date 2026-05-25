import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { 
  useGetApiBloodGroupGet, 
  usePostApiBloodGroupAdd,
  usePutApiBloodGroupUpdate,
  useDeleteApiBloodGroupDeleteId 
} from "@/api/generated/2-master-bloodgroup/2-master-bloodgroup";
import { parseApiList } from "@/utils/apiResponse";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { MobileDataCard } from "@/components/ui/MobileDataCard";

export default function BloodGroupScreen() {
  const [newName, setNewName] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data, isLoading, refetch } = useGetApiBloodGroupGet();
  const addMutation = usePostApiBloodGroupAdd();
  const updateMutation = usePutApiBloodGroupUpdate();
  const deleteMutation = useDeleteApiBloodGroupDeleteId();

  const items = parseApiList(data?.data);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await addMutation.mutateAsync({
        data: { bloodGroupName: newName, isActive: true }
      });
      setNewName("");
      refetch();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add blood group");
    }
  };

  const handleUpdate = async () => {
    if (!newName.trim() || !editingItem) return;
    try {
      await updateMutation.mutateAsync({
        data: { 
          ...editingItem,
          bloodGroupName: newName 
        }
      });
      setNewName("");
      setEditingItem(null);
      refetch();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update blood group");
    }
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setNewName(item.bloodGroupName);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setNewName("");
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync({ id });
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
      title="Blood Groups"
      subtitle="Manage medical data"
      onBack={() => router.back()}
      scrollable={false}
      flatHeader
    >
      <Card className="p-4 mb-6" style={premiumCardShadow}>
        <View className="flex-row gap-3">
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="e.g. A+"
            className="flex-1 h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
          />
          {editingItem ? (
            <View className="flex-row gap-2">
              <Button
                label="Save"
                onPress={handleUpdate}
                loading={updateMutation.isPending}
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
              loading={addMutation.isPending}
              style={{ width: 80 }}
            />
          )}
        </View>
      </Card>

      {isLoading ? (
        <SkeletonLoader rows={5} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item: any) => String(item.bloodGroupID)}
          renderItem={({ item }: { item: any }) => (
            <MobileDataCard
              title={item.bloodGroupName}
              subtitle={item.isActive ? "Active" : "Inactive"}
              icon={<IconCircle name="warning" size={40} iconSize={20} />}
              actions={
                <View className="flex-row gap-2 ml-auto">
                  <TouchableOpacity 
                    onPress={() => startEdit(item)}
                    className="bg-blue-50 p-2 rounded-lg"
                  >
                    <AppIcon name="edit" size={18} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDelete(item.bloodGroupID)}
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
