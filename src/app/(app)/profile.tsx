import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from "react-native";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { AppIcon } from "@/components/icons/AppIcon";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { ProfileAvatarPicker } from "@/components/profile/ProfileAvatarPicker";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import { useNotifications } from "@/contexts/NotificationContext";
import type { StudentModel } from "@/api/model/studentModel";
import { ROLE_LABELS } from "@/constants/rolePermissions";
import { usePermissions } from "@/hooks/usePermissions";
import { premiumCardShadow } from "@/constants/premiumStyles";

function extractList<T>(payload: unknown): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  const obj = payload as Record<string, unknown>;
  if (Array.isArray(obj.data)) return obj.data as T[];
  if (obj.data && typeof obj.data === "object") {
    const nested = obj.data as Record<string, unknown>;
    if (Array.isArray(nested.data)) return nested.data as T[];
  }
  return [];
}

function studentName(s: StudentModel): string {
  return (
    s.studentDisplayName ||
    [s.firstName, s.lastName].filter(Boolean).join(" ") ||
    "Student"
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between items-center py-3 border-b border-gray-50">
      <Text className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">{label}</Text>
      <Text className="text-sm font-black text-gray-800 text-right flex-1 ml-4" numberOfLines={2}>
        {value || "—"}
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { userData, role, logout, language } = useAuthStore();
  const { roleLabel } = usePermissions();

  const isParent = role === "parent";

  const { unreadCount } = useNotifications();
  const { data: studentsResponse, isLoading: childrenLoading } = useGetApiStudentGet({
    query: { enabled: isParent },
  });

  const children = useMemo(() => {
    return extractList<StudentModel>((studentsResponse as { data?: unknown })?.data);
  }, [studentsResponse]);

  const initials = (userData?.name || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const displayRole = roleLabel || (role ? ROLE_LABELS[role] : "User");

  return (
    <PremiumScreenLayout
      title="My Account"
      subtitle={displayRole}
      hideBack={true}
      headerSlot={
        <View className="mt-4">
          <ProfileAvatarPicker
            name={userData?.name || "User"}
            avatarUri={userData?.avatar}
            initials={initials}
            size={76}
          />
        </View>
      }
    >
      <View className="pb-10">
        {/* Account details */}
        <View 
          className="bg-white rounded-3xl border border-gray-100 p-6 mb-4" 
          style={premiumCardShadow}
        >
          <View className="flex-row items-center gap-2 mb-4">
            <AppIcon name="profile" size={16} color={Colors.primary} active />
            <Text className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              Account Details
            </Text>
          </View>
          
          <InfoRow label="Full name" value={userData?.name || "—"} />
          <InfoRow label="Email" value={userData?.email || "—"} />
          <InfoRow label="Mobile" value={userData?.mobile || "—"} />
          <InfoRow label="School" value={userData?.schoolName || "Little Angel's English School"} />
          <InfoRow label="User ID" value={userData?.id || "—"} />
          <InfoRow label="Language" value={language === "gu" ? "ગુજરાતી" : "English"} />
          
          <TouchableOpacity
            onPress={() => router.push("/(app)/notifications")}
            className="mt-6 flex-row items-center justify-between bg-blue-50/50 border border-blue-100/50 rounded-2xl px-5 py-4"
          >
            <View className="flex-row items-center gap-3">
              <AppIcon name="bell" size={20} color={Colors.primary} active />
              <Text className="font-black text-gray-800">Notifications</Text>
            </View>
            {unreadCount > 0 ? (
              <View className="bg-rose-500 min-w-[24px] h-[24px] rounded-full items-center justify-center px-1.5 border-2 border-white">
                <Text className="text-white text-[10px] font-black">{unreadCount}</Text>
              </View>
            ) : (
              <Text className="text-gray-400 text-xs font-bold uppercase">None</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Parent: linked children */}
        {isParent && (
          <View
            className="bg-white rounded-3xl border border-gray-100 p-6 mb-4"
            style={premiumCardShadow}
          >
            <View className="flex-row items-center justify-between mb-5">
              <View className="flex-row items-center gap-2">
                <AppIcon name="students" size={16} color={Colors.primary} active />
                <Text className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  My Children
                </Text>
              </View>
              <View className="bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                <Text className="text-[10px] font-black text-sky-700">
                  {children.length} linked
                </Text>
              </View>
            </View>

            {childrenLoading ? (
              <View className="py-8 items-center">
                <ActivityIndicator color={Colors.primary} />
                <Text className="text-gray-400 text-xs font-bold mt-3 uppercase tracking-wider">Loading children…</Text>
              </View>
            ) : children.length === 0 ? (
              <View className="py-8 px-5 bg-gray-50/50 rounded-2xl border border-gray-100 items-center justify-center">
                <AppIcon name="warning" size={24} color="#9CA3AF" />
                <Text className="text-gray-500 text-sm font-black text-center mt-3">
                  No children linked yet
                </Text>
                <Text className="text-gray-400 text-[11px] font-bold text-center mt-1 uppercase tracking-tighter">
                  Contact the school office to link your ward
                </Text>
              </View>
            ) : (
              <View className="gap-3">
                {children.map((child) => (
                  <TouchableOpacity
                    key={String(child.studentID)}
                    onPress={() =>
                      router.push({
                        pathname: "/(app)/student-profile",
                        params: { id: String(child.studentID) },
                      } as never)
                    }
                    activeOpacity={0.8}
                    className="flex-row items-center gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-gray-100"
                  >
                    <View className="w-12 h-12 rounded-xl bg-white border border-sky-100 items-center justify-center">
                      <AppIcon
                        name={child.gender === "Female" ? "female" : "male"}
                        size={24}
                        color={Colors.primary}
                        active
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-sm font-black text-gray-800">{studentName(child)}</Text>
                      <Text className="text-[11px] font-bold text-gray-400 mt-0.5">
                        Class {child.classID ?? "—"} · Roll {child.rollNo ?? "—"}
                      </Text>
                      {child.studentGRNo ? (
                        <Text className="text-[10px] font-black text-orange-500 mt-1 uppercase">
                          GR #{child.studentGRNo}
                        </Text>
                      ) : null}
                    </View>
                    <AppIcon name="chevronRight" size={16} color="#D1D5DB" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              onPress={() => router.push("/(app)/parent-results" as never)}
              className="mt-6 flex-row items-center justify-center gap-2.5 py-4 rounded-2xl bg-[#134A8C]/8 border border-[#134A8C]/15"
              activeOpacity={0.8}
            >
              <AppIcon name="results" size={18} color="#134A8C" active />
              <Text className="text-xs font-black text-[#134A8C] uppercase tracking-wide">View academic results</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Settings & Security */}
        <View 
          className="bg-white rounded-3xl border border-gray-100 p-6 mb-6" 
          style={premiumCardShadow}
        >
          <View className="flex-row items-center gap-2 mb-5">
            <AppIcon name="settings" size={16} color={Colors.primary} active />
            <Text className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              Settings & Security
            </Text>
          </View>

          {(role === "parent" || role === "teacher" || role === "student") && (
            <TouchableOpacity
              onPress={() => router.push("/(app)/change-password")}
              activeOpacity={0.8}
              className="flex-row items-center justify-between py-4 border-b border-gray-50"
            >
              <View className="flex-row items-center gap-3">
                <View className="w-8 h-8 rounded-lg bg-orange-50 items-center justify-center">
                  <AppIcon name="lock" size={16} color="#F59E0B" active />
                </View>
                <Text className="text-sm font-black text-gray-700">Change Password</Text>
              </View>
              <AppIcon name="chevronRight" size={14} color="#D1D5DB" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={logout}
            activeOpacity={0.8}
            className="flex-row items-center justify-between py-4"
          >
            <View className="flex-row items-center gap-3">
              <View className="w-8 h-8 rounded-lg bg-rose-50 items-center justify-center">
                <AppIcon name="logout" size={16} color="#E11D48" active />
              </View>
              <Text className="text-sm font-black text-rose-600">Sign Out</Text>
            </View>
            <AppIcon name="chevronRight" size={14} color="#D1D5DB" />
          </TouchableOpacity>
        </View>

        <View className="items-center py-4">
          <Text className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
            Little Angel&apos;s ERP · {new Date().getFullYear()}
          </Text>
          <Text className="text-[9px] font-bold text-gray-200 mt-1 uppercase">
            Build v1.0.42
          </Text>
        </View>
      </View>
    </PremiumScreenLayout>
  );
}
