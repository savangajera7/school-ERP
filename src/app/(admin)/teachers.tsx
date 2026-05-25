import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { useGetApiTeacherGetTeacherList, useDeleteApiTeacherDeleteTeacher } from "@/api/generated/teacher/teacher";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { PremiumSearchField } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { usePermissions } from "@/hooks/usePermissions";

export default function AdminTeacherManagementScreen() {
  const { isMobile } = useResponsive();
  const { canManageTeachers } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useGetApiTeacherGetTeacherList();
  const deleteTeacher = useDeleteApiTeacherDeleteTeacher();

  const teachers = useMemo(() => {
    return parseApiList<any>(data?.data);
  }, [data]);

  const filteredTeachers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return teachers;
    return teachers.filter((t) => {
      const name = `${t.firstName} ${t.lastName}`.toLowerCase();
      return (
        name.includes(q) ||
        (t.teacherCode || "").toLowerCase().includes(q) ||
        (t.subjectName || "").toLowerCase().includes(q)
      );
    });
  }, [teachers, searchQuery]);

  const handleDelete = (teacher: any) => {
    Alert.alert(
      "Delete Teacher",
      `Are you sure you want to remove ${teacher.firstName} ${teacher.lastName}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTeacher.mutateAsync({ 
                data: { teacherID: teacher.teacherID } 
              });
              refetch();
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete teacher");
            }
          }
        }
      ]
    );
  };

  const renderTeacherItem = ({ item }: { item: any }) => {
    const fullName = `${item.firstName} ${item.lastName}`;
    return (
      <MobileDataCard
        title={fullName}
        subtitle={item.teacherCode || "No Code"}
        accentColor={Colors.primary}
        icon={<IconCircle name="teachers" size={44} iconSize={22} />}
        fields={[
          { label: "Subject", value: item.subjectName || "N/A" },
          { label: "Phone", value: item.mobileNo || "N/A" },
          { label: "Experience", value: `${item.experienceYear || 0} yrs` },
        ]}
        actions={
          <View className="flex-row gap-2 ml-auto">
            <TouchableOpacity 
              onPress={() => router.push(`/(admin)/teacher-form?id=${item.teacherID}`)}
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
      title="Teachers"
      subtitle="Manage school faculty"
      scrollable={false}
      showTopBar
      rightAction={
        canManageTeachers ? (
          <HeaderActionButton
            label="+ New Teacher"
            shortLabel="+ New"
            onPress={() => router.push("/(admin)/teacher-form")}
          />
        ) : undefined
      }
    >
      <PremiumSearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search teachers..."
        onClear={() => setSearchQuery("")}
      />

      {isLoading ? (
        <SkeletonLoader rows={5} />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Could not load teachers"}
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={filteredTeachers}
          renderItem={renderTeacherItem}
          keyExtractor={(item) => String(item.teacherID)}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <EmptyState
              icon="teachers"
              title="No teachers found"
              message={searchQuery ? "Try a different search" : "Register your first teacher"}
            />
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
    </PremiumScreenLayout>
  );
}
