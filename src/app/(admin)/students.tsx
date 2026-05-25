import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Alert } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import type { StudentModel } from "@/api/model/studentModel";
import { useGetApiStudentGet, useDeleteApiStudentDeleteId } from "@/api/generated/3-student-crud/3-student-crud";
import { parseApiList } from "@/utils/apiResponse";
import { normalizeStudent, getStudentDisplayName, formatOptional } from "@/utils/studentUtils";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { PremiumSearchField } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { Card } from "@/components/ui/Card";
import { AppIcon, GenderIcon } from "@/components/icons/AppIcon";
import { EmptyState, ErrorState } from "@/components/ui/EmptyState";
import { usePermissions } from "@/hooks/usePermissions";

export default function AdminStudentManagementScreen() {
  const { isMobile } = useResponsive();
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

  const renderStudentItemMobile = ({ item }: { item: StudentModel }) => {
    const fullName = getStudentDisplayName(item);
    const studentId = item.studentID;
    return (
      <MobileDataCard
        title={fullName}
        subtitle={`GR No: ${formatOptional(item.studentGRNo)}`}
        accentColor={Colors.accent}
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
          <View className="flex-row gap-2 ml-auto">
            <TouchableOpacity 
              onPress={() => router.push(`/(app)/admission-form?id=${studentId}`)}
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
      title="Students"
      subtitle="Manage school enrollment"
      scrollable={false}
      showTopBar
      rightAction={
        canManageStudents ? (
          <HeaderActionButton
            label="+ New Student"
            shortLabel="+ New"
            onPress={() => router.push("/(app)/admission-form")}
          />
        ) : undefined
      }
    >
      <PremiumSearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search students..."
        onClear={() => setSearchQuery("")}
      />

      {isLoading ? (
        <SkeletonLoader rows={5} />
      ) : isError ? (
        <ErrorState
          message={error instanceof Error ? error.message : "Could not load students"}
          onRetry={refetch}
        />
      ) : (
        <FlatList
          data={filteredStudents}
          renderItem={renderStudentItemMobile}
          keyExtractor={(item, index) => String(item.studentID ?? index)}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <EmptyState
              icon="students"
              title="No students found"
              message={searchQuery ? "Try a different search" : "Register your first student"}
            />
          }
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}
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
