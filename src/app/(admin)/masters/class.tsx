import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Platform, ScrollView } from "react-native";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useAuthStore } from "@/store/authStore";
import { useDialog } from "@/components/ui/AppDialog";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { parseApiList } from "@/utils/apiResponse";

import { 
  useGetApiClassGetClassList, 
  usePostApiClassAdd,
  usePutApiClassUpdate,
  useDeleteApiClassDeleteId 
} from "@/api/generated/master-class-medium-shift-1a-2b/master-class-medium-shift-1a-2b";

import { useGetApiMediumGet } from "@/api/generated/master-medium/master-medium";
import { useGetApiBatchGet } from "@/api/generated/2-master-batch/2-master-batch";

export default function ClassScreen() {
  const [inputValue, setInputValue] = useState("");
  const [mediumId, setMediumId] = useState<number | null>(null);
  const [batchId, setBatchId] = useState<number | null>(null);
  
  const [editingItem, setEditingItem] = useState<any>(null);
  const { userData } = useAuthStore();
  const { alert, confirm } = useDialog();

  const currentUserId = Number(userData?.id ?? (userData as any)?.userID) || 1;
  const currentSchoolId = Number(userData?.schoolID ?? (userData as any)?.schoolId) || undefined;

  const { data, isLoading, refetch } = useGetApiClassGetClassList();
  const addMutation = usePostApiClassAdd();
  const updateMutation = usePutApiClassUpdate();
  const deleteMutation = useDeleteApiClassDeleteId();

  const { data: mediumData } = useGetApiMediumGet();
  const { data: batchData } = useGetApiBatchGet();

  const items = parseApiList(data?.data);
  const mediums = parseApiList(mediumData?.data);
  const batches = parseApiList(batchData?.data);

  // Auto-select first medium & batch if available
  React.useEffect(() => {
    if (mediums.length > 0 && mediumId === null) setMediumId(mediums[0].mediumID as number);
  }, [mediums, mediumId]);

  React.useEffect(() => {
    if (batches.length > 0 && batchId === null) setBatchId(batches[0].batchID as number);
  }, [batches, batchId]);

  const assertSuccessfulMutation = (response: any, fallbackMessage: string) => {
    const body = response?.data ?? response;
    if (body?.success === false || body?.Success === false) {
      throw new Error(body.message ?? body.Message ?? fallbackMessage);
    }
  };

  const handleAdd = async () => {
    if (!inputValue.trim() || !mediumId || !batchId) {
      await alert("Error", "Please fill Name, Medium, and Batch.", "error");
      return;
    }
    try {
      const response = await addMutation.mutateAsync({
        data: {
          className: inputValue,
          mediumID: mediumId,
          batchID: batchId,
          isActive: true,
          createdBy: currentUserId,
          ...(currentSchoolId ? { schoolID: currentSchoolId } : {}),
        },
      });
      assertSuccessfulMutation(response, "Failed to add Class");
      setInputValue("");
      await alert("Success", "Class added successfully.", "success");
      refetch();
    } catch (error: any) {
      await alert("Error", error.message || "Failed to add Class", "error");
    }
  };

  const handleUpdate = async () => {
    if (!inputValue.trim() || !editingItem || !mediumId || !batchId) {
       await alert("Error", "Please fill Name, Medium, and Batch.", "error");
       return;
    }
    try {
      const response = await updateMutation.mutateAsync({
        data: {
          ...editingItem,
          className: inputValue,
          mediumID: mediumId,
          batchID: batchId,
          updatedBy: currentUserId,
          ...(currentSchoolId ? { schoolID: currentSchoolId } : {}),
        },
      });
      assertSuccessfulMutation(response, "Failed to update Class");
      setInputValue("");
      setEditingItem(null);
      await alert("Success", "Class updated successfully.", "success");
      refetch();
    } catch (error: any) {
      await alert("Error", error.message || "Failed to update Class", "error");
    }
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setInputValue(item.className);
    setMediumId(item.mediumID);
    setBatchId(item.batchID);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setInputValue("");
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm(
      "Delete Class",
      "Are you sure you want to delete this class?",
      { confirmLabel: "Delete", destructive: true }
    );
    if (!ok) return;
    try {
      const response = await deleteMutation.mutateAsync({ id });
      assertSuccessfulMutation(response, "Failed to delete Class");
      await alert("Success", "Class deleted successfully.", "success");
      refetch();
    } catch (error: any) {
      await alert("Error", error.message || "Failed to delete Class", "error");
    }
  };

  return (
    <PremiumScreenLayout
      title="Classes"
      subtitle="Manage school classes, mediums, and shifts"
      scrollable={false}
      fullWidth
      hideBack={Platform.OS === "web"}
    >
      <Card className="p-4 mb-6" style={premiumCardShadow}>
        <View className="flex-col gap-4">
          
          {/* Medium Selector */}
          <View>
            <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Medium</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {mediums.map((med: any) => (
                <TouchableOpacity
                  key={med.mediumID}
                  onPress={() => setMediumId(med.mediumID)}
                  className={`px-4 py-1.5 rounded-xl border flex-row items-center gap-1 ${mediumId === med.mediumID ? "bg-orange-50 border-orange-200" : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"}`}
                >
                  <Text className={`text-[11px] font-bold ${mediumId === med.mediumID ? "text-orange-700" : "text-gray-600 dark:text-slate-300"}`}>
                    {med.mediumName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Batch Selector */}
          <View>
            <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Batch / Shift</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {batches.map((batch: any) => (
                <TouchableOpacity
                  key={batch.batchID}
                  onPress={() => setBatchId(batch.batchID)}
                  className={`px-4 py-1.5 rounded-xl border flex-row items-center gap-1 ${batchId === batch.batchID ? "bg-emerald-50 border-emerald-200" : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"}`}
                >
                  <Text className={`text-[11px] font-bold ${batchId === batch.batchID ? "text-emerald-700" : "text-gray-600 dark:text-slate-300"}`}>
                    {batch.batchName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View className="flex-row gap-3 mt-2">
            <TextInput
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="e.g. Class 10"
              className="flex-1 h-[48px] bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl px-4 text-sm font-semibold text-gray-800 dark:text-slate-200"
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
                  className="bg-gray-100 dark:bg-slate-700 h-[48px] w-[48px] items-center justify-center rounded-xl"
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
        </View>
      </Card>

      {isLoading ? (
        <SkeletonLoader rows={5} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item: any) => String(item.classID)}
          renderItem={({ item }: { item: any }) => (
            <MobileDataCard
              title={item.className}
              subtitle={`${item.mediumName || "N/A"} - ${item.shiftName || "N/A"}`}
              icon={<AppIcon name="school" size={26} color="#134A8C" active />}
              noAccent
              actions={
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => startEdit(item)}
                    activeOpacity={0.7}
                    className="flex-row items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl"
                  >
                    <AppIcon name="edit" size={12} color="#4F46E5" />
                    <Text className="text-[10px] font-extrabold text-indigo-700 uppercase">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item.classID)}
                    activeOpacity={0.7}
                    className="flex-row items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl"
                  >
                    <AppIcon name="delete" size={12} color="#E11D48" />
                    <Text className="text-[10px] font-extrabold text-rose-700 uppercase">Delete</Text>
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
