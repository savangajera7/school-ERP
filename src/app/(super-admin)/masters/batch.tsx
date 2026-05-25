import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { 
  useGetApiBatchGet, 
  usePostApiBatchAdd,
  useDeleteApiBatchDeleteId 
} from "@/api/generated/2-master-batch/2-master-batch";
import { parseApiList } from "@/utils/apiResponse";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

export default function BatchScreen() {
  const [newName, setNewName] = useState("");
  const { data, isLoading, refetch } = useGetApiBatchGet();
  const addMutation = usePostApiBatchAdd();
  const deleteMutation = useDeleteApiBatchDeleteId();

  const items = parseApiList(data?.data);

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      await addMutation.mutateAsync({
        data: { batchName: newName, isActive: true }
      });
      setNewName("");
      refetch();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to add batch");
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
      title="Batches"
      subtitle="Manage student batches"
      onBack={() => router.back()}
      scrollable={false}
    >
      <Card className="p-4 mb-6">
        <View className="flex-row gap-3">
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="e.g. Morning"
            className="flex-1 h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
          />
          <Button
            label="Add"
            onPress={handleAdd}
            loading={addMutation.isPending}
            style={{ width: 80 }}
          />
        </View>
      </Card>

      {isLoading ? (
        <SkeletonLoader rows={5} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item: any) => String(item.batchID)}
          renderItem={({ item }: { item: any }) => (
            <View className="flex-row items-center justify-between bg-white p-4 rounded-2xl mb-3 border border-gray-100">
              <Text className="text-sm font-bold text-gray-800">{item.batchName}</Text>
              <TouchableOpacity onPress={() => handleDelete(item.batchID)}>
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
