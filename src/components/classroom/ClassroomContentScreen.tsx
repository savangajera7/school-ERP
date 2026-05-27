import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, TextInput } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useClassroomContentList, useInsertClassroomContent, buildContentTitle } from "@/services/classroom/contentService";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ui/Toast";
import { Card } from "@/components/ui/Card";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconCircle } from "@/components/icons/AppIcon";
import type { AppIconName } from "@/constants/appIcons";

export interface ClassroomContentScreenProps {
  /** The content type kind */
  kind: "HOMEWORK" | "CLASSWORK" | "NOTEBOOK";
  /** Page header title */
  title: string;
  /** Page header subtitle */
  subtitle: string;
  /** Theme color for cards left border and buttons */
  accentColor: string;
  /** Icon to show for content list items */
  iconName: AppIconName;
}

/**
 * Parameterized generic screen component for Classroom Content management (Homework/Classwork/Notebook).
 * Standardizes layout, forms, loaders, toasts, and mutations.
 */
export default function ClassroomContentScreen({
  kind,
  title: pageTitle,
  subtitle,
  accentColor,
  iconName,
}: ClassroomContentScreenProps) {
  const { items, isLoading, refetch } = useClassroomContentList(kind);
  const insertContent = useInsertClassroomContent();
  const { userData } = useAuthStore();
  const { showToast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = async () => {
    if (!title.trim() || !description.trim()) {
      showToast("Please fill all fields", "error");
      return;
    }

    try {
      await insertContent.mutateAsync({
        data: {
          noticeTitle: buildContentTitle(kind, title),
          noticeDescription: description,
          noticeFor: "Class",
          addedBy: parseInt(userData?.id ?? "0"),
        },
      });
      showToast(`${pageTitle} added successfully`, "success");
      setIsAdding(false);
      setTitle("");
      setDescription("");
      refetch();
    } catch (error) {
      showToast(`Failed to add ${pageTitle.toLowerCase()}`, "error");
    }
  };

  return (
    <PremiumScreenLayout
      title={pageTitle}
      subtitle={subtitle}
      onBack={() => router.push("/(teacher)/dashboard")}
      scrollable={false}
      rightAction={
        <TouchableOpacity
          onPress={() => setIsAdding(!isAdding)}
          className="px-4 py-2 rounded-xl"
          style={{ backgroundColor: isAdding ? "#EF4444" : accentColor }}
        >
          <Text className="text-white font-bold text-xs uppercase">
            {isAdding ? "Cancel" : "Add New"}
          </Text>
        </TouchableOpacity>
      }
    >
      {isAdding && (
        <Card className="p-4 mb-6">
          <Text className="text-[12px] font-black text-gray-400 mb-2 uppercase">
            New {pageTitle}
          </Text>
          <TextInput
            placeholder="Subject / Title"
            value={title}
            onChangeText={setTitle}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-3 font-bold text-gray-800"
          />
          <TextInput
            placeholder="Instructions / Description"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 font-semibold text-gray-800 min-h-[100px]"
          />
          <TouchableOpacity
            onPress={handleAdd}
            disabled={insertContent.isPending}
            className="py-3 rounded-xl items-center"
            style={{ backgroundColor: accentColor }}
          >
            <Text className="text-white font-black uppercase">
              {insertContent.isPending ? "Posting..." : `Post ${pageTitle}`}
            </Text>
          </TouchableOpacity>
        </Card>
      )}

      {isLoading ? (
        <SkeletonLoader rows={4} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState
              title={`No ${pageTitle.toLowerCase()} found`}
              message="Assignments will appear here"
            />
          }
          renderItem={({ item }) => (
            <Card
              className="mb-4 p-4 border-l-4"
              style={{ borderLeftColor: accentColor }}
            >
              <View className="flex-row justify-between items-start mb-2">
                <View className="flex-1 mr-4">
                  <Text className="text-[16px] font-black text-gray-900">
                    {item.title}
                  </Text>
                  <Text className="text-[10px] text-gray-400 font-bold mt-0.5">
                    {item.date}
                  </Text>
                </View>
                <IconCircle name={iconName} size={32} iconSize={16} />
              </View>
              <Text className="text-sm text-gray-600 leading-relaxed font-medium">
                {item.body}
              </Text>
            </Card>
          )}
        />
      )}
    </PremiumScreenLayout>
  );
}
