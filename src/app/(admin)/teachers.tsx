import React, { useState, useMemo, useCallback } from "react";
import {
  View, Text, TouchableOpacity, Alert, Modal,
  ScrollView, ActivityIndicator, Image, TextInput,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import {
  useDeleteApiTeacherDeleteTeacher,
} from "@/api/generated/teacher/teacher";
import { parseApiList } from "@/utils/apiResponse";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { usePermissions } from "@/hooks/usePermissions";
import { ResponsiveDataList, EntityActionButtons, type TableColumn } from "@/components/shared";
import { useGetApiClassGet } from "@/api/generated/master-class/master-class";
import {
  usePostApiTeacherClassAssignmentAdd,
  useDeleteApiTeacherClassAssignmentRemove,
} from "@/api/generated/6-teacher-class-assignment/6-teacher-class-assignment";
import { useQueryClient } from "@tanstack/react-query";
import { useResponsive } from "@/hooks/useResponsive";
import {
  useGetApiTeacherPermissionsAll,
  usePostApiTeacherPermissionsSet,
  getGetApiTeacherPermissionsAllQueryKey,
} from "@/api/generated/6-teacher-permissions-admin-assigns-module-access-per-class/6-teacher-permissions-admin-assigns-module-access-per-class";

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

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: teachersRaw, isLoading, isError, error, refetch } = useGetApiTeacherPermissionsAll();

  const { data: classesRaw } = useGetApiClassGet();
  const allClasses = useMemo(() => parseApiList<any>(classesRaw?.data), [classesRaw]);

  const teachers: TeacherWithDetails[] = useMemo(() => {
    const raw = (teachersRaw as any)?.data?.data ?? (teachersRaw as any)?.data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [teachersRaw]);

  // ── Search ────────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTeachers = useMemo(() => {
    if (!searchQuery.trim()) return teachers;
    const q = searchQuery.toLowerCase();
    return teachers.filter(
      (t) =>
        t.teacherName?.toLowerCase().includes(q) ||
        t.teacherCode?.toLowerCase().includes(q) ||
        t.subjectName?.toLowerCase().includes(q) ||
        t.mobileNo?.includes(q),
    );
  }, [teachers, searchQuery]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const deleteTeacher = useDeleteApiTeacherDeleteTeacher();
  const addClassAssignment = usePostApiTeacherClassAssignmentAdd();
  const removeClassAssignment = useDeleteApiTeacherClassAssignmentRemove();
  const permissionMutation = usePostApiTeacherPermissionsSet();

  // ── Permission panel state ────────────────────────────────────────────────
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithDetails | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [localPerms, setLocalPerms] = useState<Record<number, ClassPermission>>({});
  const [savingClassID, setSavingClassID] = useState<number | null>(null);

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
        }
      });
      queryClient.invalidateQueries({ queryKey: getGetApiTeacherPermissionsAllQueryKey() });
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to save permissions");
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
      const cls = allClasses.find((c: any) => c.classID === classID);
      setLocalPerms((prev) => ({
        ...prev,
        [classID]: {
          classID, className: cls?.className ?? "",
          canNotice: false, canAttendance: false, canHomework: false,
          canClasswork: false, canTimetable: false, canExam: false,
        },
      }));
      setSelectedTeacher((prev) => prev ? {
        ...prev,
        classPermissions: [
          ...prev.classPermissions,
          { classID, className: cls?.className ?? "", canNotice: false, canAttendance: false,
            canHomework: false, canClasswork: false, canTimetable: false, canExam: false },
        ],
      } : prev);
    } catch (e: any) {
      Alert.alert("Error", e.message || "Failed to assign class");
    }
  };

  const removeClass = (classID: number, className: string) => {
    if (!selectedTeacher) return;
    Alert.alert(
      "Remove Class",
      `Remove ${className} from ${selectedTeacher.teacherName}? This also removes all permissions for this class.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove", style: "destructive",
          onPress: async () => {
            try {
              await removeClassAssignment.mutateAsync({
                data: { teacherID: selectedTeacher.teacherID, classID },
              });
              queryClient.invalidateQueries({ queryKey: getGetApiTeacherPermissionsAllQueryKey() });
              setLocalPerms((prev) => { const n = { ...prev }; delete n[classID]; return n; });
              setSelectedTeacher((prev) => prev ? {
                ...prev,
                classPermissions: prev.classPermissions.filter((c) => c.classID !== classID),
              } : prev);
            } catch (e: any) {
              Alert.alert("Error", e.message || "Failed to remove class");
            }
          },
        },
      ]
    );
  };

  const handleDelete = (teacher: TeacherWithDetails) => {
    Alert.alert(
      "Delete Teacher",
      `Remove ${teacher.teacherName} from the school?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete", style: "destructive",
          onPress: async () => {
            try {
              await deleteTeacher.mutateAsync({ data: { teacherID: teacher.teacherID } });
              queryClient.invalidateQueries({ queryKey: getGetApiTeacherPermissionsAllQueryKey() });
            } catch (e: any) {
              Alert.alert("Error", e.message || "Failed to delete teacher");
            }
          },
        },
      ]
    );
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
      className="bg-white rounded-2xl mb-4 border border-gray-100"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
        elevation: 2,
      }}
    >
      {/* Card header */}
      <View className="p-4 border-b border-gray-50 flex-row gap-3 rounded-t-2xl bg-white">
        <View className="relative">
          <View className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 items-center justify-center overflow-hidden">
            <TeacherAvatar photo={item.photo ?? undefined} size={56} />
          </View>
          {item.isActive && (
            <View className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
          )}
        </View>

        <View className="flex-1 justify-center">
          <View className="flex-row items-center justify-between mb-1 gap-2">
            <Text className="text-sm font-extrabold text-gray-900 uppercase flex-1" numberOfLines={1}>
              {item.teacherName}
            </Text>
            <View className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded-lg">
              <Text className="text-[10px] font-black text-blue-700 uppercase">{item.teacherCode || "—"}</Text>
            </View>
          </View>

          {item.subjectName ? (
            <View className="flex-row items-center gap-1.5 mb-1">
              <AppIcon name="subjects" size={12} color="#7C3AED" />
              <Text className="text-[12px] font-bold text-violet-600 flex-1" numberOfLines={1}>
                {item.subjectName}
              </Text>
            </View>
          ) : null}

          <View className="flex-row items-center gap-1.5">
            <AppIcon name="phone" size={12} color="#6B7280" />
            <Text className="text-[12px] font-semibold text-gray-500 flex-1" numberOfLines={1}>
              {item.mobileNo || "No phone"}
            </Text>
          </View>
        </View>
      </View>

      {/* Classes row */}
      {item.classPermissions.length > 0 && (
        <View className="px-4 py-2.5 border-b border-gray-50 flex-row items-center gap-2 flex-wrap">
          <AppIcon name="subjects" size={12} color="#9CA3AF" />
          {item.classPermissions.map((cp) => (
            <View key={cp.classID} className="px-2 py-0.5 bg-teal-50 border border-teal-100 rounded-md">
              <Text className="text-[10px] font-black text-teal-700">{cp.className}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View className="flex-row justify-end items-center px-4 py-2.5 bg-gray-50/50 gap-2 rounded-b-2xl">
        <TouchableOpacity
          className="flex-row items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl"
          onPress={() => openPanel(item)}
          activeOpacity={0.7}
        >
          <AppIcon name="settings" size={12} color="#1A3C6E" />
          <Text className="text-[10px] font-extrabold text-[#1A3C6E] uppercase">Permissions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl"
          onPress={() => router.push(`/(admin)/teacher-form?id=${item.teacherID}`)}
          activeOpacity={0.7}
        >
          <AppIcon name="edit" size={12} color="#4F46E5" />
          <Text className="text-[10px] font-extrabold text-indigo-700 uppercase">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-xl"
          onPress={() => handleDelete(item)}
          activeOpacity={0.7}
        >
          <AppIcon name="delete" size={12} color="#E11D48" />
          <Text className="text-[10px] font-extrabold text-rose-700 uppercase">Delete</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // ── Table columns (desktop) ───────────────────────────────────────────────
  const tableColumns: TableColumn<TeacherWithDetails>[] = [
    {
      key: "rowNo", header: "#", width: 48, align: "center",
      render: (_t, i) => (
        <Text className="text-sm font-semibold text-gray-400">{i + 1}</Text>
      ),
    },
    {
      key: "teacherName", header: "Teacher Name", flex: 2,
      render: (t) => (
        <View className="flex-row items-center gap-2">
          <TeacherAvatar photo={t.photo ?? undefined} size={28} />
          <View className="flex-1 overflow-hidden">
            <Text className="text-sm font-bold text-gray-800" numberOfLines={1}>{t.teacherName}</Text>
            {t.email ? (
              <Text className="text-[11px] text-gray-400 font-semibold" numberOfLines={1}>{t.email}</Text>
            ) : null}
          </View>
        </View>
      ),
    },
    {
      key: "subjectName", header: "Subject", flex: 1,
      render: (t) => (
        <Text className="text-sm text-gray-700 font-semibold" numberOfLines={1}>{t.subjectName || "—"}</Text>
      ),
    },
    {
      key: "mobileNo", header: "Phone", width: 130,
      render: (t) => (
        <Text className="text-sm text-gray-600">{t.mobileNo || "—"}</Text>
      ),
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
            <Text className="text-sm text-gray-400">No classes</Text>
          )}
        </View>
      ),
    },
    {
      key: "isActive", header: "Status", width: 80, align: "center",
      render: (t) => (
        <View className={`px-2 py-1 rounded-md border ${t.isActive ? "bg-green-50 border-green-100" : "bg-gray-50 border-gray-200"}`}>
          <Text className={`text-[10px] font-bold ${t.isActive ? "text-green-700" : "text-gray-500"}`}>
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
            onDelete={() => handleDelete(t)}
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
        <View className="flex-1 bg-gray-50">
          {/* Header */}
          <View className="bg-white border-b border-gray-200 px-5 pt-12 pb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-3">
              <TeacherAvatar photo={selectedTeacher.photo ?? undefined} size={48} />
              <View>
                <Text className="text-[18px] font-black text-gray-900">{selectedTeacher.teacherName}</Text>
                <Text className="text-[12px] text-gray-500 font-semibold mt-0.5">
                  Class Assignments & Module Permissions
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={closePanel} className="w-9 h-9 bg-gray-100 rounded-full items-center justify-center">
              <AppIcon name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>

            {selectedTeacher.classPermissions.length === 0 ? (
              <View className="bg-white rounded-2xl border border-gray-200 p-6 items-center mb-4">
                <IconCircle name="subjects" size={48} iconSize={24} />
                <Text className="text-gray-500 font-bold mt-3 text-center">No classes assigned yet.</Text>
                <Text className="text-gray-400 text-xs mt-1 text-center">Add a class below to set permissions.</Text>
              </View>
            ) : (
              selectedTeacher.classPermissions.map((cp) => {
                const local = localPerms[cp.classID] ?? cp;
                const isSaving = savingClassID === cp.classID;
                return (
                  <View key={cp.classID} className="bg-white rounded-2xl border border-gray-200 mb-3 overflow-hidden">
                    {/* Class header */}
                    <View className="flex-row items-center justify-between px-4 py-3 bg-[#1A3C6E]">
                      <View className="flex-row items-center gap-2">
                        <View className="w-7 h-7 bg-white/20 rounded-lg items-center justify-center">
                          <AppIcon name="subjects" size={14} color="#fff" />
                        </View>
                        <Text className="text-white font-black text-[14px]">{cp.className}</Text>
                      </View>
                      <View className="flex-row gap-2 items-center">
                        {isSaving ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <TouchableOpacity
                            onPress={() => saveClassPerms(cp.classID)}
                            className="px-3 py-1 bg-white/20 rounded-lg"
                          >
                            <Text className="text-white text-[11px] font-black uppercase">Save</Text>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          onPress={() => removeClass(cp.classID, cp.className)}
                          className="w-7 h-7 bg-red-500/80 rounded-lg items-center justify-center"
                        >
                          <AppIcon name="delete" size={13} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Module toggles */}
                    <View className="px-4 py-3">
                      <Text className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-wider">
                        Module Access
                      </Text>
                      <View className="flex-row flex-wrap gap-2">
                        {MODULE_KEYS.map(({ key, label, icon }) => {
                          const enabled = !!(local as any)[key];
                          return (
                            <TouchableOpacity
                              key={key}
                              onPress={() => toggleModule(cp.classID, key)}
                              className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${
                                enabled
                                  ? "bg-emerald-50 border-emerald-300"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <AppIcon
                                name={icon as any}
                                size={13}
                                color={enabled ? "#059669" : "#9CA3AF"}
                              />
                              <Text className={`text-[11px] font-black ${enabled ? "text-emerald-700" : "text-gray-400"}`}>
                                {label}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </View>
                );
              })
            )}

            {/* Add class section */}
            {unassignedClasses.length > 0 && (
              <View className="bg-white rounded-2xl border border-dashed border-gray-300 p-4 mt-2">
                <Text className="text-[11px] font-black text-gray-400 uppercase mb-3 tracking-wider">
                  Assign New Class
                </Text>
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
    </PremiumScreenLayout>
  );
}
