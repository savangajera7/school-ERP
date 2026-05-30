import { premiumCardShadow } from "@/constants/premiumStyles";
import React, { useState, useMemo, useCallback } from "react";
import {
  View, Text, TouchableOpacity, Modal,
  ScrollView, ActivityIndicator, Image, TextInput,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { useColorScheme } from "nativewind";
import { Colors } from "@/constants/colors";
import { useDeleteApiTeacherDeleteTeacher } from "@/api/generated/teacher/teacher";
import { parseApiList } from "@/utils/apiResponse";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { usePermissions } from "@/hooks/usePermissions";
import { ResponsiveDataList, EntityActionButtons, type TableColumn } from "@/components/shared";
import { useGetApiClassGet } from "@/api/generated/master-class-medium-shift-1a-2b/master-class-medium-shift-1a-2b";
import { useDebounce } from "@/hooks/useDebounce";
import { IconButton } from "@/components/ui/IconButton";
import {
  usePostApiTeacherClassAssignmentAdd,
  useDeleteApiTeacherClassAssignmentRemove,
} from "@/api/generated/6-teacher-class-assignment/6-teacher-class-assignment";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetApiTeacherPermissionsAll,
  usePostApiTeacherPermissionsSet,
  getGetApiTeacherPermissionsAllQueryKey,
} from "@/api/generated/6-teacher-permissions-admin-assigns-module-access-per-class/6-teacher-permissions-admin-assigns-module-access-per-class";
import {
  useGetApiTeacherGetTeacherList,
  getGetApiTeacherGetTeacherListQueryKey,
} from "@/api/generated/teacher/teacher";
import { SchoolTheme } from "@/constants/theme";
import { useDialog } from "@/components/ui/AppDialog";
import { useToast } from "@/components/ui/Toast";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClassPermission {
  classID: number;
  className: string;
  canNotice: boolean;
  canAttendance: boolean;
  canHomework: boolean;
  canClasswork: boolean;
  canTimetable: boolean;
  canExam: boolean;
}

interface TeacherWithDetails {
  teacherID: number;
  teacherCode: string;
  teacherName: string;
  firstName?: string;
  lastName?: string;
  mobileNo?: string;
  email?: string;
  subjectName?: string;
  experienceYear?: number;
  gender?: string;
  photo?: string;
  isActive: boolean;
  classPermissions: ClassPermission[];
}

const MODULE_KEYS: { key: keyof ClassPermission; label: string; icon: string }[] = [
  { key: "canNotice",     label: "Notice",     icon: "notices" },
  { key: "canAttendance", label: "Attendance", icon: "attendance" },
  { key: "canHomework",   label: "Homework",   icon: "homework" },
  { key: "canClasswork",  label: "Classwork",  icon: "classwork" },
  { key: "canTimetable",  label: "Timetable",  icon: "timetable" },
  { key: "canExam",       label: "Exam",       icon: "exams" },
];

// ─── Teacher Avatar ───────────────────────────────────────────────────────────

const TeacherAvatar = ({ photo, size = 44 }: { photo?: string; size?: number }) => {
  if (photo) {
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, overflow: "hidden", borderWidth: 2, borderColor: "#E5E7EB" }}>
        <Image source={{ uri: photo }} style={{ width: size, height: size }} resizeMode="cover" />
      </View>
    );
  }
  return <IconCircle name="teachers" size={size} iconSize={size * 0.5} />;
};

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function AdminTeacherManagementScreen() {
  const { canManageTeachers } = usePermissions();
  const queryClient = useQueryClient();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const dialog = useDialog();
  const { showToast } = useToast();

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: teachersRaw, isLoading, isError, error, refetch } = useGetApiTeacherGetTeacherList();

  // Force refetch on focus to ensure latest data
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );
  const { data: classesRaw } = useGetApiClassGet();
  const allClasses = useMemo(() => parseApiList<any>(classesRaw?.data), [classesRaw]);

  const teachers: TeacherWithDetails[] = useMemo(() => {
    const raw = (teachersRaw as any)?.data?.data ?? (teachersRaw as any)?.data ?? [];
    return Array.isArray(raw) ? raw.map((t: any) => ({ ...t, classPermissions: t.classPermissions || [] })) : [];
  }, [teachersRaw]);

  // ── Search ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const filteredTeachers = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return teachers;
    const q = debouncedSearchQuery.toLowerCase();
    return teachers.filter(
      (t) =>
        t.teacherName?.toLowerCase().includes(q) ||
        t.teacherCode?.toLowerCase().includes(q) ||
        t.subjectName?.toLowerCase().includes(q) ||
        t.mobileNo?.includes(q),
    );
  }, [teachers, debouncedSearchQuery]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const deleteTeacherMutation = useDeleteApiTeacherDeleteTeacher();
  const addClassAssignment = usePostApiTeacherClassAssignmentAdd();
  const removeClassAssignment = useDeleteApiTeacherClassAssignmentRemove();
  const permissionMutation = usePostApiTeacherPermissionsSet();

  // ── Delete modal state ────────────────────────────────────────────────────
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<TeacherWithDetails | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);

  const handleDeleteClick = (teacher: TeacherWithDetails) => {
    setTeacherToDelete(teacher);
    setDeleteModalVisible(true);
  };

  const executeDelete = async () => {
    if (!teacherToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTeacherMutation.mutateAsync({ data: { teacherID: teacherToDelete.teacherID } });
      queryClient.invalidateQueries({ queryKey: getGetApiTeacherPermissionsAllQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetApiTeacherGetTeacherListQueryKey() });
      setDeleteModalVisible(false);
      setTeacherToDelete(null);
      showToast("Teacher deleted successfully", "success");
    } catch (e: any) {
      dialog.alert("Error", e.message || "Failed to delete teacher", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Permission panel state ────────────────────────────────────────────────
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithDetails | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [localPerms, setLocalPerms] = useState<Record<number, ClassPermission>>({});
  const [savingClassID, setSavingClassID] = useState<number | null>(null);

  // Remove-class confirm modal
  const [removeClassModal, setRemoveClassModal] = useState<{ classID: number; className: string } | null>(null);
  const [isRemovingClass, setIsRemovingClass] = useState(false);

  const openPanel = useCallback((teacher: TeacherWithDetails) => {
    setSelectedTeacher(teacher);
    const seed: Record<number, ClassPermission> = {};
    teacher.classPermissions.forEach((cp) => { seed[cp.classID] = { ...cp }; });
    setLocalPerms(seed);
    setPanelVisible(true);
  }, []);

  const closePanel = () => { setPanelVisible(false); setSelectedTeacher(null); };

  const toggleModule = (classID: number, key: keyof ClassPermission) => {
    setLocalPerms((prev) => ({
      ...prev,
      [classID]: { ...prev[classID], [key]: !prev[classID]?.[key] },
    }));
  };

  const saveClassPerms = async (classID: number) => {
    if (!selectedTeacher) return;
    const p = localPerms[classID];
    if (!p) return;
    setSavingClassID(classID);
    try {
      await permissionMutation.mutateAsync({
        data: {
          teacherID: selectedTeacher.teacherID,
          classID,
          canNotice:     !!p.canNotice,
          canAttendance: !!p.canAttendance,
          canHomework:   !!p.canHomework,
          canClasswork:  !!p.canClasswork,
          canTimetable:  !!p.canTimetable,
          canExam:       !!p.canExam,
        },
      });
      queryClient.invalidateQueries({ queryKey: getGetApiTeacherPermissionsAllQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetApiTeacherGetTeacherListQueryKey() });
    } catch (_e) {
      // silent — user can retry
    } finally {
      setSavingClassID(null);
    }
  };

  const assignClass = async (classID: number) => {
    if (!selectedTeacher) return;
    try {
      await addClassAssignment.mutateAsync({
        data: { teacherID: selectedTeacher.teacherID, classIDs: [classID] },
      });
      queryClient.invalidateQueries({ queryKey: getGetApiTeacherPermissionsAllQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetApiTeacherGetTeacherListQueryKey() });
      const cls = allClasses.find((c: any) => c.classID === classID);
      const newPerm: ClassPermission = {
        classID, className: cls?.className ?? "",
        canNotice: false, canAttendance: false, canHomework: false,
        canClasswork: false, canTimetable: false, canExam: false,
      };
      setLocalPerms((prev) => ({ ...prev, [classID]: newPerm }));
      setSelectedTeacher((prev) => prev ? {
        ...prev, classPermissions: [...prev.classPermissions, newPerm],
      } : prev);
    } catch (_e) {}
  };

  const confirmRemoveClass = async () => {
    if (!selectedTeacher || !removeClassModal) return;
    setIsRemovingClass(true);
    try {
      await removeClassAssignment.mutateAsync({
        data: { teacherID: selectedTeacher.teacherID, classID: removeClassModal.classID },
      });
      queryClient.invalidateQueries({ queryKey: getGetApiTeacherPermissionsAllQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetApiTeacherGetTeacherListQueryKey() });
      setLocalPerms((prev) => { const n = { ...prev }; delete n[removeClassModal.classID]; return n; });
      setSelectedTeacher((prev) => prev ? {
        ...prev,
        classPermissions: prev.classPermissions.filter((c) => c.classID !== removeClassModal.classID),
      } : prev);
      setRemoveClassModal(null);
    } catch (_e) {
    } finally {
      setIsRemovingClass(false);
    }
  };

  const unassignedClasses = useMemo(() => {
    if (!selectedTeacher) return [];
    const assigned = new Set(selectedTeacher.classPermissions.map((c) => c.classID));
    return allClasses.filter((c: any) => !assigned.has(c.classID));
  }, [selectedTeacher, allClasses]);

  // ── Mobile card ───────────────────────────────────────────────────────────
  const renderTeacherCard = (item: TeacherWithDetails) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => openPanel(item)}
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
            <TeacherAvatar photo={item.photo ?? undefined} size={56} />
          </View>
          {item.isActive && (
            <View className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#1e293b] rounded-full shadow-sm" />
          )}
        </View>
        <View className="flex-1">
          <View className="flex-row items-start justify-between mb-1">
            <Text className="text-[14px] font-black text-white uppercase flex-1 mr-2 leading-tight" numberOfLines={1}>
              {item.teacherName}
            </Text>
            <View className="px-2 py-0.5 bg-white/10 rounded-lg border border-white/10">
              <Text className="text-[9px] font-black text-blue-400 uppercase tracking-tighter">
                {item.teacherCode || "N/A"}
              </Text>
            </View>
          </View>
          
          {item.subjectName ? (
            <View className="flex-row items-center gap-1.5 mb-1">
              <AppIcon name="subjects" size={13} color="#a855f7" />
              <Text className="text-[12px] font-bold text-purple-400 flex-1" numberOfLines={1}>
                {item.subjectName}
              </Text>
            </View>
          ) : null}
          
          <View className="flex-row items-center gap-1.5">
            <AppIcon name="call" size={13} color="#94a3b8" />
            <Text className="text-[12px] font-bold text-slate-400 flex-1" numberOfLines={1}>
              {item.mobileNo || "No phone"}
            </Text>
          </View>
        </View>
      </View>

      {item.classPermissions.length > 0 && (
        <View className="px-4 py-2 bg-slate-800/20 border-t border-slate-700/30 flex-row items-center gap-2 flex-wrap">
          <AppIcon name="subjects" size={11} color="#475569" />
          {item.classPermissions.map((cp) => (
            <View key={cp.classID} className="px-2 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded-lg">
              <Text className="text-[9px] font-black text-teal-400 uppercase">{cp.className}</Text>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row justify-end items-center px-4 py-2 bg-slate-800/40 border-t border-slate-700/50 gap-2">
        <TouchableOpacity 
          onPress={() => openPanel(item)}
          className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 items-center justify-center"
        >
          <AppIcon name="settings" size={16} color="#818cf8" />
        </TouchableOpacity>
        
        {canManageTeachers && (
          <>
            <TouchableOpacity 
              onPress={() => router.push(`/(admin)/teacher-form?id=${item.teacherID}`)}
              className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 items-center justify-center"
            >
              <AppIcon name="edit" size={16} color="#34d399" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => handleDeleteClick(item)}
              className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 items-center justify-center"
            >
              <AppIcon name="delete" size={16} color="#fb7185" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  // ── Table columns (desktop) ───────────────────────────────────────────────
  const tableColumns: TableColumn<TeacherWithDetails>[] = [
    {
      key: "rowNo", header: "#", width: 48, align: "center",
      render: (_t, i) => <Text className="text-sm font-semibold text-gray-400 dark:text-slate-500">{i + 1}</Text>,
    },
    {
      key: "teacherName", header: "Teacher Name", flex: 2,
      render: (t) => (
        <View className="flex-row items-center gap-2">
          <TeacherAvatar photo={t.photo ?? undefined} size={28} />
          <View className="flex-1 overflow-hidden">
            <Text className="text-sm font-bold text-gray-800 dark:text-slate-200" numberOfLines={1}>{t.teacherName}</Text>
            {t.email ? <Text className="text-[11px] text-gray-400 dark:text-slate-500 font-semibold" numberOfLines={1}>{t.email}</Text> : null}
          </View>
        </View>
      ),
    },
    {
      key: "subjectName", header: "Subject", flex: 1,
      render: (t) => <Text className="text-sm text-gray-700 dark:text-slate-300 font-semibold" numberOfLines={1}>{t.subjectName || "—"}</Text>,
    },
    {
      key: "mobileNo", header: "Phone", width: 130,
      render: (t) => <Text className="text-sm text-gray-600 dark:text-slate-400">{t.mobileNo || "—"}</Text>,
    },
    {
      key: "classPermissions", header: "Assigned Classes", flex: 2,
      render: (t) => (
        <View className="flex-row flex-wrap gap-1">
          {t.classPermissions.length ? (
            t.classPermissions.map((c) => (
              <View key={c.classID} className="px-2 py-0.5 bg-teal-50 border border-teal-100 rounded-md">
                <Text className="text-[10px] font-black text-teal-700">{c.className}</Text>
              </View>
            ))
          ) : (
            <Text className="text-sm text-gray-400 dark:text-slate-500">No classes</Text>
          )}
        </View>
      ),
    },
    {
      key: "isActive", header: "Status", width: 80, align: "center",
      render: (t) => (
        <View className={`px-2 py-1 rounded-md border ${t.isActive ? "bg-green-50 dark:bg-green-950/30 border-green-100 dark:border-green-800" : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"}`}>
          <Text className={`text-[10px] font-bold ${t.isActive ? "text-green-700" : "text-gray-500 dark:text-slate-400"}`}>
            {t.isActive ? "Active" : "Inactive"}
          </Text>
        </View>
      ),
    },
    {
      key: "actions", header: "Actions", width: 160, align: "right",
      render: (t) => (
        <View className="flex-row gap-1.5 items-center justify-end">
          <TouchableOpacity
            onPress={() => openPanel(t)}
            className="bg-indigo-50 w-[30px] h-[30px] rounded-md items-center justify-center border border-indigo-100"
            activeOpacity={0.7}
          >
            <AppIcon name="settings" size={15} color="#6366F1" />
          </TouchableOpacity>
          <EntityActionButtons
            onEdit={() => router.push(`/(admin)/teacher-form?id=${t.teacherID}`)}
            onDelete={() => handleDeleteClick(t)}
          />
        </View>
      ),
    },
  ];

  // ── Permission Panel Modal ────────────────────────────────────────────────
  const renderPermissionPanel = () => {
    if (!selectedTeacher) return null;
    return (
      <Modal visible={panelVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={closePanel}>
        <View className="flex-1 bg-gray-50 dark:bg-slate-800">
          {/* Header */}
          <View className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-5 pt-12 pb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <TeacherAvatar photo={selectedTeacher.photo ?? undefined} size={48} />
              <View>
                <Text className="text-[18px] font-black text-gray-900 dark:text-slate-100">{selectedTeacher.teacherName}</Text>
                <Text className="text-[12px] text-gray-500 dark:text-slate-400 font-semibold mt-0.5">Class Assignments & Module Permissions</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closePanel} className="w-9 h-9 bg-gray-100 dark:bg-slate-700 rounded-full items-center justify-center">
              <AppIcon name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
            {selectedTeacher.classPermissions.length === 0 ? (
              <View className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 items-center mb-4">
                <IconCircle name="subjects" size={56} iconSize={28} />
                <Text className="text-gray-700 dark:text-slate-300 font-black text-base mt-4">No classes assigned yet</Text>
                <Text className="text-gray-400 dark:text-slate-500 text-xs mt-1 text-center">Add a class below to configure module access.</Text>
              </View>
            ) : (
              selectedTeacher.classPermissions.map((cp) => {
                const local = localPerms[cp.classID] ?? cp;
                const isSaving = savingClassID === cp.classID;
                return (
                  <View key={cp.classID} className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 mb-3 overflow-hidden">
                    <View className="flex-row items-center justify-between px-4 py-3 bg-[#1A3C6E]">
                      <View className="flex-row items-center gap-2">
                        <View className="w-7 h-7 bg-white dark:bg-slate-800/20 dark:bg-slate-700/50 rounded-lg items-center justify-center">
                          <AppIcon name="subjects" size={14} color="#fff" />
                        </View>
                        <Text className="text-white font-black text-[14px]">{cp.className}</Text>
                      </View>
                      <View className="flex-row gap-2 items-center">
                        {isSaving ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <TouchableOpacity onPress={() => saveClassPerms(cp.classID)} className="px-3 py-1 bg-white dark:bg-slate-800/20 dark:bg-slate-700/50 rounded-lg">
                            <Text className="text-white text-[11px] font-black uppercase">Save</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => setRemoveClassModal({ classID: cp.classID, className: cp.className })}
                          className="w-7 h-7 bg-red-500/80 rounded-lg items-center justify-center"
                        >
                          <AppIcon name="delete" size={13} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    <View className="px-4 py-3">
                      <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase mb-3 tracking-wider">Module Access</Text>
                      <View className="flex-row flex-wrap gap-2">
                        {MODULE_KEYS.map(({ key, label, icon }) => {
                          const enabled = !!(local as any)[key];
                          return (
                            <TouchableOpacity
                              key={key}
                              onPress={() => toggleModule(cp.classID, key)}
                              className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${enabled ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800" : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"}`}
                            >
                              <AppIcon name={icon as any} size={13} color={enabled ? "#059669" : "#9CA3AF"} />
                              <Text className={`text-[11px] font-black ${enabled ? "text-emerald-700" : "text-gray-400 dark:text-slate-500"}`}>{label}</Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                );
              })
            )}

            {unassignedClasses.length > 0 && (
              <View className="bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-gray-300 dark:border-slate-600 p-4 mt-2">
                <Text className="text-[11px] font-black text-gray-400 dark:text-slate-500 uppercase mb-3 tracking-wider">Assign New Class</Text>
                <View className="flex-row flex-wrap gap-2">
                  {unassignedClasses.map((cls: any) => (
                    <TouchableOpacity
                      key={cls.classID}
                      onPress={() => assignClass(cls.classID)}
                      className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200"
                    >
                      <AppIcon name="add" size={12} color="#1A3C6E" />
                      <Text className="text-[11px] font-black text-[#1A3C6E]">{cls.className}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
  };

  // ── Main render ───────────────────────────────────────────────────────────
  return (
    <PremiumScreenLayout
      title="Teachers"
      subtitle="Manage faculty, classes & permissions"
      scrollable={false}
      fullWidth
      hideBack
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
        onRefresh={() => refetch()}
        renderCard={renderTeacherCard}
        tableColumns={tableColumns}
        keyExtractor={(item) => String(item.teacherID)}
        emptyIcon="teachers"
        emptyTitle="No teachers found"
        emptyMessage={searchQuery ? "Try a different search term" : "Register your first faculty member"}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by name, code, or subject..."
      />

      {renderPermissionPanel()}

      {/* ── Delete Teacher Modal ── */}
      <Modal visible={deleteModalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl overflow-hidden shadow-xl">
            {/* Red danger header */}
            <View className="bg-red-50 dark:bg-red-900/20 px-6 pt-6 pb-4 items-center border-b border-red-100 dark:border-red-800">
              <View className="w-14 h-14 bg-red-100 rounded-full items-center justify-center mb-3">
                <AppIcon name="delete" size={26} color="#DC2626" />
              </View>
              <Text className="text-lg font-black text-gray-900 dark:text-slate-100 text-center">Delete Teacher</Text>
              <Text className="text-sm font-semibold text-gray-500 dark:text-slate-400 text-center mt-1">
                This will permanently remove{"\n"}
                <Text className="text-gray-800 dark:text-slate-200 font-black">{teacherToDelete?.teacherName}</Text>
                {"\n"}from the school.
              </Text>
            </View>

            <View className="px-6 py-5">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 dark:bg-slate-700 py-3 rounded-xl items-center justify-center"
                  onPress={() => { setDeleteModalVisible(false); setTeacherToDelete(null); }}
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
        </View>
      </Modal>

      {/* ── Remove Class Confirm Modal ── */}
      <Modal visible={!!removeClassModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl overflow-hidden shadow-xl">
            <View className="bg-amber-50 dark:bg-amber-900/20 px-6 pt-6 pb-4 items-center border-b border-amber-100 dark:border-amber-800">
              <View className="w-14 h-14 bg-amber-100 rounded-full items-center justify-center mb-3">
                <AppIcon name="warning" size={26} color="#D97706" />
              </View>
              <Text className="text-lg font-black text-gray-900 dark:text-slate-100 text-center">Remove Class</Text>
              <Text className="text-sm font-semibold text-gray-500 dark:text-slate-400 text-center mt-1">
                Remove{" "}
                <Text className="text-gray-800 dark:text-slate-200 font-black">{removeClassModal?.className}</Text>
                {" "}from{" "}
                <Text className="text-gray-800 dark:text-slate-200 font-black">{selectedTeacher?.teacherName}</Text>?
                {"\n"}All permissions for this class will be lost.
              </Text>
            </View>
            <View className="px-6 py-5">
              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 dark:bg-slate-700 py-3 rounded-xl items-center justify-center"
                  onPress={() => setRemoveClassModal(null)}
                  disabled={isRemovingClass}
                >
                  <Text className="font-bold text-gray-700 dark:text-slate-300">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 bg-amber-500 py-3 rounded-xl items-center flex-row justify-center gap-2"
                  onPress={confirmRemoveClass}
                  disabled={isRemovingClass}
                >
                  {isRemovingClass && <ActivityIndicator size="small" color="white" />}
                  <Text className="font-bold text-white">Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </PremiumScreenLayout>
  );
}
