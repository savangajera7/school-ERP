import React, { useMemo, useState } from "react";
import { View, Text, TouchableOpacity, FlatList, RefreshControl } from "react-native";
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
import { IconCircle } from "@/components/icons/AppIcon";

export default function AttendanceHomeScreen() {
  const access = useAttendanceAccess();
  const schoolID = useAuthStore((s) => s.userData?.schoolID);
  const [date, setDate] = useState(todayIsoDate());

  const params = useMemo(
    () => buildAttendanceViewParams("classes", { schoolID, attendanceDate: date }),
    [schoolID, date]
  );

  const { data, isLoading, refetch, isRefetching, isError, error } =
    useGetApiAttendanceGet(params);

  const { classes } = useMemo(() => parseClassesView(data?.data), [data]);

  const visibleClasses = useMemo(() => {
    if (access.isSchoolAdmin) return classes;
    return classes.filter((c) => access.canMarkClass(c.classID));
  }, [classes, access]);

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
      bodyStyle={{ flex: 1, paddingHorizontal: 0 }}
      rightAction={
        access.isSchoolAdmin ? (
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push("/(app)/attendance/records")}
              className="px-3 py-2 rounded-xl bg-white/15"
            >
              <Text className="text-white text-[10px] font-black uppercase">Records</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(app)/attendance/reports")}
              className="px-3 py-2 rounded-xl bg-white/15"
            >
              <Text className="text-white text-[10px] font-black uppercase">Reports</Text>
            </TouchableOpacity>
          </View>
        ) : undefined
      }
    >
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

      {access.isTeacher && !access.loadingTeacherPerms && visibleClasses.length === 0 ? (
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
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={refetch} />
          }
          contentContainerStyle={{ paddingBottom: 80, flexGrow: 1 }}
          ListEmptyComponent={
            <EmptyState
              icon="attendance"
              title="No classes"
              message="No classes available for attendance on this date."
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => openClass(item.classID, item.className, item.attendanceMarked)}
              className="flex-row items-center bg-white border border-gray-150 rounded-2xl p-4 mb-3 mx-1"
              activeOpacity={0.85}
            >
              <IconCircle name="classroom" size={48} iconSize={24} />
              <View className="flex-1 ml-3">
                <Text className="text-base font-black text-gray-900">{item.className}</Text>
                <Text className="text-xs text-gray-400 font-semibold mt-0.5">
                  Tap to {item.attendanceMarked ? "view / update" : "mark"} attendance
                </Text>
              </View>
              <View
                className={`px-3 py-1.5 rounded-full border ${
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
                  {item.attendanceMarked ? "Marked" : "Not marked"}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </PremiumScreenLayout>
  );
}
