import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import { useGetApiTeacherGetTeacherList, useDeleteApiTeacherDeleteTeacher } from "@/api/generated/teacher/teacher";
import { parseApiList } from "@/utils/apiResponse";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { IconCircle } from "@/components/icons/AppIcon";
import { usePermissions } from "@/hooks/usePermissions";
import { ResponsiveDataList, EntityActionButtons, type TableColumn } from "@/components/shared";

export default function AdminTeacherManagementScreen() {
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

  const tableColumns: TableColumn<any>[] = [
    { key: "teacherCode", header: "Code", width: 80 },
    { 
      key: "name", 
      header: "Teacher Name", 
      flex: 2, 
      render: (t) => (
        <View className="flex-row items-center gap-2">
          <IconCircle name="teachers" size={24} iconSize={14} />
          <Text className="text-sm font-bold text-gray-800">{`${t.firstName} ${t.lastName}`}</Text>
        </View>
      )
    },
    { key: "subjectName", header: "Subject", flex: 1 },
    { key: "mobileNo", header: "Phone", width: 120 },
    { 
      key: "experienceYear", 
      header: "Experience", 
      width: 100, 
      align: "center",
      render: (t) => <Text className="text-sm text-gray-600">{t.experienceYear || 0} yrs</Text>
    },
    { 
      key: "actions", 
      header: "Actions", 
      width: 100, 
      align: "right", 
      render: (t) => (
        <EntityActionButtons 
          onEdit={() => router.push(`/(admin)/teacher-form?id=${t.teacherID}`)}
          onDelete={() => handleDelete(t)}
        />
      )
    }
  ];

  const renderTeacherItem = (item: any) => {
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
          <EntityActionButtons 
            onEdit={() => router.push(`/(admin)/teacher-form?id=${item.teacherID}`)}
            onDelete={() => handleDelete(item)}
          />
        }
      />
    );
  };

  return (
    <PremiumScreenLayout
      title="Teachers"
      subtitle="Manage school faculty"
      scrollable={false}
      flatHeader
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
      <ResponsiveDataList
        data={filteredTeachers}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRefresh={refetch}
        renderCard={renderTeacherItem}
        tableColumns={tableColumns}
        keyExtractor={(item) => String(item.teacherID)}
        emptyIcon="teachers"
        emptyTitle="No teachers found"
        emptyMessage={searchQuery ? "Try a different search" : "Register your first teacher"}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, code, or subject..."
      />
    </PremiumScreenLayout>
  );
}
