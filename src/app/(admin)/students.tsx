import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View, Text, TouchableOpacity, Alert, Modal,
  ScrollView, ActivityIndicator, TextInput,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { 
  useDeleteApiStudentDeleteId,
  usePostApiStudentSearch 
} from "@/api/generated/3-student-crud/3-student-crud";
import { parseApiList, toCamelCaseRow } from "@/utils/apiResponse";
import type { StudentModel } from "@/api/model/studentModel";
import type { StudentSearchRequest } from "@/api/model/studentSearchRequest";
import type { StudentSearchResponse } from "@/api/model/studentSearchResponse";
import type { ClassModel } from "@/api/model/classModel";
import type { BatchModel } from "@/api/model/batchModel";
import type { MediumModel } from "@/api/model/mediumModel";
import { useGetApiClassGet } from "@/api/generated/master-class/master-class";
import { useGetApiBatchGet } from "@/api/generated/2-master-batch/2-master-batch";
import { useGetApiMediumGet } from "@/api/generated/master-medium/master-medium";
import {
  normalizeStudent,
  getStudentDisplayName,
  getParentLoginUsername,
  getParentLoginPassword,
  formatOptional,
} from "@/utils/studentUtils";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { GenderIcon, AppIcon } from "@/components/icons/AppIcon";
import { usePermissions } from "@/hooks/usePermissions";
import { ResponsiveDataList, EntityActionButtons, type TableColumn } from "@/components/shared";
import { Image } from "react-native";

export default function AdminStudentManagementScreen() {
  const { canManageStudents } = usePermissions();
  const { mutateAsync: searchMutate } = usePostApiStudentSearch();
  const deleteMutation = useDeleteApiStudentDeleteId();
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [selectedMediumId, setSelectedMediumId] = useState<number | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  
  // Data state
  const [searchResponse, setSearchResponse] = useState<StudentSearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);

  // Delete modal state
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentModel | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Master data
  const { data: classData } = useGetApiClassGet();
  const classes = useMemo(() => parseApiList<ClassModel>(classData?.data), [classData]);

  const { data: batchData } = useGetApiBatchGet();
  const batches = useMemo(() => parseApiList<BatchModel>(batchData?.data), [batchData]);

  const { data: mediumData } = useGetApiMediumGet();
  const mediums = useMemo(() => parseApiList<MediumModel>(mediumData?.data), [mediumData]);

  // Search function using the new POST API
  const searchStudents = useCallback(async (searchRequest: StudentSearchRequest) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    
    try {
      const response = await searchMutate({ data: searchRequest });
      
      // The response structure is { data: { success, message, data: searchData }, status, headers }
      const apiBody = (response as any).data;
      
      if (apiBody?.success && apiBody?.data) {
        // Ensure properties are camelCase (in case backend returns PascalCase)
        const rawData = apiBody.data as Record<string, unknown>;
        const searchData = toCamelCaseRow<any>(rawData) as StudentSearchResponse;
        
        // Also ensure the students array inside is handled if it came as 'Students'
        if (!searchData.students && (rawData as any).Students) {
          searchData.students = (rawData as any).Students;
        }
        
        setSearchResponse(searchData);
      } else {
        setSearchResponse({
          students: [],
          totalCount: 0,
          page: searchRequest.page || 1,
          pageSize: searchRequest.pageSize || 20,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        });
      }
    } catch (err: any) {
      console.error('Search error:', err);
      setIsError(true);
      setError(err);
      setSearchResponse(null);
    } finally {
      setIsLoading(false);
    }
  }, [searchMutate]);

  // Effect to trigger search when focused or when filters/pagination change
  useFocusEffect(
    useCallback(() => {
      const searchRequest: StudentSearchRequest = {
        page: currentPage,
        pageSize: pageSize,
        search: searchQuery.trim() || undefined,
        classID: selectedClassId || undefined,
        batchID: selectedBatchId || undefined,
        mediumID: selectedMediumId || undefined,
        sortBy: "Name",
        sortOrder: "ASC"
      };

      searchStudents(searchRequest);
    }, [searchQuery, selectedClassId, selectedBatchId, selectedMediumId, currentPage, pageSize, searchStudents])
  );

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedClassId, selectedBatchId, selectedMediumId]);

  const students = useMemo(() => {
    if (!searchResponse?.students) return [];
    return searchResponse.students.map((s) => normalizeStudent(s as any));
  }, [searchResponse]);

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
      await deleteMutation.mutateAsync({
        id: studentToDelete.studentID,
        params: { reason: deleteReason.trim() }
      });
      setDeleteModalVisible(false);
      // Refresh the current search
      const searchRequest: StudentSearchRequest = {
        page: currentPage,
        pageSize: pageSize,
        search: searchQuery.trim() || undefined,
        classID: selectedClassId || undefined,
        batchID: selectedBatchId || undefined,
        mediumID: selectedMediumId || undefined,
        sortBy: "Name",
        sortOrder: "ASC"
      };
      searchStudents(searchRequest);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to delete student");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    const searchRequest: StudentSearchRequest = {
      page: currentPage,
      pageSize: pageSize,
      search: searchQuery.trim() || undefined,
      classID: selectedClassId || undefined,
      batchID: selectedBatchId || undefined,
      mediumID: selectedMediumId || undefined,
      sortBy: "Name",
      sortOrder: "ASC"
    };
    searchStudents(searchRequest);
  };

  const tableColumns: TableColumn<StudentModel>[] = [
    { key: "rollNo", header: "Roll", width: 60, align: "center" },
    {
      key: "name",
      header: "Student Name",
      flex: 2,
      render: (s) => (
        <View className="flex-row items-center gap-2 flex-1 overflow-hidden">
          {s.studentPhoto ? (
            <Image source={{ uri: s.studentPhoto }} className="w-6 h-6 rounded-full shrink-0" />
          ) : (
            <GenderIcon gender={s.gender} size={16} />
          )}
          <View className="flex-1 overflow-hidden">
            <Text className="text-sm font-bold text-gray-800" numberOfLines={1}>{getStudentDisplayName(s)}</Text>
          </View>
        </View>
      )
    },
    {
      key: "parentLogin",
      header: "Parent Login",
      flex: 1.4,
      render: (s) => (
        <View className="flex-1 overflow-hidden">
          <Text className="text-xs font-bold text-gray-700" numberOfLines={1}>
            U: {getParentLoginUsername(s)}
          </Text>
          <Text className="text-[11px] font-semibold text-gray-500" numberOfLines={1}>
            P: {getParentLoginPassword(s)}
          </Text>
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
      width: 130,
      align: "right",
      render: (s) => (
        <EntityActionButtons
          onView={() => {
            if (s.studentID == null) return;
            router.push({ pathname: "/(app)/student-profile", params: { id: String(s.studentID) } });
          }}
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
        className="bg-white rounded-2xl mb-4 border border-gray-100"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.04,
          shadowRadius: 10,
          elevation: 2,
        }}
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
            {Boolean(item.rollNo) && (
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
              {Boolean(item.classID || item.sectionID) && (
                <View className="px-2 py-0.5 bg-teal-50 border border-teal-100 rounded-lg">
                  <Text className="text-[10px] font-black text-teal-700 uppercase">
                    {item.classID ? `Class ${item.classID}` : ''}{item.sectionID ? `-${item.sectionID}` : ''}
                  </Text>
                </View>
              )}
            </View>

            <View className="flex-row items-center gap-1.5 mb-1.5">
              <AppIcon name="parents" size={13} color="#059669" />
              <Text className="text-[12px] font-bold text-emerald-600 flex-1" numberOfLines={1}>
                Username: {getParentLoginUsername(item)}
              </Text>
            </View>

            <View className="flex-row items-center gap-1.5 mb-1.5">
              <AppIcon name="lock" size={13} color="#6B7280" />
              <Text className="text-[12px] font-bold text-gray-600 flex-1" numberOfLines={1}>
                Password: {getParentLoginPassword(item)}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex-row justify-end items-center px-4 py-2.5 bg-gray-50/50 gap-2.5 rounded-b-2xl">
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

  // Pagination component
  const renderPagination = () => {
    if (!searchResponse || (searchResponse.totalPages || 0) <= 1) return null;

    return (
      <View className="flex-row items-center justify-between px-4 py-3 bg-white border-t border-gray-200">
        <TouchableOpacity
          onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
          disabled={!searchResponse.hasPreviousPage}
          className={`px-4 py-2 rounded-lg ${searchResponse.hasPreviousPage ? 'bg-blue-500' : 'bg-gray-300'}`}
        >
          <Text className={`font-bold ${searchResponse.hasPreviousPage ? 'text-white' : 'text-gray-500'}`}>
            Previous
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center gap-2">
          <Text className="text-sm font-semibold text-gray-700">
            Page {searchResponse?.page || 1} of {searchResponse?.totalPages || 1}
          </Text>
          <Text className="text-xs text-gray-500">
            ({searchResponse.totalCount} total)
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setCurrentPage((p) => Math.min(searchResponse?.totalPages || 1, p + 1))}
          disabled={!searchResponse?.hasNextPage}
          className={`px-4 py-2 rounded-lg ${searchResponse.hasNextPage ? 'bg-blue-500' : 'bg-gray-300'}`}
        >
          <Text className={`font-bold ${searchResponse.hasNextPage ? 'text-white' : 'text-gray-500'}`}>
            Next
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <PremiumScreenLayout
      title="Students"
      subtitle="Manage school enrollment"
      scrollable={false}
      fullWidth
      hideBack
    >
      <View
        className="bg-white px-5 py-4 mb-4 rounded-2xl border border-gray-100 z-20"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 6,
          elevation: 3,
        }}
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
            {batches.map((b) => (
              <TouchableOpacity
                key={b.batchID}
                onPress={() => setSelectedBatchId(b.batchID || null)}
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
            {classes.map((cls) => (
              <TouchableOpacity
                key={cls.classID}
                onPress={() => setSelectedClassId(cls.classID || null)}
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

      <ResponsiveDataList
        data={students}
        isLoading={isLoading}
        isError={isError}
        error={error}
        onRefresh={handleRefresh}
        renderCard={renderStudentItemMobile}
        tableColumns={tableColumns}
        keyExtractor={(item) => String(item.studentID)}
        emptyIcon="students"
        emptyTitle="No students found"
        emptyMessage={searchQuery ? "Try a different search" : "Register your first student"}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, username, or roll..."
      />

      {renderPagination()}

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
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