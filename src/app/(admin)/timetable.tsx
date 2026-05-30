import React, { useState, useMemo, useCallback, useEffect } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  ActivityIndicator, Modal, TextInput,
} from "react-native";
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
  getApiTimetableGet,
} from "@/api/generated/10-timetable/10-timetable";
import { useGetApiClassGet } from "@/api/generated/master-class-medium-shift-1a-2b/master-class-medium-shift-1a-2b";
import { useGetApiMediumGet } from "@/api/generated/master-medium/master-medium";
import { useGetApiBatchGet } from "@/api/generated/2-master-batch/2-master-batch";
import {
  useGetApiTeacherGetTeacherList,
} from "@/api/generated/teacher/teacher";
import { useGetApiTeacherPermissionsTeacherId } from "@/api/generated/6-teacher-permissions-admin-assigns-module-access-per-class/6-teacher-permissions-admin-assigns-module-access-per-class";
import { useGetApiSubjectGetSubjectList } from "@/api/generated/subject/subject";
import { useQueryClient } from "@tanstack/react-query";
import { useDialog } from "@/components/ui/AppDialog";
import { SchoolTheme } from "@/constants/theme";
import { useColorScheme } from "nativewind";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { ResponsiveDataList } from "@/components/shared/ResponsiveDataList";
import { EntityActionButtons } from "@/components/shared/EntityActionButtons";
import { type TableColumn } from "@/components/shared/DataTable";

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
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

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
  const [selectedMediumID, setSelectedMediumID] = useState<number | null>(null);
  const [selectedBatchID, setSelectedBatchID] = useState<number | null>(null);
  const [selectedClassID, setSelectedClassID] = useState<number | null>(null);


  
  // ── Master data ───────────────────────────────────────────────────────────
  const { data: classesRaw, refetch: refetchClasses } = useGetApiClassGet();
  const { data: mediumsRaw, refetch: refetchMediums } = useGetApiMediumGet();
  const { data: batchesRaw, refetch: refetchBatches } = useGetApiBatchGet();
  
  const mediums = useMemo(() => parseApiList<any>(mediumsRaw?.data), [mediumsRaw]);
  const batches = useMemo(() => parseApiList<any>(batchesRaw?.data), [batchesRaw]);

  
  const { data: teacherPermissionsData, refetch: refetchTeacherPerms } = useGetApiTeacherPermissionsTeacherId(
    Number(userData?.id || 0),
    { query: { enabled: isTeacher } }
  );

  
  const classes = useMemo(() => {
    let allCls = parseApiList<any>(classesRaw?.data);
    
    // Filter by selected medium AND batch
    if (selectedMediumID) {
      allCls = allCls.filter((c: any) => c.mediumID === selectedMediumID);
    }
    if (selectedBatchID) {
      allCls = allCls.filter((c: any) => c.batchID === selectedBatchID);
    }

    if (isSchoolAdmin || isAdmin) return allCls;
    if (isTeacher) {
      const perms = parseApiList<any>(teacherPermissionsData?.data);
      const allowedClassIds = new Set(
        perms.filter((p: any) => p.canTimetable).map((p: any) => p.classID)
      );
      return allCls.filter((c: any) => allowedClassIds.has(c.classID));
    }
    return [];
  }, [classesRaw, isSchoolAdmin, isAdmin, isTeacher, teacherPermissionsData, selectedMediumID, selectedBatchID]);


  const { data: teachersRaw, refetch: refetchTeachers } = useGetApiTeacherGetTeacherList();
  const teachers = useMemo(() => parseApiList<any>(teachersRaw?.data), [teachersRaw]);

  const { data: subjectsRaw, refetch: refetchSubjects } = useGetApiSubjectGetSubjectList();
  const subjects = useMemo(() => {
    const list = parseApiList<any>(subjectsRaw?.data);
    return list.filter((s: any) => 
      s.subjectName && 
      s.subjectName.trim().length > 0 && 
      s.subjectName.trim().toLowerCase() !== "show subject"
    );
  }, [subjectsRaw]);

  
  // Auto-select first medium & batch
  React.useEffect(() => {
    if (mediums.length > 0 && selectedMediumID === null) {
      setSelectedMediumID(mediums[0].mediumID);
    }
  }, [mediums, selectedMediumID]);

  React.useEffect(() => {
    if (batches.length > 0 && selectedBatchID === null) {
      setSelectedBatchID(batches[0].batchID);
    }
  }, [batches, selectedBatchID]);

  // Auto-select first class for admin & teacher
  React.useEffect(() => {
    if (classes.length > 0) {
      const currentStillValid = classes.some(c => c.classID === selectedClassID);
      if (!currentStillValid) {
        setSelectedClassID(classes[0].classID);
      }
    } else {
      setSelectedClassID(null);
    }
  }, [classes, isSchoolAdmin, isAdmin, isTeacher]);


  
  // ── Timetable query params ────────────────────────────────────────────────
  const queryParams = useMemo(() => {
    if (isViewOnly) {
      // parent/student — backend resolves class from JWT
      return { View: "student", Day: selectedDay };
    }
    // admin & teacher
    if (!selectedClassID) return null;
    return { ClassID: selectedClassID, Day: selectedDay, BatchID: selectedBatchID ?? undefined };
  }, [isViewOnly, selectedClassID, selectedDay, selectedBatchID]);


  const { data: timetableRaw, isLoading, isError, error, refetch: refetchTimetable } = useGetApiTimetableGet(
    queryParams ?? undefined,
    { query: { enabled: !!queryParams } }
  );

  // Use useEffect instead of useFocusEffect to avoid early navigation context requirements
  React.useEffect(() => {
    if (refetchTimetable) refetchTimetable();
  }, [refetchTimetable, selectedClassID, selectedDay, selectedBatchID]);

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


  // ── PDF Generation ────────────────────────────────────────────────────────
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const downloadPDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      // Fetch data for all days sequentially
      const weekData: Record<string, Period[]> = {};
      let title = "Timetable";
      
      for (const day of DAYS) {
        const params = isViewOnly 
          ? { View: "student", Day: day } 
          : { ClassID: selectedClassID ?? undefined, Day: day, BatchID: selectedBatchID ?? undefined };
          
        if (!isViewOnly && !selectedClassID) continue;
        
        try {
           const res = await getApiTimetableGet(params);
           const d = (res as any)?.data?.data ?? (res as any)?.data;
           if (!d) continue;
           
           const header = Array.isArray(d) ? d[0] : d;
           const periods = Array.isArray(d?.periods) ? d.periods : Array.isArray(d) && d.length > 1 ? d[1] : [];
           
           if (!title || title === "Timetable") {
             if (header?.className) title = `Class ${header.className} ${header.batchName ? `(${header.batchName})` : ''} Timetable`;
             else if (header?.teacherName) title = `${header.teacherName}'s Timetable`;
           }
           
           if (periods.length > 0) {
             weekData[day] = [...periods].sort((a, b) => a.startTime.localeCompare(b.startTime));
           }
        } catch (e) {
           console.log(`Failed to fetch day ${day}`, e);
        }
      }
      
      if (Object.keys(weekData).length === 0) {
        await dialog.alert("No Data", "There are no scheduled periods for this week to export.", "warning");
        setIsGeneratingPDF(false);
        return;
      }
      
      // Build HTML
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #111827; padding: 40px; margin: 0; background: #fff; }
            .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #134A8C; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-container { display: flex; align-items: center; gap: 15px; }
            .logo { width: 60px; height: 60px; object-fit: contain; }
            .school-info h1 { margin: 0; font-size: 24px; color: #111827; }
            .school-info p { margin: 4px 0 0; font-size: 14px; color: #6B7280; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
            .title-info { text-align: right; }
            .title-info h2 { margin: 0; font-size: 22px; color: #134A8C; }
            .title-info p { margin: 4px 0 0; font-size: 14px; color: #6B7280; }
            
            table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
            th { background-color: #F3F4F6; color: #374151; font-weight: 800; text-align: center; padding: 12px; border: 1px solid #D1D5DB; text-transform: uppercase; font-size: 13px; letter-spacing: 1px; }
            td { padding: 12px; border: 1px solid #D1D5DB; vertical-align: top; }
            
            .period-card { background: #F9FAFB; border-left: 4px solid #134A8C; padding: 10px; margin-bottom: 10px; border-radius: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
            .period-card.break { background: #FFF7ED; border-left-color: #EA580C; border: 1px solid #FFEDD5; text-align: center; }
            .time { font-size: 11px; color: #4B5563; font-weight: 800; margin-bottom: 4px; }
            .subject { font-size: 14px; font-weight: 800; color: #111827; margin-bottom: 4px; word-wrap: break-word; }
            .details { font-size: 11px; color: #6B7280; font-weight: 600; }
            .break-text { font-size: 13px; font-weight: 800; color: #C2410C; text-transform: uppercase; letter-spacing: 1px; }
            
            .no-classes { text-align: center; color: #9CA3AF; font-size: 13px; font-style: italic; padding: 20px; }
            .footer { margin-top: 50px; text-align: center; font-size: 11px; color: #9CA3AF; border-top: 1px solid #E5E7EB; padding-top: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-container">
              <img src="https://little-angle.mahispark.com/images/logo.png" class="logo" />
              <div class="school-info">
                <h1>Little Angel's</h1>
                <p>School ERP</p>
              </div>
            </div>
            <div class="title-info">
              <h2>Weekly Timetable</h2>
              <p>${title}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                ${DAYS.map(day => `<th>${day}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              <tr>
                ${DAYS.map(day => {
                  const periods = weekData[day] || [];
                  if (periods.length === 0) return `<td class="no-classes">No Classes</td>`;
                  
                  return `<td>
                    ${periods.map(p => {
                      const isB = p.subjectName?.toLowerCase().includes("break") || p.subjectName?.toLowerCase().includes("lunch");
                      if (isB) {
                        return `
                          <div class="period-card break">
                            <div class="time">${p.startTime} - ${p.endTime}</div>
                            <div class="break-text">${p.subjectName || "Break"}</div>
                          </div>
                        `;
                      }
                      return `
                        <div class="period-card" style="border-left-color: ${subjectColor(p.subjectName || 'A')}">
                          <div class="time">${p.startTime} - ${p.endTime}</div>
                          <div class="subject">${p.subjectName}</div>
                          <div class="details">
                            ${p.teacherName || p.className ? `${p.teacherName || p.className}<br>` : ''}
                            ${p.roomNumber ? `Room: ${p.roomNumber}` : ''}
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </td>`;
                }).join('')}
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            Generated by Little Angel's School Management System on ${new Date().toLocaleDateString()}
          </div>
        </body>
        </html>
      `;

      if (Platform.OS === 'web') {
        const { printAsync } = require("expo-print");
        await printAsync({ html: htmlContent });
      } else {
        const { printToFileAsync } = require("expo-print");
        const { shareAsync } = require("expo-sharing");
        const { uri } = await printToFileAsync({ html: htmlContent });
        await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
      }
      
    } catch (error: any) {
      console.error(error);
      await dialog.alert("Error", error?.message || "Failed to generate PDF.", "error");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // ── Form modal state ──────────────────────────────────────────────────────
  const [formVisible, setFormVisible] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<Period | null>(null);
  const [formDay, setFormDay] = useState<Day>(defaultDay);
  const [formClassID, setFormClassID] = useState<number | null>(null);
  const [formSubjectID, setFormSubjectID] = useState<number | null>(null);
  const [formTeacherID, setFormTeacherID] = useState<number | null>(null);
  const [formRoom, setFormRoom] = useState("");
  const [isBreak, setIsBreak] = useState(false);
  const [breakName, setBreakName] = useState("Break");
  const [formStart, setFormStart] = useState("08:00");
  const [formEnd, setFormEnd] = useState("09:00");
  const [formSaving, setFormSaving] = useState(false);

  // Time Picker state
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const parseTimeString = (timeStr: string) => {
    try {
      const [hours, minutes] = (timeStr || "08:00").split(':').map(Number);
      const date = new Date();
      date.setHours(hours || 0, minutes || 0, 0, 0);
      return date;
    } catch (e) {
      return new Date();
    }
  };

  const formatTimeToString = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const openAdd = () => {
    setEditingPeriod(null);
    setFormDay(selectedDay);
    setFormClassID(selectedClassID);
    setFormSubjectID(null);
    setFormTeacherID(null);
    setFormRoom("");
    setFormStart("08:00");
    setFormEnd("09:00");
    setIsBreak(false);
    setBreakName("Break");
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
    const isB = p.subjectName?.toLowerCase().includes("break") || p.subjectName?.toLowerCase().includes("lunch");
    setIsBreak(isB || false);
    setBreakName(isB && p.subjectName ? p.subjectName : "Break");
    setFormVisible(true);
  };

  const handleSave = async () => {
    if (!isBreak && (!formSubjectID || !formTeacherID)) {
      await dialog.alert("Missing Fields", "Subject and Teacher are required for regular periods.", "warning");
      return;
    }
    if (!formStart || !formEnd) {
      await dialog.alert("Missing Fields", "Start Time and End Time are required.", "warning");
      return;
    }

    if (formStart >= formEnd) {
      await dialog.alert("Invalid Time", "End time must be after start time.", "warning");
      return;
    }
    
    // Attempt to resolve subject ID for break if user has a subject with 'break'
    let resolvedSubjectID = formSubjectID;
    if (isBreak && !resolvedSubjectID) {
       const breakSub = subjects.find((s: any) => s.subjectName?.toLowerCase().includes("break"));
       if (breakSub) resolvedSubjectID = breakSub.subjectID;
    }
    
    setFormSaving(true);
    try {
      if (editingPeriod?.timetableID) {
        await updateMutation.mutateAsync({
          data: { timetableID: editingPeriod.timetableID, subjectID: resolvedSubjectID, teacherID: isBreak ? undefined : (formTeacherID ?? undefined), roomNumber: formRoom || null, startTime: formStart, endTime: formEnd },
        });
      } else {
        const classId = formClassID ?? selectedClassID;
        if (!classId) { await dialog.alert("Error", "Please select a class.", "error"); return; }
        await addMutation.mutateAsync({
          data: { classID: classId ?? undefined, day: formDay, subjectID: resolvedSubjectID ?? undefined, teacherID: isBreak ? undefined : (formTeacherID ?? undefined), roomNumber: formRoom || null, startTime: formStart, endTime: formEnd },
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
        const isB = p.subjectName?.toLowerCase().includes("break") || p.subjectName?.toLowerCase().includes("lunch");
        if (isB) {
          return (
             <View className="flex-row items-center gap-2 px-2 py-1 rounded-lg bg-orange-50 dark:bg-orange-900/30 self-start">
               <AppIcon name="coffee" size={14} color="#EA580C" />
               <Text className="text-sm font-black text-orange-600 dark:text-orange-400">{p.subjectName}</Text>
             </View>
          );
        }
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
    const isB = period.subjectName?.toLowerCase().includes("break") || period.subjectName?.toLowerCase().includes("lunch");
    const color = isB ? "#EA580C" : subjectColor(period.subjectName);
    
    if (isB) {
      return (
        <View
          className="rounded-2xl border mb-3 overflow-hidden flex-row items-center px-4 py-3"
          style={[
            premiumCardShadow,
            {
              backgroundColor: isDark ? "#431407" : "#FFF7ED", // orange-950 / orange-50
              borderColor: isDark ? "#7C2D12" : "#FFEDD5",
            }
          ]}
        >
          <View className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/50 items-center justify-center mr-3">
            <AppIcon name="coffee" size={20} color="#EA580C" />
          </View>
          <View className="flex-1">
            <Text className="text-[15px] font-black text-orange-800 dark:text-orange-200 uppercase tracking-widest">{period.subjectName}</Text>
            <View className="flex-row items-center gap-1.5 mt-0.5">
              <AppIcon name="clock" size={10} color={isDark ? "#FDBA74" : "#F97316"} />
              <Text className="text-[11px] font-bold text-orange-600 dark:text-orange-300">
                {period.startTime} – {period.endTime}
              </Text>
            </View>
          </View>
          {canEdit && (
            <View className="flex-row gap-2">
               <TouchableOpacity onPress={() => openEdit(period)} className="w-8 h-8 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30">
                 <AppIcon name="edit" size={14} color="#EA580C" />
               </TouchableOpacity>
               <TouchableOpacity onPress={() => setDeleteTarget(period)} className="w-8 h-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                 <AppIcon name="delete" size={14} color="#E11D48" />
               </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }
    
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
  
  if (!isMounted) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-slate-900">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }
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
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={downloadPDF}
            disabled={isGeneratingPDF}
            className="flex-row items-center justify-center w-10 h-10 rounded-xl"
            style={{ backgroundColor: isDark ? "#1E293B" : "#F1F5F9", opacity: isGeneratingPDF ? 0.7 : 1 }}
            activeOpacity={0.8}
          >
            {isGeneratingPDF ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <AppIcon name="print" size={18} color={isDark ? "#94A3B8" : "#475569"} />
            )}
          </TouchableOpacity>
          {canEdit && (
            <TouchableOpacity
              onPress={openAdd}
              className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600"
              activeOpacity={0.8}
            >
              <AppIcon name="add" size={14} color="white" />
              <Text className="text-white font-black text-xs uppercase tracking-tight">Add Period</Text>
            </TouchableOpacity>
          )}
        </View>
      }
    >
            {/* ── Filters bar ── */}
      <View
        className="rounded-2xl border px-4 py-4 mb-4"
        style={[premiumCardShadow, { backgroundColor: isDark ? SchoolTheme.cardDark : "#FFFFFF", borderColor: isDark ? SchoolTheme.borderDark : "#F3F4F6" }]}
      >
        {/* Day Selector */}
        <View className="mb-4">
          <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Select Day</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {DAYS.map((day) => (
              <TouchableOpacity
                key={day}
                onPress={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl border ${
                  selectedDay === day
                    ? "bg-indigo-600 border-indigo-600"
                    : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                }`}
                activeOpacity={0.8}
              >
                <Text className={`text-[11px] font-black uppercase tracking-tight ${
                  selectedDay === day ? "text-white" : "text-gray-600 dark:text-slate-400"
                }`}>
                  {day.substring(0, 3)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Medium Selector */}
        <View className="mb-4">
          <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Select Medium</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {Array.isArray(mediums) && mediums.map((med: any) => (
              <TouchableOpacity
                key={med.mediumID}
                onPress={() => setSelectedMediumID(med.mediumID)}
                className={`px-4 py-2 rounded-xl border ${
                  selectedMediumID === med.mediumID 
                    ? "bg-orange-600 border-orange-600" 
                    : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                }`}
              >
                <Text className={`text-[11px] font-black uppercase tracking-tight ${
                  selectedMediumID === med.mediumID ? "text-white" : "text-gray-600 dark:text-slate-300"
                }`}>
                  {med.mediumName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Batch Selector */}
        <View className="mb-4">
          <Text className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">Select Batch</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {batches.map((batch: any) => (
              <TouchableOpacity
                key={batch.batchID}
                onPress={() => setSelectedBatchID(batch.batchID)}
                className={`px-4 py-2 rounded-xl border ${
                  selectedBatchID === batch.batchID 
                    ? "bg-emerald-600 border-emerald-600" 
                    : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                }`}
              >
                <Text className={`text-[11px] font-black uppercase tracking-tight ${
                  selectedBatchID === batch.batchID ? "text-white" : "text-gray-600 dark:text-slate-300"
                }`}>
                  {batch.batchName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        

        {/* Class selector — admin & teacher */}
        {(isSchoolAdmin || isAdmin || isTeacher) && (
          <View>
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
                      ? "bg-indigo-600 border-indigo-600"
                      : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                  }`}
                  activeOpacity={0.8}
                >
                  <Text className={`text-[11px] font-black uppercase tracking-tight ${
                    selectedClassID === cls.classID ? "text-white" : "text-gray-600 dark:text-slate-400"
                  }`}>
                    {cls.className}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      {/* ── Form Modal ── */}
      {formVisible && (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, elevation: 9999 }}>
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
              {/* Break Toggle */}
              <View className="mb-6 flex-row justify-between items-center bg-orange-500/10 dark:bg-orange-500/5 p-4 rounded-2xl border border-orange-500/20">
                <View className="flex-1 mr-4">
                  <View className="flex-row items-center gap-2 mb-1">
                    <AppIcon name="attendance" size={14} color="#f59e0b" />
                    <Text className="text-sm font-black text-orange-700 dark:text-orange-400">Break Period</Text>
                  </View>
                  <Text className="text-[10px] font-bold text-orange-600/70 dark:text-orange-300/50">Enable for lunch, recess, or school events</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setIsBreak(!isBreak)} 
                  activeOpacity={0.8}
                  className={`w-11 h-6 rounded-full p-1 justify-center ${isBreak ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                >
                  <View 
                    className={`w-4 h-4 bg-white rounded-full shadow-sm`} 
                    style={{ transform: [{ translateX: isBreak ? 20 : 0 }] }}
                  />
                </TouchableOpacity>
              </View>

              {/* Subject / Break Name */}
              <View className="mb-6">
                {isBreak ? (
                  <>
                    <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">Break Title</Text>
                    <TextInput
                      value={breakName}
                      onChangeText={setBreakName}
                      placeholder="e.g. Lunch Break"
                      placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                      className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 text-sm font-bold text-gray-800 dark:text-slate-200"
                    />
                  </>
                ) : (
                  <>
                    <View className="flex-row items-center justify-between mb-2 ml-1">
                      <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Select Subject *</Text>
                      {formSubjectID && (
                        <TouchableOpacity onPress={() => setFormSubjectID(null)}>
                          <Text className="text-[10px] font-bold text-indigo-500 uppercase">Clear</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                      {subjects.map((sub: any) => {
                        const isSelected = formSubjectID === sub.subjectID;
                        return (
                          <TouchableOpacity
                            key={sub.subjectID}
                            onPress={() => setFormSubjectID(sub.subjectID)}
                            className={`px-4 py-2.5 rounded-xl border ${
                              isSelected 
                                ? "bg-indigo-600 border-indigo-600" 
                                : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                            }`}
                            activeOpacity={0.8}
                          >
                            <Text className={`text-[11px] font-black uppercase tracking-tight ${
                              isSelected ? "text-white" : "text-slate-600 dark:text-slate-400"
                            }`}>
                              {sub.subjectName}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </>
                )}
              </View>

              {/* Teacher */}
              {!isBreak && (
                <View className="mb-6">
                  <View className="flex-row items-center justify-between mb-2 ml-1">
                    <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">Assign Teacher *</Text>
                    {formTeacherID && (
                      <TouchableOpacity onPress={() => setFormTeacherID(null)}>
                        <Text className="text-[10px] font-bold text-emerald-500 uppercase">Clear</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
                    {teachers.map((t: any) => {
                      const isSelected = formTeacherID === t.teacherID;
                      return (
                        <TouchableOpacity
                          key={t.teacherID}
                          onPress={() => setFormTeacherID(t.teacherID)}
                          className={`px-4 py-2.5 rounded-xl border ${
                            isSelected 
                              ? "bg-emerald-600 border-emerald-600" 
                              : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                          }`}
                          activeOpacity={0.8}
                        >
                          <Text className={`text-[11px] font-black uppercase tracking-tight ${
                            isSelected ? "text-white" : "text-slate-600 dark:text-slate-400"
                          }`}>
                            {t.firstName} {t.lastName}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>
              )}

              {/* Time Selection */}
              <View className="flex-row gap-4 mb-6">
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">Starts At *</Text>
                  <TouchableOpacity
                    onPress={() => setShowStartPicker(true)}
                    activeOpacity={0.7}
                    className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 flex-row items-center justify-between"
                  >
                    <Text className="text-sm font-black text-gray-800 dark:text-slate-200">{formStart}</Text>
                    <View className="w-7 h-7 rounded-lg bg-indigo-500/10 items-center justify-center">
                      <AppIcon name="timetable" size={14} color="#6366F1" />
                    </View>
                  </TouchableOpacity>
                  {showStartPicker && (
                    <DateTimePicker
                      value={parseTimeString(formStart)}
                      mode="time"
                      is24Hour={true}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowStartPicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          setFormStart(formatTimeToString(selectedDate));
                        }
                      }}
                    />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">Ends At *</Text>
                  <TouchableOpacity
                    onPress={() => setShowEndPicker(true)}
                    activeOpacity={0.7}
                    className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 flex-row items-center justify-between"
                  >
                    <Text className="text-sm font-black text-gray-800 dark:text-slate-200">{formEnd}</Text>
                    <View className="w-7 h-7 rounded-lg bg-indigo-500/10 items-center justify-center">
                      <AppIcon name="timetable" size={14} color="#6366F1" />
                    </View>
                  </TouchableOpacity>
                  {showEndPicker && (
                    <DateTimePicker
                      value={parseTimeString(formEnd)}
                      mode="time"
                      is24Hour={true}
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowEndPicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          setFormEnd(formatTimeToString(selectedDate));
                        }
                      }}
                    />
                  )}
                </View>
              </View>

              {/* Room Number */}
              <View className="mb-6">
                <Text className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 ml-1">Room / Location</Text>
                <View className="relative">
                  <TextInput
                    value={formRoom}
                    onChangeText={setFormRoom}
                    placeholder="e.g. Room 101, Science Lab"
                    placeholderTextColor={isDark ? "#475569" : "#94a3b8"}
                    className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl px-4 py-3.5 pl-11 text-sm font-bold text-gray-800 dark:text-slate-200"
                  />
                  <View className="absolute left-4 top-3.5">
                    <AppIcon name="admission" size={16} color="#94a3b8" />
                  </View>
                </View>
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
      </View>
      )}

      {/* ── Delete Modal ── */}
      {!!deleteTarget && (
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, elevation: 9999 }}>
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
      </View>
      )}

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
          onRefresh={refetchTimetable}
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
