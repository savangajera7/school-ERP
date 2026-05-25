import React, { useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Colors } from "@/constants/colors";
import { MOBILE_TAB_BAR_HEIGHT } from "@/constants/mobileTabs";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import { useNotifications } from "@/contexts/NotificationContext";
import type { StudentModel } from "@/api/model/studentModel";
import { ROLE_LABELS } from "@/constants/rolePermissions";
import { usePermissions } from "@/hooks/usePermissions";

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
  const { isMobile } = useBreakpoint();
  const insets = useSafeAreaInsets();

  const parentId = Number(userData?.id) || 0;
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
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const displayRole = roleLabel || (role ? ROLE_LABELS[role] : "User");

  const bottomPad = isMobile ? MOBILE_TAB_BAR_HEIGHT + (insets.bottom || 0) + 16 : 40;

  return (
    <SafeAreaView className="flex-1 bg-[#F4F6FA]" edges={["left", "right"]}>
      <StatusBar style="light" translucent backgroundColor="transparent" />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
      >
        <LinearGradient
          colors={["#134A8C", "#0D3666"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 24,
            paddingTop: (insets.top || 0) + 20,
            paddingBottom: 56,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
          }}
        >
          <Text className="text-white/60 text-[10px] font-black uppercase tracking-widest">
            My Account
          </Text>
          <Text className="text-white text-2xl font-black mt-1" style={{ fontFamily: "Outfit" }}>
            Profile
          </Text>

          <View className="flex-row items-center gap-4 mt-6">
            {userData?.avatar ? (
              <Image
                source={{ uri: userData.avatar }}
                className="w-16 h-16 rounded-2xl border-2 border-white/30"
              />
            ) : (
              <View className="w-16 h-16 rounded-2xl bg-white/15 border-2 border-white/25 items-center justify-center">
                <Text className="text-2xl font-black text-white">{initials}</Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-white text-lg font-black">{userData?.name || "User"}</Text>
              <View className="self-start mt-1.5 px-2.5 py-1 rounded-lg bg-[#F5921E]/25 border border-[#F5921E]/40">
                <Text className="text-[#FDE68A] text-[10px] font-black uppercase tracking-wider">
                  {displayRole}
                </Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View className="px-4 w-full self-center max-w-[800px]" style={{ marginTop: -28 }}>
          {/* Account details */}
          <View
            className="bg-white rounded-3xl border border-gray-100 p-5 mb-4"
            style={{ boxShadow: "0px 4px 20px rgba(0,0,0,0.04)" }}
          >
            <Text className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">
              Account Details
            </Text>
            <InfoRow label="Full name" value={userData?.name || "—"} />
            <InfoRow label="Email" value={userData?.email || "—"} />
            <InfoRow label="Mobile" value={userData?.mobile || "—"} />
            <InfoRow label="School" value={userData?.schoolName || "Little Angel's English School"} />
            <InfoRow label="User ID" value={userData?.id || "—"} />
            <InfoRow label="Language" value={language === "gu" ? "ગુજરાતી" : "English"} />
            <TouchableOpacity
              onPress={() => router.push("/(app)/notifications")}
              className="mt-4 flex-row items-center justify-between bg-blue-50 border border-blue-100 rounded-2xl px-4 py-3"
            >
              <Text className="font-bold text-primary">Notifications</Text>
              {unreadCount > 0 ? (
                <View className="bg-rose-500 min-w-[22px] h-[22px] rounded-full items-center justify-center px-1">
                  <Text className="text-white text-xs font-black">{unreadCount}</Text>
                </View>
              ) : (
                <Text className="text-gray-400 text-sm">None</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Parent: linked children */}
          {isParent && (
            <View
              className="bg-white rounded-3xl border border-gray-100 p-5 mb-4"
              style={{ boxShadow: "0px 4px 20px rgba(0,0,0,0.04)" }}
            >
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  My Children
                </Text>
                <View className="bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                  <Text className="text-[10px] font-black text-sky-700">
                    {children.length} linked
                  </Text>
                </View>
              </View>

              {childrenLoading ? (
                <View className="py-8 items-center">
                  <ActivityIndicator color={Colors.primary} />
                  <Text className="text-gray-400 text-xs font-bold mt-3">Loading children…</Text>
                </View>
              ) : children.length === 0 ? (
                <View className="py-6 px-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <Text className="text-gray-500 text-sm font-bold text-center">
                    No children linked to this account yet.
                  </Text>
                  <Text className="text-gray-400 text-[11px] font-medium text-center mt-1">
                    Contact the school office to link your ward.
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
                      activeOpacity={0.85}
                      className="flex-row items-center gap-3 p-4 rounded-2xl bg-[#F8FAFC] border border-gray-100"
                    >
                      <View className="w-11 h-11 rounded-xl bg-white border border-sky-100 items-center justify-center">
                        <Text className="text-xl">{child.gender === "Female" ? "👧" : "👦"}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-black text-gray-800">{studentName(child)}</Text>
                        <Text className="text-[11px] font-bold text-gray-400 mt-0.5">
                          Class {child.classID ?? "—"} · Roll {child.rollNo ?? "—"}
                        </Text>
                        {child.studentGRNo ? (
                          <Text className="text-[10px] font-bold text-orange-600 mt-0.5">
                            GR #{child.studentGRNo}
                          </Text>
                        ) : null}
                      </View>
                      <Text className="text-gray-300 text-lg">›</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <TouchableOpacity
                onPress={() => router.push("/(app)/parent-results" as never)}
                className="mt-4 flex-row items-center justify-center gap-2 py-3 rounded-2xl bg-[#134A8C]/8 border border-[#134A8C]/15"
                activeOpacity={0.8}
              >
                <Text className="text-sm">🏆</Text>
                <Text className="text-[12px] font-black text-[#134A8C]">View academic results</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick actions for staff */}
          {role && role !== "parent" && (
            <View
              className="bg-white rounded-3xl border border-gray-100 p-5 mb-4"
              style={{ boxShadow: "0px 4px 20px rgba(0,0,0,0.04)" }}
            >
              <Text className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Quick links
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {[
                  { label: "Menu", route: "/(app)/menu", icon: "☰" },
                  { label: "Students", route: "/(app)/students", icon: "🎓" },
                  { label: "Notices", route: "/(app)/notices", icon: "📢" },
                ].map((link) => (
                  <TouchableOpacity
                    key={link.route}
                    onPress={() => router.push(link.route as never)}
                    className="flex-row items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100"
                    activeOpacity={0.8}
                  >
                    <Text>{link.icon}</Text>
                    <Text className="text-xs font-black text-gray-700">{link.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {(role === "parent" || role === "teacher" || role === "student") && (
            <TouchableOpacity
              onPress={() => router.push("/(app)/change-password")}
              activeOpacity={0.85}
              className="flex-row items-center justify-center gap-2.5 py-4 rounded-2xl bg-[#134A8C]/8 border border-[#134A8C]/15 mb-3"
            >
              <Text className="text-base">🔒</Text>
              <Text className="text-sm font-black text-[#134A8C] uppercase tracking-wide">
                Change password
              </Text>
            </TouchableOpacity>
          )}

          {/* Sign out */}
          <TouchableOpacity
            onPress={logout}
            activeOpacity={0.85}
            className="flex-row items-center justify-center gap-2.5 py-4 rounded-2xl bg-rose-50 border border-rose-100 mb-2"
            style={{ boxShadow: "0px 2px 12px rgba(239,68,68,0.08)" }}
          >
            <Text className="text-base">🚪</Text>
            <Text className="text-sm font-black text-rose-600 uppercase tracking-wide">
              Sign out
            </Text>
          </TouchableOpacity>

          <Text className="text-center text-[10px] font-bold text-gray-400 pb-2">
            Little Angel's ERP · {new Date().getFullYear()}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
