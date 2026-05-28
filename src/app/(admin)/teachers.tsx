import React, { useState, useMemo, useCallback } from "react";
import {
  View, Text, TouchableOpacity, Alert, Modal,
  ScrollView, ActivityIndicator, Image,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";
import {
  useDeleteApiTeacherDeleteTeacher,
} from "@/api/generated/teacher/teacher";
import { parseApiList } from "@/utils/apiResponse";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { usePermissions } from "@/hooks/usePermissions";
import { EntityActionButtons, type TableColumn } from "@/components/shared";
import { useGetApiClassGet } from "@/api/generated/master-class/master-class";
import {
  usePostApiTeacherClassAssignmentAdd,
  useDeleteApiTeacherClassAssignmentRemove,
} from "@/api/generated/6-teacher-class-assignment/6-teacher-class-assignment";
import { customInstance } from "@/services/api/axiosInstance";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

// ─── API helpers (not yet in generated files) ────────────────────────────────
// Replaced with Orval hooks

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function AdminTeacherManagementScreen() {
  const { canManageTeachers } = usePermissions();
  const { isMobile } = useResponsive();
  const queryClient = useQueryClient();

  // ── Data ──────────────────────────────────────────────────────────────────
  const { data: teachersRaw, isLoading, isError, error, refetch } = useGetApiTeacherPermissionsAll();

  const { data: classesRaw } = useGetApiClassGet();
  const allClasses = useMemo(() => parseApiList<any>(classesRaw?.data), [classesRaw]);

  const teachers: TeacherWithDetails[] = useMemo(() => {
    const raw = (teachersRaw as any)?.data?.data ?? (teachersRaw as any)?.data ?? [];
    return Array.isArray(raw) ? raw : [];
  }, [teachersRaw]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const deleteTeacher = useDeleteApiTeacherDeleteTeacher();
  const addClassAssignment = usePostApiTeacherClassAssignmentAdd();
  const removeClassAssignment = useDeleteApiTeacherClassAssignmentRemove();
  const permissionMutation = usePostApiTeacherPermissionsSet();

  // ── Permission panel state ────────────────────────────────────────────────
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherWithDetails | null>(null);
  const [panelVisible, setPanelVisible] = useState(false);
  // local edits: classID → permission flags
  const [localPerms, setLocalPerms] = useState<Record<number, ClassPermission>>({});
  const [savingClassID, setSavingClassID] = useState<number | null>(null);

  const openPanel = useCallback((teacher: TeacherWithDetails) => {
    setSelectedTeacher(teacher);
    // seed local state from current data
    const seed: Record<number, ClassPermission> = {};
    teacher.classPermissions.forEach((cp) => { seed[cp.classID] = { ...cp }; });
    setLocalPerms(seed);
    setPanelVisible(true);
  }, []);

  const closePanel = () => { setPanelVisible(false); setSelectedTeacher(null); };

  // Toggle a module flag locally
  const toggleModule = (classID: number, key: keyof ClassPermission) => {
    setLocalPerms((prev) => ({
      ...prev,
      [classID]: { ...prev[classID], [key]: !prev[classID]?.[key] },
    }));
  };

  // Save permissions for one class row
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

  // Assign a new class to teacher
  const assignClass = async (classID: number) => {
    if (!selectedTeacher) return;
    try {
      await addClassAssignment.mutateAsync({
        data: { teacherID: selectedTeacher.teacherID, classIDs: [classID] },
      });
              queryClient.invalidateQueries({ queryKey: getGetApiTeacherPermissionsAllQueryKey() });
      // seed local perms for new class
      const cls = allClasses.find((c: any) => c.classID === classID);
      setLocalPerms((prev) => ({
        ...prev,
        [classID]: {
          classID, className: cls?.className ?? "",
          canNotice: false, canAttendance: false, canHomework: false,
          canClasswork: false, canTimetable: false, canExam: false,
        },
      }));
      // update selectedTeacher locally so panel refreshes
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

  // Remove a class from teacher
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

  // Delete teacher
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

  // ── Unassigned classes (for "Add Class" picker) ───────────────────────────
  const unassignedClasses = useMemo(() => {
    if (!selectedTeacher) return [];
    const assigned = new Set(selectedTeacher.classPermissions.map((c) => c.classID));
    return allClasses.filter((c: any) => !assigned.has(c.classID));
  }, [selectedTeacher, allClasses]);

  // ── Teacher avatar (photo or fallback icon) ──────────────────────────────
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

  // ── Render teacher card ───────────────────────────────────────────────────
  const renderTeacherCard = (item: TeacherWithDetails) => (
    <MobileDataCard
      title={item.teacherName}
      subtitle={item.teacherCode || "No Code"}
      accentColor={Colors.primary}
      icon={<TeacherAvatar photo={item.photo ?? undefined} size={44} />}
      fields={[
        { label: "Subject", value: item.subjectName || "N/A" },
        { label: "Phone",   value: item.mobileNo || "N/A" },
        { label: "Classes", value: item.classPermissions.length
            ? item.classPermissions.map((c) => c.className).join(", ")
            : "No classes assigned" },
      ]}
      actions={
        <View className="flex-row gap-2 flex-wrap">
          <TouchableOpacity
            onPress={() => openPanel(item)}
            className="flex-row items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200"
          >
            <AppIcon name="settings" size={13} color="#1A3C6E" />
            <Text className="text-[11px] font-black text-[#1A3C6E] uppercase">Classes & Permissions</Text>
          </TouchableOpacity>
          <EntityActionButtons
            onEdit={() => router.push(`/(admin)/teacher-form?id=${item.teacherID}`)}
            onDelete={() => handleDelete(item)}
          />
        </View>
      }
    />
  );

  // ── Table columns (desktop) ───────────────────────────────────────────────
  const tableColumns: TableColumn<TeacherWithDetails>[] = [
    { key: "teacherCode", header: "Code", width: 80 },
    {
      key: "teacherName", header: "Teacher Name", flex: 2,
      render: (t, _i) => (
        <View className="flex-row items-center gap-2">
          <TeacherAvatar photo={t.photo ?? undefined} size={28} />
          <Text className="text-sm font-bold text-gray-800">{t.teacherName}</Text>
        </View>
      ),
    },
    { key: "subjectName", header: "Subject", flex: 1 },
    { key: "mobileNo",    header: "Phone",   width: 120 },
    {
      key: "classPermissions", header: "Assigned Classes", flex: 2,
      render: (t, _i) => (
        <Text className="text-sm text-gray-600">
          {t.classPermissions.length
            ? t.classPermissions.map((c) => c.className).join(", ")
            : "—"}
        </Text>
      ),
    },
    {
      key: "actions", header: "Actions", width: 180, align: "right",
      render: (t, _i) => (
        <View className="flex-row gap-2 items-center justify-end">
          <TouchableOpacity
            onPress={() => openPanel(t)}
            className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 border border-blue-200"
          >
            <AppIcon name="settings" size={12} color="#1A3C6E" />
            <Text className="text-[10px] font-black text-[#1A3C6E] uppercase">Permissions</Text>
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

            {/* Assigned classes with permission toggles */}
            {selectedTeacher.classPermissions.length === 0 ? (
              <View className="bg-white rounded-2xl border border-gray-200 p-6 items-center mb-4">
                <AppIcon name="subjects" size={32} color="#D1D5DB" />
                <Text className="text-gray-400 font-bold mt-2 text-center">No classes assigned yet.</Text>
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
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="text-gray-400 mt-3 font-semibold">Loading teachers...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center p-8">
          <AppIcon name="teachers" size={48} color="#E5E7EB" />
          <Text className="text-gray-400 font-bold mt-3 text-center">Failed to load teachers</Text>
          <TouchableOpacity onPress={() => refetch()} className="mt-4 px-5 py-2 bg-blue-50 rounded-xl border border-blue-200">
            <Text className="text-[#1A3C6E] font-black text-xs uppercase">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : teachers.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <IconCircle name="teachers" size={64} iconSize={32} />
          <Text className="text-gray-700 font-black text-lg mt-4">No teachers yet</Text>
          <Text className="text-gray-400 text-sm mt-1 text-center">Register your first faculty member</Text>
          {canManageTeachers && (
            <TouchableOpacity
              onPress={() => router.push("/(admin)/teacher-form")}
              className="mt-5 px-6 py-3 rounded-xl"
              style={{ backgroundColor: Colors.primary }}
            >
              <Text className="text-white font-black text-xs uppercase tracking-widest">+ Add Teacher</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : isMobile ? (
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 12, paddingBottom: 40 }}>
          {teachers.map((t) => (
            <View key={t.teacherID} className="mb-3">
              {renderTeacherCard(t)}
            </View>
          ))}
        </ScrollView>
      ) : (
        // Desktop table
        <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
          {/* Table header */}
          <View className="flex-row bg-gray-100 rounded-xl px-4 py-3 mb-2">
            {tableColumns.map((col) => (
              <View key={col.key} style={{ flex: col.flex, width: col.width, minWidth: 0, alignItems: col.align === "right" ? "flex-end" : "flex-start" }}>
                <Text className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{col.header}</Text>
              </View>
            ))}
          </View>
          {teachers.map((t, rowIdx) => (
            <View key={t.teacherID} className="flex-row bg-white rounded-xl px-4 py-3 mb-2 border border-gray-100 items-center">
              {tableColumns.map((col) => (
                <View key={col.key} style={{ flex: col.flex, width: col.width, minWidth: 0, alignItems: col.align === "right" ? "flex-end" : "flex-start" }}>
                  {col.render ? col.render(t, rowIdx) : (
                    <Text className="text-sm text-gray-700">{String((t as any)[col.key] ?? "—")}</Text>
                  )}
                </View>
              ))}
            </View>
          ))}
        </ScrollView>
      )}

      {renderPermissionPanel()}
    </PremiumScreenLayout>
  );
}
