import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from "react-native";
import { router } from "expo-router";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import type { StudentModel } from "@/api/model/studentModel";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import { parseApiList } from "@/utils/apiResponse";
import { normalizeStudent, getStudentDisplayName, formatOptional } from "@/utils/studentUtils";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { HeaderActionButton } from "@/components/ui/HeaderActionButton";
import { PremiumSearchField } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { Card } from "@/components/ui/Card";
import { AppIcon, GenderIcon } from "@/components/icons/AppIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/EmptyState";
import { usePermissions } from "@/hooks/usePermissions";

export default function StudentManagementScreen() {
  const { isMobile } = useResponsive();
  const { canManageStudents } = usePermissions();
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, error, refetch } = useGetApiStudentGet();

  const students = useMemo(() => {
    const raw = parseApiList<Record<string, unknown>>(data);
    return raw
      .map(normalizeStudent)
      .filter(
        (s) =>
          s.studentID != null ||
          s.studentGRNo ||
          s.rollNo ||
          s.firstName ||
          s.studentDisplayName
      );
  }, [data]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return students;
    return students.filter((student) => {
      const name = getStudentDisplayName(student).toLowerCase();
      return (
        name.includes(q) ||
        formatOptional(student.rollNo, "").toLowerCase().includes(q) ||
        formatOptional(student.studentGRNo, "").toLowerCase().includes(q)
      );
    });
  }, [students, searchQuery]);

  const renderStudentItemMobile = ({ item }: { item: StudentModel }) => {
    const fullName = getStudentDisplayName(item);
    const studentId = item.studentID;
    return (
      <MobileDataCard
        title={fullName}
        subtitle={`GR No: ${formatOptional(item.studentGRNo)}`}
        accentColor={Colors.primary}
        icon={
          <View style={styles.avatarBox}>
            <GenderIcon gender={item.gender} size={22} />
          </View>
        }
        badge={
          <View style={styles.rollBadge}>
            <Text style={styles.rollBadgeText}>
              Roll: {formatOptional(item.rollNo)}
            </Text>
          </View>
        }
        fields={[
          { label: "Class", value: formatOptional(item.classID) },
          { label: "Section", value: formatOptional(item.sectionID) },
          { label: "Status", value: formatOptional(item.status, "Active"), highlight: "success" },
        ]}
        onPress={() => {
          if (studentId == null) return;
          router.push({
            pathname: "/(app)/student-profile",
            params: { id: String(studentId) },
          });
        }}
      />
    );
  };

  return (
    <PremiumScreenLayout
      title="Students Ledger"
      subtitle="Manage student details and records"
      scrollable={false}
      bodyStyle={styles.listBody}
      rightAction={
        canManageStudents ? (
          <HeaderActionButton
            label="+ New Admission"
            shortLabel="+ New"
            onPress={() => router.push("/(app)/admission-form")}
            style={isMobile ? { alignSelf: "stretch" } : undefined}
          />
        ) : undefined
      }
    >
      <PremiumSearchField
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search by name, roll no or GR..."
        onClear={() => setSearchQuery("")}
      />

        {isLoading ? (
          <SkeletonLoader variant={isMobile ? "card" : "table"} rows={5} />
        ) : isError ? (
          <View style={styles.emptyWrap}>
            <ErrorState
              message={
                error instanceof Error
                  ? error.message
                  : "Could not load students. Pull to refresh."
              }
            />
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : isMobile ? (
          <FlatList
            data={filteredStudents}
            renderItem={renderStudentItemMobile}
            keyExtractor={(item, index) =>
              item.studentID != null ? String(item.studentID) : `student-${index}`
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
            ListEmptyComponent={
              <EmptyState
                icon="students"
                title="No students found"
                message={
                  searchQuery
                    ? "Try a different search term"
                    : "Add your first student with New Admission"
                }
              />
            }
            onRefresh={refetch}
            refreshing={isLoading}
          />
        ) : (
          <Card noPadding className="bg-white border border-gray-150 overflow-hidden shadow-sm">
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: 64 }]}>Roll</Text>
              <Text style={[styles.th, { width: 100 }]}>GR No</Text>
              <Text style={[styles.th, { flex: 1 }]}>Student Name</Text>
              <Text style={[styles.th, { width: 80 }]}>Gender</Text>
              <Text style={[styles.th, { width: 72, textAlign: "center" }]}>Class</Text>
              <Text style={[styles.th, { width: 72, textAlign: "center" }]}>Section</Text>
              <Text style={[styles.th, { width: 100, textAlign: "right" }]}>Actions</Text>
            </View>

            {filteredStudents.length === 0 ? (
              <EmptyState
                icon="students"
                title="No matching records"
                message="Adjust your search or add a new admission"
              />
            ) : (
              filteredStudents.map((item, index) => {
                const fullName = getStudentDisplayName(item);
                return (
                  <View
                    key={item.studentID ?? index}
                    style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]}
                  >
                    <Text style={[styles.td, { width: 64 }]}>{formatOptional(item.rollNo)}</Text>
                    <Text style={[styles.td, { width: 100 }]}>{formatOptional(item.studentGRNo)}</Text>
                    <View style={[styles.nameCell, { flex: 1 }]}>
                      <View style={styles.avatarBoxSmall}>
                        <GenderIcon gender={item.gender} size={16} />
                      </View>
                      <Text style={styles.nameText} numberOfLines={1}>
                        {fullName}
                      </Text>
                    </View>
                    <Text style={[styles.tdMuted, { width: 80 }]}>{formatOptional(item.gender)}</Text>
                    <Text style={[styles.td, { width: 72, textAlign: "center" }]}>
                      {formatOptional(item.classID)}
                    </Text>
                    <Text style={[styles.td, { width: 72, textAlign: "center" }]}>
                      {formatOptional(item.sectionID)}
                    </Text>
                    <View style={{ width: 100, alignItems: "flex-end" }}>
                      <TouchableOpacity
                        disabled={item.studentID == null}
                        onPress={() =>
                          router.push({
                            pathname: "/(app)/student-profile",
                            params: { id: String(item.studentID) },
                          })
                        }
                        style={styles.profileBtn}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.profileBtnText}>Profile</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })
            )}
          </Card>
        )}
    </PremiumScreenLayout>
  );
}

const styles = StyleSheet.create({
  listBody: { flex: 1, marginTop: -20, paddingHorizontal: 0 },
  avatarBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  avatarBoxSmall: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  rollBadge: {
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FFEDD5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rollBadgeText: { fontSize: 10, fontWeight: "800", color: "#C2410C", textTransform: "uppercase" },
  emptyWrap: { paddingVertical: 24 },
  retryBtn: {
    alignSelf: "center",
    marginTop: 12,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: "center",
  },
  retryText: { color: "#fff", fontWeight: "800" },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: "#F8FAFC",
    borderBottomWidth: 1,
    borderBottomColor: "#E8ECF1",
  },
  th: { fontSize: 11, fontWeight: "800", color: "#6B7280", textTransform: "uppercase" },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#fff",
  },
  tableRowAlt: { backgroundColor: "#FAFBFC" },
  td: { fontSize: 14, fontWeight: "700", color: "#374151" },
  tdMuted: { fontSize: 14, fontWeight: "600", color: "#6B7280" },
  nameCell: { flexDirection: "row", alignItems: "center", gap: 10, minWidth: 0 },
  nameText: { flex: 1, fontSize: 14, fontWeight: "800", color: "#111827" },
  profileBtn: {
    backgroundColor: `${Colors.primary}18`,
    borderWidth: 1,
    borderColor: `${Colors.primary}33`,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    minHeight: 40,
    justifyContent: "center",
  },
  profileBtnText: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.primary,
    textTransform: "uppercase",
  },
});
