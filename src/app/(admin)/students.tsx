import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput, ActivityIndicator, Image } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useDialog } from "@/components/ui/AppDialog";
import { useToast } from "@/components/ui/Toast";
import type { StudentModel } from "@/api/model/studentModel";
import type { StudentSearchRequest } from "@/api/model/studentSearchRequest";
import type { StudentSearchResponse } from "@/api/model/studentSearchResponse";
import { usePostApiStudentSearch, useDeleteApiStudentDeleteId } from "@/api/generated/3-student-crud/3-student-crud";
import { useGetApiClassGet } from "@/api/generated/master-class-medium-shift-1a-2b/master-class-medium-shift-1a-2b";
import { useGetApiBatchGet } from "@/api/generated/2-master-batch/2-master-batch";
import { useGetApiMediumGet } from "@/api/generated/master-medium/master-medium";
import { parseApiList, toCamelCaseRow } from "@/utils/apiResponse";
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
import { premiumCardShadow } from "@/constants/premiumStyles";
import { useDebounce } from "@/hooks/useDebounce";
import { IconButton } from "@/components/ui/IconButton";

export default function AdminStudentManagementScreen() {
  const dialog = useDialog();
  const { showToast } = useToast();
  const { canManageStudents } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
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

  const { mutateAsync: searchMutate } = usePostApiStudentSearch();
  const [searchResponse, setSearchResponse] = useState<StudentSearchResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentModel | null>(null);
  const [deleteReason, setDeleteReason] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const searchStudents = React.useCallback(async (searchRequest: StudentSearchRequest) => {
    setIsLoading(true);
    setIsError(false);
    setError(null);
    
    try {
      const isNextPage = (searchRequest.page || 1) > 1;
      if (isNextPage) setIsFetchingNextPage(true);
      
      const response = await searchMutate({ data: searchRequest });
      const apiBody = (response as any).data;
      
      if (apiBody?.success && apiBody?.data) {
        const rawData = apiBody.data as Record<string, unknown>;
        const searchData = toCamelCaseRow<any>(rawData) as StudentSearchResponse;
        
        if (!searchData.students && (rawData as any).Students) {
          searchData.students = (rawData as any).Students;
        }
        
        setSearchResponse(prev => {
          if (isNextPage && prev) {
            return {
              ...searchData,
              students: [...(prev.students || []), ...(searchData.students || [])]
            };
          }
          return searchData;
        });
      } else {
        if (!isNextPage) setSearchResponse({ students: [], totalCount: 0, page: searchRequest.page || 1, pageSize: searchRequest.pageSize || 20, totalPages: 0, hasNextPage: false, hasPreviousPage: false });
      }
    } catch (err: any) {
      if (!searchRequest.page || searchRequest.page === 1) {
        setIsError(true);
        setError(err);
        setSearchResponse(null);
      }
    } finally {
      setIsLoading(false);
      setIsFetchingNextPage(false);
    }
  }, [searchMutate]);

  useFocusEffect(
    React.useCallback(() => {
      const searchRequest: StudentSearchRequest = {
        page: currentPage,
        pageSize: pageSize,
        search: debouncedSearchQuery.trim() || undefined,
        classID: selectedClassId || undefined,
        batchID: selectedBatchId || undefined,
        mediumID: selectedMediumId || undefined,
        sortBy: "Name",
        sortOrder: "ASC"
      };
      searchStudents(searchRequest);
    }, [debouncedSearchQuery, selectedClassId, selectedBatchId, selectedMediumId, currentPage, pageSize, searchStudents])
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, selectedClassId, selectedBatchId, selectedMediumId]);

  const students = useMemo(() => {
    if (!searchResponse?.students) return [];
    const list = searchResponse.students.map((s) => normalizeStudent(s as any));
    return list.sort((a, b) => {
      const rollA = a.rollNo ? parseInt(String(a.rollNo), 10) : 999999;
      const rollB = b.rollNo ? parseInt(String(b.rollNo), 10) : 999999;
      const isA_NaN = isNaN(rollA);
      const isB_NaN = isNaN(rollB);
      if (isA_NaN && isB_NaN) return 0;
      if (isA_NaN) return 1;
      if (isB_NaN) return -1;
      return rollA - rollB;
    });
  }, [searchResponse]);

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
      dialog.alert("Missing Reason", "Please provide a valid reason for deleting this student.", "warning");
      return;
    }

    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({
        id: studentToDelete.studentID,
        params: { reason: deleteReason.trim() }
      });
      setDeleteModalVisible(false);
      showToast("Student deleted successfully", "success");
      const searchRequest: StudentSearchRequest = {
        page: currentPage,
        pageSize: pageSize,
        search: debouncedSearchQuery.trim() || undefined,
        classID: selectedClassId || undefined,
        batchID: selectedBatchId || undefined,
        mediumID: selectedMediumId || undefined,
        sortBy: "Name",
        sortOrder: "ASC"
      };
      searchStudents(searchRequest);
    } catch (err: any) {
      dialog.alert("Error", err.message || "Failed to delete student", "error");
    } finally {
      setIsDeleting(false);
    }
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
            <Text className="text-sm font-bold text-gray-800 dark:text-slate-200" numberOfLines={1}>{getStudentDisplayName(s)}</Text>
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
          <Text className="text-xs font-bold text-gray-700 dark:text-slate-300" numberOfLines={1}>
            U: {getParentLoginUsername(s)}
          </Text>
          <Text className="text-[11px] font-semibold text-gray-500 dark:text-slate-400" numberOfLines={1}>
            P: {getParentLoginPassword(s)}
          </Text>
        </View>
      )
    },
    { 
      key: "class", 
      header: "Class", 
      flex: 1, 
      render: (s) => {
        const cName = (s as any).className || classes.find((c: any) => c.classID === s.classID)?.className || s.classID;
        return (
          <Text className="text-sm font-semibold text-gray-600 dark:text-slate-400">
            {cName ? `Class ${cName}` : ''}
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
      width: 130,
      align: "right",
      render: (s: any) => (
        <EntityActionButtons
          onView={() => {
            if (s.studentID == null) return;
            router.push({ pathname: "/(app)/student-profile", params: { id: String(s.studentID) } });
          }}
          onEdit={() => router.push(`/(admin)/admission-form?id=${s.studentID}`)}
          onDelete={() => handleDeleteClick(s)}
        />
      )
    } as TableColumn<any>] : [])
  ];

  const renderStudentItemMobile = (item: StudentModel) => {
    const fullName = getStudentDisplayName(item);
    const studentId = item.studentID;
    const cName = (item as any).className || classes.find((c: any) => c.classID === item.classID)?.className || item.classID;
    
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
        className="bg-[#1e293b] rounded-2xl mb-3 overflow-hidden border border-slate-700"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="p-4 flex-row gap-3">
          <View className="relative">
            <View className="w-14 h-14 rounded-xl bg-slate-700 border border-slate-600 items-center justify-center overflow-hidden">
              {item.studentPhoto ? (
                <Image source={{ uri: item.studentPhoto }} className="w-full h-full" />
              ) : (
                <GenderIcon gender={item.gender} size={26} />
              )}
            </View>
            {Boolean(item.rollNo) && (
              <View className="absolute -top-1.5 -right-1.5 bg-orange-500 border-2 border-[#1e293b] min-w-[20px] h-5 px-1 rounded-full items-center justify-center shadow-md">
                <Text className="text-[10px] font-black text-white">{item.rollNo}</Text>
              </View>
            )}
          </View>
          
          <View className="flex-1">
            <View className="flex-row items-start justify-between mb-1">
              <Text className="text-[14px] font-black text-white uppercase flex-1 mr-2 leading-tight" numberOfLines={1}>
                {fullName}
              </Text>
              {Boolean(item.classID || cName) && (
                <View className="px-2 py-0.5 bg-white/10 rounded-lg border border-white/10">
                  <Text className="text-[9px] font-black text-teal-400 uppercase tracking-tighter">
                    {cName ? `Class ${cName}` : ''}
                  </Text>
                </View>
              )}
            </View>
            
            <View className="flex-row items-center gap-1.5 mb-1">
              <AppIcon name="profile" size={13} color="#10b981" />
              <Text className="text-[12px] font-bold text-[#10b981] flex-1" numberOfLines={1}>
                User: {getParentLoginUsername(item)}
              </Text>
            </View>
            
            <View className="flex-row items-center gap-1.5">
              <AppIcon name="key" size={13} color="#94a3b8" />
              <Text className="text-[12px] font-bold text-slate-400 flex-1" numberOfLines={1}>
                Pass: <Text className="text-white">{getParentLoginPassword(item)}</Text>
              </Text>
            </View>
          </View>
        </View>
        
        <View className="flex-row justify-end items-center px-4 py-2 bg-slate-800/40 border-t border-slate-700/50 gap-2">
          {canManageStudents && (
            <>
              <TouchableOpacity 
                onPress={() => router.push(`/(admin)/admission-form?id=${studentId}`)}
                className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 items-center justify-center"
              >
                <AppIcon name="edit" size={16} color="#818cf8" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => handleDeleteClick(item)}
                className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 items-center justify-center"
              >
                <AppIcon name="delete" size={16} color="#fb7185" />
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity 
            onPress={() => {
              if (studentId == null) return;
              router.push({ pathname: "/(app)/student-profile", params: { id: String(studentId) } });
            }}
            className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center"
          >
            <AppIcon name="profile" size={16} color="#34d399" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const handleRefresh = () => {
    const searchRequest: StudentSearchRequest = {
      page: currentPage,
      pageSize: pageSize,
      search: debouncedSearchQuery.trim() || undefined,
      classID: selectedClassId || undefined,
      batchID: selectedBatchId || undefined,
      mediumID: selectedMediumId || undefined,
      sortBy: "Name",
      sortOrder: "ASC"
    };
    searchStudents(searchRequest);
  };

  
  return (
    <PremiumScreenLayout
      title="Students"
      subtitle="Manage school enrollment"
      scrollable={false}
      fullWidth
      hideBack
      rightAction={
        <TouchableOpacity
          onPress={() => setShowFilters(prev => !prev)}
          className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
            showFilters
              ? "bg-[#0d3666]/10 dark:bg-blue-900/20 border-[#0d3666]/20 dark:border-blue-700/30"
              : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
          }`}
          activeOpacity={0.7}
        >
          <AppIcon name="filter" size={14} color={showFilters ? "#0d3666" : "#4B5563"} />
          <Text className={`text-[11px] font-extrabold uppercase ${showFilters ? "text-[#0d3666]" : "text-gray-600 dark:text-slate-400"}`}>
            {showFilters ? "Hide Filters" : "Filters"}
          </Text>
        </TouchableOpacity>
      }
    >
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
        onEndReached={() => {
          if (searchResponse?.hasNextPage && !isFetchingNextPage && !isLoading) {
            setCurrentPage(prev => prev + 1);
          }
        }}
        isFetchingNextPage={isFetchingNextPage}
        headerComponent={
          showFilters ? (
            <View 
              className="bg-white dark:bg-slate-800 px-5 py-4 mb-4 rounded-2xl border border-gray-100 dark:border-slate-700 z-20"
              style={premiumCardShadow}
            >
              <View className="mb-3">
                <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Select Medium</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setSelectedMediumId(null)}
                    className={`px-4 py-1.5 rounded-xl border ${selectedMediumId === null ? "bg-orange-50 border-orange-200" : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"}`}
                  >
                    <Text className={`text-[11px] font-bold ${selectedMediumId === null ? "text-orange-700" : "text-gray-600 dark:text-slate-300"}`}>All Mediums</Text>
                  </TouchableOpacity>
                  {mediums.map((med: any) => (
                    <TouchableOpacity
                      key={med.mediumID}
                      onPress={() => setSelectedMediumId(med.mediumID)}
                      className={`px-4 py-1.5 rounded-xl border flex-row items-center gap-1 ${selectedMediumId === med.mediumID ? "bg-orange-50 border-orange-200" : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"}`}
                    >
                      <Text className={`text-[11px] font-bold ${selectedMediumId === med.mediumID ? "text-orange-700" : "text-gray-600 dark:text-slate-300"}`}>
                        {med.mediumName}
                      </Text>
                      {selectedMediumId === med.mediumID && <AppIcon name="subjects" size={12} color="#C2410C" />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="mb-3">
                <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Select Batch</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setSelectedBatchId(null)}
                    className={`px-4 py-1.5 rounded-xl border ${selectedBatchId === null ? "bg-blue-50 border-blue-200" : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"}`}
                  >
                    <Text className={`text-[11px] font-bold ${selectedBatchId === null ? "text-blue-700" : "text-gray-600 dark:text-slate-300"}`}>All Batches</Text>
                  </TouchableOpacity>
                  {batches.map((b: any) => (
                    <TouchableOpacity
                      key={b.batchID}
                      onPress={() => setSelectedBatchId(b.batchID)}
                      className={`px-4 py-1.5 rounded-xl border flex-row items-center gap-1 ${selectedBatchId === b.batchID ? "bg-blue-50 border-blue-200" : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"}`}
                    >
                      <Text className={`text-[11px] font-bold ${selectedBatchId === b.batchID ? "text-blue-700" : "text-gray-600 dark:text-slate-300"}`}>
                        {b.batchName}
                      </Text>
                      {selectedBatchId === b.batchID && <AppIcon name="admission" size={12} color="#1D4ED8" />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View className="mb-1">
                <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">Select Class</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  <TouchableOpacity
                    onPress={() => setSelectedClassId(null)}
                    className={`px-4 py-2 rounded-xl border ${selectedClassId === null ? "bg-teal-50 border-teal-200" : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"}`}
                  >
                    <Text className={`text-[11px] font-bold ${selectedClassId === null ? "text-teal-700" : "text-gray-600 dark:text-slate-300"}`}>All Classes</Text>
                  </TouchableOpacity>
                  {classes.map((cls: any) => (
                    <TouchableOpacity
                      key={cls.classID}
                      onPress={() => setSelectedClassId(cls.classID)}
                      className={`px-4 py-2 rounded-xl border ${selectedClassId === cls.classID ? "bg-teal-50 border-teal-200" : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"}`}
                    >
                      <Text className={`text-[11px] font-bold ${selectedClassId === cls.classID ? "text-teal-700" : "text-gray-600 dark:text-slate-300"}`}>
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
      

      {selectedIds.length > 0 && (
        <View className="absolute bottom-6 left-0 right-0 items-center z-50">
          <TouchableOpacity
            className="bg-red-600 px-6 py-3 rounded-full flex-row items-center gap-2 shadow-lg"
            onPress={async () => {
              const ok = await dialog.showDialog({
                title: "Bulk Delete",
                message: `Are you sure you want to delete ${selectedIds.length} students?`,
                variant: "warning",
                buttons: [
                  { label: "Cancel", cancel: true },
                  { label: "Delete", destructive: true, primary: true }
                ]
              });
              if (ok.confirmed) {
                  // Simulate bulk delete
                  setIsDeleting(true);
                  setTimeout(() => {
                    setIsDeleting(false);
                    setSelectedIds([]);
                    showToast("Students deleted successfully", "success");
                    handleRefresh();
                  }, 1000);
              }
            }}
          >
            <AppIcon name="delete" size={20} color="white" />
            <Text className="text-white font-bold">Delete {selectedIds.length} Selected</Text>
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View style={StyleSheet.absoluteFill} className="bg-black/50 items-center justify-center p-4">
          <View className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-xl">
            <Text className="text-lg font-black text-gray-900 dark:text-slate-100 mb-2">Delete Student</Text>
            <Text className="text-sm font-semibold text-gray-600 dark:text-slate-400 mb-4">
              Are you sure you want to remove {studentToDelete ? getStudentDisplayName(studentToDelete) : ""}? Please provide a reason below.
            </Text>
            
            <TextInput
              value={deleteReason}
              onChangeText={setDeleteReason}
              placeholder="Reason for deletion..."
              className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 min-h-[80px] text-sm font-semibold text-gray-800 dark:text-slate-200 mb-6"
              multiline
              textAlignVertical="top"
            />
            
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 bg-gray-100 dark:bg-slate-700 py-3 rounded-xl items-center justify-center"
                onPress={() => setDeleteModalVisible(false)}
                disabled={isDeleting}
              >
                <Text className="font-bold text-gray-700 dark:text-slate-300">Cancel</Text>
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
