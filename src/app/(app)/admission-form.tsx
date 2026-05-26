import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { AppIcon } from "@/components/icons/AppIcon";
import { 
  useGetApiStudentGetByIDId 
} from "@/api/generated/3-student-crud/3-student-crud";
import { 
  usePostApiAdmissionAdd, 
  usePutApiAdmissionUpdate 
} from "@/api/generated/4-admission/4-admission";
import { useGetApiBloodGroupGet } from "@/api/generated/2-master-bloodgroup/2-master-bloodgroup";
import { useGetApiReligionGet } from "@/api/generated/2-master-religion/2-master-religion";
import { useGetApiCategoryGet } from "@/api/generated/2-master-category/2-master-category";
import { useGetApiBatchGet } from "@/api/generated/2-master-batch/2-master-batch";
import { useGetApiClassGet } from "@/api/generated/master-class/master-class";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { useResponsive } from "@/hooks/useResponsive";
import { parseApiData, parseApiList } from "@/utils/apiResponse";

export default function AdmissionFormScreen() {
  const { id } = useLocalSearchParams();
  const studentID = id ? parseInt(typeof id === "string" ? id : id[0]) : null;
  const isEditing = !!studentID;

  const { canManageStudents } = usePermissions();
  if (!canManageStudents) {
    return <AccessDenied message="New admissions are handled by school administrators." />;
  }

  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(false);

  // --- Form State ---
  
  // 1. Personal Details
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [bloodGroupId, setBloodGroupId] = useState<number | undefined>();
  const [religionId, setReligionId] = useState<number | undefined>();
  const [categoryId, setCategoryId] = useState<number | undefined>();
  
  // 2. Identification
  const [aadhaarNo, setAadhaarNo] = useState("");
  const [penNo, setPenNo] = useState("");
  const [aparID, setAparID] = useState("");

  // 3. Contact & Address
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [currentAddress, setCurrentAddress] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [permanentCity, setPermanentCity] = useState("");

  // 4. Guardian Details
  const [fatherName, setFatherName] = useState("");
  const [fatherNumber, setFatherNumber] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [fatherEducation, setFatherEducation] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherNumber, setMotherNumber] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [motherEducation, setMotherEducation] = useState("");

  // 5. Academic & Others
  const [formNo, setFormNo] = useState("");
  const [classId, setClassId] = useState<number | undefined>();
  const [batchId, setBatchId] = useState<number | undefined>();
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split("T")[0]);
  const [previousSchool, setPreviousSchool] = useState("");
  const [lastPercentage, setLastPercentage] = useState("");
  const [reference, setReference] = useState("");
  const [remarks, setRemarks] = useState("");
  const [status, setStatus] = useState("Active");

  // --- API Hooks ---
  const studentAddMutation = usePostApiAdmissionAdd();
  const studentUpdateMutation = usePutApiAdmissionUpdate();
  
  const { data: studentResponse, isLoading: loadingStudent } = useGetApiStudentGetByIDId(studentID as number, {
    query: { enabled: isEditing }
  });

  // Masters
  const { data: bloodGroupsData } = useGetApiBloodGroupGet();
  const { data: religionsData } = useGetApiReligionGet();
  const { data: categoriesData } = useGetApiCategoryGet();
  const { data: batchesData } = useGetApiBatchGet();
  const { data: classesData } = useGetApiClassGet();

  const bloodGroups = parseApiList(bloodGroupsData?.data);
  const religions = parseApiList(religionsData?.data);
  const categories = parseApiList(categoriesData?.data);
  const batches = parseApiList(batchesData?.data);
  const classes = parseApiList(classesData?.data);

  useEffect(() => {
    if (studentResponse?.data) {
      const s = parseApiData(studentResponse.data) as any;
      setFirstName(s.firstName || "");
      setMiddleName(s.middleName || "");
      setLastName(s.lastName || "");
      setGender(s.gender || "Male");
      setDob(s.dob ? String(s.dob).slice(0, 10) : "");
      setBloodGroupId(s.bloodGroupID);
      setReligionId(s.religionID);
      setCategoryId(s.categoryID);
      
      setAadhaarNo(s.aadhaarNo || "");
      setPenNo(s.penNo || "");
      setAparID(s.aparID || "");

      setMobile(s.studentNumber || "");
      setEmail(s.studentEmail || "");
      setCurrentAddress(s.currentAddress || "");
      setCurrentCity(s.currentCity || "");
      setPermanentAddress(s.permanentAddress || "");
      setPermanentCity(s.permanentCity || "");

      setFatherName(s.fatherName || "");
      setFatherNumber(s.fatherNumber || "");
      setFatherOccupation(s.fatherOccupation || "");
      setFatherEducation(s.fatherEducation || "");
      setMotherName(s.motherName || "");
      setMotherNumber(s.motherNumber || "");
      setMotherOccupation(s.motherOccupation || "");
      setMotherEducation(s.motherEducation || "");

      setFormNo(s.studentGRNo || "");
      setClassId(s.classID);
      setBatchId(s.batchID);
      setAdmissionDate(s.admissionDate ? String(s.admissionDate).slice(0, 10) : "");
      setPreviousSchool(s.previousSchoolName || "");
      setLastPercentage(String(s.lastSemesterYearPercentage || ""));
      setReference(s.referenceSource || "");
      setRemarks(s.remarks || "");
      setStatus(s.isActive ? "Active" : "In-Active");
    }
  }, [studentResponse]);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !fatherName || !mobile) {
      Alert.alert("Missing Fields", "Please complete all required fields (*).");
      return;
    }

    const payload = {
      firstName,
      middleName,
      lastName,
      gender,
      dob,
      bloodGroupID: bloodGroupId,
      religionID: religionId,
      categoryID: categoryId,
      aadhaarNo,
      penNo,
      aparID,
      studentNumber: mobile,
      studentEmail: email || `${firstName.toLowerCase()}${lastName.toLowerCase()}@school.com`,
      currentAddress,
      currentCity,
      permanentAddress,
      permanentCity,
      fatherName,
      fatherNumber,
      fatherOccupation,
      fatherEducation,
      motherName,
      motherNumber,
      motherOccupation,
      motherEducation,
      studentGRNo: formNo,
      classID: classId,
      batchID: batchId,
      admissionDate,
      previousSchoolName: previousSchool,
      lastSemesterYearPercentage: parseFloat(lastPercentage) || 0,
      referenceSource: reference,
      remarks,
      isActive: status === "Active",
    };

    try {
      setLoading(true);
      if (isEditing) {
        await studentUpdateMutation.mutateAsync({
          data: { ...payload, studentID: studentID as number }
        });
        Alert.alert("Success", "Student Records Updated Successfully!");
      } else {
        await studentAddMutation.mutateAsync({
          data: payload
        });
        Alert.alert("Success", "Student Admission Registered Successfully!");
      }
      setLoading(false);
      router.back();
    } catch (error: any) {
      setLoading(false);
      Alert.alert("Error", error.message || `Failed to ${isEditing ? "update" : "register"} student`);
    }
  };

  if (loadingStudent) {
    return (
      <PremiumScreenLayout title="Loading..." subtitle="Fetching student details">
        <ActivityIndicator size="large" color={Colors.primary} className="mt-20" />
      </PremiumScreenLayout>
    );
  }

  const renderDropdown = (label: string, value: number | undefined, options: any[], onSelect: (id: number) => void, placeholder: string) => (
    <View className="flex-1 min-w-[200px]">
      <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">{label}</Text>
      <View className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-[48px]">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 10 }}>
          {options.map((opt) => {
            const id = opt.bloodGroupID || opt.religionID || opt.categoryID || opt.batchID || opt.classID;
            const name = opt.bloodGroupName || opt.religionName || opt.categoryName || opt.batchName || opt.className;
            return (
              <TouchableOpacity
                key={id}
                onPress={() => onSelect(id)}
                className={`px-3 py-1.5 rounded-lg mr-2 ${value === id ? "bg-[#1A3C6E]" : "bg-gray-200"}`}
              >
                <Text className={`text-[11px] font-bold ${value === id ? "text-white" : "text-gray-600"}`}>
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );

  const formContent = (
    <>
      {/* SECTION 1: Personal Details */}
      <Card className="bg-white border border-gray-150 p-6 mb-6">
        <View className="flex-row items-center gap-3 mb-5 border-b border-gray-100 pb-4">
          <View className="w-10 h-10 bg-blue-50 rounded-xl items-center justify-center border border-blue-100">
            <AppIcon name={gender.toLowerCase() === "female" ? "female" : "male"} size={22} color="#0369A1" active />
          </View>
          <Text className="text-[16px] font-black text-gray-900 uppercase tracking-wide">Personal Details</Text>
        </View>

        <View className={`flex-row flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}>
          <View className="flex-1 min-w-[150px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">First Name *</Text>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First Name"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
          <View className="flex-1 min-w-[150px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Middle Name</Text>
            <TextInput
              value={middleName}
              onChangeText={setMiddleName}
              placeholder="Middle Name"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
          <View className="flex-1 min-w-[150px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Last Name *</Text>
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              placeholder="Last Name"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
        </View>

        <View className={`flex-row flex-wrap gap-4 mt-4 ${isMobile ? "flex-col" : ""}`}>
          <View className="flex-1 min-w-[150px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Gender *</Text>
            <View className="flex-row bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-[48px] p-0.5">
              {["Male", "Female"].map((g) => (
                <TouchableOpacity
                  key={g}
                  onPress={() => setGender(g)}
                  className={`flex-1 items-center justify-center rounded-lg ${gender === g ? "bg-[#1A3C6E]" : ""}`}
                >
                  <Text className={`text-xs font-black uppercase ${gender === g ? "text-white" : "text-gray-500"}`}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View className="flex-1 min-w-[150px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Date of Birth *</Text>
            <TextInput
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
        </View>

        <View className={`flex-row flex-wrap gap-4 mt-4 ${isMobile ? "flex-col" : ""}`}>
          {renderDropdown("Blood Group", bloodGroupId, bloodGroups, setBloodGroupId, "Select Blood Group")}
          {renderDropdown("Religion", religionId, religions, setReligionId, "Select Religion")}
          {renderDropdown("Category", categoryId, categories, setCategoryId, "Select Category")}
        </View>
      </Card>

      {/* SECTION 2: Identification & Documents */}
      <Card className="bg-white border border-gray-150 p-6 mb-6">
        <View className="flex-row items-center gap-3 mb-5 border-b border-gray-100 pb-4">
          <View className="w-10 h-10 bg-purple-50 rounded-xl items-center justify-center border border-purple-100">
            <AppIcon name="profile" size={22} color="#7C3AED" active />
          </View>
          <Text className="text-[16px] font-black text-gray-900 uppercase tracking-wide">Identification Details</Text>
        </View>

        <View className={`flex-row flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Aadhaar Number</Text>
            <TextInput
              value={aadhaarNo}
              onChangeText={setAadhaarNo}
              placeholder="12 Digit Aadhaar"
              keyboardType="number-pad"
              maxLength={12}
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">PEN Number</Text>
            <TextInput
              value={penNo}
              onChangeText={setPenNo}
              placeholder="Enter PEN No"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">APAR ID</Text>
            <TextInput
              value={aparID}
              onChangeText={setAparID}
              placeholder="Enter APAR ID"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
        </View>
      </Card>

      {/* SECTION 3: Contact & Address */}
      <Card className="bg-white border border-gray-150 p-6 mb-6">
        <View className="flex-row items-center gap-3 mb-5 border-b border-gray-100 pb-4">
          <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100">
            <AppIcon name="notifications" size={22} color="#059669" active />
          </View>
          <Text className="text-[16px] font-black text-gray-900 uppercase tracking-wide">Contact & Address</Text>
        </View>

        <View className={`flex-row flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Mobile Number *</Text>
            <TextInput
              value={mobile}
              onChangeText={setMobile}
              placeholder="10 Digit Mobile"
              keyboardType="phone-pad"
              maxLength={10}
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
          <View className="flex-1 min-w-[250px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Email Address</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
        </View>

        <View className="mt-4">
          <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Current Address</Text>
          <TextInput
            value={currentAddress}
            onChangeText={setCurrentAddress}
            placeholder="Full Address"
            multiline
            className="min-h-[80px] bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-800"
          />
        </View>
        
        <View className="mt-4">
          <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Permanent Address</Text>
          <TextInput
            value={permanentAddress}
            onChangeText={setPermanentAddress}
            placeholder="Full Address"
            multiline
            className="min-h-[80px] bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-semibold text-gray-800"
          />
        </View>
      </Card>

      {/* SECTION 4: Guardian Details */}
      <Card className="bg-white border border-gray-150 p-6 mb-6">
        <View className="flex-row items-center gap-3 mb-5 border-b border-gray-100 pb-4">
          <View className="w-10 h-10 bg-amber-50 rounded-xl items-center justify-center border border-amber-100">
            <AppIcon name="parents" size={22} color="#B45309" active />
          </View>
          <Text className="text-[16px] font-black text-gray-900 uppercase tracking-wide">Guardian Details</Text>
        </View>

        {/* Father's Info */}
        <Text className="text-[14px] font-bold text-gray-700 mb-3">Father's Information</Text>
        <View className={`flex-row flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Father Name *</Text>
            <TextInput
              value={fatherName}
              onChangeText={setFatherName}
              placeholder="Father's Full Name"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Father Phone</Text>
            <TextInput
              value={fatherNumber}
              onChangeText={setFatherNumber}
              placeholder="Father's Mobile"
              keyboardType="phone-pad"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
        </View>
        <View className={`flex-row flex-wrap gap-4 mt-4 ${isMobile ? "flex-col" : ""}`}>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Father Occupation</Text>
            <TextInput
              value={fatherOccupation}
              onChangeText={setFatherOccupation}
              placeholder="Occupation"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Father Education</Text>
            <TextInput
              value={fatherEducation}
              onChangeText={setFatherEducation}
              placeholder="Education"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
        </View>

        {/* Mother's Info */}
        <Text className="text-[14px] font-bold text-gray-700 mt-6 mb-3">Mother's Information</Text>
        <View className={`flex-row flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Mother Name</Text>
            <TextInput
              value={motherName}
              onChangeText={setMotherName}
              placeholder="Mother's Full Name"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Mother Phone</Text>
            <TextInput
              value={motherNumber}
              onChangeText={setMotherNumber}
              placeholder="Mother's Mobile"
              keyboardType="phone-pad"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
        </View>
        <View className={`flex-row flex-wrap gap-4 mt-4 ${isMobile ? "flex-col" : ""}`}>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Mother Occupation</Text>
            <TextInput
              value={motherOccupation}
              onChangeText={setMotherOccupation}
              placeholder="Occupation"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Mother Education</Text>
            <TextInput
              value={motherEducation}
              onChangeText={setMotherEducation}
              placeholder="Education"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
        </View>
      </Card>

      {/* SECTION 5: Academic History & Reference */}
      <Card className="bg-white border border-gray-150 p-6 mb-6">
        <View className="flex-row items-center gap-3 mb-5 border-b border-gray-100 pb-4">
          <View className="w-10 h-10 bg-pink-50 rounded-xl items-center justify-center border border-pink-100">
            <AppIcon name="reports" size={22} color="#DB2777" active />
          </View>
          <Text className="text-[16px] font-black text-gray-900 uppercase tracking-wide">Academic History</Text>
        </View>

        <View className={`flex-row flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}>
          <View className="flex-1 min-w-[250px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Previous School Name</Text>
            <TextInput
              value={previousSchool}
              onChangeText={setPreviousSchool}
              placeholder="Last School Attended"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
          <View className="flex-1 min-w-[150px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Last Year %</Text>
            <TextInput
              value={lastPercentage}
              onChangeText={setLastPercentage}
              placeholder="e.g. 85.5"
              keyboardType="decimal-pad"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
        </View>

        <View className={`flex-row flex-wrap gap-4 mt-4 ${isMobile ? "flex-col" : ""}`}>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Reference / Source</Text>
            <TextInput
              value={reference}
              onChangeText={setReference}
              placeholder="How did you hear about us?"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
          <View className="flex-1 min-w-[200px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Admission Status</Text>
            <View className="flex-row bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-[48px] p-0.5">
              {["Active", "In-Active"].map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStatus(s)}
                  className={`flex-1 items-center justify-center rounded-lg ${status === s ? "bg-[#1A3C6E]" : ""}`}
                >
                  <Text className={`text-xs font-black uppercase ${status === s ? "text-white" : "text-gray-500"}`}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View className="mt-4">
          <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Remarks</Text>
          <TextInput
            value={remarks}
            onChangeText={setRemarks}
            placeholder="Any additional notes"
            className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
          />
        </View>
      </Card>

      {/* SECTION 6: Academic Registration */}
      <Card className="bg-white border border-gray-150 p-6 mb-10">
        <View className="flex-row items-center gap-3 mb-5 border-b border-gray-100 pb-4">
          <View className="w-10 h-10 bg-emerald-50 rounded-xl items-center justify-center border border-emerald-100">
            <AppIcon name="subjects" size={22} color="#15803D" active />
          </View>
          <Text className="text-[16px] font-black text-gray-900 uppercase tracking-wide">School Registration</Text>
        </View>

        <View className={`flex-row flex-wrap gap-4 ${isMobile ? "flex-col" : ""}`}>
          <View className="flex-1 min-w-[150px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Form / GR No.</Text>
            <TextInput
              value={formNo}
              onChangeText={setFormNo}
              placeholder="LAES-2026-XXX"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-bold text-gray-800"
              editable={!isEditing}
            />
          </View>
          <View className="flex-1 min-w-[150px]">
            <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">Admission Date</Text>
            <TextInput
              value={admissionDate}
              onChangeText={setAdmissionDate}
              placeholder="YYYY-MM-DD"
              className="h-[48px] bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800"
            />
          </View>
        </View>

        <View className={`flex-row flex-wrap gap-4 mt-4 ${isMobile ? "flex-col" : ""}`}>
          {renderDropdown("Assign Class", classId, classes, setClassId, "Select Class")}
          {renderDropdown("Assign Batch", batchId, batches, setBatchId, "Select Batch")}
        </View>
      </Card>
    </>
  );

  return (
    <PremiumScreenLayout
      title={isEditing ? "Edit Admission" : "Admission Form"}
      subtitle={isEditing ? "Modify existing student records" : "Register a new student into the school ledger"}
      onBack={() => router.back()}
      keyboard
      rightAction={
        !isMobile ? (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl flex-row gap-2"
            style={{ backgroundColor: Colors.accent }}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-black text-xs uppercase tracking-widest">
                {isEditing ? "Update" : "Register"}
              </Text>
            )}
          </TouchableOpacity>
        ) : undefined
      }
    >
      {formContent}
      {isMobile && (
        <View className="mb-10">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className="h-[52px] rounded-xl items-center justify-center shadow-lg flex-row gap-2"
            style={{ backgroundColor: Colors.accent }}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-black text-xs uppercase tracking-widest">
                {isEditing ? "Update Record" : "Register Student"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </PremiumScreenLayout>
  );
}
