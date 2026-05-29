import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, TextInput, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { useGetApiAttendanceGet } from "@/api/attendance";
import {
  buildAttendanceViewParams,
  parseDetailView,
  normalizeAttendanceStatusFromApi,
  getAttendanceRowName,
  getAttendanceRowRoll,
} from "@/api/attendance";
import { useAuthStore } from "@/store/authStore";
import { useAttendanceAccess } from "@/hooks/useAttendanceAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Colors } from "@/constants/colors";
import { formatDisplayDate } from "@/utils/dateHelpers";
import { AppIcon, GenderIcon } from "@/components/icons/AppIcon";

export default function AttendanceDetailScreen() {
  const access = useAttendanceAccess();
  const params = useLocalSearchParams<{ classId?: string; className?: string; date?: string }>();
  const classID = parseInt(String(params.classId ?? ""), 10);
  const className = String(params.className ?? "Class");
  const date = String(params.date ?? "");
  const schoolID = useAuthStore((s) => s.userData?.schoolID);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "present" | "absent" | "leave">("all");

  const queryParams = useMemo(
    () =>
      classID
        ? buildAttendanceViewParams("detail", { classID, attendanceDate: date, schoolID })
        : undefined,
    [classID, date, schoolID]
  );

  const { data, isLoading } = useGetApiAttendanceGet(queryParams, {
    query: { enabled: !!classID },
  });

  const detail = useMemo(() => parseDetailView(data?.data), [data]);

  const filteredStudents = useMemo(() => {
    let list = detail.students;

    // Filter by status
    if (filter !== "all") {
      list = list.filter((s) => {
        const st = normalizeAttendanceStatusFromApi(s.attendanceStatus);
        if (filter === "present") return st === "Present";
        if (filter === "absent") return st === "Absent";
        return st === "Leave";
      });
    }

    // Filter by search
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter((s) =>
        getAttendanceRowName(s).toLowerCase().includes(q) ||
        String(getAttendanceRowRoll(s)).includes(q)
      );
    }

    return list;
  }, [detail.students, searchQuery, filter]);

  const counts = useMemo(() => {
    let present = 0, absent = 0, leave = 0;
    detail.students.forEach((s) => {
      const st = normalizeAttendanceStatusFromApi(s.attendanceStatus);
      if (st === "Absent") absent++;
      else if (st === "Leave") leave++;
      else present++;
    });
    return { present, absent, leave, total: detail.students.length };
  }, [detail.students]);

  if (!access.canMarkClass(classID) && !access.isSchoolAdmin) {
    return <AccessDenied message="No permission to view this class attendance." />;
  }

  const filterChips: { key: typeof filter; label: string; count: number; color: string; bgActive: string; bgInactive: string }[] = [
    { key: "all", label: "All", count: counts.total, color: "#1A3C6E", bgActive: "bg-[#1A3C6E]", bgInactive: "bg-white border-gray-200" },
    { key: "present", label: "Present", count: counts.present, color: "#059669", bgActive: "bg-emerald-600", bgInactive: "bg-white border-emerald-200" },
    { key: "absent", label: "Absent", count: counts.absent, color: "#DC2626", bgActive: "bg-rose-600", bgInactive: "bg-white border-rose-200" },
    { key: "leave", label: "Leave", count: counts.leave, color: "#D97706", bgActive: "bg-amber-500", bgInactive: "bg-white border-amber-200" },
  ];

  return (
    <PremiumScreenLayout
      title={`${className} — Detail`}
      subtitle={formatDisplayDate(detail.attendanceDate || date)}
      onBack={() => router.back()}
      scrollable={false}
      fullWidth
      rightAction={
        <TouchableOpacity
          onPress={() => router.back()}
          className="flex-row items-center gap-1.5 px-3 py-2 rounded-xl"
          style={{ backgroundColor: Colors.accent }}
          activeOpacity={0.85}
        >
          <AppIcon name="edit" size={13} color="#fff" />
          <Text className="text-white text-[11px] font-black uppercase">Edit</Text>
        </TouchableOpacity>
      }
    >
      {/* Audit + Summary card */}
      <View className="bg-white rounded-2xl border border-gray-100 p-4 mb-3 mx-3 mt-3" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 }}>
        <View className="flex-row gap-4 mb-3">
          <View className="flex-1">
            <Text className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Marked by</Text>
            <Text className="text-[13px] font-extrabold text-gray-900">{detail.takenBy || "—"}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-[10px] font-black uppercase text-gray-400 mb-0.5">Last updated</Text>
            <Text className="text-[13px] font-semibold text-gray-700">{detail.lastUpdatedBy || "—"}</Text>
          </View>
        </View>

        {/* Filter chips */}
        {!isLoading && counts.total > 0 && (
          <View className="flex-row gap-2 pt-3 border-t border-gray-100">
            {filterChips.map((chip) => {
              const active = filter === chip.key;
              return (
                <TouchableOpacity
                  key={chip.key}
                  onPress={() => setFilter(chip.key)}
                  className={`flex-1 py-2 rounded-xl border items-center ${active ? chip.bgActive : chip.bgInactive}`}
                  activeOpacity={0.8}
                >
                  <Text className={`text-[10px] font-black uppercase ${active ? 'text-white' : 'text-gray-500'}`}>
                    {chip.label}
                  </Text>
                  <Text className={`text-[16px] font-black ${active ? 'text-white' : 'text-gray-800'}`}>
                    {chip.count}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* Search */}
      <View className="px-3 mb-3">
        <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 h-10">
          <AppIcon name="search" size={15} color="#9CA3AF" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search student..."
            className="flex-1 ml-2 text-sm font-semibold text-gray-800"
            placeholderTextColor="#9CA3AF"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <AppIcon name="close" size={14} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : (
        <FlatList
          data={filteredStudents}
          keyExtractor={(item) => String(item.studentID)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={
            <View className="items-center py-12">
              <Text className="text-gray-400 font-semibold text-sm">No attendance data found.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const label = normalizeAttendanceStatusFromApi(item.attendanceStatus);
            const isPresent = label === "Present";
            const isLeave = label === "Leave";
            const badgeBg = isPresent ? "bg-emerald-50 border-emerald-200" : isLeave ? "bg-amber-50 border-amber-200" : "bg-rose-50 border-rose-200";
            const badgeText = isPresent ? "text-emerald-700" : isLeave ? "text-amber-700" : "text-rose-700";

            return (
              <View className="mx-3 mb-2">
                <View
                  className="bg-white rounded-xl border border-gray-100 p-2.5 flex-row items-center"
                  style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.03, shadowRadius: 3, elevation: 1 }}
                >
                  {/* Photo */}
                  <View className="w-10 h-10 rounded-full bg-gray-50 border border-gray-200 items-center justify-center overflow-hidden mr-2.5">
                    {item.studentPhoto ? (
                      <Image source={{ uri: item.studentPhoto }} style={{ width: 40, height: 40 }} resizeMode="cover" />
                    ) : (
                      <GenderIcon gender={item.gender} size={20} />
                    )}
                  </View>

                  {/* Name + Roll + Remark */}
                  <View className="flex-1 mr-2">
                    <Text className="text-[13px] font-bold text-gray-900" numberOfLines={1}>
                      {getAttendanceRowName(item)}
                    </Text>
                    <Text className="text-[10px] text-gray-400 font-semibold">
                      Roll {getAttendanceRowRoll(item)}
                      {item.remark ? ` · "${item.remark}"` : ""}
                    </Text>
                  </View>

                  {/* Status badge */}
                  <View className={`px-2.5 py-1.5 rounded-lg border ${badgeBg}`}>
                    <Text className={`text-[10px] font-black uppercase ${badgeText}`}>
                      {label}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}
    </PremiumScreenLayout>
  );
}
