import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";
import { useBreakpoint } from "@/hooks/useBreakpoint";

// Mock Data
const MOCK_OUTSTANDING = [
  { id: "stu_1", name: "Pooja Patel", class: "Class I-A", totalDue: 15000, outstanding: 10000, rollNo: "14" },
  { id: "stu_2", name: "Rahul Sharma", class: "Class I-A", totalDue: 15000, outstanding: 15000, rollNo: "21" },
  { id: "stu_3", name: "Aarav Desai", class: "Class II-B", totalDue: 18000, outstanding: 5000, rollNo: "03" },
];

const MOCK_TRANSACTIONS = [
  { id: "tx_101", studentName: "Pooja Patel", amount: 5000, method: "Razorpay", date: "18 May, 2026", status: "Success" },
  { id: "tx_102", studentName: "Aarav Desai", amount: 13000, method: "Cash", date: "16 May, 2026", status: "Success" },
  { id: "tx_103", studentName: "Kavya Verma", amount: 15000, method: "Bank Transfer", date: "12 May, 2026", status: "Success" },
];

const FEE_STRUCTURE = [
  { term: "Term 1 (Tuition)", amount: 8000 },
  { term: "Term 2 (Tuition)", amount: 8000 },
  { term: "Exam Fee", amount: 1000 },
  { term: "Lab & Library", amount: 1000 },
];

import { Colors } from "@/constants/colors";
import { LinearGradient } from "expo-linear-gradient";
import { useFeesCollect, useFeesPending, useFeesPaymentHistory } from "@/api/generated/erp-fees/erp-fees";

export default function FeesManagementScreen() {
  const { isMobile } = useBreakpoint();
  const [activeTab, setActiveTab] = useState<"collect" | "history" | "structure">("collect");
  const [searchQuery, setSearchQuery] = useState("");
  
  const collectFees = useFeesCollect();
  const { data: pendingData } = useFeesPending();
  const { data: historyData } = useFeesPaymentHistory();

  // Collect modal state
  const [selectedStudent, setSelectedStudent] = useState<typeof MOCK_OUTSTANDING[0] | null>(null);
  const [collectAmount, setCollectAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"Cash" | "Razorpay" | "Bank Transfer">("Razorpay");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOpenCollect = (student: typeof MOCK_OUTSTANDING[0]) => {
    setSelectedStudent(student);
    setCollectAmount(student.outstanding.toString());
  };

  const handleProcessPayment = async () => {
    if (!collectAmount || parseFloat(collectAmount) <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid payment amount.");
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulate API call or use collectFees mutation if ready
      // await collectFees.mutateAsync({ data: { ... } });

      // Process payment (Razorpay emulator simulation)
      setTimeout(() => {
        setIsProcessing(false);
        if (Platform.OS !== "web") {
          Alert.alert(
            "Payment Successful",
            `Receipt generated for ₹${collectAmount} via ${paymentMethod} for ${selectedStudent?.name}.`,
            [{ text: "OK", onPress: () => setSelectedStudent(null) }]
          );
        } else {
          window.alert(`Payment Successful!\nReceipt generated for ₹${collectAmount} for ${selectedStudent?.name}.`);
          setSelectedStudent(null);
        }
      }, 2000);
    } catch (error) {
      setIsProcessing(false);
      Alert.alert("Error", "Payment processing failed.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" translucent backgroundColor="transparent" />
      
      {/* Top Navbar */}
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark]}
        className="px-6 pt-6 pb-12 rounded-b-[32px]"
      >
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => router.push("/(app)/dashboard")}
            className="w-10 h-10 bg-white/10 rounded-xl items-center justify-center border border-white/20"
          >
            <Text className="text-white font-bold">🔙</Text>
          </TouchableOpacity>
          <View>
            <Text className="text-xl font-black text-white">Fees Management</Text>
            <Text className="text-white/60 text-xs font-bold uppercase tracking-wider mt-0.5">
              Collect invoices and view ledgers
            </Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tabs */}
      <View className="px-6 -mt-6">
        <View className="bg-white p-2 rounded-2xl flex-row shadow-lg shadow-gray-200/50 border border-gray-50">
          <TouchableOpacity 
            onPress={() => setActiveTab("collect")}
            className={`flex-1 items-center py-2.5 rounded-xl ${activeTab === 'collect' ? 'bg-primary/5' : ''}`}
          >
            <Text className={`text-xs font-black uppercase tracking-tighter ${activeTab === 'collect' ? 'text-primary' : 'text-gray-400'}`}>Collect</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("history")}
            className={`flex-1 items-center py-2.5 rounded-xl ${activeTab === 'history' ? 'bg-primary/5' : ''}`}
          >
            <Text className={`text-xs font-black uppercase tracking-tighter ${activeTab === 'history' ? 'text-primary' : 'text-gray-400'}`}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("structure")}
            className={`flex-1 items-center py-2.5 rounded-xl ${activeTab === 'structure' ? 'bg-primary/5' : ''}`}
          >
            <Text className={`text-xs font-black uppercase tracking-tighter ${activeTab === 'structure' ? 'text-primary' : 'text-gray-400'}`}>Structure</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4 mt-6 md:px-8" showsVerticalScrollIndicator={false}>
        <View className="max-w-[1200px] w-full self-center pb-10">
          
          {/* Quick Stats Grid */}
          <View className={`flex-row gap-4 mb-6 ${isMobile ? "flex-col" : ""}`}>
            <Card className="flex-1 bg-[#0d3666] p-5">
              <Text className="text-xs font-bold text-indigo-200 uppercase tracking-wider mb-1">Total Fee Collected</Text>
              <Text className="text-2xl font-bold text-white">₹3,45,000</Text>
            </Card>
            <Card className="flex-1 bg-orange-50 border border-orange-100 p-5">
              <Text className="text-xs font-bold text-[#f5921e] uppercase tracking-wider mb-1">Total Outstanding</Text>
              <Text className="text-2xl font-bold text-[#0d3666]">₹1,20,000</Text>
            </Card>
          </View>

          {/* Module Tabs */}
          <View className="flex-row gap-2 mb-6 border-b border-gray-100 pb-3">
            <TouchableOpacity
              onPress={() => setActiveTab("collect")}
              className={`px-4 py-2 rounded-lg ${activeTab === "collect" ? "bg-[#0d3666]" : "bg-white border border-gray-150"}`}
            >
              <Text className={`text-xs font-bold ${activeTab === "collect" ? "text-white" : "text-gray-600"}`}>
                💳 Collect Fees
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-lg ${activeTab === "history" ? "bg-[#0d3666]" : "bg-white border border-gray-150"}`}
            >
              <Text className={`text-xs font-bold ${activeTab === "history" ? "text-white" : "text-gray-600"}`}>
                🧾 Invoices & Logs
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActiveTab("structure")}
              className={`px-4 py-2 rounded-lg ${activeTab === "structure" ? "bg-[#0d3666]" : "bg-white border border-gray-150"}`}
            >
              <Text className={`text-xs font-bold ${activeTab === "structure" ? "text-white" : "text-gray-600"}`}>
                ⚙️ Fee Structure
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content: Collect Fees */}
          {activeTab === "collect" && (
            <View className="gap-4">
              {/* Search outstanding */}
              <View className="bg-white border border-gray-100 rounded-xl h-[48px] px-4 flex-row items-center gap-3 mb-2">
                <Text className="text-gray-400">🔍</Text>
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search outstanding student by name..."
                  className="flex-1 text-sm font-semibold text-gray-800"
                />
              </View>

              {/* Outstanding List */}
              <Card className="bg-white border border-gray-100 overflow-hidden">
                <View className="flex-row items-center px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <Text className="w-12 text-xs font-bold text-gray-400 uppercase">Roll</Text>
                  <Text className="flex-1 text-xs font-bold text-gray-400 uppercase">Student Name</Text>
                  <Text className="w-[120px] text-xs font-bold text-gray-400 uppercase text-center">Class</Text>
                  <Text className="w-[120px] text-xs font-bold text-gray-400 uppercase text-right">Outstanding</Text>
                  <Text className="w-[120px] text-xs font-bold text-gray-400 uppercase text-right"></Text>
                </View>

                {MOCK_OUTSTANDING.map((item) => (
                  <View key={item.id} className="flex-row items-center px-5 py-4 border-b border-gray-50">
                    <Text className="w-12 text-sm font-bold text-gray-400">{item.rollNo}</Text>
                    <Text className="flex-1 text-sm font-bold text-gray-800">{item.name}</Text>
                    <Text className="w-[120px] text-sm text-gray-500 font-semibold text-center">{item.class}</Text>
                    <Text className="w-[120px] text-sm text-red-650 font-bold text-right">₹{item.outstanding}</Text>
                    
                    <View className="w-[120px] items-end">
                      <TouchableOpacity 
                        onPress={() => handleOpenCollect(item)}
                        className="px-3.5 py-1.5 bg-[#f5921e] rounded-lg shadow-sm shadow-orange-100"
                      >
                        <Text className="text-xs font-bold text-white">Collect</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </Card>

              {/* Collect modal Overlay (Simplified inline view if selected student is active) */}
              {selectedStudent && (
                <Card className="bg-white border border-orange-200 p-6 mt-4 shadow-lg">
                  <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-gray-100">
                    <Text className="text-base font-bold text-[#0d3666]">
                      Collect Fee Payment: {selectedStudent.name}
                    </Text>
                    <TouchableOpacity onPress={() => setSelectedStudent(null)}>
                      <Text className="text-sm font-bold text-gray-400">Cancel</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="gap-4">
                    <View className="flex-row gap-4">
                      <View className="flex-1">
                        <Text className="text-xs font-bold text-gray-400 mb-2 uppercase">Payment Amount (₹)</Text>
                        <TextInput
                          value={collectAmount}
                          onChangeText={setCollectAmount}
                          keyboardType="numeric"
                          className="h-[48px] bg-gray-50 border border-gray-200 rounded-lg px-4 text-sm font-bold text-gray-800"
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-xs font-bold text-gray-400 mb-2 uppercase">Payment Method</Text>
                        <View className="flex-row gap-2">
                          {(["Razorpay", "Cash", "Bank Transfer"] as const).map((method) => (
                            <TouchableOpacity
                              key={method}
                              onPress={() => setPaymentMethod(method)}
                              className={`flex-1 h-[48px] border justify-center items-center rounded-lg ${
                                paymentMethod === method ? "bg-[#0d3666] border-[#0d3666]" : "bg-white border-gray-200"
                              }`}
                            >
                              <Text className={`text-xs font-bold ${paymentMethod === method ? "text-white" : "text-gray-600"}`}>
                                {method}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    </View>

                    <TouchableOpacity 
                      onPress={handleProcessPayment}
                      disabled={isProcessing}
                      className="h-[48px] bg-[#0d3666] rounded-xl items-center justify-center mt-2 shadow-md shadow-indigo-100"
                    >
                      <Text className="text-sm font-bold text-white">
                        {isProcessing 
                          ? "Connecting to Razorpay..." 
                          : `Confirm & Process Payment (₹${collectAmount})`}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </Card>
              )}
            </View>
          )}

          {/* Tab Content: Transaction History */}
          {activeTab === "history" && (
            <Card className="bg-white border border-gray-100 overflow-hidden">
              <View className="flex-row items-center px-5 py-3 bg-gray-50 border-b border-gray-100">
                <Text className="w-20 text-xs font-bold text-gray-400 uppercase">Receipt No</Text>
                <Text className="flex-1 text-xs font-bold text-gray-400 uppercase">Student Name</Text>
                <Text className="w-[120px] text-xs font-bold text-gray-400 uppercase text-center">Method</Text>
                <Text className="w-[120px] text-xs font-bold text-gray-400 uppercase text-center">Date</Text>
                <Text className="w-[100px] text-xs font-bold text-gray-400 uppercase text-right">Amount</Text>
                <Text className="w-[100px] text-xs font-bold text-gray-400 uppercase text-right">Status</Text>
              </View>

              {MOCK_TRANSACTIONS.map((tx) => (
                <View key={tx.id} className="flex-row items-center px-5 py-4 border-b border-gray-50">
                  <Text className="w-20 text-sm font-bold text-gray-400">{tx.id}</Text>
                  <Text className="flex-1 text-sm font-bold text-gray-800">{tx.studentName}</Text>
                  <Text className="w-[120px] text-sm text-gray-500 font-semibold text-center">{tx.method}</Text>
                  <Text className="w-[120px] text-sm text-gray-500 font-semibold text-center">{tx.date}</Text>
                  <Text className="w-[100px] text-sm text-gray-900 font-bold text-right">₹{tx.amount}</Text>
                  
                  <View className="w-[100px] items-end">
                    <View className="px-2.5 py-1 bg-green-50 rounded-full">
                      <Text className="text-[10px] font-bold text-green-700">{tx.status}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </Card>
          )}

          {/* Tab Content: Fee Structure */}
          {activeTab === "structure" && (
            <Card className="bg-white border border-gray-100 p-5">
              <Text className="text-sm font-bold text-gray-800 border-b border-gray-50 pb-3 mb-4">
                Primary Standard (Class I - IV) Fee Structure
              </Text>
              
              <View className="gap-4">
                {FEE_STRUCTURE.map((item, idx) => (
                  <View key={idx} className="flex-row justify-between items-center py-2 border-b border-gray-50">
                    <Text className="text-sm font-semibold text-gray-600">{item.term}</Text>
                    <Text className="text-sm font-bold text-gray-800">₹{item.amount}</Text>
                  </View>
                ))}

                <View className="flex-row justify-between items-center py-3 bg-gray-50 px-4 rounded-xl mt-2">
                  <Text className="text-sm font-bold text-gray-900">Total Yearly Academic Fee</Text>
                  <Text className="text-base font-bold text-[#0d3666]">₹18,000</Text>
                </View>
              </View>
            </Card>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
