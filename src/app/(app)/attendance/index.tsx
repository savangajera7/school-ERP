import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ScrollView,
} from "react-native";
import { Redirect, router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumDatePicker } from "@/components/ui/PremiumDatePicker";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useGetApiAttendanceGet } from "@/api/attendance";
import {
  buildAttendanceViewParams,
  parseClassesView,
  todayIsoDate,
  isFutureDate,
} from "@/api/attendance";
import { useAuthStore } from "@/store/authStore";
import { useAttendanceAccess } from "@/hooks/useAttendanceAccess";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { Colors } from "@/constants/colors";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { useGetApiClassGet } from "@/api/generated/master-class/master-class";
import { parseApiList } from "@/utils/apiResponse";

export default function AttendanceHomeScreen() {
  const access = useAttendanceAccess();
  const schoolID = useAuthStore((s) => s.userData?.schoolID);
  const [date, setDate] = useState(todayIsoDate());
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const { data: classData } = useGetApiClassGet();
  const allClasses = useMemo(() => parseApiList<any>(classData?.data), [classData]);

  const params = useMemo(
    () => buildAttendanceViewParams("classes", { schoolID, attendanceDate: date }),
    [schoolID, date]
  );

  const { data, isLoading, refetch, isRefetching, isError, error } =
    useGetApiAttendanceGet(params);

  const { classes } = useMemo(() => parseClassesView(data?.data), [data]);

  const visibleClasses = useMemo(() => {
    let list = access.isSchoolAdmin ? classes : classes.filter((c) => access.canMarkClass(c.classID));
    if (selectedClassId) list = list.filter((c) => c.classID === selectedClassId);
    return list;
  }, [classes, access, selectedClassId]);

  const markedCount = useMemo(() => visibleClasses.filter((c) => c.attendanceMarked).length, [visibleClasses]);
  const totalCount = visibleClasses.length;

  // Redirect parents/students to their own view
  if (access.isAttendanceReadOnly) {
    return <Redirect href="/(parent)/attendance" />;
  }
  if (!access.canAccessMarkingScreen) {
    return <AccessDenied message="You do not have permission to access student attendance." />;
  }

  const openClass = (classID: number, className: string, attendanceMarked: boolean) => {
    if (!access.canMarkClass(classID)) return;
    router.push({
      pathname: "/(app)/attendance/mark",
      params: {
        classId: String(classID),
        className,
        date,
        marked: attendanceMarked ? "1" : "0",
      },
    });
  };

  const renderClassCard = ({ item }: { item: typeof visibleClasses[0] }) => (
    <TouchableOpacity
      onPress={() => openClass(item.classID, item.className, item.attendanceMarked)}
      activeOpacity={0.9}
      className="bg-white rounded-2xl mb-3 border border-gray-100"
      style={premiumCardShadow}
    >
      <View className="p-4 flex-row items-center gap-3">
        <View className="relative">
          <View
            className={`w-14 h-14 rounded-2xl items-center justify-center border ${
              item.attendanceMarked
                ? "bg-emerald-50 border-emerald-100"
                : "bg-gray-50 border-gray-200"
            }`}
          >
            <AppIcon
              name="attendance"
              size={26}
              color={item.attendanceMarked ? "#059669" : "#9CA3AF"}
            />
          </View>
          {item.attendanceMarked && (
            <View className="absolute -top-1.5 -right-1.5 bg-emerald-500 border-2 border-white w-5 h-5 rounded-full items-center justify-center">
              <Text className="text-[9px] font-black text-white">✓</Text>
            </View>
          )}
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-sm font-extrabold text-gray-900 uppercase">
              {item.className}
            </Text>
            <View
              className={`px-2.5 py-1 rounded-full border ${
                item.attendanceMarked
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <Text
                className={`text-[10px] font-black uppercase ${
                  item.attendanceMarked ? "text-emerald-700" : "text-gray-500"
                }`}
              >
                {item.attendanceMarked ? "Marked" : "Pending"}
              </Text>
            </View>
          </View>
          <Text className="text-xs text-gray-400 font-semibold">
            Tap to {item.attendanceMarked ? "view / update" : "mark"} attendance
          </Text>
        </View>

        <AppIcon name="chevronRight" size={16} color="#D1D5DB" />
      </View>
    </TouchableOpacity>
  );

  return (
    <PremiumScreenLayout
      title="Student Attendance"
      subtitle={
        access.isTeacher
          ? "Your assigned classes — tap to mark"
          : "Select a class to mark daily attendance"
      }
      onBack={() => router.push("/(app)/dashboard")}
      scrollable={false}
      fullWidth
      hideBack={false}
      rightAction={
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setShowFilters((p) => !p)}
            className={`flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl border ${
              showFilters
                ? "bg-[#0d3666]/10 border-[#0d3666]/20"
                : "bg-gray-50 border-gray-200"
            }`}
            activeOpacity={0.7}
          >
            <AppIcon name="filter" size={14} color={showFilters ? "#0d3666" : "#4B5563"} />
            <Text
              className={`text-[11px] font-extrabold uppercase ${
                showFilters ? "text-[#0d3666]" : "text-gray-600"
              }`}
            >
              {showFilters ? "Hide" : "Filter"}
            </Text>
          </TouchableOpacity>
          {access.isSchoolAdmin && (
            <TouchableOpacity
              onPress={() => router.push("/(app)/attendance/reports")}
              className="flex-row items-center gap-1.5 px-3 py-1.5 rounded-xl border bg-gray-50 border-gray-200"
              activeOpacity={0.7}
            >
              <AppIcon name="reports" size={14} color="#4B5563" />
              <Text className="text-[11px] font-extrabold uppercase text-gray-600">Reports</Text>
            </TouchableOpacity>
          )}
        </View>
      }
    >
      {/* Date picker */}
      <View className="px-1 mb-3">
        <PremiumDatePicker
          label="Attendance date"
          value={date}
          onChange={(d) => {
            if (!isFutureDate(d)) setDate(d);
          }}
        />
        {isFutureDate(date) && (
          <Text className="text-rose-600 text-xs font-bold mt-1">
            Future dates cannot be marked.
          </Text>
        )}
      </View>

      {/* Filters */}
      {showFilters && (
        <View
          className="bg-white px-5 py-4 mb-4 rounded-2xl border border-gray-100"
          style={premiumCardShadow}
        >
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1.5">
            Filter by Class
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            <TouchableOpacity
              onPress={() => setSelectedClassId(null)}
              className={`px-4 py-2 rounded-xl border ${
                selectedClassId === null ? "bg-teal-50 border-teal-200" : "bg-white border-gray-200"
              }`}
            >
              <Text
                className={`text-[11px] font-bold ${
                  selectedClassId === null ? "text-teal-700" : "text-gray-600"
                }`}
              >
                All Classes
              </Text>
            </TouchableOpacity>
            {allClasses.map((cls: any) => (
              <TouchableOpacity
                key={cls.classID}
                onPress={() => setSelectedClassId(cls.classID)}
                className={`px-4 py-2 rounded-xl border ${
                  selectedClassId === cls.classID
                    ? "bg-teal-50 border-teal-200"
                    : "bg-white border-gray-200"
                }`}
              >
                <Text
                  className={`text-[11px] font-bold ${
                    selectedClassId === cls.classID ? "text-teal-700" : "text-gray-600"
                  }`}
                >
                  Class {cls.className}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Summary bar */}
      {!isLoading && totalCount > 0 && (
        <View className="flex-row gap-2 mb-3 px-1">
          <View className="flex-1 bg-white border border-gray-100 rounded-xl px-3 py-2.5" style={premiumCardShadow}>
            <Text className="text-[10px] font-black uppercase text-gray-400">Total</Text>
            <Text className="text-xl font-black text-gray-900">{totalCount}</Text>
          </View>
          <View className="flex-1 bg-white border border-emerald-100 rounded-xl px-3 py-2.5" style={premiumCardShadow}>
            <Text className="text-[10px] font-black uppercase text-emerald-600">Marked</Text>
            <Text className="text-xl font-black text-emerald-700">{markedCount}</Text>
          </View>
          <View className="flex-1 bg-white border border-amber-100 rounded-xl px-3 py-2.5" style={premiumCardShadow}>
            <Text className="text-[10px] font-black uppercase text-amber-600">Pending</Text>
            <Text className="text-xl font-black text-amber-700">{totalCount - markedCount}</Text>
          </View>
        </View>
      )}

      {/* Teacher no-permission state */}
      {access.isTeacher && !access.loadingTeacherPerms && visibleClasses.length === 0 && !isLoading ? (
        <AccessDenied message="Contact school admin to enable Attendance permission for your classes." />
      ) : isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : isError ? (
        <EmptyState
          icon="warning"
          title="Could not load classes"
          message={String((error as { message?: string })?.message ?? "Check API connection and login.")}
        />
      ) : (
        <FlatList
          data={visibleClasses}
          keyExtractor={(item) => String(item.classID)}
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          contentContainerStyle={{ paddingBottom: 80, flexGrow: 1, paddingHorizontal: 4 }}
          ListEmptyComponent={
            <EmptyState
              icon="attendance"
              title="No classes"
              message="No classes available for attendance on this date."
            />
          }
          renderItem={renderClassCard}
        />
      )}
    </PremiumScreenLayout>
  );
}
