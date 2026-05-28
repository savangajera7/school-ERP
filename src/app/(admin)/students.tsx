import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, TextInput, ActivityIndicator, Image } from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import type { StudentModel } from "@/api/model/studentModel";
import { useGetApiStudentGet, useDeleteApiStudentDeleteId } from "@/api/generated/3-student-crud/3-student-crud";
import { useGetApiClassGet } from "@/api/generated/master-class/master-class";
import { useGetApiBatchGet } from "@/api/generated/2-master-batch/2-master-batch";
import { parseApiList } from "@/utils/apiResponse";
import { normalizeStudent, getStudentDisplayName, formatOptional } from "@/utils/studentUtils";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { GenderIcon, AppIcon } from "@/components/icons/AppIcon";
import { usePermissions } from "@/hooks/usePermissions";
import { ResponsiveDataList, EntityActionButtons, type TableColumn } from "@/components/shared";
import { customInstance } from "@/services/api/axiosInstance";

export default function AdminStudentManagementScreen() {
  const { canManageStudents } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [selectedMedium, setSelectedMedium] = useState<string | null>(null);

  const { data: classData } = useGetApiClassGet();
  const classes = useMemo(() => parseApiList<any>(classData?.data), [classData]);

  const { data: batchData } = useGetApiBatchGet();
  const batches = useMemo(() => parseApiList<any>(batchData?.data), [batchData]);

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

  const uniqueMediums = useMemo(() => {
    const types = new Set(students.map(s => s.lastSchoolType).filter(Boolean));
    return Array.from(types).map((name) => String(name));
  }, [students]);

  const filteredStudents = useMemo(() => {
    let filtered = students;
    
    if (selectedClassId) {
      filtered = filtered.filter(s => s.classID === selectedClassId || Number(s.classID) === selectedClassId);
    }

    if (selectedBatchId) {
      filtered = filtered.filter(s => s.batchID === selectedBatchId || Number(s.batchID) === selectedBatchId);
    }

    if (selectedMedium) {
      filtered = filtered.filter(s => s.lastSchoolType === selectedMedium);
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
          {s.studentPhoto ? (
            <Image source={{ uri: s.studentPhoto }} className="w-6 h-6 rounded-full" />
          ) : (
            <GenderIcon gender={s.gender} size={16} />
          )}
          <View>
            <Text className="text-sm font-bold text-gray-800">{getStudentDisplayName(s)}</Text>
            {(s as any).parentUserName && (
              <Text className="text-[10px] text-gray-500 font-semibold">P: {(s as any).parentUserName} / {(s as any).parentPassword}</Text>
            )}
          </View>
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
      <TouchableOpacity 
        onPress={() => {
          if (studentId == null) return;
          router.push({
            pathname: "/(app)/student-profile",
            params: { id: String(studentId) },
          });
        }}
        activeOpacity={0.9}
        className="bg-white rounded-xl mb-3 shadow-sm border border-gray-100 overflow-hidden"
      >
        <View className="p-4 border-b border-gray-50 flex-row gap-3">
          <View className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 border border-gray-200 items-center justify-center">
            {item.studentPhoto ? (
              <Image source={{ uri: item.studentPhoto }} className="w-full h-full" />
            ) : (
              <GenderIcon gender={item.gender} size={24} />
            )}
          </View>
          <View className="flex-1 justify-center">
            <Text className="text-[13px] font-black text-gray-900 mb-2 uppercase" numberOfLines={1}>
              ({item.rollNo || '-'}) {fullName}
            </Text>
            
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <AppIcon name="call" size={14} color="#059669" />
              <Text className="text-[12px] font-bold text-emerald-600">
                +91 {item.fatherNumber || item.studentNumber || '-'} <Text className="text-gray-400 font-medium">(Father)</Text>
              </Text>
            </View>
            
            <View className="flex-row items-center gap-1.5">
              <AppIcon name="lock" size={14} color="#6B7280" />
              <Text className="text-[12px] font-bold text-gray-600">
                Password : {(item as any).parentPassword || 'N/A'}
              </Text>
            </View>
          </View>
        </View>
        
        <View className="flex-row justify-end items-center px-4 py-2 bg-gray-50/50 gap-2">
          <TouchableOpacity 
            className="w-8 h-8 rounded border border-amber-100 bg-amber-400 items-center justify-center"
            onPress={() => router.push(`/(app)/admission-form?id=${studentId}`)}
          >
            <AppIcon name="admission" size={14} color="white" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            className="w-8 h-8 rounded border border-blue-100 bg-blue-600 items-center justify-center"
            onPress={() => handleDeleteClick(item)}
          >
            <AppIcon name="warning" size={14} color="white" />
          </TouchableOpacity>

          <TouchableOpacity 
            className="w-8 h-8 rounded border border-orange-100 bg-orange-500 items-center justify-center"
            onPress={() => {
              if (studentId == null) return;
              router.push({ pathname: "/(app)/student-profile", params: { id: String(studentId) } });
            }}
          >
            <AppIcon name="profile" size={14} color="white" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
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
        <View className="mb-2">
          <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Select Medium</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => setSelectedMedium(null)}
              className={`px-4 py-1.5 rounded-lg border ${selectedMedium === null ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}`}
            >
              <Text className={`text-[11px] font-bold ${selectedMedium === null ? "text-orange-700" : "text-gray-600"}`}>All Mediums</Text>
            </TouchableOpacity>
            {uniqueMediums.map((med) => (
              <TouchableOpacity
                key={med}
                onPress={() => setSelectedMedium(med)}
                className={`px-4 py-1.5 rounded-lg border flex-row items-center gap-1 ${selectedMedium === med ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}`}
              >
                <Text className={`text-[11px] font-bold ${selectedMedium === med ? "text-orange-700" : "text-gray-600"}`}>
                  {med}
                </Text>
                {selectedMedium === med && <AppIcon name="subjects" size={12} color="#C2410C" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="mb-2">
          <Text className="text-xs font-bold text-gray-500 mb-1">Select Batch</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => setSelectedBatchId(null)}
              className={`px-4 py-1.5 rounded-lg border ${selectedBatchId === null ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`}
            >
              <Text className={`text-[11px] font-bold ${selectedBatchId === null ? "text-blue-700" : "text-gray-600"}`}>All Batches</Text>
            </TouchableOpacity>
            {batches.map((b) => (
              <TouchableOpacity
                key={b.batchID}
                onPress={() => setSelectedBatchId(b.batchID)}
                className={`px-4 py-1.5 rounded-lg border flex-row items-center gap-1 ${selectedBatchId === b.batchID ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`}
              >
                <Text className={`text-[11px] font-bold ${selectedBatchId === b.batchID ? "text-blue-700" : "text-gray-600"}`}>
                  {b.batchName}
                </Text>
                {selectedBatchId === b.batchID && <AppIcon name="admission" size={12} color="#1D4ED8" />}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <TouchableOpacity
            onPress={() => setSelectedClassId(null)}
            className={`px-4 py-2 rounded-full border ${selectedClassId === null ? "bg-[#0d3666] border-[#0d3666]" : "bg-gray-50 border-gray-200"}`}
          >
            <Text className={`text-xs font-bold ${selectedClassId === null ? "text-white" : "text-gray-600"}`}>All Classes</Text>
          </TouchableOpacity>
          {classes.map((cls) => (
            <TouchableOpacity
              key={cls.classID}
              onPress={() => setSelectedClassId(cls.classID)}
              className={`px-4 py-2 rounded-full border ${selectedClassId === cls.classID ? "bg-[#0d3666] border-[#0d3666]" : "bg-gray-50 border-gray-200"}`}
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
