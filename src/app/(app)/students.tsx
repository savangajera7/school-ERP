import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal, TextInput, ActivityIndicator, Image } from "react-native";
import { router } from "expo-router";
import type { StudentModel } from "@/api/model/studentModel";
import { useGetApiStudentGet, useDeleteApiStudentDeleteId } from "@/api/generated/3-student-crud/3-student-crud";
import { useGetApiClassGet } from "@/api/generated/master-class/master-class";
import { useGetApiBatchGet } from "@/api/generated/2-master-batch/2-master-batch";
import { useGetApiMediumGet } from "@/api/generated/master-medium/master-medium";
import { parseApiList } from "@/utils/apiResponse";
import { normalizeStudent, getStudentDisplayName, formatOptional } from "@/utils/studentUtils";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { GenderIcon, AppIcon } from "@/components/icons/AppIcon";
import { usePermissions } from "@/hooks/usePermissions";
import { ResponsiveDataList, EntityActionButtons, type TableColumn } from "@/components/shared";
import { premiumCardShadow } from "@/constants/premiumStyles";

export default function AdminStudentManagementScreen() {
  const { canManageStudents } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [selectedMediumId, setSelectedMediumId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: classData } = useGetApiClassGet();
  const classes = useMemo(() => parseApiList<any>(classData?.data), [classData]);

  const { data: batchData } = useGetApiBatchGet();
  const batches = useMemo(() => parseApiList<any>(batchData?.data), [batchData]);

  const { data: mediumData } = useGetApiMediumGet();
  const mediums = useMemo(() => parseApiList<any>(mediumData?.data), [mediumData]);

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

    if (selectedBatchId) {
      filtered = filtered.filter(s => s.batchID === selectedBatchId || Number(s.batchID) === selectedBatchId);
    }

    if (selectedMediumId) {
      filtered = filtered.filter(s => (s as any).mediumID === selectedMediumId || Number((s as any).mediumID) === selectedMediumId);
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
    return [...filtered].sort((a, b) => {
      const rollA = parseInt(a.rollNo || "0") || 0;
      const rollB = parseInt(b.rollNo || "0") || 0;
      return rollA - rollB;
    });
  }, [students, searchQuery, selectedClassId, selectedBatchId, selectedMediumId]);

  const handleDeleteClick = (student: StudentModel) => {
    if (!student.studentID) return;
    setStudentToDelete(student);
    setDeleteReason("");
    setDeleteModalVisible(true);
  };

  const deleteMutation = useDeleteApiStudentDeleteId();

  const executeDelete = async () => {
    if (!studentToDelete?.studentID) return;
    if (!deleteReason.trim()) {
      Alert.alert("Missing Reason", "Please provide a valid reason for deleting this student.");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({
        id: studentToDelete.studentID,
        params: { reason: deleteReason.trim() }
      });
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
      render: (s) => {
        const className = classes.find((c: any) => c.classID === s.classID)?.className || s.classID;
        return (
          <Text className="text-sm font-semibold text-gray-600">
            {className ? `Class ${className}` : ''} {s.sectionID ? `- ${s.sectionID}` : ''}
          </Text>
        );
      }
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
    ...(canManageStudents ? [{ 
      key: "actions", 
      header: "Actions", 
      width: 100, 
      align: "right", 
      render: (s: any) => (
        <EntityActionButtons 
          onEdit={() => router.push(`/(app)/admission-form?id=${s.studentID}`)}
          onDelete={() => handleDeleteClick(s)}
        />
      )
    } as TableColumn<any>] : [])
  ];

  const renderStudentItemMobile = (item: StudentModel) => {
    const fullName = getStudentDisplayName(item);
    const studentId = item.studentID;
    const className = classes.find((c: any) => c.classID === item.classID)?.className || item.classID;
    
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
        className="bg-white rounded-2xl mb-3 border border-gray-100"
        style={premiumCardShadow}
      >
        <View className="p-4 border-b border-gray-50 flex-row gap-3 rounded-t-2xl bg-white">
          <View className="relative">
            <View className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 items-center justify-center overflow-hidden">
              {item.studentPhoto ? (
                <Image source={{ uri: item.studentPhoto }} className="w-full h-full" />
              ) : (
                <GenderIcon gender={item.gender} size={26} />
              )}
            </View>
            {item.rollNo && (
              <View className="absolute -top-1.5 -right-1.5 bg-amber-500 border border-white min-w-[20px] h-5 px-1 rounded-full items-center justify-center shadow-sm">
                <Text className="text-[10px] font-black text-white">{item.rollNo}</Text>
              </View>
            )}
          </View>
          <View className="flex-1 justify-center">
            <View className="flex-row items-center justify-between mb-1.5 gap-2">
              <Text className="text-sm font-extrabold text-gray-900 uppercase flex-1" numberOfLines={1}>
                {fullName}
              </Text>
              {(item.classID || item.sectionID) && (
                <View className="px-2 py-0.5 bg-teal-50 border border-teal-100 rounded-lg">
                  <Text className="text-[10px] font-black text-teal-700 uppercase">
                    {className ? `Class ${className}` : ''}{item.sectionID ? `-${item.sectionID}` : ''}
                  </Text>
                </View>
              )}
            </View>
            
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <AppIcon name="call" size={13} color="#059669" />
              <Text className="text-[12px] font-bold text-emerald-600">
                +91 {item.fatherNumber || item.studentNumber || '-'} <Text className="text-gray-400 font-semibold">(Father)</Text>
              </Text>
            </View>
            
            <View className="flex-row items-center gap-1.5 mb-1.5">
              <AppIcon name="lock" size={13} color="#6B7280" />
              <Text className="text-[12px] font-bold text-gray-600">
                Password: {(item as any).parentPassword || 'N/A'}
              </Text>
            </View>

            {item.studentGRNo && (
              <View className="flex-row items-center gap-1.5">
                <AppIcon name="admission" size={13} color="#3B82F6" />
                <Text className="text-[12px] font-bold text-gray-600">
                  GR No: {item.studentGRNo}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <View className="flex-row justify-end items-center px-4 py-2.5 bg-gray-50/50 gap-2.5 rounded-b-2xl">
          {canManageStudents && (
            <>
              <TouchableOpacity 
                className="flex-row items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl"
                onPress={() => router.push(`/(app)/admission-form?id=${studentId}`)}
                activeOpacity={0.7}
              >
                <AppIcon name="admission" size={12} color="#4F46E5" />
                <Text className="text-[10px] font-extrabold text-indigo-700 uppercase">Edit</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="flex-row items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl"
                onPress={() => handleDeleteClick(item)}
                activeOpacity={0.7}
              >
                <AppIcon name="warning" size={12} color="#E11D48" />
                <Text className="text-[10px] font-extrabold text-rose-700 uppercase">Delete</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity 
            className="flex-row items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl"
            onPress={() => {
              if (studentId == null) return;
              router.push({ pathname: "/(app)/student-profile", params: { id: String(studentId) } });
            }}
            activeOpacity={0.7}
          >
            <AppIcon name="profile" size={12} color="#059669" />
            <Text className="text-[10px] font-extrabold text-emerald-700 uppercase">Profile</Text>
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
      rightAction={
        <TouchableOpacity
          onPress={() => setShowFilters(prev => !prev)}
          className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
            showFilters
              ? "bg-[#0d3666]/10 border-[#0d3666]/20"
              : "bg-gray-50 border-gray-200"
          }`}
          activeOpacity={0.7}
        >
          <AppIcon name="filter" size={14} color={showFilters ? "#0d3666" : "#4B5563"} />
          <Text className={`text-[11px] font-extrabold uppercase ${showFilters ? "text-[#0d3666]" : "text-gray-600"}`}>
            {showFilters ? "Hide Filters" : "Filters"}
          </Text>
        </TouchableOpacity>
      }
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
        headerComponent={
          showFilters ? (
            <View 
              className="bg-white px-5 py-4 mb-4 rounded-2xl border border-gray-100 z-20"
              style={premiumCardShadow}
            >
              <View className="mb-3">
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Select Medium</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setSelectedMediumId(null)}
                    className={`px-4 py-1.5 rounded-xl border ${selectedMediumId === null ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}`}
                  >
                    <Text className={`text-[11px] font-bold ${selectedMediumId === null ? "text-orange-700" : "text-gray-600"}`}>All Mediums</Text>
                  </TouchableOpacity>
                  {mediums.map((med: any) => (
                    <TouchableOpacity
                      key={med.mediumID}
                      onPress={() => setSelectedMediumId(med.mediumID)}
                      className={`px-4 py-1.5 rounded-xl border flex-row items-center gap-1 ${selectedMediumId === med.mediumID ? "bg-orange-50 border-orange-200" : "bg-white border-gray-200"}`}
                    >
                      <Text className={`text-[11px] font-bold ${selectedMediumId === med.mediumID ? "text-orange-700" : "text-gray-600"}`}>
                        {med.mediumName}
                      </Text>
                      {selectedMediumId === med.mediumID && <AppIcon name="subjects" size={12} color="#C2410C" />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="mb-3">
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Select Batch</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setSelectedBatchId(null)}
                    className={`px-4 py-1.5 rounded-xl border ${selectedBatchId === null ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`}
                  >
                    <Text className={`text-[11px] font-bold ${selectedBatchId === null ? "text-blue-700" : "text-gray-600"}`}>All Batches</Text>
                  </TouchableOpacity>
                  {batches.map((b: any) => (
                    <TouchableOpacity
                      key={b.batchID}
                      onPress={() => setSelectedBatchId(b.batchID)}
                      className={`px-4 py-1.5 rounded-xl border flex-row items-center gap-1 ${selectedBatchId === b.batchID ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"}`}
                    >
                      <Text className={`text-[11px] font-bold ${selectedBatchId === b.batchID ? "text-blue-700" : "text-gray-600"}`}>
                        {b.batchName}
                      </Text>
                      {selectedBatchId === b.batchID && <AppIcon name="admission" size={12} color="#1D4ED8" />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="mb-1">
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">Select Class</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setSelectedClassId(null)}
                    className={`px-4 py-2 rounded-xl border ${selectedClassId === null ? "bg-teal-50 border-teal-200" : "bg-white border-gray-200"}`}
                  >
                    <Text className={`text-[11px] font-bold ${selectedClassId === null ? "text-teal-700" : "text-gray-600"}`}>All Classes</Text>
                  </TouchableOpacity>
                  {classes.map((cls: any) => (
                    <TouchableOpacity
                      key={cls.classID}
                      onPress={() => setSelectedClassId(cls.classID)}
                      className={`px-4 py-2 rounded-xl border ${selectedClassId === cls.classID ? "bg-teal-50 border-teal-200" : "bg-white border-gray-200"}`}
                    >
                      <Text className={`text-[11px] font-bold ${selectedClassId === cls.classID ? "text-teal-700" : "text-gray-600"}`}>
                        Class {cls.className}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          ) : null
        }
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
