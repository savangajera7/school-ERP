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

function PeriodCard({
  period, index, canEdit,
  onEdit, onDelete,
}: {
  period: Period; index: number; canEdit: boolean;
  onEdit: (p: Period) => void; onDelete: (p: Period) => void;
}) {
  const color = subjectColor(period.subjectName);
  return (
    <View
      className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 mb-3 overflow-hidden"
      style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}
    >
      {/* Color accent bar */}
      <View style={{ height: 3, backgroundColor: color }} />
      <View className="p-4">
        <View className="flex-row items-start justify-between gap-2">
          <View className="flex-1">
            {/* Time badge */}
            {period.hasOverlap && (
              <View className="bg-red-50 px-2 py-1 rounded-lg border border-red-200 self-start mb-2 flex-row items-center gap-1">
                <AppIcon name="warning" size={10} color="#DC2626" />
                <Text className="text-[9px] font-black text-red-600 uppercase tracking-wider">Time Overlap</Text>
              </View>
            )}
            <View className="flex-row items-center gap-2 mb-2">
              <View className="bg-gray-100 dark:bg-slate-700 px-2.5 py-1 rounded-lg flex-row items-center gap-1.5">
                <AppIcon name="clock" size={11} color="#6B7280" />
                <Text className="text-[11px] font-black text-gray-600 dark:text-slate-400">
                  {period.startTime} – {period.endTime}
                </Text>
              </View>
              {period.roomNumber ? (
                <View className="bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg">
                  <Text className="text-[10px] font-black text-blue-600 uppercase">{period.roomNumber}</Text>
                </View>
              ) : null}
            </View>
            {/* Subject */}
            <Text className="text-[15px] font-black text-gray-900 dark:text-slate-100 mb-1" numberOfLines={1}>
              {period.subjectName}
            </Text>
            {/* Teacher / Class */}
            <View className="flex-row items-center gap-1.5">
              <AppIcon name="teachers" size={12} color="#6B7280" />
              <Text className="text-[12px] font-semibold text-gray-500 dark:text-slate-400" numberOfLines={1}>
                {period.teacherName || period.className || "—"}
              </Text>
            </View>
          </View>
          {/* Period number */}
          <View className="w-8 h-8 rounded-xl items-center justify-center" style={{ backgroundColor: color + "18" }}>
            <Text className="text-[13px] font-black" style={{ color }}>{index + 1}</Text>
          </View>
        </View>
        {/* Actions */}
        {canEdit && (
          <View className="flex-row gap-2 mt-3 pt-3 border-t border-gray-50 dark:border-slate-700/50">
            <TouchableOpacity
              onPress={() => onEdit(period)}
              className="flex-1 flex-row items-center justify-center gap-1.5 py-2 bg-indigo-50 border border-indigo-100 rounded-xl"
              activeOpacity={0.7}
            >
              <AppIcon name="edit" size={13} color="#4F46E5" />
              <Text className="text-[11px] font-black text-indigo-700 uppercase">Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(period)}
              className="flex-1 flex-row items-center justify-center gap-1.5 py-2 bg-rose-50 border border-rose-100 rounded-xl"
              activeOpacity={0.7}
            >
              <AppIcon name="delete" size={13} color="#E11D48" />
              <Text className="text-[11px] font-black text-rose-700 uppercase">Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Desktop Table Row ────────────────────────────────────────────────────────

function TableRow({
  period, index, canEdit, onEdit, onDelete,
}: {
  period: Period; index: number; canEdit: boolean;
  onEdit: (p: Period) => void; onDelete: (p: Period) => void;
}) {
  const color = subjectColor(period.subjectName);
  return (
    <View className="flex-row items-center px-5 py-3.5 border-b border-gray-50 dark:border-slate-700 bg-white dark:bg-slate-800">
      {/* # */}
      <View className="w-10 items-center">
        <View className="w-6 h-6 rounded-lg items-center justify-center" style={{ backgroundColor: color + "18" }}>
          <Text className="text-[11px] font-black" style={{ color }}>{index + 1}</Text>
        </View>
      </View>
      {/* Time */}
      <View className="w-[140px]">
        <Text className="text-[12px] font-black text-gray-700 dark:text-slate-300">{period.startTime} – {period.endTime}</Text>
        {period.hasOverlap && (
          <View className="bg-red-50 px-1.5 py-0.5 rounded-md border border-red-200 self-start mt-1 flex-row items-center gap-1">
            <AppIcon name="warning" size={8} color="#DC2626" />
            <Text className="text-[8px] font-black text-red-600 uppercase">Overlap</Text>
          </View>
        )}
      </View>
      {/* Subject */}
      <View className="flex-1 flex-row items-center gap-2">
        <View className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        <Text className="text-sm font-bold text-gray-800 dark:text-slate-200" numberOfLines={1}>{period.subjectName}</Text>
      </View>
      {/* Teacher / Class */}
      <View className="w-[160px]">
        <Text className="text-sm text-gray-500 dark:text-slate-400 font-semibold" numberOfLines={1}>
          {period.teacherName || period.className || "—"}
        </Text>
      </View>
      {/* Room */}
      <View className="w-[90px]">
        {period.roomNumber ? (
          <View className="bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-lg self-start">
            <Text className="text-[10px] font-black text-blue-600 uppercase">{period.roomNumber}</Text>
          </View>
        ) : (
          <Text className="text-sm text-gray-300">—</Text>
        )}
      </View>
      {/* Actions */}
      {canEdit && (
        <View className="w-[80px] flex-row gap-1.5 justify-end">
          <TouchableOpacity
            onPress={() => onEdit(period)}
            className="bg-indigo-50 w-[28px] h-[28px] rounded-lg items-center justify-center border border-indigo-100"
            activeOpacity={0.7}
          >
            <AppIcon name="edit" size={13} color="#4F46E5" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onDelete(period)}
            className="bg-rose-50 w-[28px] h-[28px] rounded-lg items-center justify-center border border-rose-100"
            activeOpacity={0.7}
          >
            <AppIcon name="delete" size={13} color="#E11D48" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function TimetableScreen() {
  const { isSchoolAdmin, isAdmin, isTeacher, isParent, isStudent, userData } = usePermissions();
  const { isMobile } = useResponsive();
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

  const { data: timetableRaw, isLoading, isError, refetch } = useGetApiTimetableGet(
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
        className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 px-4 py-4 mb-4"
        style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 }}
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
          <View className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-[500px] overflow-hidden"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 }}
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
              {/* Class selector (add mode only) */}
              {(isSchoolAdmin || isAdmin || isTeacher) && !editingPeriod && (
                <View className="mb-4">
                  <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Class</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                    {classes.map((cls: any) => (
                      <TouchableOpacity
                        key={cls.classID}
                        onPress={() => setFormClassID(cls.classID)}
                        className={`px-4 py-2 rounded-xl border ${
                          formClassID === cls.classID ? "bg-[#1A3C6E] dark:bg-blue-600 border-[#1A3C6E] dark:border-blue-600" : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                        }`}
                        activeOpacity={0.8}
                      >
                        <Text className={`text-[11px] font-black uppercase ${
                          formClassID === cls.classID ? "text-white" : "text-gray-600 dark:text-slate-400"
                        }`}>
                          {cls.className}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}

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
          <View className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-[420px] overflow-hidden"
            style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 24, elevation: 8 }}
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
                  className={`px-4 py-2 rounded-xl border ${active ? `${c.bg} ${c.border}` : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"}`}
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
          <Text className="text-[16px] font-black text-gray-900 dark:text-slate-100">
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
      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text className="text-gray-400 dark:text-slate-500 mt-3 font-semibold text-sm">Loading schedule...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center p-8">
          <IconCircle name="timetable" size={64} iconSize={32} />
          <Text className="text-gray-700 dark:text-slate-300 font-black text-base mt-4">Could not load timetable</Text>
          <TouchableOpacity onPress={() => refetch()} className="mt-4 px-5 py-2 bg-blue-50 rounded-xl border border-blue-200">
            <Text className="text-[#1A3C6E] font-black text-xs uppercase">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : periods.length === 0 ? (
        <View className="flex-1 items-center justify-center p-8">
          <IconCircle name="timetable" size={64} iconSize={32} />
          <Text className="text-gray-700 dark:text-slate-300 font-black text-base mt-4">No periods scheduled</Text>
          <Text className="text-gray-400 dark:text-slate-500 text-sm mt-1 text-center">
            {canEdit ? "Tap \"Add Period\" to create the first period for this day." : "No classes scheduled for this day."}
          </Text>
        </View>
      ) : isMobile ? (
        <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
          {periods.map((p, i) => (
            <PeriodCard
              key={p.timetableID ?? i}
              period={p} index={i} canEdit={canEdit}
              onEdit={openEdit} onDelete={setDeleteTarget}
            />
          ))}
        </ScrollView>
      ) : (
        /* Desktop table */
        <View className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 overflow-hidden"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 }}
        >
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ minWidth: 600 }}>
          {/* Table header */}
          <View className="flex-row items-center px-5 py-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700">
            <View className="w-10"><Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase">#</Text></View>
            <View className="w-[140px]"><Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider">Time</Text></View>
            <View className="flex-1"><Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider">Subject</Text></View>
            <View className="w-[160px]"><Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider">{isTeacher ? "Class" : "Teacher"}</Text></View>
            <View className="w-[90px]"><Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider">Room</Text></View>
            {canEdit && <View className="w-[80px]"><Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase text-right tracking-wider">Actions</Text></View>}
          </View>
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            {periods.map((p, i) => (
              <TableRow
                key={p.timetableID ?? i}
                period={p} index={i} canEdit={canEdit}
                onEdit={openEdit} onDelete={setDeleteTarget}
              />
            ))}
          </ScrollView>
            </View>
          </ScrollView>
        </View>
      )}
    </PremiumScreenLayout>
  );
}
