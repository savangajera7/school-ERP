import React, { useState, useMemo } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert, Platform, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useResponsive } from "@/hooks/useResponsive";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumSearchField, PremiumTabSwitcher } from "@/components/ui/premium";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import {
  useGetApiTeacherGetTeacherList,
  usePostApiTeacherInsertTeacher,
} from "@/api/generated/teacher/teacher";
import { parseApiList } from "@/utils/apiResponse";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { PremiumLoader } from "@/components/ui/PremiumLoader";

export default function TeacherManagementScreen() {
  const { isMobile } = useResponsive();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "add">("list");

  // Add Form State
  const [activeTab, setActiveTab] = useState<"basic" | "education" | "role">("basic");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [designation, setDesignation] = useState("");
  const [qualification, setQualification] = useState("");
  const [passingYear, setPassingYear] = useState("");
  const [assignedClass, setAssignedClass] = useState("");

  // API Hooks
  const { showToast } = useToast();
  const userData = useAuthStore((s) => s.userData);
  const { data: teachersData, isLoading: isGetLoading, refetch } =
    useGetApiTeacherGetTeacherList();
  const addTeacherMutation = usePostApiTeacherInsertTeacher();

  const facultyList = useMemo(() => {
    const list = parseApiList(teachersData?.data);
    if (!Array.isArray(list)) return [];
    return list.map((item: any, index: number) => ({
      id: item.teacherID?.toString() || item.id?.toString() || `tc_${index + 1}`,
      name: item.teacherDisplayName || `${item.firstName} ${item.lastName}` || "Unknown Faculty",
      role: item.designation || "Faculty",
      subject: item.qualification || "General Studies",
      email: item.email || "N/A",
      phone: item.mobileNo || "N/A",
      status: item.isActive ? "Active" : "Inactive",
    }));
  }, [teachersData]);

  const filteredTeachers = useMemo(() => {
    return facultyList.filter(t => 
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [facultyList, searchQuery]);

  const handleAddTeacher = async () => {
    if (!firstName || !lastName || !mobile) {
      Alert.alert("Missing Fields", "Please complete all required Employee fields.");
      return;
    }

    try {
      await addTeacherMutation.mutateAsync({
        data: {
          teacherCode: `T${Math.floor(100 + Math.random() * 900)}`,
          firstName,
          lastName,
          mobileNo: mobile,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@laes.com`,
          qualification,
          subjectName: assignedClass || designation,
          createdBy: parseInt(userData?.id ?? "0", 10) || 0,
        },
      });

      showToast("New employee successfully registered.", "success");
      setViewMode("list");
      refetch();
      // Reset Form
      setFirstName("");
      setLastName("");
      setMobile("");
      setDesignation("");
      setQualification("");
      setPassingYear("");
      setAssignedClass("");
    } catch (error) {
      showToast("Failed to register employee.", "error");
    }
  };

  return (
    <PremiumScreenLayout
      title="Teacher Directory"
      subtitle="Manage faculty and administrative profiles"
      onBack={() => router.push("/(app)/dashboard")}
      rightAction={
        viewMode === "list" ? (
          <TouchableOpacity
            onPress={() => setViewMode("add")}
            className="px-4 py-2.5 rounded-xl flex-row items-center gap-1.5"
            style={{ backgroundColor: Colors.accent }}
            activeOpacity={0.8}
          >
            <AppIcon name="add" size={16} color="white" active />
            <Text className="text-white font-black text-xs uppercase tracking-widest">Add</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setViewMode("list")}
            className="px-4 py-2.5 bg-white/10 rounded-xl border border-white/20"
            activeOpacity={0.8}
          >
            <Text className="text-white font-black text-xs uppercase tracking-widest">Cancel</Text>
          </TouchableOpacity>
        )
      }
    >
          {viewMode === "list" && (
            <View className="gap-4">
              <PremiumSearchField
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search faculty by name or subject..."
              />

              {isGetLoading ? (
                <View className="py-20">
                  <PremiumLoader color={Colors.primary} size={36} />
                </View>
              ) : filteredTeachers.length === 0 ? (
                <View className="py-20 items-center justify-center bg-white rounded-3xl border border-gray-100 p-8">
                  <EmptyState icon="teacherStaff" title="No teachers" message="Staff records will appear here" />
                </View>
              ) : isMobile ? (
                <View className="gap-2">
                  {filteredTeachers.map((tc) => (
                    <MobileDataCard
                      key={tc.id}
                      title={tc.name}
                      subtitle={tc.subject}
                      icon={
                        <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center border border-blue-100">
                          <AppIcon name="teacherStaff" size={20} color={Colors.primary} active />
                        </View>
                      }
                      badge={
                        <View className="bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          <Text className="text-[10px] font-black text-emerald-600 uppercase">{tc.status}</Text>
                        </View>
                      }
                      fields={[
                        { label: "Role", value: tc.role },
                        { label: "Phone", value: tc.phone },
                        { label: "Email", value: tc.email },
                      ]}
                    />
                  ))}
                </View>
              ) : (
                <Card noPadding className="bg-white border border-gray-100 overflow-hidden shadow-sm">
                  {/* Header */}
                  <View className="flex-row items-center px-5 py-4 bg-gray-50 border-b border-gray-150">
                    <Text className="flex-1 text-[10px] font-black text-gray-400 uppercase tracking-wider">Employee Details</Text>
                    <Text className="w-[150px] text-[10px] font-black text-gray-400 uppercase text-center tracking-wider">Designation</Text>
                    <Text className="w-[200px] text-[10px] font-black text-gray-400 uppercase text-center tracking-wider">Contact Info</Text>
                    <Text className="w-[120px] text-[10px] font-black text-gray-400 uppercase text-right tracking-wider">Status</Text>
                  </View>

                  {/* Rows */}
                  {filteredTeachers.map((tc, index) => (
                    <View 
                      key={tc.id} 
                      className={`flex-row items-center px-5 py-4 border-b border-gray-100 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/20"
                      }`}
                    >
                      <View className="flex-1 flex-row items-center gap-3.5">
                        <View className="w-10 h-10 rounded-xl bg-blue-50 items-center justify-center border border-blue-100">
                          <AppIcon name="teacherStaff" size={20} color={Colors.primary} active />
                        </View>
                        <View>
                          <Text className="text-sm font-black text-gray-900">{tc.name}</Text>
                          <Text className="text-[12px] text-gray-450 font-bold mt-1">{tc.subject}</Text>
                        </View>
                      </View>

                      <Text className="w-[150px] text-sm text-gray-650 font-extrabold text-center">{tc.role}</Text>
                      
                      <View className="w-[200px] items-center">
                        <Text className="text-xs text-gray-800 font-extrabold">{tc.phone}</Text>
                        <Text className="text-[11px] text-gray-400 font-bold mt-0.5">{tc.email}</Text>
                      </View>

                      <View className="w-[120px] items-end">
                        <View className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                          <Text className="text-[10px] font-black text-emerald-600 uppercase">{tc.status}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </Card>
              )}
            </View>
          )}

          {/* MODE 2: Add Employee Multi-Tab Wizard */}
          {viewMode === "add" && (
            <View>
              <PremiumTabSwitcher
                tabs={[
                  { key: "basic", label: "Basic Info" },
                  { key: "education", label: "Education" },
                  { key: "role", label: "Permissions" },
                ]}
                active={activeTab}
                onChange={(k) => setActiveTab(k as typeof activeTab)}
              />

                     {activeTab === "basic" && (
                <Card className="bg-white border border-gray-150 p-6 gap-5 max-w-[800px] w-full self-center shadow-sm">
                  <Text className="text-[15px] font-black text-gray-900 border-b border-gray-100 pb-3" style={{ color: Colors.primary }}>Basic & Personal Details</Text>
                  
                  <View className={`flex-row gap-4 ${isMobile ? "flex-col" : ""}`}>
                    <View className="flex-1">
                      <Text className="text-[11px] font-black text-gray-400 mb-2 uppercase tracking-wider">First Name *</Text>
                      <TextInput 
                        value={firstName} 
                        onChangeText={setFirstName}
                        placeholder="Enter first name"
                        placeholderTextColor="#9CA3AF"
                        className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                        style={{ outlineWidth: 0 } as any}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[11px] font-black text-gray-400 mb-2 uppercase tracking-wider">Last Name *</Text>
                      <TextInput 
                        value={lastName} 
                        onChangeText={setLastName}
                        placeholder="Enter last name"
                        placeholderTextColor="#9CA3AF"
                        className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                        style={{ outlineWidth: 0 } as any}
                      />
                    </View>
                  </View>

                  <View className={`flex-row gap-4 ${isMobile ? "flex-col" : ""}`}>
                    <View className="flex-1">
                      <Text className="text-[11px] font-black text-gray-400 mb-2 uppercase tracking-wider">Mobile Number *</Text>
                      <TextInput 
                        value={mobile} 
                        onChangeText={setMobile}
                        placeholder="Enter mobile number"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                        style={{ outlineWidth: 0 } as any}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[11px] font-black text-gray-400 mb-2 uppercase tracking-wider">Designation</Text>
                      <TextInput 
                        value={designation} 
                        onChangeText={setDesignation}
                        placeholder="e.g. Faculty, Admin Staff"
                        placeholderTextColor="#9CA3AF"
                        className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                        style={{ outlineWidth: 0 } as any}
                      />
                    </View>
                  </View>
                </Card>
              )}

              {/* Tab 2: Education Details */}
              {activeTab === "education" && (
                <Card className="bg-white border border-gray-150 p-6 gap-5 max-w-[800px] w-full self-center shadow-sm">
                  <Text className="text-[15px] font-black text-gray-900 border-b border-gray-100 pb-3" style={{ color: Colors.primary }}>Academic & Qualification History</Text>
                  
                  <View className={`flex-row gap-4 ${isMobile ? "flex-col" : ""}`}>
                    <View className="flex-1">
                      <Text className="text-[11px] font-black text-gray-400 mb-2 uppercase tracking-wider">Qualification Degree</Text>
                      <TextInput 
                        value={qualification} 
                        onChangeText={setQualification}
                        placeholder="e.g. B.Ed, M.Sc"
                        placeholderTextColor="#9CA3AF"
                        className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                        style={{ outlineWidth: 0 } as any}
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-[11px] font-black text-gray-400 mb-2 uppercase tracking-wider">Passing Year</Text>
                      <TextInput 
                        value={passingYear} 
                        onChangeText={setPassingYear}
                        placeholder="e.g. 2018"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                        style={{ outlineWidth: 0 } as any}
                      />
                    </View>
                  </View>
                </Card>
              )}

              {/* Tab 3: Role & Permission Allocations */}
              {activeTab === "role" && (
                <Card className="bg-white border border-gray-150 p-6 gap-5 max-w-[800px] w-full self-center shadow-sm">
                  <Text className="text-[15px] font-black text-gray-900 border-b border-gray-100 pb-3" style={{ color: Colors.primary }}>App Permission & Assignments</Text>
                  
                  <View className="flex-1">
                    <Text className="text-[11px] font-black text-gray-400 mb-2 uppercase tracking-wider">Assigned Subject / Class Expertise</Text>
                    <TextInput 
                      value={assignedClass} 
                      onChangeText={setAssignedClass}
                      placeholder="e.g. Mathematics Class I-A"
                      placeholderTextColor="#9CA3AF"
                      className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                      style={{ outlineWidth: 0 } as any}
                    />
                  </View>

                  <TouchableOpacity 
                    onPress={handleAddTeacher}
                    disabled={addTeacherMutation.isPending}
                    className="h-[52px] rounded-xl justify-center items-center mt-4 shadow-lg flex-row gap-2"
                    style={{ backgroundColor: Colors.accent, shadowColor: Colors.accent }}
                    activeOpacity={0.8}
                  >
                    {addTeacherMutation.isPending ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                      <Text className="text-sm font-black text-white uppercase tracking-wider">Save & Register Employee</Text>
                    )}
                  </TouchableOpacity>
                </Card>
              )}
            </View>
          )}

    </PremiumScreenLayout>
  );
}
