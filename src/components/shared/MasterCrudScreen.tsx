import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { parseApiList } from "@/utils/apiResponse";
import type { AppIconName } from "@/constants/appIcons";
import { useAuthStore } from "@/store/authStore";

export interface MasterCrudScreenProps {
  /** Page title (e.g. "Classes") */
  title: string;
  /** Page subtitle (e.g. "Manage school classes") */
  subtitle: string;
  /** Human-readable entity name (e.g. "class") */
  entityName: string;
  /** Primary identifier key (e.g. "classID") */
  idField: string;
  /** Display label key (e.g. "className") */
  nameField: string;
  /** Input field placeholder (e.g. "e.g. Class 10") */
  placeholder: string;
  /** Left icon for list items */
  iconName: AppIconName;
  /** TanStack query hook to fetch list */
  useGetList: () => { data: any; isLoading: boolean; refetch: () => any };
  /** TanStack mutation hook to add entity */
  useAdd: () => { mutateAsync: (payload: { data: any }) => Promise<any>; isPending: boolean };
  /** TanStack mutation hook to update entity */
  useUpdate: () => { mutateAsync: (payload: { data: any }) => Promise<any>; isPending: boolean };
  /** TanStack mutation hook to delete entity by ID */
  useDelete: () => { mutateAsync: (payload: { id: number }) => Promise<any>; isPending: boolean };
  /** Optional custom subtitle mapping (e.g., active status display) */
  getSubtitle?: (item: any) => string;
}

/**
 * Standardized generic Master CRUD controller screen.
 * Consolidates layout, state, loading skeleton, form input, update modes,
 * and deletion confirmation prompts for all master lists.
 */
export function MasterCrudScreen({
  title,
  subtitle,
  entityName,
  idField,
  nameField,
  placeholder,
  iconName,
  useGetList,
  useAdd,
  useUpdate,
  useDelete,
  getSubtitle = (item) => (item.isActive ? "Active" : "Inactive"),
}: MasterCrudScreenProps) {
  const [inputValue, setInputValue] = useState("");
  const [editingItem, setEditingItem] = useState<any>(null);
  const { userData } = useAuthStore();
  const currentUserId =
    Number(userData?.id ?? (userData as any)?.userID ?? (userData as any)?.UserID) || 1;
  const currentSchoolId =
    Number(userData?.schoolID ?? (userData as any)?.schoolId ?? (userData as any)?.SchoolID) ||
    undefined;

  const { data, isLoading, refetch } = useGetList();
  const addMutation = useAdd();
  const updateMutation = useUpdate();
  const deleteMutation = useDelete();

  const items = parseApiList(data?.data);

  const assertSuccessfulMutation = (response: any, fallbackMessage: string) => {
    const body = response?.data ?? response;
    if (body?.success === false || body?.Success === false) {
      throw new Error(body.message ?? body.Message ?? fallbackMessage);
    }
  };

  const handleAdd = async () => {
    if (!inputValue.trim()) return;
    try {
      const response = await addMutation.mutateAsync({
        data: {
          [nameField]: inputValue,
          isActive: true,
          createdBy: currentUserId,
          ...(currentSchoolId ? { schoolID: currentSchoolId } : {}),
        },
      });
      assertSuccessfulMutation(response, `Failed to add ${entityName}`);
      setInputValue("");
      refetch();
    } catch (error: any) {
      Alert.alert("Error", error.message || `Failed to add ${entityName}`);
    }
  };

  const handleUpdate = async () => {
    if (!inputValue.trim() || !editingItem) return;
    try {
      const response = await updateMutation.mutateAsync({
        data: {
          ...editingItem,
          [nameField]: inputValue,
          createdBy: currentUserId,
          updatedBy: currentUserId,
          ...(currentSchoolId ? { schoolID: currentSchoolId } : {}),
        },
      });
      assertSuccessfulMutation(response, `Failed to update ${entityName}`);
      setInputValue("");
      setEditingItem(null);
      refetch();
    } catch (error: any) {
      Alert.alert("Error", error.message || `Failed to update ${entityName}`);
    }
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setInputValue(item[nameField]);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setInputValue("");
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete", `Are you sure you want to delete this ${entityName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await deleteMutation.mutateAsync({ id });
            assertSuccessfulMutation(response, `Failed to delete ${entityName}`);
            refetch();
          } catch (error: any) {
            Alert.alert("Error", error.message || `Failed to delete ${entityName}`);
          }
        },
      },
    ]);
  };

  return (
    <PremiumScreenLayout
      title={title}
      subtitle={subtitle}
      onBack={() => router.back()}
      scrollable={false}
      flatHeader
    >
      <Card className="p-4 mb-6" style={premiumCardShadow}>
        <View className="flex-row gap-3">
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={placeholder}
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
          keyExtractor={(item: any) => String(item[idField])}
          renderItem={({ item }: { item: any }) => (
            <MobileDataCard
              title={item[nameField]}
              subtitle={getSubtitle(item)}
              icon={<IconCircle name={iconName} size={40} iconSize={20} />}
              actions={
                <View className="flex-row gap-2 ml-auto">
                  <TouchableOpacity
                    onPress={() => startEdit(item)}
                    className="bg-blue-50 p-2 rounded-lg"
                  >
                    <AppIcon name="edit" size={18} color="#3B82F6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item[idField])}
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
