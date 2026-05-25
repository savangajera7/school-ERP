import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { 
  useGetApiBloodGroupGet, 
  usePostApiBloodGroupAdd,
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
  const { data, isLoading, refetch } = useGetApiBloodGroupGet();
  const addMutation = usePostApiBloodGroupAdd();
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
      subtitle="Manage student medical data"
      onBack={() => router.back()}
      scrollable={false}
    >
      <Card className="p-4 mb-6" style={premiumCardShadow}>
        <View className="flex-row gap-3">
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="e.g. A+"
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
          keyExtractor={(item: any) => String(item.bloodGroupID)}
          renderItem={({ item }: { item: any }) => (
            <MobileDataCard
              title={item.bloodGroupName}
              subtitle={item.isActive ? "Active" : "Inactive"}
              icon={<IconCircle name="warning" size={40} iconSize={20} />}
              actions={
                <TouchableOpacity 
                  onPress={() => handleDelete(item.bloodGroupID)}
                  className="bg-red-50 p-2 rounded-lg ml-auto"
                >
                  <AppIcon name="delete" size={18} color="#EF4444" />
                </TouchableOpacity>
              }
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </PremiumScreenLayout>
  );
}
