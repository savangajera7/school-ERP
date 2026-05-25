import React, { useState, useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Platform } from "react-native";
import { router } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { EmptyState } from "@/components/ui/EmptyState";
import { AppIcon } from "@/components/icons/AppIcon";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
// Admission Inquiry API not in current Swagger — using local data until backend adds it.
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "@/components/auth/AccessDenied";

const INITIAL_INQUIRIES = [
  {
    id: "inq_1",
    studentName: "Aarti Patel",
    parentName: "Amit Patel",
    contact: "9876543212",
    email: "amit.patel@gmail.com",
    requestedClass: "Class I",
    status: "Pending",
    date: "2026-05-18",
  },
  {
    id: "inq_2",
    studentName: "Kabir Malhotra",
    parentName: "Sanjay Malhotra",
    contact: "9876543215",
    email: "sanjay.m@gmail.com",
    requestedClass: "Class XI-Sci",
    status: "Processed",
    date: "2026-05-16",
  },
  {
    id: "inq_3",
    studentName: "Diya Sharma",
    parentName: "Rajesh Sharma",
    contact: "9876543222",
    email: "sharma.rajesh@gmail.com",
    requestedClass: "Nursery",
    status: "Rejected",
    date: "2026-05-15",
  },
];

export default function InquiriesScreen() {
  const { can } = usePermissions();
  if (!can("manageInquiries")) {
    return <AccessDenied message="Admission inquiries are managed by school administrators." />;
  }
  const { isMobile } = useBreakpoint();
  const [search, setSearch] = useState("");
  const [selectedClass, setSelectedClass] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Modal State
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newStudent, setNewStudent] = useState("");
  const [newParent, setNewParent] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newClass, setNewClass] = useState("Class I");

  const [inquiries, setInquiries] = useState(INITIAL_INQUIRIES);
  const isLoading = false;
  const apiPending = true;

  const inquiryList = inquiries;

  const handleAddInquiry = async () => {
    if (!newStudent || !newParent || !newContact) return;

    try {
      const newEntry = {
        id: `inq_${Date.now()}`,
        studentName: newStudent,
        parentName: newParent,
        contact: newContact,
        email: newEmail || "N/A",
        requestedClass: newClass,
        status: "Pending",
        date: new Date().toISOString().split("T")[0],
      };
      setInquiries((prev) => [newEntry, ...prev]);
      setIsModalVisible(false);
      setNewStudent("");
      setNewParent("");
      setNewContact("");
      setNewEmail("");
    } catch (error) {
      // Local fallback representation
      setIsModalVisible(false);
    }
  };

  const [localStatuses, setLocalStatuses] = useState<Record<string, string>>({});

  const handleStatusChange = (id: string, nextStatus: "Pending" | "Processed" | "Rejected") => {
    setLocalStatuses(prev => ({ ...prev, [id]: nextStatus }));
  };

  const resolvedInquiries = useMemo(() => {
    return inquiryList.map(inq => ({
      ...inq,
      status: localStatuses[inq.id] || inq.status,
    }));
  }, [inquiryList, localStatuses]);

  const filteredInquiries = useMemo(() => {
    return resolvedInquiries.filter((inq) => {
      const matchesSearch =
        inq.studentName.toLowerCase().includes(search.toLowerCase()) ||
        inq.parentName.toLowerCase().includes(search.toLowerCase()) ||
        inq.contact.includes(search);
      const matchesClass = selectedClass === "All" || inq.requestedClass === selectedClass;
      const matchesStatus = selectedStatus === "All" || inq.status === selectedStatus;
      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [resolvedInquiries, search, selectedClass, selectedStatus]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Processed":
        return { bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", dot: "bg-[#f5921e]" };
      case "Rejected":
        return { bg: "bg-rose-50 border-rose-100", text: "text-rose-700", dot: "bg-rose-500" };
      default:
        return { bg: "bg-amber-50 border-amber-100", text: "text-amber-700", dot: "bg-amber-500" };
    }
  };

  return (
    <PremiumScreenLayout
      title="Online Inquiries"
      subtitle="Manage admission inquiry leads"
      onBack={() => router.push("/(app)/dashboard")}
      rightAction={
        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          className="px-4 py-2.5 bg-orange-500 rounded-xl"
          activeOpacity={0.8}
        >
          <Text className="text-white font-black text-xs uppercase tracking-widest">+ New</Text>
        </TouchableOpacity>
      }
    >
      {apiPending && (
        <View className="mb-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <Text className="text-amber-800 text-sm font-semibold text-center">
            Admission Inquiry API is not in the current backend spec. Data is stored locally until the endpoint is available.
          </Text>
        </View>
      )}

          {/* Filters Bar */}
          <Card className="bg-white border border-gray-150 p-4 mb-6 flex-row flex-wrap gap-4 items-center">
            {/* Search Input */}
            <View 
              className="flex-1 min-w-[200px] h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 flex-row items-center gap-2.5"
            >
              <AppIcon name="search" size={14} color="#9CA3AF" />
              <TextInput
                placeholder="Search name, parent, or contact..."
                value={search}
                onChangeText={setSearch}
                className="flex-1 text-sm font-semibold text-gray-800"
                placeholderTextColor="#9CA3AF"
                style={{ outlineWidth: 0 } as any}
              />
            </View>

            {/* Class Filter */}
            <View className="flex-row items-center gap-2">
              <Text className="text-xs text-gray-400 font-extrabold uppercase tracking-wide">Class:</Text>
              <View className="flex-row bg-gray-50 border border-gray-200 rounded-xl overflow-hidden p-0.5">
                {["All", "Nursery", "Class I", "Class XI-Sci"].map((cls) => (
                  <TouchableOpacity
                    key={cls}
                    onPress={() => setSelectedClass(cls)}
                    className={`px-3 py-1.5 rounded-lg ${selectedClass === cls ? "bg-[#0d3666]" : ""}`}
                  >
                    <Text className={`text-[10px] font-black uppercase tracking-wider ${
                      selectedClass === cls ? "text-white" : "text-gray-500"
                    }`}>
                      {cls === "Class XI-Sci" ? "XI-Sci" : cls}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status Filter */}
            <View className="flex-row items-center gap-2">
              <Text className="text-xs text-gray-400 font-extrabold uppercase tracking-wide">Status:</Text>
              <View className="flex-row bg-gray-50 border border-gray-200 rounded-xl overflow-hidden p-0.5">
                {["All", "Pending", "Processed", "Rejected"].map((st) => (
                  <TouchableOpacity
                    key={st}
                    onPress={() => setSelectedStatus(st)}
                    className={`px-3 py-1.5 rounded-lg ${selectedStatus === st ? "bg-[#0d3666]" : ""}`}
                  >
                    <Text className={`text-[10px] font-black uppercase tracking-wider ${
                      selectedStatus === st ? "text-white" : "text-gray-500"
                    }`}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>

          {/* Inquiries list grid */}
          {isLoading ? (
            <View className="py-20">
              <PremiumLoader color={Colors.primary} size={36} />
            </View>
          ) : filteredInquiries.length === 0 ? (
            <View className="py-20 items-center justify-center bg-white rounded-3xl border border-gray-100 p-8">
              <EmptyState icon="inquiries" title="No inquiries" message="New inquiries will show here" />
              <Text className="text-gray-400 font-extrabold text-sm uppercase tracking-wider">No admission inquiries found</Text>
            </View>
          ) : isMobile ? (
            <View className="gap-2">
              {filteredInquiries.map((inq) => {
                const style = getStatusStyle(inq.status);
                return (
                  <MobileDataCard
                    key={inq.id}
                    title={inq.studentName}
                    subtitle={`Requested Class: ${inq.requestedClass}`}
                    badge={
                      <View className={`px-2.5 py-0.5 rounded border ${style.bg}`}>
                        <Text className={`text-[10px] font-black uppercase tracking-wider ${style.text}`}>
                          {inq.status}
                        </Text>
                      </View>
                    }
                    fields={[
                      { label: "Parent", value: inq.parentName },
                      { label: "Phone", value: inq.contact },
                      { label: "Email", value: inq.email },
                      { label: "Submitted", value: inq.date },
                    ]}
                    actions={
                      inq.status === "Pending" ? (
                        <View className="flex-row gap-3 mt-1 flex-1">
                          <TouchableOpacity
                            onPress={() => handleStatusChange(inq.id, "Processed")}
                            className="flex-1 py-3 bg-emerald-500 rounded-xl items-center shadow-sm shadow-emerald-100"
                            activeOpacity={0.8}
                          >
                            <Text className="text-xs font-black text-white uppercase tracking-wider">Approve</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => handleStatusChange(inq.id, "Rejected")}
                            className="flex-grow py-3 bg-rose-500 rounded-xl items-center shadow-sm shadow-rose-100"
                            activeOpacity={0.8}
                          >
                            <Text className="text-xs font-black text-white uppercase tracking-wider">Reject</Text>
                          </TouchableOpacity>
                        </View>
                      ) : null
                    }
                  />
                );
              })}
            </View>
          ) : (
            <Card noPadding className="bg-white border border-gray-100 overflow-hidden shadow-sm">
              <View className="flex-row bg-gray-50 border-b border-gray-150 px-6 py-4">
                <Text className="flex-[1.5] font-black text-gray-400 text-xs uppercase">Student Name</Text>
                <Text className="flex-1 font-black text-gray-400 text-xs uppercase">Parent Name</Text>
                <Text className="flex-[0.8] font-black text-gray-400 text-xs uppercase">Class Requested</Text>
                <Text className="flex-1 font-black text-gray-400 text-xs uppercase">Contact Details</Text>
                <Text className="flex-[0.8] font-black text-gray-400 text-xs uppercase">Date Received</Text>
                <Text className="flex-[0.8] font-black text-gray-400 text-xs uppercase text-center">Status</Text>
                <Text className="flex-1 font-black text-gray-400 text-xs uppercase text-right">Actions</Text>
              </View>

              <View className="divide-y divide-gray-105">
                {filteredInquiries.map((inq) => {
                  const style = getStatusStyle(inq.status);
                  return (
                    <View key={inq.id} className="flex-row items-center px-6 py-4">
                      <Text className="flex-[1.5] font-black text-gray-900 text-sm">{inq.studentName}</Text>
                      <Text className="flex-1 text-gray-600 text-sm font-bold">{inq.parentName}</Text>
                      <Text className="flex-[0.8] text-gray-700 text-sm font-extrabold">{inq.requestedClass}</Text>
                      <View className="flex-1 gap-0.5">
                        <Text className="text-gray-900 text-sm font-extrabold">{inq.contact}</Text>
                        {inq.email && <Text className="text-gray-400 text-xs font-semibold">{inq.email}</Text>}
                      </View>
                      <Text className="flex-[0.8] text-gray-500 text-sm font-bold">{inq.date}</Text>
                      
                      <View className="flex-[0.8] items-center justify-center">
                        <View className={`px-2.5 py-1 rounded-full border flex-row items-center gap-1.5 ${style.bg}`}>
                          <View className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                          <Text className={`text-[10px] font-black uppercase tracking-wider ${style.text}`}>
                            {inq.status}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-grow flex-1 flex-row justify-end gap-2">
                        {inq.status === "Pending" ? (
                          <>
                            <TouchableOpacity
                              onPress={() => handleStatusChange(inq.id, "Processed")}
                              className="px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-lg"
                            >
                              <Text className="text-[11px] text-emerald-700 font-extrabold uppercase">Approve</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => handleStatusChange(inq.id, "Rejected")}
                              className="px-3 py-1.5 bg-rose-50 border border-rose-100 rounded-lg"
                            >
                              <Text className="text-[11px] text-rose-700 font-extrabold uppercase">Reject</Text>
                            </TouchableOpacity>
                          </>
                        ) : (
                          <View className="px-3 py-1.5 bg-gray-50 border border-gray-150 rounded-lg">
                            <Text className="text-[11px] text-gray-400 font-extrabold uppercase">
                              {inq.status === "Processed" ? "Approved" : "Rejected"}
                            </Text>
                          </View>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          )}

      {/* Modal: New Inquiry Form */}
      <Modal
        visible={isModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center p-6">
          <Card className="w-full max-w-[500px] bg-white p-6 rounded-3xl border-2 border-orange-50 shadow-2xl">
            <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-gray-100">
              <Text className="text-base font-black text-gray-900 uppercase tracking-wider">Add New Inquiry Lead</Text>
              <TouchableOpacity 
                onPress={() => setIsModalVisible(false)}
                className="bg-gray-50 w-8 h-8 rounded-full items-center justify-center"
              >
                <Text className="text-sm font-black text-gray-400">✕</Text>
              </TouchableOpacity>
            </View>

            <View className="gap-4 mb-6">
              <View>
                <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Student Full Name *</Text>
                <TextInput
                  value={newStudent}
                  onChangeText={setNewStudent}
                  placeholder="Enter student name"
                  placeholderTextColor="#9CA3AF"
                  className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                  style={{ outlineWidth: 0 } as any}
                />
              </View>

              <View>
                <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Parent / Guardian Name *</Text>
                <TextInput
                  value={newParent}
                  onChangeText={setNewParent}
                  placeholder="Enter parent name"
                  placeholderTextColor="#9CA3AF"
                  className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                  style={{ outlineWidth: 0 } as any}
                />
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Contact Number *</Text>
                  <TextInput
                    value={newContact}
                    onChangeText={setNewContact}
                    placeholder="Enter mobile number"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="phone-pad"
                    className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                    style={{ outlineWidth: 0 } as any}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Requested Class</Text>
                  <TextInput
                    value={newClass}
                    onChangeText={setNewClass}
                    placeholder="Class I"
                    placeholderTextColor="#9CA3AF"
                    className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                    style={{ outlineWidth: 0 } as any}
                  />
                </View>
              </View>

              <View>
                <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Email Address (Optional)</Text>
                <TextInput
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="Enter parent email address"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
                  style={{ outlineWidth: 0 } as any}
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                className="flex-1 py-3 bg-gray-50 rounded-xl items-center border border-gray-150"
              >
                <Text className="text-sm font-black text-gray-450 uppercase tracking-wider">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleAddInquiry}
                className="flex-1 py-3 bg-[#0d3666] rounded-xl items-center shadow-lg shadow-indigo-100"
              >
                <Text className="text-sm font-black text-white uppercase tracking-wider">Save inquiry</Text>
              </TouchableOpacity>
            </View>
          </Card>
        </View>
      </Modal>
    </PremiumScreenLayout>
  );
}
