import React, { useState } from "react";
import { View, Text, FlatList, TextInput, TouchableOpacity, Platform, ActivityIndicator } from "react-native";
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
import { useToast } from "@/components/ui/Toast";

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
  const { showToast } = useToast();

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
      showToast(`${entityName} added successfully`, "success");
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
      showToast(`${entityName} updated successfully`, "success");
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
      showToast(`${entityName} deleted successfully`, "success");
      refetch();
    } catch (error: any) {
      await alert("Error", error.message || `Failed to delete ${entityName}`, "error");
    }
  };

  return (
    <PremiumScreenLayout
      title={title}
      subtitle={subtitle}
      scrollable={false}
      fullWidth
      hideBack={Platform.OS === "web"}
    >
      <View 
        className="bg-[#1e293b] p-4 mb-4 rounded-2xl border border-slate-700 mx-4 mt-3 shadow-lg"
      >
        <View className="flex-row gap-2">
          <TextInput
            value={inputValue}
            onChangeText={setInputValue}
            placeholder={placeholder}
            placeholderTextColor="#94a3b8"
            className="flex-1 h-[46px] bg-slate-800 border border-slate-700 rounded-xl px-4 text-sm font-black text-white"
          />
          {editingItem ? (
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleUpdate}
                disabled={updateMutation.isPending}
                className="bg-emerald-600 h-[46px] px-4 items-center justify-center rounded-xl"
              >
                {updateMutation.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white font-black uppercase text-[10px]">Save</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={cancelEdit}
                className="bg-slate-700 h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-600"
              >
                <AppIcon name="close" size={18} color="#94a3b8" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handleAdd}
              disabled={addMutation.isPending}
              className="bg-indigo-600 h-[46px] px-5 items-center justify-center rounded-xl"
            >
              {addMutation.isPending ? <ActivityIndicator size="small" color="#fff" /> : <Text className="text-white font-black uppercase text-[10px]">Add</Text>}
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <SkeletonLoader rows={5} />
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item: any) => String(item[idField])}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 100 }}
          renderItem={({ item }: { item: any }) => (
            <MobileDataCard
              title={item[nameField]}
              subtitle={getSubtitle(item)}
              icon={<AppIcon name={iconName} size={20} color="#f5921e" />}
              noAccent
              actions={
                <View className="flex-row gap-2">
                  <TouchableOpacity
                    onPress={() => startEdit(item)}
                    className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 items-center justify-center"
                  >
                    <AppIcon name="edit" size={16} color="#818cf8" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDelete(item[idField])}
                    className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 items-center justify-center"
                  >
                    <AppIcon name="delete" size={16} color="#fb7185" />
                  </TouchableOpacity>
                </View>
              }
            />
          )}
        />
      )}
    </PremiumScreenLayout>
  );
}

