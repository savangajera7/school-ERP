import { ParentAttendanceView } from "@/components/attendance/ParentAttendanceView";
import { Alert } from "react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
  Image,
} from "react-native";
import { useDialog } from "@/components/ui/AppDialog";
import { Redirect, router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import {
  useGetApiAttendanceGet,
  usePostApiAttendanceMark,
  usePutApiAttendanceUpdate,
} from "@/api/attendance";
import {
  buildClassStudentsLoadParams,
  buildClassAbsentOnlyMarkRequest,
  parseStudentsView,
  parseClassesView,
  buildAttendanceViewParams,
  normalizeAttendanceStatusFromApi,
  getGetApiAttendanceGetQueryKey,
  isFutureDate,
  getAttendanceRowName,
  getAttendanceRowRoll,
  assertAttendanceApiSuccess,
  getAttendanceApiMessage,
} from "@/api/attendance";
import type { MarkStatus } from "@/components/attendance/StudentMarkRow";

import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { useAttendanceAccess } from "@/hooks/useAttendanceAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { Colors } from "@/constants/colors";
import { SchoolTheme } from "@/constants/theme";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { useColorScheme } from "react-native";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import * as Haptics from "expo-haptics";
import { ScrollView } from "react-native";
import { getApiErrorMessage } from "@/utils/recordHelpers";
import { AppIcon, GenderIcon } from "@/components/icons/AppIcon";
import { parseApiList } from "@/utils/apiResponse";
import { useGetApiMediumGet } from "@/api/generated/master-medium/master-medium";
import { useGetApiBatchGet } from "@/api/generated/2-master-batch/2-master-batch";
import { useGetApiClassGetByMediumShift } from "@/api/generated/master-class-medium-shift-1a-2b/master-class-medium-shift-1a-2b";


const STATUS_CONFIG = {
  Present: {
    label: "P",
    full: "Present",
    active: "bg-emerald-600 border-emerald-600",
    inactive: "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600",
    activeText: "text-white",
    inactiveText: "text-gray-400 dark:text-slate-500",
    badge: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-700",
  },
  Absent: {
    label: "A",
    full: "Absent",
    active: "bg-rose-600 border-rose-600",
    inactive: "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600",
    activeText: "text-white",
    inactiveText: "text-gray-400 dark:text-slate-500",
    badge: "bg-rose-50 border-rose-200",
    badgeText: "text-rose-700",
  },
  Leave: {
    label: "L",
    full: "Leave",
    active: "bg-amber-500 border-amber-500",
    inactive: "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600",
    activeText: "text-white",
    inactiveText: "text-gray-400 dark:text-slate-500",
    badge: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-700",
  },
} as const;

export function AdminTeacherAttendanceView() {
  const isDark = useColorScheme() === "dark";
  const dialog = useDialog();
  const access = useAttendanceAccess();
  const { showToast } = useToast();
  const queryClient = useQueryClient();


  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [selectedMediumID, setSelectedMediumID] = useState<number | null>(null);
  const [selectedBatchID, setSelectedBatchID] = useState<number | null>(null);
  const [classID, setClassID] = useState<number>(0);

  const { data: mediumsData, refetch: refetchMediums } = useGetApiMediumGet();
  const { data: batchesData, refetch: refetchBatches } = useGetApiBatchGet();

  const mediums = useMemo(() => parseApiList<any>(mediumsData?.data), [mediumsData]);

  const batches = useMemo(() => parseApiList<any>(batchesData?.data), [batchesData]);


  // ── Master Data Refresh ───────────────────────────────────────────────────
  useFocusEffect(
    React.useCallback(() => {
      refetchMediums();
      refetchBatches();
    }, [refetchMediums, refetchBatches])
  );


  // Auto-select first medium & batch
  useEffect(() => {
    if (mediums.length > 0 && selectedMediumID === null) {
      setSelectedMediumID(mediums[0].mediumID || mediums[0].id);
    }
  }, [mediums, selectedMediumID]);

  useEffect(() => {
    if (batches.length > 0 && selectedBatchID === null) {
      setSelectedBatchID(batches[0].batchID || batches[0].id);
    }
  }, [batches, selectedBatchID]);


  const userData = useAuthStore((s) => s.userData);

  const [attendanceMap, setAttendanceMap] = useState<Record<number, MarkStatus>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const attendanceParams = useMemo(
    () => buildAttendanceViewParams("classes", { schoolID: userData?.schoolID, attendanceDate: date }),
    [userData?.schoolID, date]
  );
  const { data: attendanceData, refetch: refetchAttendanceClasses } = useGetApiAttendanceGet(attendanceParams);
  const { classes } = useMemo(() => parseClassesView(attendanceData?.data), [attendanceData]);

  // Classes for the selected medium + batch (Medium → Shift → Class flow)
  const classByShiftParams = useMemo(
    () => ({
      mediumID: selectedMediumID ?? undefined,
      batchID: selectedBatchID ?? undefined,
      schoolID: userData?.schoolID,
    }),
    [selectedMediumID, selectedBatchID, userData?.schoolID]
  );
  const { data: classListData } = useGetApiClassGetByMediumShift(classByShiftParams, {
    query: { enabled: !!selectedMediumID && !!selectedBatchID },
  });
  const shiftClasses = useMemo(
    () => parseApiList<any>(classListData?.data),
    [classListData]
  );

  // Which classes already have attendance marked for this date
  const markedMap = useMemo(() => {
    const m: Record<number, boolean> = {};
    classes.forEach((c: any) => {
      m[c.classID] = c.attendanceMarked;
    });
    return m;
  }, [classes]);

  const visibleClasses = useMemo(() => {
    // Prefer the medium/shift class list; fall back to the view=classes list
    const base =
      shiftClasses.length > 0
        ? shiftClasses
          .map((c: any) => {
            const id = c.classID ?? c.id;
            return {
              classID: id,
              className: c.className ?? c.name ?? `Class ${id}`,
              attendanceMarked: markedMap[id] ?? false,
            };
          })
          .filter((c) => !!c.classID)
        : classes;

    return access.isSchoolAdmin
      ? base
      : base.filter((c: any) => access.canMarkClass(c.classID));
  }, [shiftClasses, classes, markedMap, access]);

  // Auto-select valid class
  useEffect(() => {
    if (visibleClasses.length > 0) {
      const currentStillValid = visibleClasses.some(c => c.classID === classID);
      if (!currentStillValid) {
        setClassID(visibleClasses[0].classID);
      }
    } else {
      setClassID(0);
    }
  }, [visibleClasses, classID]);

  const activeClass = visibleClasses.find(c => c.classID === classID);
  const className = activeClass?.className || "Class";
  const alreadyMarked = activeClass?.attendanceMarked || false;

  const queryParams = useMemo(
    () => (classID ? buildClassStudentsLoadParams(classID, date, userData?.schoolID) : undefined),
    [classID, date, userData?.schoolID]
  );

  const { data, isLoading, refetch: refetchStudents } = useGetApiAttendanceGet(queryParams, {
    query: { enabled: !!classID },
  });

  // Force refetch on focus to ensure latest data
  useFocusEffect(
    React.useCallback(() => {
      refetchAttendanceClasses();
      if (classID) refetchStudents();
    }, [refetchAttendanceClasses, refetchStudents, classID])
  );

  const markMutation = usePostApiAttendanceMark();
  const updateMutation = usePutApiAttendanceUpdate();
  const isSaving = markMutation.isPending || updateMutation.isPending;

  const { students } = useMemo(() => parseStudentsView(data?.data), [data]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;
    return students.filter((s) =>
      getAttendanceRowName(s).toLowerCase().includes(q) ||
      String(getAttendanceRowRoll(s)).includes(q)
    );
  }, [students, searchQuery]);

  useEffect(() => {
    const next: Record<number, MarkStatus> = {};
    const nextRemarks: Record<number, string> = {};
    students.forEach((s) => {
      if (!s.studentID) return;
      const norm = normalizeAttendanceStatusFromApi(s.attendanceStatus);
      next[s.studentID] =
        norm === "Absent" ? "Absent" : norm === "Leave" ? "Leave" : "Present";
      if (s.remark) nextRemarks[s.studentID] = s.remark;
    });
    setAttendanceMap(next);
    setRemarks(nextRemarks);
  }, [students]);

  const counts = useMemo(() => {
    let present = 0, absent = 0, leave = 0;
    students.forEach((s) => {
      const st = attendanceMap[s.studentID!] ?? "Present";
      if (st === "Absent") absent++;
      else if (st === "Leave") leave++;
      else present++;
    });
    return { present, absent, leave };
  }, [students, attendanceMap]);

  if (access.isAttendanceReadOnly) return <Redirect href="/(parent)/attendance" />;
  if (classID !== 0 && !access.canMarkClass(classID)) {
    return (
      <AccessDenied message="You do not have attendance permission for this class. Contact school admin." />
    );
  }

  const toggleSelection = (id: number) => {
    setSelectedIds(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      if (next.length === 0) setIsSelectionMode(false);
      return next;
    });
  };

  const handleLongPress = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedIds([id]);
    }
  };

  const handleBulkMark = (status: MarkStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setAttendanceMap(prev => {
      const next = { ...prev };
      selectedIds.forEach(id => next[id] = status);
      return next;
    });
    setSelectedIds([]);
    setIsSelectionMode(false);
  };

  const markAllPresent = () => {
    const next: Record<number, MarkStatus> = {};
    students.forEach((s) => { if (s.studentID) next[s.studentID] = "Present"; });
    setAttendanceMap(next);
    setRemarks({});
  };

  const handleSave = () => {
    if (isFutureDate(date)) {
      dialog.alert("Invalid date", "Cannot mark attendance for a future date.");
      return;
    }

    const studentIds = students.map((s) => s.studentID!).filter(Boolean);
    const absentRate = studentIds.length
      ? (counts.absent + counts.leave) / studentIds.length
      : 0;

    const doSave = async () => {
      const payload = buildClassAbsentOnlyMarkRequest({
        classID,
        attendanceDate: date,
        schoolID: userData?.schoolID ?? null,
        attendanceMap: attendanceMap as Record<number, string>,
        studentIds,
        remarks,
      });

      try {
        const res = alreadyMarked
          ? await updateMutation.mutateAsync({ data: payload })
          : await markMutation.mutateAsync({ data: payload });

        // Backend returns HTTP 200 with { success:false, message } for logical errors
        assertAttendanceApiSuccess(res);

        await queryClient.invalidateQueries({ queryKey: getGetApiAttendanceGetQueryKey() });

        const msg =
          getAttendanceApiMessage(res) ??
          (alreadyMarked ? "Attendance updated." : "Attendance saved.");

        showToast(msg, "success");
        router.replace("/(app)/attendance");
      } catch (e) {
        showToast(getApiErrorMessage(e, "Failed to save attendance."), "error");
      }
    };

    if (absentRate > 0.5) {
      Alert.alert("High absence rate", `More than half the class (${counts.absent + counts.leave} of ${studentIds.length}) is absent or on leave. Save anyway?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Save", onPress: () => void doSave() },
        ]
      );
      return;
    }
    void doSave();
  };

  const renderStudentCard = ({ item }: { item: typeof students[0] }) => {
    const sid = item.studentID!;
    const status = attendanceMap[sid] ?? "Present";
    const showRemark = status !== "Present";
    const isSelected = selectedIds.includes(sid);

    return (
      <View className="mx-3 mb-2">
        <TouchableOpacity
          activeOpacity={0.9}
          onLongPress={() => handleLongPress(sid)}
          onPress={() => { if (isSelectionMode) toggleSelection(sid); }}
          className={`bg-white dark:bg-slate-800 rounded-xl border p-2.5 flex-row items-center ${isSelected ? 'border-blue-500' : 'border-gray-100 dark:border-slate-700'}`}
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 }}
        >
          {/* Selection check */}
          {isSelected && (
            <View className="absolute -top-1 -left-1 z-10 w-5 h-5 rounded-full bg-blue-600 items-center justify-center border border-white">
              <AppIcon name="check" size={10} color="white" />
            </View>
          )}

          {/* Photo */}
          <View className="w-10 h-10 rounded-full bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600 items-center justify-center overflow-hidden mr-2.5">
            {item.studentPhoto ? (
              <Image source={{ uri: item.studentPhoto }} style={{ width: 40, height: 40 }} resizeMode="cover" />
            ) : (
              <GenderIcon gender={item.gender} size={20} />
            )}
          </View>

          {/* Name + Roll */}
          <View className="flex-1 mr-2">
            <Text className="text-[13px] font-bold text-gray-900 dark:text-slate-100" numberOfLines={1}>
              {getAttendanceRowName(item)}
            </Text>
            <Text className="text-[10px] text-gray-400 dark:text-slate-500 font-semibold">
              Roll {getAttendanceRowRoll(item)}
            </Text>
          </View>

          {/* P / A / L buttons */}
          <View className="flex-row gap-1.5">
            {(["Present", "Absent", "Leave"] as MarkStatus[]).map((opt) => {
              const c = STATUS_CONFIG[opt];
              const active = status === opt;
              return (
                <TouchableOpacity
                  key={`${sid}-${opt}`}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAttendanceMap((prev) => ({ ...prev, [sid]: opt })); }}
                  className={`w-9 h-9 rounded-lg border items-center justify-center ${active ? c.active : c.inactive}`}
                  activeOpacity={0.8}
                >
                  <Text className={`text-[12px] font-black ${active ? c.activeText : c.inactiveText}`}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>

        {/* Remark - shown below the row when not present */}
        {showRemark && (
          <View className="mx-1 mt-1 mb-1">
            <TextInput
              value={remarks[sid] ?? ""}
              onChangeText={(text) => setRemarks((prev) => ({ ...prev, [sid]: text }))}
              placeholder="Remark (optional)"
              className="h-8 border border-gray-200 dark:border-slate-600 rounded-lg px-3 text-xs bg-gray-50 dark:bg-slate-800 font-semibold text-gray-800 dark:text-slate-200"
            />
          </View>
        )}
      </View>
    );
  };

  return (
    <PremiumScreenLayout
      title="Attendance"
      subtitle={`${className} · ${date}`}
      scrollable={false}
      fullWidth
      rightAction={
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSaving || isLoading}
          className="flex-row items-center gap-1.5 px-4 py-2.5 rounded-xl"
          style={{ backgroundColor: Colors.accent }}
          activeOpacity={0.85}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <>
              <AppIcon name="calendar" size={14} color="#fff" />
              <Text className="text-white font-black text-xs uppercase">
                {alreadyMarked ? "Update" : "Save"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      }
    >
      {/* Top Selectors Card */}
      <View className="rounded-2xl border mx-3 mt-4 px-4 py-4 mb-3" style={[premiumCardShadow, { backgroundColor: isDark ? SchoolTheme.cardDark : "#FFFFFF", borderColor: isDark ? SchoolTheme.borderDark : "#F3F4F6" }]}>

        {/* Medium Selector */}
        <View className="mb-4">
          <Text className="text-[10px] font-black tracking-widest text-gray-400 dark:text-slate-500 mb-2 uppercase ml-1">Select Medium</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {mediums.map((med: any) => {
              const medId = med.mediumID || med.id;
              const isSelected = selectedMediumID === medId;
              return (
                <TouchableOpacity
                  key={medId}
                  onPress={() => setSelectedMediumID(medId)}
                  className={`px-4 py-1.5 rounded-xl border flex-row items-center gap-1 ${isSelected ? "bg-orange-50 border-orange-200" : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"}`}
                >
                  <Text className={`text-[11px] font-bold ${isSelected ? "text-orange-700" : "text-gray-600 dark:text-slate-300"}`}>
                    {med.mediumName || med.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Batch Selector */}
        <View className="mb-4">
          <Text className="text-[10px] font-black tracking-widest text-gray-400 dark:text-slate-500 mb-2 uppercase ml-1">Select Batch</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {batches.map((batch: any) => {
              const batchId = batch.batchID || batch.id;
              const isSelected = selectedBatchID === batchId;
              return (
                <TouchableOpacity
                  key={batchId}
                  onPress={() => setSelectedBatchID(batchId)}
                  className={`px-4 py-1.5 rounded-xl border flex-row items-center gap-1 ${isSelected ? "bg-emerald-50 border-emerald-200" : "bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600"}`}
                >
                  <Text className={`text-[11px] font-bold ${isSelected ? "text-emerald-700" : "text-gray-600 dark:text-slate-300"}`}>
                    {batch.batchName || batch.name}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Weekly Date Strip */}
        <View className="mb-4 mx-1">
          <Text className="text-[10px] font-black tracking-widest text-gray-400 dark:text-slate-500 mb-2 uppercase">Select Date</Text>
          <View className="flex-row justify-between gap-1.5 w-full">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - 3 + i); // 3 days before today, today, 3 days after today
              const iso = d.toISOString().split("T")[0];
              const isSelected = date === iso;
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = d.getDate();
              const isFuture = isFutureDate(iso);
              return (
                <TouchableOpacity
                  key={iso}
                  onPress={() => { if (!isFuture) setDate(iso) }}
                  className={`flex-1 py-2 rounded-xl items-center justify-center border ${isSelected ? "bg-[#1A3C6E] border-[#1A3C6E]" : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"} ${isFuture ? "opacity-40" : ""}`}
                  activeOpacity={0.8}
                  disabled={isFuture}
                >
                  <Text className={`text-[8px] font-black uppercase mb-0.5 ${isSelected ? 'text-white' : 'text-gray-400 dark:text-slate-500'}`}>{dayName}</Text>
                  <Text className={`text-[13px] font-black ${isSelected ? 'text-white' : 'text-gray-800 dark:text-slate-200'}`}>{dayNum}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Class Selector */}
        <View>
          <Text className="text-[10px] font-black tracking-widest text-gray-400 dark:text-slate-500 mb-2 uppercase ml-1">Select Class</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {visibleClasses.length === 0 ? (
              <Text className="text-xs text-gray-400 dark:text-slate-500 font-semibold italic py-2">No assigned classes</Text>
            ) : visibleClasses.map((c) => {
              const isSelected = classID === c.classID;
              return (
                <TouchableOpacity
                  key={c.classID}
                  onPress={() => setClassID(c.classID)}
                  className={`px-4 py-2 rounded-xl border ${isSelected ? 'bg-[#1A3C6E] border-[#1A3C6E]' : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600'}`}
                  activeOpacity={0.8}
                >
                  <Text className={`text-[11px] font-black uppercase ${isSelected ? 'text-white' : 'text-gray-600 dark:text-slate-400'}`}>
                    {c.className}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Quick actions inside card */}
        <View className="flex-row justify-between mt-3 pt-3 border-t" style={{ borderColor: isDark ? SchoolTheme.borderDark : "#F9FAFB" }}>
          <TouchableOpacity onPress={markAllPresent} className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100" activeOpacity={0.7}>
            <AppIcon name="check" size={11} color="#059669" />
            <Text className="text-[10px] font-black text-emerald-700 uppercase">All Present</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push({ pathname: "/(app)/attendance/detail", params: { classId: String(classID), className, date } })} className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600" activeOpacity={0.7}>
            <AppIcon name="profile" size={11} color="#4B5563" />
            <Text className="text-[10px] font-black text-gray-600 dark:text-slate-400 uppercase">Detail</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push({ pathname: "/(app)/attendance/history", params: { classId: String(classID), date } })} className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-600" activeOpacity={0.7}>
            <AppIcon name="reports" size={11} color="#4B5563" />
            <Text className="text-[10px] font-black text-gray-600 dark:text-slate-400 uppercase">History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View className="px-1 mb-3">
        <View className="flex-row items-center bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl px-3 h-11">
          <AppIcon name="search" size={16} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search student by name or roll..."
            className="flex-1 ml-2 text-sm font-semibold text-gray-800 dark:text-slate-200"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <AppIcon name="close" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Student list */}
      {isLoading ? (
        <SkeletonLoader variant="card" rows={6} />
      ) : (
        <FlatList
          data={filteredStudents}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => String(item.studentID)}
          contentContainerStyle={{ paddingBottom: 120 }}
          onRefresh={refetchStudents}
          refreshing={false}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-gray-400 dark:text-slate-500 font-semibold text-sm">
                {searchQuery ? "No students match your search." : "No students in this class."}
              </Text>
            </View>
          }
          renderItem={renderStudentCard}
        />
      )}
      {/* Bulk Action Footer */}
      {isSelectionMode && selectedIds.length > 0 && (
        <View className="absolute bottom-6 left-4 right-4 bg-gray-900 rounded-2xl p-4 shadow-xl z-50 flex-row items-center justify-between">
          <Text className="text-white font-bold text-sm ml-2">{selectedIds.length} Selected</Text>
          <View className="flex-row gap-2">
            <TouchableOpacity onPress={() => handleBulkMark("Present")} className="bg-emerald-600 px-3 py-2 rounded-xl">
              <Text className="text-white font-bold text-xs">P</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleBulkMark("Absent")} className="bg-rose-600 px-3 py-2 rounded-xl">
              <Text className="text-white font-bold text-xs">A</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleBulkMark("Leave")} className="bg-amber-500 px-3 py-2 rounded-xl">
              <Text className="text-white font-bold text-xs">L</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setIsSelectionMode(false); setSelectedIds([]); }} className="bg-gray-700 px-3 py-2 rounded-xl ml-2">
              <AppIcon name="close" size={14} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </PremiumScreenLayout>
  );
}


export default function UnifiedAttendanceScreen() {
  const { isParent, isStudent } = useAttendanceAccess();

  if (isParent || isStudent) {
    return <ParentAttendanceView />;
  }

  return <AdminTeacherAttendanceView />;
}
