import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Platform } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { ResponsiveDataList } from "@/components/shared/ResponsiveDataList";
import { FormLayout } from "@/components/layout/FormLayout";
import { IconButton } from "@/components/ui/IconButton";
import { Switch } from "react-native";
import { useDebounce } from "@/hooks/useDebounce";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { parseApiList } from "@/utils/apiResponse";
import type { AppIconName } from "@/constants/appIcons";
import { useAuthStore } from "@/store/authStore";
import { useDialog } from "@/components/ui/AppDialog";

export interface MasterCrudScreenProps {
  title: string;
  subtitle: string;
  entityName: string;
  idField: string;
  nameField: string;
  placeholder: string;
  iconName: AppIconName;
  useGetList: () => { data: any; isLoading: boolean; refetch: () => any };
  useAdd: () => { mutateAsync: (payload: { data: any }) => Promise<any>; isPending: boolean };
  useUpdate: () => { mutateAsync: (payload: { data: any }) => Promise<any>; isPending: boolean };
  useDelete: () => { mutateAsync: (payload: { id: number }) => Promise<any>; isPending: boolean };
  getSubtitle?: (item: any) => string;
}

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
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [editingItem, setEditingItem] = useState<any>(null);
  const { userData } = useAuthStore();
  const { alert, confirm } = useDialog();

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
  const filteredItems = React.useMemo(() => {
    if (!debouncedSearch) return items;
    return items.filter((item: any) => 
      String(item[nameField]).toLowerCase().includes(debouncedSearch.toLowerCase())
    );
  }, [items, debouncedSearch, nameField]);

  const assertSuccessfulMutation = (response: any, fallbackMessage: string) => {
    const body = response?.data ?? response;
    if (body?.success === false || body?.Success === false) {
      throw new Error(body.message ?? body.Message ?? fallbackMessage);
    }
  };

  const handleAdd = async () => {
    setHasSubmitted(true);
    if (!inputValue.trim()) return;
    try {
      const response = await addMutation.mutateAsync({
        data: {
          [nameField]: inputValue,
          isActive: isActive,
          createdBy: currentUserId,
          ...(currentSchoolId ? { schoolID: currentSchoolId } : {}),
        },
      });
      assertSuccessfulMutation(response, `Failed to add ${entityName}`);
      setInputValue("");
      setHasSubmitted(false);
      setIsActive(true);
      await alert("Success", `${entityName} added successfully.`, "success");
      refetch();
    } catch (error: any) {
      await alert("Error", error.message || `Failed to add ${entityName}`, "error");
    }
  };

  const handleUpdate = async () => {
    setHasSubmitted(true);
    if (!inputValue.trim() || !editingItem) return;
    try {
      const response = await updateMutation.mutateAsync({
        data: {
          ...editingItem,
          [nameField]: inputValue,
          isActive: isActive,
          createdBy: currentUserId,
          updatedBy: currentUserId,
          ...(currentSchoolId ? { schoolID: currentSchoolId } : {}),
        },
      });
      assertSuccessfulMutation(response, `Failed to update ${entityName}`);
      setInputValue("");
      setEditingItem(null);
      setHasSubmitted(false);
      setIsActive(true);
      await alert("Success", `${entityName} updated successfully.`, "success");
      refetch();
    } catch (error: any) {
      await alert("Error", error.message || `Failed to update ${entityName}`, "error");
    }
  };

  const startEdit = (item: any) => {
    setEditingItem(item);
    setInputValue(item[nameField]);
    setIsActive(item.isActive ?? true);
    setHasSubmitted(false);
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setInputValue("");
    setIsActive(true);
    setHasSubmitted(false);
  };

  const handleDelete = async (id: number) => {
    const ok = await confirm(
      `Delete ${entityName}`,
      `Are you sure you want to delete this ${entityName}? This cannot be undone.`,
      { confirmLabel: "Delete", destructive: true }
    );
    if (!ok) return;
    try {
      const response = await deleteMutation.mutateAsync({ id });
      assertSuccessfulMutation(response, `Failed to delete ${entityName}`);
      await alert("Success", `${entityName} deleted successfully.`, "success");
      refetch();
    } catch (error: any) {
      await alert("Error", error.message || `Failed to delete ${entityName}`, "error");
    }
  };

  return (
    <PremiumScreenLayout
      title={title}
      subtitle={subtitle}
      onBack={() => router.back()}
      scrollable={false}
      fullWidth
      hideBack={Platform.OS === "web"}
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
              icon={<AppIcon name={iconName} size={26} color="#134A8C" active />}
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
                    onPress={() => handleDelete(item[idField])}
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
