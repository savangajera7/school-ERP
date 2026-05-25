import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput, FlatList, ActivityIndicator, ScrollView, Platform } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { StudentModel } from "@/api/model/studentModel";
import { useGetApiStudentGet } from "@/api/generated/3-student-crud/3-student-crud";
import { useGetApiClassGet } from "@/api/generated/master-class/master-class";
import { ClassModel } from "@/api/model/classModel";
import { parseApiList } from "@/utils/apiResponse";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumCard, PremiumSearchField } from "@/components/ui/premium";
import { AppIcon, GenderIcon } from "@/components/icons/AppIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { Card } from "@/components/ui/Card";
import { normalizeStudent, getStudentDisplayName, formatOptional } from "@/utils/studentUtils";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslation } from "@/hooks/useTranslation";

export default function StudentSearchScreen() {
  const { isMobile } = useResponsive();
  const { can } = usePermissions();
  const { t } = useTranslation();
  const canView = can("viewStudents");
  
  // Advanced Filter States
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterGender, setFilterGender] = useState<"All" | "Male" | "Female">("All");
  const [filterClass, setFilterClass] = useState<string>("All");

  // Call the live API
  const { data, isLoading, refetch } = useGetApiStudentGet();
  const { data: classData } = useGetApiClassGet();

  const students = useMemo(() => {
    const raw = parseApiList<Record<string, unknown>>(data);
    return raw.map(normalizeStudent);
  }, [data]);

  const classes = useMemo(() => parseApiList<ClassModel>(classData), [classData]);

  // Multifold Search Engine
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const name = getStudentDisplayName(student).toLowerCase();
      const roll = formatOptional(student.rollNo, "").toLowerCase();
      const gr = formatOptional(student.studentGRNo, "").toLowerCase();
      const q = query.toLowerCase();

      const matchesQuery = !q || name.includes(q) || roll.includes(q) || gr.includes(q);
      const matchesGender = filterGender === "All" || student.gender === filterGender;
      const matchesClass = filterClass === "All" || String(student.classID) === filterClass;

      return matchesQuery && matchesGender && matchesClass;
    });
  }, [students, query, filterGender, filterClass]);

  const clearFilters = () => {
    setQuery("");
    setFilterGender("All");
    setFilterClass("All");
  };

  const renderStudentItemMobile = ({ item }: { item: StudentModel }) => {
    const fullName = getStudentDisplayName(item);
    const className = classes.find(c => String(c.classID) === String(item.classID))?.className || `ID: ${item.classID}`;
    
    return (
      <MobileDataCard
        key={item.studentID}
        title={fullName}
        subtitle={`GR No: ${formatOptional(item.studentGRNo)}`}
        accentColor={Colors.accent}
        icon={
          <View className="w-11 h-11 rounded-xl items-center justify-center bg-blue-50/50 border border-blue-100">
            <GenderIcon gender={item.gender} size={22} />
          </View>
        }
        badge={
          <View className="bg-orange-50 border border-orange-100 px-2.5 py-0.5 rounded-lg">
            <Text className="text-[10px] font-black text-orange-600 uppercase">
              Roll: {formatOptional(item.rollNo)}
            </Text>
          </View>
        }
        fields={[
          { label: "Class", value: className },
          { label: "Gender", value: formatOptional(item.gender) },
          { label: "Status", value: "Active", highlight: "success" },
        ]}
      />
    );
  };

  if (!canView) {
    return (
      <PremiumScreenLayout
        title={t.students + " " + t.search}
        subtitle="Filter and locate student records"
        hideBack={isMobile}
        withTabBar
        scrollable={true}
        bodyStyle={{ marginTop: -20, paddingHorizontal: 16, flex: 1 }}
      >
        <Card className="bg-white border border-gray-150 p-10 items-center rounded-3xl mt-6">
          <View className="mb-4">
            <AppIcon name="lock" size={44} color="#EF4444" active />
          </View>
          <Text className="text-base font-black text-gray-800 uppercase tracking-wide">{t.accessDenied}</Text>
          <Text className="text-xs text-gray-400 font-bold mt-2 text-center leading-relaxed">
            {t.noPermissionSearch}
          </Text>
        </Card>
      </PremiumScreenLayout>
    );
  }

  return (
    <PremiumScreenLayout
      title={t.students + " " + t.search}
      subtitle="Filter and locate student records"
      hideBack={isMobile}
      withTabBar
      scrollable={false}
      bodyStyle={{ marginTop: -20, paddingHorizontal: 0, flex: 1 }}
    >
        <View className="px-4 pt-2">
          <View className="flex-row gap-2 items-center mb-2">
            <View className="flex-1">
              <PremiumSearchField
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name, roll, or GR..."
                onClear={() => setQuery("")}
              />
            </View>
            <TouchableOpacity 
              onPress={() => setShowFilters(!showFilters)}
              className={`h-12 w-12 rounded-2xl items-center justify-center border ${
                showFilters ? "bg-blue-600 border-blue-600" : "bg-white border-gray-200"
              }`}
              style={Platform.OS === 'web' ? { outlineWidth: 0 } as any : {}}
            >
              <AppIcon name="filter" size={20} color={showFilters ? "#FFF" : "#64748B"} active={showFilters} />
            </TouchableOpacity>
          </View>

          {showFilters && (
            <PremiumCard noAccent style={{ padding: 16, marginBottom: 12 }}>
              <View className="flex-row items-center justify-between mb-4 border-b border-gray-50 pb-2">
                <Text className="text-[11px] font-black text-gray-900 uppercase tracking-wider">Advanced Filters</Text>
                <TouchableOpacity onPress={clearFilters}>
                  <Text className="text-[10px] font-black text-rose-500 uppercase">{t.clearAll}</Text>
                </TouchableOpacity>
              </View>

              <View className="gap-4">
                {/* Filter by Gender */}
                <View>
                  <Text className="text-[10px] font-black text-gray-400 uppercase mb-2">{t.gender}</Text>
                  <View className="flex-row bg-gray-55 border border-gray-200 rounded-xl p-0.5 h-10">
                    {(["All", "Male", "Female"] as const).map((gender) => (
                      <TouchableOpacity
                        key={gender}
                        onPress={() => setFilterGender(gender)}
                        className={`flex-1 justify-center items-center rounded-lg ${
                          filterGender === gender ? "bg-blue-600" : ""
                        }`}
                      >
                        <Text className={`text-[10px] font-black uppercase ${
                          filterGender === gender ? "text-white" : "text-gray-400"
                        }`}>
                          {gender}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Filter by Class */}
                <View>
                  <Text className="text-[10px] font-black text-gray-400 uppercase mb-2">{t.classId}</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    <TouchableOpacity
                      onPress={() => setFilterClass("All")}
                      className={`px-4 py-2 mr-2 rounded-xl border ${
                        filterClass === "All" ? "bg-blue-600 border-blue-600" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <Text className={`text-[10px] font-black uppercase ${filterClass === "All" ? "text-white" : "text-gray-500"}`}>
                        All Classes
                      </Text>
                    </TouchableOpacity>
                    {classes.map((cls) => (
                      <TouchableOpacity
                        key={cls.classID}
                        onPress={() => setFilterClass(String(cls.classID))}
                        className={`px-4 py-2 mr-2 rounded-xl border ${
                          filterClass === String(cls.classID) ? "bg-blue-600 border-blue-600" : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <Text className={`text-[10px] font-black uppercase ${filterClass === String(cls.classID) ? "text-white" : "text-gray-500"}`}>
                          {cls.className}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </PremiumCard>
          )}
        </View>

        {/* Results overview */}
        <View className="flex-row justify-between items-center mb-3 px-4">
          <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {filteredStudents.length} Students Found
          </Text>
          {isLoading && <ActivityIndicator size="small" color="#2563EB" />}
        </View>

        {/* ── Grid/Table Results Flow ──────────────────────────────── */}
        {isLoading ? (
          <View className="px-4">
            <SkeletonLoader variant={isMobile ? "card" : "table"} rows={5} />
          </View>
        ) : filteredStudents.length === 0 ? (
          <View className="px-4">
            <EmptyState
              icon="search"
              title={t.noResultFound}
              message="Try adjusting your search query or filters to find what you're looking for."
            />
          </View>
        ) : isMobile ? (
          /* Mobile Virtualized Touch Card Stack */
          <FlatList
            data={filteredStudents}
            renderItem={renderStudentItemMobile}
            keyExtractor={(item, index) => item.studentID != null ? String(item.studentID) : `student-${index}`}
            contentContainerStyle={{ gap: 12, paddingHorizontal: 16, paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          /* Elegant High-Fidelity Desktop Data Table */
          <View className="px-4">
            <Card className="bg-white border border-gray-150 shadow-sm rounded-3xl overflow-hidden">
              <View className="flex-row bg-[#F4F8FC] border-b border-gray-100 px-6 py-4">
                <Text className="w-[100px] font-black text-gray-400 text-[10px] uppercase tracking-wider">{t.rollNumber}</Text>
                <Text className="flex-1 font-black text-gray-400 text-[10px] uppercase tracking-wider">{t.studentName}</Text>
                <Text className="w-[120px] font-black text-gray-400 text-[10px] uppercase tracking-wider text-center">{t.grNumber}</Text>
                <Text className="w-[120px] font-black text-gray-400 text-[10px] uppercase tracking-wider text-center">Class</Text>
                <Text className="w-[120px] font-black text-gray-400 text-[10px] uppercase tracking-wider text-center">{t.gender}</Text>
                <Text className="w-[100px] font-black text-gray-400 text-[10px] uppercase tracking-wider text-right">{t.status}</Text>
              </View>

              <FlatList
                data={filteredStudents}
                keyExtractor={(item, index) => item.studentID != null ? String(item.studentID) : `student-${index}`}
                renderItem={({ item, index }) => {
                  const fullName = getStudentDisplayName(item);
                  const className = classes.find(c => String(c.classID) === String(item.classID))?.className || `ID: ${item.classID}`;
                  
                  return (
                    <View
                      className={`flex-row items-center px-6 py-3.5 border-b border-gray-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                      }`}
                    >
                      <Text className="w-[100px] text-xs font-black text-orange-600">Roll #{formatOptional(item.rollNo)}</Text>
                      
                      <View className="flex-1 flex-row items-center gap-3">
                        <View className="w-8 h-8 rounded-lg bg-sky-50 items-center justify-center border border-sky-100">
                          <GenderIcon gender={item.gender} size={18} />
                        </View>
                        <Text className="text-sm font-black text-gray-800">{fullName}</Text>
                      </View>

                      <Text className="w-[120px] text-xs font-extrabold text-gray-500 text-center">{formatOptional(item.studentGRNo)}</Text>
                      <Text className="w-[120px] text-xs font-extrabold text-gray-500 text-center">{className}</Text>
                      <Text className="w-[120px] text-xs font-extrabold text-gray-500 text-center">{formatOptional(item.gender)}</Text>
                      
                      <View className="w-[100px] items-end">
                        <View className="px-2.5 py-0.5 bg-emerald-50 rounded-full border border-emerald-100">
                          <Text className="text-[9px] font-black text-emerald-600 uppercase">{t.active}</Text>
                        </View>
                      </View>
                    </View>
                  );
                }}
              />
            </Card>
          </View>
        )}
    </PremiumScreenLayout>
  );
}
