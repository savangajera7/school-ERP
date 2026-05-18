import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { useBreakpoint } from "@/hooks/useBreakpoint";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface InquiryItem {
  id: string;
  studentName: string;
  parentName: string;
  contact: string;
  email: string;
  requestedClass: string;
  status: "Pending" | "Processed" | "Rejected";
  date: string;
}

const INITIAL_INQUIRIES: InquiryItem[] = [
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
  const { isMobile, isTablet } = useBreakpoint();
  const [inquiries, setInquiries] = useState<InquiryItem[]>(INITIAL_INQUIRIES);
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

  const handleAddInquiry = () => {
    if (!newStudent || !newParent || !newContact) return;
    const newInq: InquiryItem = {
      id: `inq_${Date.now()}`,
      studentName: newStudent,
      parentName: newParent,
      contact: newContact,
      email: newEmail,
      requestedClass: newClass,
      status: "Pending",
      date: new Date().toISOString().split("T")[0],
    };
    setInquiries([newInq, ...inquiries]);
    setIsModalVisible(false);
    // Reset Form
    setNewStudent("");
    setNewParent("");
    setNewContact("");
    setNewEmail("");
  };

  const handleStatusChange = (id: string, nextStatus: "Pending" | "Processed" | "Rejected") => {
    setInquiries(
      inquiries.map((inq) => (inq.id === id ? { ...inq, status: nextStatus } : inq))
    );
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.studentName.toLowerCase().includes(search.toLowerCase()) ||
      inq.parentName.toLowerCase().includes(search.toLowerCase()) ||
      inq.contact.includes(search);
    const matchesClass = selectedClass === "All" || inq.requestedClass === selectedClass;
    const matchesStatus = selectedStatus === "All" || inq.status === selectedStatus;
    return matchesSearch && matchesClass && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Processed":
        return { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-[#f5921e]" };
      case "Rejected":
        return { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" };
      default:
        return { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" };
    }
  };

  const renderDesktopGrid = () => (
    <Card className="bg-white border border-gray-100 p-0 overflow-hidden">
      <View className="flex-row bg-gray-50 border-b border-gray-100 px-6 py-4">
        <Text className="flex-[1.5] font-bold text-gray-500 text-[13px] uppercase">Student Name</Text>
        <Text className="flex-1 font-bold text-gray-500 text-[13px] uppercase">Parent Name</Text>
        <Text className="flex-[0.8] font-bold text-gray-500 text-[13px] uppercase">Class Requested</Text>
        <Text className="flex-1 font-bold text-gray-500 text-[13px] uppercase">Contact Details</Text>
        <Text className="flex-[0.8] font-bold text-gray-500 text-[13px] uppercase">Date Received</Text>
        <Text className="flex-[0.8] font-bold text-gray-500 text-[13px] uppercase text-center">Status</Text>
        <Text className="flex-1 font-bold text-gray-500 text-[13px] uppercase text-right">Actions</Text>
      </View>

      <View className="divide-y divide-gray-50">
        {filteredInquiries.map((inq) => {
          const style = getStatusStyle(inq.status);
          return (
            <View key={inq.id} className="flex-row items-center px-6 py-4 hover:bg-gray-50/50">
              <Text className="flex-[1.5] font-bold text-gray-900 text-sm">{inq.studentName}</Text>
              <Text className="flex-1 text-gray-600 text-sm font-semibold">{inq.parentName}</Text>
              <Text className="flex-[0.8] text-gray-700 text-sm font-bold">{inq.requestedClass}</Text>
              <View className="flex-1 gap-0.5">
                <Text className="text-gray-900 text-sm font-bold">{inq.contact}</Text>
                {inq.email && <Text className="text-gray-400 text-xs font-semibold">{inq.email}</Text>}
              </View>
              <Text className="flex-[0.8] text-gray-500 text-sm font-medium">{inq.date}</Text>
              
              <View className="flex-[0.8] items-center justify-center">
                <View className={`px-2.5 py-1 rounded-full flex-row items-center gap-1.5 ${style.bg}`}>
                  <View className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                  <Text className={`text-[11px] font-bold ${style.text}`}>{inq.status}</Text>
                </View>
              </View>

              <View className="flex-grow flex-1 flex-row justify-end gap-2">
                {inq.status === "Pending" && (
                  <>
                    <TouchableOpacity
                      onPress={() => handleStatusChange(inq.id, "Processed")}
                      className="px-2.5 py-1.5 bg-emerald-50 rounded-lg"
                    >
                      <Text className="text-xs text-emerald-700 font-bold">Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleStatusChange(inq.id, "Rejected")}
                      className="px-2.5 py-1.5 bg-red-50 rounded-lg"
                    >
                      <Text className="text-xs text-red-700 font-bold">Reject</Text>
                    </TouchableOpacity>
                  </>
                )}
                {inq.status === "Processed" && (
                  <View className="px-2.5 py-1.5 bg-gray-50 rounded-lg">
                    <Text className="text-xs text-gray-400 font-bold">Processed</Text>
                  </View>
                )}
                {inq.status === "Rejected" && (
                  <View className="px-2.5 py-1.5 bg-gray-50 rounded-lg">
                    <Text className="text-xs text-gray-400 font-bold">Rejected</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </Card>
  );

  const renderMobileCards = () => (
    <View className="gap-4">
      {filteredInquiries.map((inq) => {
        const style = getStatusStyle(inq.status);
        return (
          <Card key={inq.id} className="bg-white border border-gray-100 p-5 shadow-sm">
            <View className="flex-row justify-between items-start mb-3">
              <View className="flex-1 pr-3">
                <Text className="text-lg font-bold text-gray-900">{inq.studentName}</Text>
                <Text className="text-xs text-gray-400 font-semibold mt-0.5">Requested: {inq.requestedClass}</Text>
              </View>
              <View className={`px-2.5 py-1 rounded-full flex-row items-center gap-1.5 ${style.bg}`}>
                <View className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                <Text className={`text-[11px] font-bold ${style.text}`}>{inq.status}</Text>
              </View>
            </View>

            <View className="h-[1px] bg-gray-50 w-full mb-3" />

            <View className="gap-2 mb-4">
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-400 font-semibold">Parent Name:</Text>
                <Text className="text-xs text-gray-700 font-bold">{inq.parentName}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-400 font-semibold">Contact:</Text>
                <Text className="text-xs text-gray-900 font-bold">{inq.contact}</Text>
              </View>
              {inq.email && (
                <View className="flex-row justify-between">
                  <Text className="text-xs text-gray-400 font-semibold">Email:</Text>
                  <Text className="text-xs text-gray-500 font-medium">{inq.email}</Text>
                </View>
              )}
              <View className="flex-row justify-between">
                <Text className="text-xs text-gray-400 font-semibold">Received:</Text>
                <Text className="text-xs text-gray-500 font-medium">{inq.date}</Text>
              </View>
            </View>

            {inq.status === "Pending" && (
              <View className="flex-row gap-3 pt-1">
                <TouchableOpacity
                  onPress={() => handleStatusChange(inq.id, "Processed")}
                  className="flex-1 py-2.5 bg-emerald-50 rounded-xl items-center"
                >
                  <Text className="text-xs text-emerald-700 font-bold">Approve Inquiry</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleStatusChange(inq.id, "Rejected")}
                  className="flex-1 py-2.5 bg-red-50 rounded-xl items-center"
                >
                  <Text className="text-xs text-red-700 font-bold">Reject</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <View className="flex-1">
        {/* Top Navbar */}
        <View className="bg-white border-b border-gray-100 px-6 py-4 flex-row justify-between items-center">
          <View className="flex-row items-center gap-3">
            <TouchableOpacity
              onPress={() => router.push("/(app)/dashboard")}
              className="w-10 h-10 bg-gray-50 rounded-xl items-center justify-center"
            >
              <Text className="text-sm font-bold text-gray-700">🔙</Text>
            </TouchableOpacity>
            <View>
              <Text className="text-[18px] font-bold text-gray-900">Online Inquiries</Text>
              <Text className="text-[12px] text-gray-400 font-semibold mt-0.5">
                Manage incoming student admissions inquiry leads
              </Text>
            </View>
          </View>

          <Button
            label="New Inquiry"
            onPress={() => setIsModalVisible(true)}
            variant="primary"
          />
        </View>

        <ScrollView className="flex-1 pt-6 px-6" keyboardShouldPersistTaps="handled">
          {/* Filters Bar */}
          <Card className="bg-white border border-gray-100 p-4 mb-6 flex-row flex-wrap gap-4 items-center">
            {/* Search Input */}
            <View className="flex-1 min-w-[200px] h-[44px] bg-gray-50 border border-gray-150 rounded-xl px-4 flex-row items-center gap-2">
              <Text className="text-xs">🔍</Text>
              <TextInput
                placeholder="Search name, parent, or mobile"
                value={search}
                onChangeText={setSearch}
                className="flex-1 text-sm font-semibold text-gray-800"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Class Filter */}
            <View className="flex-row items-center gap-2">
              <Text className="text-xs text-gray-500 font-bold">Class:</Text>
              <View className="flex-row bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                {["All", "Nursery", "Class I", "Class XI-Sci"].map((cls) => (
                  <TouchableOpacity
                    key={cls}
                    onPress={() => setSelectedClass(cls)}
                    className={`px-3 py-1.5 ${selectedClass === cls ? "bg-[#0d3666]" : ""}`}
                  >
                    <Text className={`text-xs font-bold ${selectedClass === cls ? "text-white" : "text-gray-600"}`}>
                      {cls}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Status Filter */}
            <View className="flex-row items-center gap-2">
              <Text className="text-xs text-gray-500 font-bold">Status:</Text>
              <View className="flex-row bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
                {["All", "Pending", "Processed", "Rejected"].map((st) => (
                  <TouchableOpacity
                    key={st}
                    onPress={() => setSelectedStatus(st)}
                    className={`px-3 py-1.5 ${selectedStatus === st ? "bg-[#0d3666]" : ""}`}
                  >
                    <Text className={`text-xs font-bold ${selectedStatus === st ? "text-white" : "text-gray-600"}`}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Card>

          {/* Inquiries list grid */}
          {isMobile ? renderMobileCards() : renderDesktopGrid()}
        </ScrollView>

        {/* Modal: New Inquiry Form */}
        <Modal
          visible={isModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View className="flex-1 bg-black/40 items-center justify-center p-6">
            <Card className="w-full max-w-[500px] bg-white p-6 rounded-2xl">
              <View className="flex-row justify-between items-center mb-5 pb-3 border-b border-gray-100">
                <Text className="text-lg font-bold text-gray-900">Add New Inquiry</Text>
                <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                  <Text className="text-lg text-gray-400 font-bold">✕</Text>
                </TouchableOpacity>
              </View>

              <View className="gap-4 mb-6">
                <View>
                  <Text className="text-xs font-bold text-gray-500 mb-1.5">Student Full Name</Text>
                  <TextInput
                    value={newStudent}
                    onChangeText={setNewStudent}
                    placeholder="Enter student name"
                    className="h-[48px] bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-semibold text-gray-800"
                  />
                </View>

                <View>
                  <Text className="text-xs font-bold text-gray-500 mb-1.5">Parent / Guardian Name</Text>
                  <TextInput
                    value={newParent}
                    onChangeText={setNewParent}
                    placeholder="Enter parent name"
                    className="h-[48px] bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-semibold text-gray-800"
                  />
                </View>

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-500 mb-1.5">Contact Number</Text>
                    <TextInput
                      value={newContact}
                      onChangeText={setNewContact}
                      placeholder="Enter mobile number"
                      keyboardType="phone-pad"
                      className="h-[48px] bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-semibold text-gray-800"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs font-bold text-gray-500 mb-1.5">Class Requested</Text>
                    <View className="h-[48px] bg-gray-50 border border-gray-100 rounded-xl px-4 flex-row items-center justify-between">
                      <TextInput
                        value={newClass}
                        onChangeText={setNewClass}
                        placeholder="Class I"
                        className="flex-1 text-sm font-semibold text-gray-800"
                      />
                    </View>
                  </View>
                </View>

                <View>
                  <Text className="text-xs font-bold text-gray-500 mb-1.5">Email Address (Optional)</Text>
                  <TextInput
                    value={newEmail}
                    onChangeText={setNewEmail}
                    placeholder="Enter parent email address"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="h-[48px] bg-gray-50 border border-gray-100 rounded-xl px-4 text-sm font-semibold text-gray-800"
                  />
                </View>
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => setIsModalVisible(false)}
                  className="flex-1 py-3 border border-gray-100 rounded-xl items-center"
                >
                  <Text className="text-sm font-bold text-gray-500">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddInquiry}
                  className="flex-1 py-3 bg-[#0d3666] rounded-xl items-center"
                >
                  <Text className="text-sm font-bold text-white">Save Inquiry</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
