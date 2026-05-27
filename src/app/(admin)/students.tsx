import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import type { StudentModel } from "@/api/model/studentModel";
import { useGetApiStudentGet, useDeleteApiStudentDeleteId } from "@/api/generated/3-student-crud/3-student-crud";
import { parseApiList } from "@/utils/apiResponse";
import { normalizeStudent, getStudentDisplayName, formatOptional } from "@/utils/studentUtils";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { GenderIcon } from "@/components/icons/AppIcon";
import { usePermissions } from "@/hooks/usePermissions";
import { ResponsiveDataList, EntityActionButtons, type TableColumn } from "@/components/shared";

export default function AdminStudentManagementScreen() {
  const { canManageStudents } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useGetApiStudentGet();
  const deleteStudent = useDeleteApiStudentDeleteId();

  const students = useMemo(() => {
    const raw = parseApiList<Record<string, unknown>>(data?.data);
    return raw
      .map(normalizeStudent)
      .filter(
        (s) =>
          s.studentID != null ||
          s.studentGRNo ||
          s.rollNo ||
          s.firstName ||
          s.studentDisplayName
      );
  }, [data]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;
    return students.filter((student) => {
      const name = getStudentDisplayName(student).toLowerCase();
      return (
        name.includes(q) ||
        formatOptional(student.rollNo, "").toLowerCase().includes(q) ||
        formatOptional(student.studentGRNo, "").toLowerCase().includes(q)
      );
    });
  }, [students, searchQuery]);

  const handleDelete = (student: StudentModel) => {
    if (!student.studentID) return;
    Alert.alert(
      "Delete Student",
      `Are you sure you want to remove ${getStudentDisplayName(student)}?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await deleteStudent.mutateAsync({ id: student.studentID! });
              refetch();
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete student");
            }
          }
        }
      ]
    );
  };

  const tableColumns: TableColumn<StudentModel>[] = [
    { key: "studentGRNo", header: "GR No", width: 80 },
    { key: "rollNo", header: "Roll", width: 60, align: "center" },
    { 
      key: "name", 
      header: "Student Name", 
      flex: 2, 
      render: (s) => (
        <View className="flex-row items-center gap-2">
          <GenderIcon gender={s.gender} size={16} />
          <Text className="text-sm font-bold text-gray-800">{getStudentDisplayName(s)}</Text>
        </View>
      )
    },
    { 
      key: "class", 
      header: "Class", 
      flex: 1, 
      render: (s) => (
        <Text className="text-sm font-semibold text-gray-600">
          {formatOptional(s.classID)} - {formatOptional(s.sectionID)}
        </Text>
      )
    },
    { 
      key: "status", 
      header: "Status", 
      width: 80, 
      align: "center", 
      render: (s) => (
        <View className="px-2 py-1 bg-green-50 rounded-md border border-green-100">
          <Text className="text-[10px] font-bold text-green-700">{formatOptional(s.status, "Active")}</Text>
        </View>
      )
    },
    { 
      key: "actions", 
      header: "Actions", 
      width: 100, 
      align: "right", 
      render: (s) => (
        <EntityActionButtons 
          onEdit={() => router.push(`/(app)/admission-form?id=${s.studentID}`)}
          onDelete={() => handleDelete(s)}
        />
      )
    }
  ];

  const renderStudentItemMobile = (item: StudentModel) => {
    const fullName = getStudentDisplayName(item);
    const studentId = item.studentID;
    return (
      <MobileDataCard
        title={fullName}
        subtitle={`GR No: ${formatOptional(item.studentGRNo)}`}
        accentColor={Colors.primary}
        icon={
          <View style={styles.avatarBox}>
            <GenderIcon gender={item.gender} size={22} />
          </View>
        }
        badge={
          <View style={styles.rollBadge}>
            <Text style={styles.rollBadgeText}>
              Roll: {formatOptional(item.rollNo)}
            </Text>
          </View>
        }
        fields={[
          { label: "Class", value: formatOptional(item.classID) },
          { label: "Section", value: formatOptional(item.sectionID) },
          { label: "Status", value: formatOptional(item.status, "Active"), highlight: "success" },
        ]}
        onPress={() => {
          if (studentId == null) return;
          router.push({
            pathname: "/(app)/student-profile",
            params: { id: String(studentId) },
          });
        }}
        actions={
          <EntityActionButtons 
            onEdit={() => router.push(`/(app)/admission-form?id=${studentId}`)}
            onDelete={() => handleDelete(item)}
          />
        }
      />
    );
  };

  return (
    <PremiumScreenLayout
      title="Students"
      subtitle="Manage school enrollment"
      scrollable={false}
      flatHeader
    >
      <ResponsiveDataList
        data={filteredStudents}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRefresh={refetch}
        renderCard={renderStudentItemMobile}
        tableColumns={tableColumns}
        keyExtractor={(item) => String(item.studentID)}
        emptyIcon="students"
        emptyTitle="No students found"
        emptyMessage={searchQuery ? "Try a different search" : "Register your first student"}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, GR No, or Roll..."
      />
    </PremiumScreenLayout>
  );
}

const styles = StyleSheet.create({
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  rollBadge: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FFEDD5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rollBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#9A3412",
  },
});
