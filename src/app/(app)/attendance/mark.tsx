import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  TextInput,
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
  normalizeAttendanceStatusFromApi,
  getGetApiAttendanceGetQueryKey,
  isFutureDate,
  getAttendanceRowName,
  getAttendanceRowRoll,
} from "@/api/attendance";
import type { MarkStatus } from "@/components/attendance/StudentMarkRow";
import { AttendanceSummaryChips } from "@/components/attendance/AttendanceSummaryChips";
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
import { premiumCardShadow } from "@/constants/premiumStyles";

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

export default function MarkAttendanceScreen() {
  const dialog = useDialog();
  const access = useAttendanceAccess();
  const params = useLocalSearchParams<{
    classId?: string;
    className?: string;
    date?: string;
    marked?: string;
  }>();

  const classID = parseInt(String(params.classId ?? ""), 10);
  const className = String(params.className ?? "Class");
  const date = String(params.date ?? new Date().toISOString().split("T")[0]);
  const alreadyMarked = params.marked === "1";

  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const userData = useAuthStore((s) => s.userData);

  const [attendanceMap, setAttendanceMap] = useState<Record<number, MarkStatus>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

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
  if (!classID || Number.isNaN(classID)) return <Redirect href="/(app)/attendance" />;
  if (!access.canMarkClass(classID)) {
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
    const cfg = STATUS_CONFIG[status];
    const showRemark = status !== "Present";

    const isSelected = selectedIds.includes(sid);
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => handleLongPress(sid)}
        onPress={() => {
          if (isSelectionMode) toggleSelection(sid);
        }}
        className={`bg-white rounded-2xl mb-3 border ${isSelected ? 'border-blue-500' : 'border-gray-100'}`}
        style={premiumCardShadow}
      >
        {isSelected && (
          <View className="absolute top-4 left-4 z-10 w-6 h-6 rounded-md bg-blue-600 items-center justify-center border border-blue-700">
            <AppIcon name="check" size={12} color="white" />
          </View>
        )}
        <View className="p-4 flex-row items-center gap-3">
          <View className="relative">
            <View className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 items-center justify-center">
              <GenderIcon gender={item.gender} size={24} />
            </View>
            {item.rollNumber != null && (
              <View className="absolute -top-1.5 -right-1.5 bg-amber-500 border border-white min-w-[20px] h-5 px-1 rounded-full items-center justify-center">
                <Text className="text-[9px] font-black text-white">{item.rollNumber}</Text>
              </View>
            )}
          </View>

          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-1">
              <Text className="text-sm font-extrabold text-gray-900 flex-1" numberOfLines={1}>
                {getAttendanceRowName(item)}
              </Text>
              <View className={`px-2.5 py-1 rounded-lg border ${cfg.badge}`}>
                <Text className={`text-[9px] font-black uppercase ${cfg.badgeText}`}>
                  {cfg.full}
                </Text>
              </View>
            </View>
            <Text className="text-xs text-gray-400 font-semibold">
              Roll {getAttendanceRowRoll(item)}
            </Text>
          </View>
        </View>

        {/* Status buttons */}
        <View className="flex-row gap-2 px-4 pb-3">
          {(["Present", "Absent", "Leave"] as MarkStatus[]).map((opt) => {
            const c = STATUS_CONFIG[opt];
            const active = status === opt;
            return (
              <TouchableOpacity
                key={`${sid}-${opt}`}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAttendanceMap((prev) => ({ ...prev, [sid]: opt })); }}
                className={`flex-1 py-2.5 rounded-xl border items-center ${active ? c.active : c.inactive}`}
                activeOpacity={0.85}
              >
                <Text className={`text-xs font-black uppercase ${active ? c.activeText : c.inactiveText}`}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Remark input for non-present */}
        {showRemark && (
          <View className="px-4 pb-4">
            <TextInput
              value={remarks[sid] ?? ""}
              onChangeText={(text) => setRemarks((prev) => ({ ...prev, [sid]: text }))}
              placeholder="Remark (optional)"
              className="h-10 border border-gray-200 rounded-xl px-3 text-sm bg-gray-50 font-semibold text-gray-800"
            />
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <PremiumScreenLayout
      title={className}
      subtitle={`${date} · ${alreadyMarked ? "Update" : "Mark"} attendance`}
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
      {/* Weekly Date Strip */}
      <View className="px-2 mb-4 mt-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - 6 + i); // Last 7 days ending today
            const iso = d.toISOString().split("T")[0];
            const isSelected = date === iso;
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = d.getDate();
            return (
              <TouchableOpacity
                key={iso}
                onPress={() => setDate(iso)}
                className={`w-[52px] h-[64px] rounded-2xl items-center justify-center border ${isSelected ? 'bg-indigo-600 border-indigo-700' : 'bg-white border-gray-200'}`}
                activeOpacity={0.7}
              >
                <Text className={`text-[10px] font-bold uppercase mb-1 ${isSelected ? 'text-indigo-100' : 'text-gray-400'}`}>{dayName}</Text>
                <Text className={`text-[16px] font-black ${isSelected ? 'text-white' : 'text-gray-800'}`}>{dayNum}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Summary chips */}
      <View className="px-1 mb-2">
        <AttendanceSummaryChips
          present={counts.present}
          absent={counts.absent}
          leave={counts.leave}
        />
      </View>

      {/* Quick actions */}
      <View className="flex-row gap-2 mb-3 px-1">
        <TouchableOpacity
          onPress={markAllPresent}
          className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100"
          activeOpacity={0.7}
        >
          <AppIcon name="check" size={13} color="#059669" />
          <Text className="text-[11px] font-extrabold text-emerald-700 uppercase">All Present</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(app)/attendance/detail",
              params: { classId: String(classID), className, date },
            })
          }
          className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200"
          activeOpacity={0.7}
        >
          <AppIcon name="profile" size={13} color="#6B7280" />
          <Text className="text-[11px] font-extrabold text-gray-600 uppercase">Detail</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/(app)/attendance/history",
              params: { classId: String(classID), date },
            })
          }
          className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-gray-200"
          activeOpacity={0.7}
        >
          <AppIcon name="reports" size={13} color="#6B7280" />
          <Text className="text-[11px] font-extrabold text-gray-600 uppercase">History</Text>
        </TouchableOpacity>
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
          keyExtractor={(item) => String(item.studentID)}
          contentContainerStyle={{ paddingBottom: 160, paddingHorizontal: 4 }}
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
