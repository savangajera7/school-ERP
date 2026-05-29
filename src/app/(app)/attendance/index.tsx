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
import { Redirect, router, useLocalSearchParams } from "expo-router";
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
} from "@/api/attendance";
import type { MarkStatus } from "@/components/attendance/StudentMarkRow";

import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { useAttendanceAccess } from "@/hooks/useAttendanceAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { Colors } from "@/constants/colors";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import * as Haptics from "expo-haptics";
import { ScrollView } from "react-native";
import { getApiErrorMessage } from "@/utils/recordHelpers";
import { AppIcon, GenderIcon } from "@/components/icons/AppIcon";


const STATUS_CONFIG = {
  Present: {
    label: "P",
    full: "Present",
    active: "bg-emerald-600 border-emerald-600",
    inactive: "bg-white border-gray-200",
    activeText: "text-white",
    inactiveText: "text-gray-400",
    badge: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-700",
  },
  Absent: {
    label: "A",
    full: "Absent",
    active: "bg-rose-600 border-rose-600",
    inactive: "bg-white border-gray-200",
    activeText: "text-white",
    inactiveText: "text-gray-400",
    badge: "bg-rose-50 border-rose-200",
    badgeText: "text-rose-700",
  },
  Leave: {
    label: "L",
    full: "Leave",
    active: "bg-amber-500 border-amber-500",
    inactive: "bg-white border-gray-200",
    activeText: "text-white",
    inactiveText: "text-gray-400",
    badge: "bg-amber-50 border-amber-200",
    badgeText: "text-amber-700",
  },
} as const;

export default function UnifiedAttendanceScreen() {
  const dialog = useDialog();
  const access = useAttendanceAccess();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const [date, setDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [classID, setClassID] = useState<number>(0);

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
  const { data: attendanceData } = useGetApiAttendanceGet(attendanceParams);
  const { classes } = useMemo(() => parseClassesView(attendanceData?.data), [attendanceData]);
  const visibleClasses = useMemo(() => {
    return access.isSchoolAdmin ? classes : classes.filter((c) => access.canMarkClass(c.classID));
  }, [classes, access]);

  useEffect(() => {
    if (classID === 0 && visibleClasses.length > 0) {
      setClassID(visibleClasses[0].classID);
    }
  }, [visibleClasses, classID]);

  const activeClass = visibleClasses.find(c => c.classID === classID);
  const className = activeClass?.className || "Class";
  const alreadyMarked = activeClass?.attendanceMarked || false;

  const queryParams = useMemo(
    () => (classID ? buildClassStudentsLoadParams(classID, date, userData?.schoolID) : undefined),
    [classID, date, userData?.schoolID]
  );

  const { data, isLoading, refetch } = useGetApiAttendanceGet(queryParams, {
    query: { enabled: !!classID },
  });

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

        await queryClient.invalidateQueries({ queryKey: getGetApiAttendanceGetQueryKey() });

        const body = (res as { data?: { message?: string } })?.data;
        const msg =
          typeof body === "object" && body && "message" in body && body.message
            ? String(body.message)
            : alreadyMarked ? "Attendance updated." : "Attendance saved.";

        showToast(msg, "success");
        router.replace("/(app)/attendance");
      } catch (e) {
        showToast(getApiErrorMessage(e, "Failed to save attendance."), "error");
      }
    };

    if (absentRate > 0.5) {
      dialog.alert("High absence rate", `More than half the class (${counts.absent + counts.leave} of ${studentIds.length}) is absent or on leave. Save anyway?`,
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
          className={`bg-white rounded-xl border p-2.5 flex-row items-center ${isSelected ? 'border-blue-500' : 'border-gray-100'}`}
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 }}
        >
          {/* Selection check */}
          {isSelected && (
            <View className="absolute -top-1 -left-1 z-10 w-5 h-5 rounded-full bg-blue-600 items-center justify-center border border-white">
              <AppIcon name="check" size={10} color="white" />
            </View>
          )}

          {/* Photo */}
          <View className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 items-center justify-center overflow-hidden mr-2.5">
            {item.studentPhoto ? (
              <Image source={{ uri: item.studentPhoto }} style={{ width: 40, height: 40 }} resizeMode="cover" />
            ) : (
              <GenderIcon gender={item.gender} size={20} />
            )}
          </View>

          {/* Name + Roll */}
          <View className="flex-1 mr-2">
            <Text className="text-[13px] font-bold text-gray-900" numberOfLines={1}>
              {getAttendanceRowName(item)}
            </Text>
            <Text className="text-[10px] text-gray-400 font-semibold">
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
              className="h-8 border border-gray-200 rounded-lg px-3 text-xs bg-gray-50 font-semibold text-gray-800"
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
      onBack={() => router.back()}
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
              <AppIcon name="save" size={14} color="#fff" />
              <Text className="text-white font-black text-xs uppercase">
                {alreadyMarked ? "Update" : "Save"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      }
    >
      {/* Top Selectors Card */}
      <View className="bg-white mx-3 mt-4 rounded-3xl p-4 mb-3 border border-gray-100" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
        
        {/* Class Selector */}
        <View className="mb-4">
          <Text className="text-[10px] font-black tracking-widest text-gray-400 mb-2 uppercase ml-1">Select Class</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {visibleClasses.length === 0 ? (
              <Text className="text-xs text-gray-400 font-semibold italic py-2">No assigned classes</Text>
            ) : visibleClasses.map((c) => {
              const isSelected = classID === c.classID;
              return (
                <TouchableOpacity
                  key={c.classID}
                  onPress={() => setClassID(c.classID)}
                  className={`px-4 py-2 rounded-xl border ${isSelected ? 'bg-[#1A3C6E] border-[#1A3C6E]' : 'bg-white border-gray-200'}`}
                  activeOpacity={0.8}
                >
                  <Text className={`text-[11px] font-black uppercase ${isSelected ? 'text-white' : 'text-gray-600'}`}>
                    {c.className}
                  </Text>
                </TouchableOpacity>
              )
            })}
          </ScrollView>
        </View>

        {/* Weekly Date Strip (Centered on Today) */}
        <View>
          <Text className="text-[10px] font-black tracking-widest text-gray-400 mb-2 uppercase ml-1">Select Date</Text>
          <View className="flex-row justify-between w-full">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date();
              d.setDate(d.getDate() - 3 + i); // 3 days before today, today, 3 days after today
              const iso = d.toISOString().split("T")[0];
              const isSelected = date === iso;
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = d.getDate();
              return (
                <TouchableOpacity
                  key={iso}
                  onPress={() => setDate(iso)}
                  className={`flex-1 mx-0.5 max-w-[44px] h-[54px] rounded-xl items-center justify-center border ${isSelected ? 'bg-[#1A3C6E] border-[#1A3C6E]' : 'bg-white border-gray-200'}`}
                  activeOpacity={0.8}
                >
                  <Text className={`text-[9px] font-bold uppercase mb-0.5 ${isSelected ? 'text-white' : 'text-gray-400'}`}>{dayName}</Text>
                  <Text className={`text-[14px] font-black ${isSelected ? 'text-white' : 'text-gray-800'}`}>{dayNum}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

          {/* Quick actions inside card */}
          <View className="flex-row justify-between mt-3 pt-3 border-t border-gray-100">
            <TouchableOpacity onPress={markAllPresent} className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100" activeOpacity={0.7}>
              <AppIcon name="check" size={11} color="#059669" />
              <Text className="text-[10px] font-black text-emerald-700 uppercase">All Present</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push({ pathname: "/(app)/attendance/detail", params: { classId: String(classID), className, date } })} className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200" activeOpacity={0.7}>
              <AppIcon name="profile" size={11} color="#4B5563" />
              <Text className="text-[10px] font-black text-gray-600 uppercase">Detail</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push({ pathname: "/(app)/attendance/history", params: { classId: String(classID), date } })} className="flex-row items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-200" activeOpacity={0.7}>
              <AppIcon name="reports" size={11} color="#4B5563" />
              <Text className="text-[10px] font-black text-gray-600 uppercase">History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search */}
      <View className="px-1 mb-3">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 h-11">
          <AppIcon name="search" size={16} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search student by name or roll..."
            className="flex-1 ml-2 text-sm font-semibold text-gray-800"
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
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-gray-400 font-semibold text-sm">
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
