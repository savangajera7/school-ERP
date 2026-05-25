import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { 
  useGetApiReligionGet, 
  usePostApiReligionAdd,
  usePutApiReligionUpdate,
  useDeleteApiReligionDeleteId 
} from "@/api/generated/2-master-religion/2-master-religion";
import { parseApiList } from "@/utils/apiResponse";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { MobileDataCard } from "@/components/ui/MobileDataCard";

export default function ReligionScreen() {
  const [newName, setNewName] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data, isLoading, refetch } = useGetApiReligionGet();
  const addMutation = usePostApiReligionAdd();
  const updateMutation = usePutApiReligionUpdate();
  const deleteMutation = useDeleteApiReligionDeleteId();

  const items = parseApiList(data?.data);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await addMutation.mutateAsync({
        data: { religionName: newName, isActive: true }
      });
      setNewName("");
      refetch();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add religion");
    }
  };

  const handleUpdate = async () => {
    if (!newName.trim() || !editingItem) return;
    try {
      await updateMutation.mutateAsync({
        data: { 
          ...editingItem,
          religionName: newName 
        }
      });
      setNewName("");
      setEditingItem(null);
      refetch();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to update religion");
    }
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setNewName(item.religionName);
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
      title="Religions"
      subtitle="Manage student demographic data"
      onBack={() => router.back()}
      scrollable={false}
    >
      <Card className="p-4 mb-6" style={premiumCardShadow}>
        <View className="flex-row gap-3">
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="e.g. Hindu"
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
          keyExtractor={(item: any) => String(item.religionID)}
          renderItem={({ item }: { item: any }) => (
            <MobileDataCard
              title={item.religionName}
              subtitle={item.isActive ? "Active" : "Inactive"}
              icon={<IconCircle name="language" size={40} iconSize={20} />}
              actions={
                <View className="flex-row gap-2 ml-auto">
                  <TouchableOpacity 
                    onPress={() => startEdit(item)}
                    className="bg-blue-50 p-2 rounded-lg"
                  >
                    <AppIcon name="edit" size={18} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => handleDelete(item.religionID)}
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
