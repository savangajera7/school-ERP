import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, TextInput, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import type { StudentModel } from "@/api/model/studentModel";
import { useGetApiStudentGet, useDeleteApiStudentDeleteId } from "@/api/generated/3-student-crud/3-student-crud";
import { useGetApiClassGet } from "@/api/generated/master-class/master-class";
import { parseApiList } from "@/utils/apiResponse";
import { normalizeStudent, getStudentDisplayName, formatOptional } from "@/utils/studentUtils";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { GenderIcon } from "@/components/icons/AppIcon";
import { usePermissions } from "@/hooks/usePermissions";
import { ResponsiveDataList, EntityActionButtons, type TableColumn } from "@/components/shared";
import { customInstance } from "@/services/api/axiosInstance";

export default function AdminStudentManagementScreen() {
  const { canManageStudents } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const { data: classData } = useGetApiClassGet();
  const classes = useMemo(() => parseApiList<any>(classData?.data), [classData]);

  const { data, isLoading, isError, error, refetch } = useGetApiStudentGet();
  
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentModel | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

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
    let filtered = students;
    
    if (selectedClassId) {
      filtered = filtered.filter(s => s.classID === selectedClassId || Number(s.classID) === selectedClassId);
    }
    
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      filtered = filtered.filter((student) => {
        const name = getStudentDisplayName(student).toLowerCase();
        return (
          name.includes(q) ||
          formatOptional(student.rollNo, "").toLowerCase().includes(q) ||
          formatOptional(student.studentGRNo, "").toLowerCase().includes(q)
        );
      });
    }

    // Sort by roll number numerically
    return filtered.sort((a, b) => {
      const rollA = parseInt(a.rollNo || "0") || 0;
      const rollB = parseInt(b.rollNo || "0") || 0;
      return rollA - rollB;
    });
  }, [students, searchQuery, selectedClassId]);

  const handleDeleteClick = (student: StudentModel) => {
    if (!student.studentID) return;
    setStudentToDelete(student);
    setDeleteReason("");
    setDeleteModalVisible(true);
  };

  const executeDelete = async () => {
    if (!studentToDelete?.studentID) return;
    if (!deleteReason.trim()) {
      Alert.alert("Missing Reason", "Please provide a valid reason for deleting this student.");
      return;
    }

    setIsDeleting(true);
    try {
      await customInstance(`/api/Student/Delete/${studentToDelete.studentID}?reason=${encodeURIComponent(deleteReason.trim())}`, { method: "DELETE" });
      setDeleteModalVisible(false);
      refetch();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to delete student");
    } finally {
      setIsDeleting(false);
    }
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
          onDelete={() => handleDeleteClick(s)}
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
            onDelete={() => handleDeleteClick(item)}
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
      <View className="bg-white px-4 py-2 border-b border-gray-100">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <TouchableOpacity
            onPress={() => setSelectedClassId(null)}
            className={`px-4 py-2 rounded-full border ${selectedClassId === null ? "bg-blue-600 border-blue-600" : "bg-gray-50 border-gray-200"}`}
          >
            <Text className={`text-xs font-bold ${selectedClassId === null ? "text-white" : "text-gray-600"}`}>All Classes</Text>
          </TouchableOpacity>
          {classes.map((cls) => (
            <TouchableOpacity
              key={cls.classID}
              onPress={() => setSelectedClassId(cls.classID)}
              className={`px-4 py-2 rounded-full border ${selectedClassId === cls.classID ? "bg-blue-600 border-blue-600" : "bg-gray-50 border-gray-200"}`}
            >
              <Text className={`text-xs font-bold ${selectedClassId === cls.classID ? "text-white" : "text-gray-600"}`}>
                Class {cls.className}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
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

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={StyleSheet.absoluteFill} className="bg-black/50 items-center justify-center p-4">
          <View className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl">
            <Text className="text-lg font-black text-gray-900 mb-2">Delete Student</Text>
            <Text className="text-sm font-semibold text-gray-600 mb-4">
              Are you sure you want to remove {studentToDelete ? getStudentDisplayName(studentToDelete) : ""}? Please provide a reason below.
            </Text>
            
            <TextInput
              value={deleteReason}
              onChangeText={setDeleteReason}
              placeholder="Reason for deletion..."
              className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 min-h-[80px] text-sm font-semibold text-gray-800 mb-6"
              multiline
              textAlignVertical="top"
            />
            
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 py-3 rounded-xl items-center justify-center"
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text className="font-bold text-gray-700">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-red-600 py-3 rounded-xl items-center flex-row justify-center gap-2"
                onPress={executeDelete}
                disabled={isDeleting}
              >
                {isDeleting && <ActivityIndicator size="small" color="white" />}
                <Text className="font-bold text-white">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
