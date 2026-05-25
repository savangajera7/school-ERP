import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, Alert } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { useGetApiExamGetExamList, useDeleteApiExamDeleteExam } from "@/api/generated/exam/exam";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { PremiumSearchField } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";

export default function AdminExamsManagementScreen() {
  const { isMobile } = useResponsive();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useGetApiExamGetExamList();
  const deleteExam = useDeleteApiExamDeleteExam();

  const exams = useMemo(() => {
    return parseApiList<any>(data?.data);
  }, [data]);

  const filteredExams = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return exams;
    return exams.filter((e) => {
      const name = (e.examName || "").toLowerCase();
      return (
        name.includes(q) ||
        (e.examCode || "").toLowerCase().includes(q) ||
        (e.className || "").toLowerCase().includes(q)
      );
    });
  }, [exams, searchQuery]);

  const handleDelete = (exam: any) => {
    Alert.alert(
      "Delete Exam",
      `Are you sure you want to remove "${exam.examName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteExam.mutateAsync({ 
                data: { examID: exam.examID } 
              });
              refetch();
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete exam");
            }
          }
        }
      ]
    );
  };

  const renderExamItem = ({ item }: { item: any }) => {
    return (
      <MobileDataCard
        title={item.examName || "Untitled Exam"}
        subtitle={item.examCode || "No Code"}
        accentColor={Colors.accent}
        icon={<IconCircle name="exams" size={44} iconSize={22} />}
        fields={[
          { label: "Class", value: item.className || "All Classes" },
          { label: "Date", value: item.examDate ? String(item.examDate).slice(0, 10) : "TBA" },
          { label: "Status", value: item.status || "Upcoming", highlight: "warning" },
        ]}
        actions={
          <View className="flex-row gap-2 ml-auto">
            <TouchableOpacity 
              onPress={() => router.push(`/(admin)/exam-form?id=${item.examID}`)}
              className="bg-blue-50 p-2 rounded-lg"
            >
              <AppIcon name="edit" size={18} color="#3B82F6" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleDelete(item)}
              className="bg-red-50 p-2 rounded-lg"
            >
              <AppIcon name="delete" size={18} color="#EF4444" />
            </TouchableOpacity>
          </View>
        }
      />
    );
  };

  return (
    <PremiumScreenLayout
      title="Examinations"
      subtitle="Schedule & results management"
      scrollable={false}
      showTopBar
      rightAction={
        <HeaderActionButton
          label="+ Create Exam"
          shortLabel="+ Add"
          onPress={() => router.push("/(admin)/exam-form")}
        />
      }
    >
      <PremiumSearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search exam name or code..."
        onClear={() => setSearchQuery("")}
      />

      {isLoading ? (
        <SkeletonLoader rows={5} />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Could not load exams"}
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={filteredExams}
          renderItem={renderExamItem}
          keyExtractor={(item) => String(item.examID)}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <EmptyState
              icon="exams"
              title="No exams found"
              message={searchQuery ? "Try a different search" : "No exams scheduled yet"}
            />
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </PremiumScreenLayout>
  );
}
