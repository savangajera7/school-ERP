import React, { useState, useMemo, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, Modal, TextInput,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { usePermissions } from "@/hooks/usePermissions";
import { useResponsive } from "@/hooks/useResponsive";
import { parseApiList } from "@/utils/apiResponse";
import { Colors } from "@/constants/colors";
import {
  useGetApiTimetableGet,
  usePostApiTimetableAdd,
  usePutApiTimetableUpdate,
  usePostApiTimetableDelete,
  getGetApiTimetableGetQueryKey,
} from "@/api/generated/10-timetable/10-timetable";
import { useGetApiClassGet } from "@/api/generated/master-class/master-class";
import {
  useGetApiTeacherGetTeacherList,
} from "@/api/generated/teacher/teacher";
import { useGetApiTeacherPermissionsTeacherId } from "@/api/generated/6-teacher-permissions-admin-assigns-module-access-per-class/6-teacher-permissions-admin-assigns-module-access-per-class";
import { useGetApiSubjectGetSubjectList } from "@/api/generated/subject/subject";
import { useQueryClient } from "@tanstack/react-query";
import { useDialog } from "@/components/ui/AppDialog";
import { SchoolTheme } from "@/constants/theme";
import { useColorScheme } from "nativewind";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { ResponsiveDataList, EntityActionButtons, type TableColumn } from "@/components/shared";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] as const;
type Day = typeof DAYS[number];

const DAY_COLORS: Record<Day, { bg: string; text: string; border: string }> = {
  MONDAY:    { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
  TUESDAY:   { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  WEDNESDAY: { bg: "bg-emerald-50",text: "text-emerald-700",border: "border-emerald-200" },
  THURSDAY:  { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200" },
  FRIDAY:    { bg: "bg-rose-50",   text: "text-rose-700",   border: "border-rose-200" },
  SATURDAY:  { bg: "bg-gray-50 dark:bg-slate-800",   text: "text-gray-600 dark:text-slate-400",   border: "border-gray-200 dark:border-slate-600" },
};

const SUBJECT_COLORS = [
  "#1A3C6E", "#7C3AED", "#059669", "#D97706", "#DC2626",
  "#0891B2", "#BE185D", "#65A30D", "#EA580C", "#6366F1",
];

function subjectColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return SUBJECT_COLORS[Math.abs(h) % SUBJECT_COLORS.length];
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Period {
  timetableID?: number;
  subjectName: string;
  teacherName: string;
  roomNumber: string;
  startTime: string;
  endTime: string;
  className?: string;
  subjectID?: number;
  teacherID?: number;
  hasOverlap?: boolean;
}

interface TimetableView {
  className?: string;
  batchName?: string;
  teacherName?: string;
  day: string;
  date: string;
  periods: Period[];
}

// ─── Period Card ─────────────────────────────────────────────────────────────

// ─── Desktop Table Row Removed ───────────────────────────────────────────────

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function TimetableScreen() {
  const { isSchoolAdmin, isAdmin, isTeacher, isParent, isStudent, userData } = usePermissions();
  const { isMobile } = useResponsive();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const queryClient = useQueryClient();
  const dialog = useDialog();

  const canEdit = isSchoolAdmin || isAdmin;
  const isViewOnly = isParent || isStudent;

  // ── Selectors ─────────────────────────────────────────────────────────────
  const todayIndex = new Date().getDay(); // 0=Sun
  const defaultDay: Day = DAYS[Math.min(todayIndex > 0 ? todayIndex - 1 : 0, 5)];
  const [selectedDay, setSelectedDay] = useState<Day>(defaultDay);
  const [selectedClassID, setSelectedClassID] = useState<number | null>(null);

  // ── Master data ───────────────────────────────────────────────────────────
  const { data: classesRaw } = useGetApiClassGet();
  
  const { data: teacherPermissionsData } = useGetApiTeacherPermissionsTeacherId(
    Number(userData?.id || 0),
    { query: { enabled: isTeacher } }
  );

  const classes = useMemo(() => {
    const allCls = parseApiList<any>(classesRaw?.data);
    if (isSchoolAdmin || isAdmin) return allCls;
    if (isTeacher) {
      const perms = parseApiList<any>(teacherPermissionsData?.data);
      const allowedClassIds = new Set(
        perms.filter((p: any) => p.canTimetable).map((p: any) => p.classID)
      );
      return allCls.filter((c: any) => allowedClassIds.has(c.classID));
    }
    return [];
  }, [classesRaw, isSchoolAdmin, isAdmin, isTeacher, teacherPermissionsData]);

  const { data: teachersRaw } = useGetApiTeacherGetTeacherList();
  const teachers = useMemo(() => parseApiList<any>(teachersRaw?.data), [teachersRaw]);

  const { data: subjectsRaw } = useGetApiSubjectGetSubjectList();
  const subjects = useMemo(() => {
    const list = parseApiList<any>(subjectsRaw?.data);
    return list.filter((s: any) => 
      s.subjectName && 
      s.subjectName.trim().length > 0 && 
      s.subjectName.trim().toLowerCase() !== "show subject"
    );
  }, [subjectsRaw]);

  // Auto-select first class for admin & teacher
  React.useEffect(() => {
    if (classes.length > 0 && selectedClassID === null && (isSchoolAdmin || isAdmin || isTeacher)) {
      setSelectedClassID(classes[0].classID);
    }
  }, [classes, selectedClassID, isSchoolAdmin, isAdmin, isTeacher]);

  // ── Timetable query params ────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    if (isViewOnly) {
      // parent/student — backend resolves class from JWT
      return { View: "student", Day: selectedDay };
    }
    // admin & teacher
    if (!selectedClassID) return null;
    return { ClassID: selectedClassID, Day: selectedDay };
  }, [isViewOnly, selectedClassID, selectedDay]);

  const { data: timetableRaw, isLoading, isError, error, refetch } = useGetApiTimetableGet(
    queryParams ?? undefined,
    { query: { enabled: !!queryParams } }
  );

  const timetableView = useMemo((): TimetableView | null => {
    const d = (timetableRaw as any)?.data?.data ?? (timetableRaw as any)?.data;
    if (!d) return null;
    // The API returns two result sets — header + periods array
    // Orval wraps them; we handle both shapes
    const header = Array.isArray(d) ? d[0] : d;
    const periods: Period[] = Array.isArray(d?.periods)
      ? d.periods
      : Array.isArray(d) && d.length > 1
        ? d[1]
        : [];
    return {
      className: header?.className,
      batchName: header?.batchName,
      teacherName: header?.teacherName,
      day: header?.day ?? selectedDay,
      date: header?.date ?? "",
      periods,
    };
  }, [timetableRaw, selectedDay]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const addMutation = usePostApiTimetableAdd();
  const updateMutation = usePutApiTimetableUpdate();
  const deleteMutation = usePostApiTimetableDelete();

  // ── Form modal state ──────────────────────────────────────────────────────
  const [formVisible, setFormVisible] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [formDay, setFormDay] = useState<Day>(defaultDay);
  const [formClassID, setFormClassID] = useState<number | null>(null);
  const [formSubjectID, setFormSubjectID] = useState<number | null>(null);
  const [formTeacherID, setFormTeacherID] = useState<number | null>(null);
  const [formRoom, setFormRoom] = useState("");
  const [formStart, setFormStart] = useState("08:00");
  const [formEnd, setFormEnd] = useState("09:00");
  const [formSaving, setFormSaving] = useState(false);

  const openAdd = () => {
    setEditingPeriod(null);
    setFormDay(selectedDay);
    setFormClassID(selectedClassID);
    setFormSubjectID(null);
    setFormTeacherID(null);
    setFormRoom("");
    setFormStart("08:00");
    setFormEnd("09:00");
    setFormVisible(true);
  };

  const openEdit = (p: Period) => {
    setEditingPeriod(p);
    setFormDay(selectedDay);
    setFormClassID(selectedClassID);
    setFormSubjectID(p.subjectID ?? null);
    setFormTeacherID(p.teacherID ?? null);
    setFormRoom(p.roomNumber ?? "");
    setFormStart(p.startTime ?? "08:00");
    setFormEnd(p.endTime ?? "09:00");
    setFormVisible(true);
  };

  const handleSave = async () => {
    if (!formSubjectID || !formTeacherID || !formStart || !formEnd) {
      await dialog.alert("Missing Fields", "Subject, Teacher, Start Time and End Time are required.", "warning");
      return;
    }
    setFormSaving(true);
    try {
      if (editingPeriod?.timetableID) {
        await updateMutation.mutateAsync({
          data: { timetableID: editingPeriod.timetableID, subjectID: formSubjectID, teacherID: formTeacherID, roomNumber: formRoom || null, startTime: formStart, endTime: formEnd },
        });
      } else {
        const classId = formClassID ?? selectedClassID;
        if (!classId) { await dialog.alert("Error", "Please select a class.", "error"); return; }
        await addMutation.mutateAsync({
          data: { classID: classId, day: formDay, subjectID: formSubjectID, teacherID: formTeacherID, roomNumber: formRoom || null, startTime: formStart, endTime: formEnd },
        });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/timetable/get'] });
      setFormVisible(false);
    } catch (e: any) {
      await dialog.alert("Error", e?.message || "Failed to save period", "error");
    } finally {
      setFormSaving(false);
    }
  };

  // ── Delete modal ──────────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Period | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget?.timetableID) return;
    setIsDeleting(true);
    try {
      await deleteMutation.mutateAsync({ data: { timetableID: deleteTarget.timetableID } });
      queryClient.invalidateQueries({ queryKey: ['/api/timetable/get'] });
      setDeleteTarget(null);
    } catch (e: any) {
      await dialog.alert("Error", e?.message || "Failed to delete period", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const sortedPeriods = useMemo(() => {
    const sorted = [...(timetableView?.periods ?? [])].sort((a, b) => {
      return a.startTime.localeCompare(b.startTime);
    });
    
    // Check overlaps
    return sorted.map((p, i) => {
      let hasOverlap = false;
      if (i > 0) {
        if (p.startTime < sorted[i-1].endTime) {
          hasOverlap = true;
        }
      }
      return { ...p, hasOverlap };
    });
  }, [timetableView?.periods]);
  const periods = sortedPeriods;

  const tableColumns: TableColumn<Period>[] = [
    {
      key: "rowNo", header: "#", width: 48, align: "center",
      render: (p, i) => {
        const color = subjectColor(p.subjectName);
        return (
          <View className="w-6 h-6 rounded-lg items-center justify-center" style={{ backgroundColor: color + "30" }}>
            <Text className="text-[11px] font-black" style={{ color }}>{i + 1}</Text>
          </View>
        );
      },
    },
    {
      key: "time", header: "Time", width: 140,
      render: (p) => (
        <View>
          <Text className="text-[12px] font-black" style={{ color: isDark ? SchoolTheme.textDark : "#374151" }}>{p.startTime} – {p.endTime}</Text>
          {p.hasOverlap && (
            <View className="px-1.5 py-0.5 rounded-md border self-start mt-1 flex-row items-center gap-1" style={{ backgroundColor: isDark ? "#450A0A" : "#FEF2F2", borderColor: isDark ? "#7F1D1D" : "#FECACA" }}>
              <AppIcon name="warning" size={8} color={isDark ? "#F87171" : "#DC2626"} />
              <Text className="text-[8px] font-black uppercase" style={{ color: isDark ? "#FCA5A5" : "#DC2626" }}>Overlap</Text>
            </View>
          )}
        </View>
      ),
    },
    {
      key: "subject", header: "Subject", flex: 1,
      render: (p) => {
        const color = subjectColor(p.subjectName);
        return (
          <View className="flex-row items-center gap-2">
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <Text className="text-sm font-bold" numberOfLines={1} style={{ color: isDark ? SchoolTheme.textDark : "#1F2937" }}>{p.subjectName}</Text>
          </View>
        );
      },
    },
    {
      key: "teacherClass", header: isTeacher ? "Class" : "Teacher", width: 160,
      render: (p) => (
        <Text className="text-sm font-semibold" numberOfLines={1} style={{ color: isDark ? SchoolTheme.textSecondaryDark : "#6B7280" }}>
          {p.teacherName || p.className || "—"}
        </Text>
      ),
    },
    {
      key: "room", header: "Room", width: 90,
      render: (p) => (
        p.roomNumber ? (
          <View className="border px-2 py-0.5 rounded-lg self-start" style={{ backgroundColor: isDark ? "#1E3A8A" : "#EFF6FF", borderColor: isDark ? "#1E40AF" : "#DBEAFE" }}>
            <Text className="text-[10px] font-black uppercase" style={{ color: isDark ? "#60A5FA" : "#2563EB" }}>{p.roomNumber}</Text>
          </View>
        ) : <Text className="text-sm" style={{ color: isDark ? "#475569" : "#D1D5DB" }}>—</Text>
      ),
    },
    {
      key: "actions", header: "Actions", width: 80, align: "right",
      render: (p) => canEdit ? (
        <View className="flex-row gap-1.5 justify-end">
          <EntityActionButtons onEdit={() => openEdit(p)} onDelete={() => setDeleteTarget(p)} />
        </View>
      ) : <></>,
    },
  ];

  const renderPeriodCard = (period: Period, index: number) => {
    const color = subjectColor(period.subjectName);
    return (
      <View
        className="rounded-2xl border mb-3 overflow-hidden"
        style={[
          premiumCardShadow,
          {
            backgroundColor: isDark ? SchoolTheme.cardDark : "#FFFFFF",
            borderColor: isDark ? SchoolTheme.borderDark : "#F3F4F6",
          }
        ]}
      >
        <View style={{ height: 3, backgroundColor: color }} />
        <View className="p-4">
          <View className="flex-row items-start justify-between gap-2">
            <View className="flex-1">
              {period.hasOverlap && (
                <View className="px-2 py-1 rounded-lg border self-start mb-2 flex-row items-center gap-1" style={{ backgroundColor: isDark ? "#450A0A" : "#FEF2F2", borderColor: isDark ? "#7F1D1D" : "#FECACA" }}>
                  <AppIcon name="warning" size={10} color={isDark ? "#F87171" : "#DC2626"} />
                  <Text className="text-[9px] font-black uppercase tracking-wider" style={{ color: isDark ? "#FCA5A5" : "#DC2626" }}>Time Overlap</Text>
                </View>
              )}
              <View className="flex-row items-center gap-2 mb-2">
                <View className="px-2.5 py-1 rounded-lg flex-row items-center gap-1.5" style={{ backgroundColor: isDark ? "#1E293B" : "#F3F4F6" }}>
                  <AppIcon name="clock" size={11} color={isDark ? "#94A3B8" : "#6B7280"} />
                  <Text className="text-[11px] font-black" style={{ color: isDark ? "#CBD5E1" : "#4B5563" }}>
                    {period.startTime} – {period.endTime}
                  </Text>
                </View>
                {period.roomNumber ? (
                  <View className="border px-2 py-1 rounded-lg" style={{ backgroundColor: isDark ? "#1E3A8A" : "#EFF6FF", borderColor: isDark ? "#1E40AF" : "#DBEAFE" }}>
                    <Text className="text-[10px] font-black uppercase" style={{ color: isDark ? "#60A5FA" : "#2563EB" }}>{period.roomNumber}</Text>
                  </View>
                ) : null}
              </View>
              <Text className="text-[15px] font-black mb-1" numberOfLines={1} style={{ color: isDark ? SchoolTheme.textDark : "#111827" }}>
                {period.subjectName}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <AppIcon name="teachers" size={12} color={isDark ? SchoolTheme.textSecondaryDark : "#6B7280"} />
                <Text className="text-[12px] font-semibold" numberOfLines={1} style={{ color: isDark ? SchoolTheme.textSecondaryDark : "#6B7280" }}>
                  {period.teacherName || period.className || "—"}
                </Text>
              </View>
            </View>
            <View className="w-8 h-8 rounded-xl items-center justify-center" style={{ backgroundColor: color + "30" }}>
              <Text className="text-[13px] font-black" style={{ color }}>{index + 1}</Text>
            </View>
          </View>
          {canEdit && (
            <View className="flex-row gap-2 mt-3 pt-3 border-t" style={{ borderColor: isDark ? SchoolTheme.borderDark : "#F9FAFB" }}>
              <TouchableOpacity onPress={() => openEdit(period)} className="flex-1 flex-row items-center justify-center gap-1.5 py-2 border rounded-xl" style={{ backgroundColor: isDark ? "#1E3A8A" : "#EEF2FF", borderColor: isDark ? "#1E40AF" : "#E0E7FF" }} activeOpacity={0.7}>
                <AppIcon name="edit" size={13} color={isDark ? "#818CF8" : "#4F46E5"} />
                <Text className="text-[11px] font-black uppercase" style={{ color: isDark ? "#A5B4FC" : "#4338CA" }}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setDeleteTarget(period)} className="flex-1 flex-row items-center justify-center gap-1.5 py-2 border rounded-xl" style={{ backgroundColor: isDark ? "#4C1D95" : "#FFF1F2", borderColor: isDark ? "#5B21B6" : "#FFE4E6" }} activeOpacity={0.7}>
                <AppIcon name="delete" size={13} color={isDark ? "#F43F5E" : "#E11D48"} />
                <Text className="text-[11px] font-black uppercase" style={{ color: isDark ? "#FDA4AF" : "#BE123C" }}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };
  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <PremiumScreenLayout
      title="Timetable"
      subtitle={
        isTeacher ? "Your teaching schedule" :
        isViewOnly ? "Your child's class schedule" :
        "Manage class schedules & periods"
      }
      scrollable={false}
      fullWidth
      hideBack
      rightAction={
        canEdit ? (
          <TouchableOpacity
            onPress={openAdd}
            className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl"
            style={{ backgroundColor: Colors.accent }}
            activeOpacity={0.8}
          >
            <AppIcon name="add" size={15} color="white" />
            <Text className="text-white font-black text-xs uppercase tracking-widest">Add Period</Text>
          </TouchableOpacity>
        ) : undefined
      }
    >
      {/* ── Filters bar ── */}
      <View
        className="rounded-2xl border px-4 py-4 mb-4"
        style={[premiumCardShadow, { backgroundColor: isDark ? SchoolTheme.cardDark : "#FFFFFF", borderColor: isDark ? SchoolTheme.borderDark : "#F3F4F6" }]}
      >
        {/* Class selector — admin & teacher */}
        {(isSchoolAdmin || isAdmin || isTeacher) && (
          <View className="mb-4">
            <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              {isTeacher ? "Select Permitted Class" : "Select Class"}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {classes.length === 0 && isTeacher ? (
                <Text className="text-xs text-gray-400 dark:text-slate-500 font-semibold italic py-2">No class permissions</Text>
              ) : classes.map((cls: any) => (
                <TouchableOpacity
                  key={cls.classID}
                  onPress={() => setSelectedClassID(cls.classID)}
                  className={`px-4 py-2 rounded-xl border ${
                    selectedClassID === cls.classID
                      ? "bg-[#1A3C6E] border-[#1A3C6E]"
                      : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                  }`}
                  activeOpacity={0.8}
                >
                  <Text className={`text-[11px] font-black uppercase ${
                    selectedClassID === cls.classID ? "text-white" : "text-gray-600 dark:text-slate-400"
                  }`}>
                    {cls.className}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

      {/* ── Form Modal ── */}
      <Modal visible={formVisible} transparent animationType="fade">
        <SafeAreaView className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="rounded-3xl w-full max-w-[500px] overflow-hidden"
            style={[{ backgroundColor: isDark ? SchoolTheme.cardDark : "#FFFFFF" }, { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 }]}
          >
            {/* Header */}
            <View className="px-6 py-5 border-b border-gray-100 dark:border-slate-700 flex-row items-center justify-between">
              <View className="flex-row items-center gap-3">
                <View className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 items-center justify-center">
                  <AppIcon name={editingPeriod ? "edit" : "add"} size={18} color="#4F46E5" />
                </View>
                <View>
                  <Text className="text-[16px] font-black text-gray-900 dark:text-slate-100">
                    {editingPeriod ? "Edit Period" : "Add New Period"}
                  </Text>
                  <Text className="text-[11px] text-gray-400 dark:text-slate-500 font-semibold mt-0.5">
                    {selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setFormVisible(false)} className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-slate-700 items-center justify-center" activeOpacity={0.7}>
                <AppIcon name="close" size={16} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Form */}
            <ScrollView className="px-6 py-5" showsVerticalScrollIndicator={false}>
              {/* Subject */}
              <View className="mb-4">
                <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Subject *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {subjects.map((sub: any) => (
                    <TouchableOpacity
                      key={sub.subjectID}
                      onPress={() => setFormSubjectID(sub.subjectID)}
                      className={`px-4 py-2 rounded-xl border ${
                        formSubjectID === sub.subjectID ? "bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500" : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text className={`text-[11px] font-black ${
                        formSubjectID === sub.subjectID ? "text-white" : "text-gray-600 dark:text-slate-400"
                      }`}>
                        {sub.subjectName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Teacher */}
              <View className="mb-4">
                <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Teacher *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {teachers.map((t: any) => (
                    <TouchableOpacity
                      key={t.teacherID}
                      onPress={() => setFormTeacherID(t.teacherID)}
                      className={`px-4 py-2 rounded-xl border ${
                        formTeacherID === t.teacherID ? "bg-indigo-600 dark:bg-indigo-500 border-indigo-600 dark:border-indigo-500" : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                      }`}
                      activeOpacity={0.8}
                    >
                      <Text className={`text-[11px] font-black ${
                        formTeacherID === t.teacherID ? "text-white" : "text-gray-600 dark:text-slate-400"
                      }`}>
                        {t.firstName} {t.lastName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Time */}
              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Start Time *</Text>
                  <TextInput
                    value={formStart}
                    onChangeText={setFormStart}
                    placeholder="08:00"
                    className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 dark:text-slate-200"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">End Time *</Text>
                  <TextInput
                    value={formEnd}
                    onChangeText={setFormEnd}
                    placeholder="09:00"
                    className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 dark:text-slate-200"
                  />
                </View>
              </View>

              {/* Room */}
              <View className="mb-4">
                <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Room Number</Text>
                <TextInput
                  value={formRoom}
                  onChangeText={setFormRoom}
                  placeholder="e.g. 101, Lab A"
                  className="bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 dark:text-slate-200"
                />
              </View>
            </ScrollView>

            {/* Footer */}
            <View className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex-row gap-3">
              <TouchableOpacity
                onPress={() => setFormVisible(false)}
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600"
                activeOpacity={0.7}
              >
                <Text className="text-center text-[12px] font-black text-gray-600 dark:text-slate-300 uppercase">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSave}
                disabled={formSaving}
                className="flex-1 py-3 rounded-xl bg-indigo-600 border border-indigo-600"
                activeOpacity={0.7}
              >
                {formSaving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-center text-[12px] font-black text-white uppercase">
                    {editingPeriod ? "Update" : "Add Period"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ── Delete Modal ── */}
      <Modal visible={!!deleteTarget} transparent animationType="fade">
        <SafeAreaView className="flex-1 bg-black/50 items-center justify-center p-4">
          <View className="rounded-3xl w-full max-w-[420px] overflow-hidden"
            style={[{ backgroundColor: isDark ? SchoolTheme.cardDark : "#FFFFFF" }, { shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 }]}
          >
            {/* Header */}
            <View className="px-6 py-5 bg-rose-50 border-b border-rose-100 flex-row items-center gap-3">
              <View className="w-10 h-10 rounded-xl bg-rose-100 border border-rose-200 items-center justify-center">
                <AppIcon name="delete" size={18} color="#E11D48" />
              </View>
              <View className="flex-1">
                <Text className="text-[16px] font-black text-rose-900">Delete Period</Text>
                <Text className="text-[11px] text-rose-600 font-semibold mt-0.5">This action cannot be undone</Text>
              </View>
            </View>

            {/* Body */}
            <View className="px-6 py-5">
              <Text className="text-sm text-gray-600 dark:text-slate-400 font-semibold leading-relaxed">
                Are you sure you want to delete the period for{" "}
                <Text className="font-black text-gray-900 dark:text-slate-100">{deleteTarget?.subjectName}</Text>
                {deleteTarget?.startTime && deleteTarget?.endTime && (
                  <Text> ({deleteTarget.startTime} – {deleteTarget.endTime})</Text>
                )}?
              </Text>
            </View>

            {/* Footer */}
            <View className="px-6 py-4 border-t border-gray-100 dark:border-slate-700 flex-row gap-3">
              <TouchableOpacity
                onPress={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600"
                activeOpacity={0.7}
              >
                <Text className="text-center text-[12px] font-black text-gray-600 dark:text-slate-400 uppercase">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 border border-rose-600"
                activeOpacity={0.7}
              >
                {isDeleting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text className="text-center text-[12px] font-black text-white uppercase">Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

        {/* Day selector */}
        <View>
          <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Select Day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {DAYS.map((day) => {
              const active = selectedDay === day;
              const c = DAY_COLORS[day];
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-xl border ${active ? `${c.bg} ${c.border}` : ""}`}
                  style={!active ? { backgroundColor: isDark ? SchoolTheme.cardDark : "#FFFFFF", borderColor: isDark ? SchoolTheme.borderDark : "#E5E7EB" } : {}}
                  activeOpacity={0.8}
                >
                  <Text className={`text-[11px] font-black uppercase ${active ? c.text : "text-gray-500 dark:text-slate-400"}`}>
                    {day.charAt(0) + day.slice(1).toLowerCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* ── Header info ── */}
      <View className="flex-row items-center justify-between mb-3 px-1">
        <View>
          <Text className="text-[16px] font-black" style={{ color: isDark ? SchoolTheme.textDark : "#111827" }}>
            {selectedDay.charAt(0) + selectedDay.slice(1).toLowerCase()}'s Schedule
          </Text>
          <Text className="text-[12px] text-gray-400 dark:text-slate-500 font-semibold mt-0.5">
            {timetableView?.className
              ? `Class ${timetableView.className}${timetableView.batchName ? ` · ${timetableView.batchName}` : ""}`
              : timetableView?.teacherName
                ? timetableView.teacherName
                : isViewOnly ? "Your child's class" : "Select a class above"}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <View className="bg-gray-100 dark:bg-slate-700 px-3 py-1.5 rounded-xl flex-row items-center gap-1.5">
            <AppIcon name="subjects" size={12} color="#6B7280" />
            <Text className="text-[11px] font-black text-gray-600 dark:text-slate-400">{periods.length} periods</Text>
          </View>
        </View>
      </View>

      {/* ── Content ── */}
      <View className="flex-1 mt-2">
        <ResponsiveDataList
          data={periods}
          isLoading={isLoading}
          isError={isError}
          error={error}
          onRefresh={refetch}
          renderCard={renderPeriodCard}
          tableColumns={tableColumns}
          keyExtractor={(item, index) => item.timetableID ? String(item.timetableID) : String(index)}
          emptyIcon="timetable"
          emptyTitle="No periods scheduled"
          emptyMessage={canEdit ? "Tap 'Add Period' to create the first period for this day." : "No classes scheduled for this day."}
        />
      </View>
    </PremiumScreenLayout>
  );
}
