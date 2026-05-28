import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, Image } from "react-native";
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
import { useGetApiAcademicYearGet } from "@/api/generated/2-master-academicyear/2-master-academicyear";
import { useGetApiSectionGet } from "@/api/generated/master-section/master-section";
import { useGetApiMediumGet } from "@/api/generated/master-medium/master-medium";
import { usePermissions } from "@/hooks/usePermissions";
import { AccessDenied } from "@/components/auth/AccessDenied";
import { useResponsive } from "@/hooks/useResponsive";
import { parseApiData, parseApiList } from "@/utils/apiResponse";
import { PremiumDatePicker } from "@/components/ui/PremiumDatePicker";
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from "@/store/authStore";
import { uploadProfileImage } from "@/services/upload/uploadService";

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
  const { userData } = useAuthStore();

  // --- Form State ---
  
  // 1. Academic Details
  const [academicYearId, setAcademicYearId] = useState<number | undefined>();
  const [classId, setClassId] = useState<number | undefined>();
  const [batchId, setBatchId] = useState<number | undefined>();
  const [sectionId, setSectionId] = useState<number | undefined>();
  const [studentGRNo, setStudentGRNo] = useState("");
  const [uidNo, setUidNo] = useState("");
  const [rollNo, setRollNo] = useState("");

  // 2. Personal Details
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstNameSecondary, setFirstNameSecondary] = useState("");
  const [middleNameSecondary, setMiddleNameSecondary] = useState("");
  const [lastNameSecondary, setLastNameSecondary] = useState("");
  const [studentDisplayName, setStudentDisplayName] = useState("");
  const [gender, setGender] = useState("Male");
  const [studentNumber, setStudentNumber] = useState("");
  const [studentWhatsappNo, setStudentWhatsappNo] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [dob, setDob] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroupId, setBloodGroupId] = useState<number | undefined>();
  const [birthPlace, setBirthPlace] = useState("");
  const [birthPlaceTaluka, setBirthPlaceTaluka] = useState("");
  const [birthPlaceDistrict, setBirthPlaceDistrict] = useState("");
  const [religionId, setReligionId] = useState<number | undefined>();
  const [nationality, setNationality] = useState("Indian");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [caste, setCaste] = useState("");
  const [subCaste, setSubCaste] = useState("");
  const [aadhaarNo, setAadhaarNo] = useState("");
  const [aparID, setAparID] = useState("");
  const [penNo, setPenNo] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [studentPhoto, setStudentPhoto] = useState<string | null>(null);
  const [ews, setEws] = useState(false);

  // 3. Guardian Details
  const [fatherName, setFatherName] = useState("");
  const [fatherNumber, setFatherNumber] = useState("");
  const [fatherOccupation, setFatherOccupation] = useState("");
  const [fatherEducation, setFatherEducation] = useState("");
  const [fatherEmail, setFatherEmail] = useState("");
  const [motherName, setMotherName] = useState("");
  const [motherNumber, setMotherNumber] = useState("");
  const [motherOccupation, setMotherOccupation] = useState("");
  const [motherEducation, setMotherEducation] = useState("");
  const [motherEmail, setMotherEmail] = useState("");
  const [fatherPhoto, setFatherPhoto] = useState<string | null>(null);
  const [motherPhoto, setMotherPhoto] = useState<string | null>(null);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [sendSMSNotification, setSendSMSNotification] = useState(false);

  // 4. Address Details
  const [currentAddress, setCurrentAddress] = useState("");
  const [currentCity, setCurrentCity] = useState("");
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false);
  const [permanentAddress, setPermanentAddress] = useState("");
  const [permanentCity, setPermanentCity] = useState("");
  const [transportFacility, setTransportFacility] = useState(false);

  // 5. Admission Details
  const [rte, setRte] = useState(false);
  const [studentType, setStudentType] = useState("New");
  const [studentFeesDate, setStudentFeesDate] = useState("");
  const [createdDate, setCreatedDate] = useState(new Date().toISOString().split("T")[0]);
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().split("T")[0]);
  const [admissionStandard, setAdmissionStandard] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");
  const [previousSchoolName, setPreviousSchoolName] = useState("");
  const [previousSchoolCategory, setPreviousSchoolCategory] = useState("");
  const [previousSchoolCityVillage, setPreviousSchoolCityVillage] = useState("");
  const [previousSchoolType, setPreviousSchoolType] = useState("");
  const [lastPercentage, setLastPercentage] = useState("");
  const [status, setStatus] = useState("Active");
  const [reference, setReference] = useState("");
  const [siblingInfo, setSiblingInfo] = useState("");
  const [remarks, setRemarks] = useState("");
  const [studentShift, setStudentShift] = useState("Morning");
  const [hallTicketNo, setHallTicketNo] = useState("");
  const [admissionFormNo, setAdmissionFormNo] = useState("");
  const [mediumId, setMediumId] = useState<number | undefined>(undefined);

  // --- Accordion State ---
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    academic: true,
    personal: false,
    guardian: false,
    address: false,
    admission: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
  const { data: academicYearsData } = useGetApiAcademicYearGet();
  const { data: sectionsData } = useGetApiSectionGet();
  const { data: mediumsData } = useGetApiMediumGet();

  const bloodGroups = parseApiList(bloodGroupsData?.data);
  const religions = parseApiList(religionsData?.data);
  const categories = parseApiList(categoriesData?.data);
  const batches = parseApiList(batchesData?.data);
  const classes = parseApiList(classesData?.data);
  const academicYears = parseApiList(academicYearsData?.data);
  const sections = parseApiList(sectionsData?.data);
  const mediums = parseApiList(mediumsData?.data);

  useEffect(() => {
    if (studentResponse?.data) {
      const s = parseApiData(studentResponse.data) as any;
      setAcademicYearId(s.academicYearID);
      setClassId(s.classID);
      setBatchId(s.batchID);
      setSectionId(s.sectionID);
      setMediumId(s.mediumID || undefined);
      setStudentGRNo(s.studentGRNo || "");
      setUidNo(s.uidNo || "");
      setRollNo(s.rollNo || "");

      setFirstName(s.firstName || "");
      setMiddleName(s.middleName || "");
      setLastName(s.lastName || "");
      setFirstNameSecondary(s.firstNameSecondary || "");
      setMiddleNameSecondary(s.middleNameSecondary || "");
      setLastNameSecondary(s.lastNameSecondary || "");
      setStudentDisplayName(s.studentDisplayName || "");
      setGender(s.gender || "Male");
      setStudentNumber(s.studentNumber || "");
      setStudentWhatsappNo(s.studentWhatsappNo || "");
      setStudentEmail(s.studentEmail || "");
      setDob(s.dob ? String(s.dob).slice(0, 10) : "");
      setAge(String(s.age || ""));
      setBloodGroupId(s.bloodGroupID);
      setBirthPlace(s.birthPlace || "");
      setBirthPlaceTaluka(s.birthPlaceTaluka || "");
      setBirthPlaceDistrict(s.birthPlaceDistrict || "");
      setReligionId(s.religionID);
      setNationality(s.nationality || "Indian");
      setCategoryId(s.categoryID);
      setCaste(s.caste || "");
      setSubCaste(s.subCaste || "");
      setAadhaarNo(s.aadhaarNo || "");
      setAparID(s.aparID || "");
      setPenNo(s.penNo || "");
      setWeight(String(s.weight || ""));
      setHeight(String(s.height || ""));
      setStudentPhoto(s.studentPhoto || null);
      setEws(!!s.ews);

      setFatherName(s.fatherName || "");
      setFatherNumber(s.fatherNumber || "");
      setFatherOccupation(s.fatherOccupation || "");
      setFatherEducation(s.fatherEducation || "");
      setFatherEmail(s.fatherEmail || "");
      setMotherName(s.motherName || "");
      setMotherNumber(s.motherNumber || "");
      setMotherOccupation(s.motherOccupation || "");
      setMotherEducation(s.motherEducation || "");
      setMotherEmail(s.motherEmail || "");
      setFatherPhoto(s.fatherPhoto || null);
      setMotherPhoto(s.motherPhoto || null);
      setWhatsappNumber(s.whatsappNumber || "");
      setSendSMSNotification(!!s.sendSMSNotification);

      setCurrentAddress(s.currentAddress || "");
      setCurrentCity(s.currentCity || "");
      setSameAsCurrentAddress(!!s.sameAsCurrentAddress);
      setPermanentAddress(s.permanentAddress || "");
      setPermanentCity(s.permanentCity || "");
      setTransportFacility(!!s.transportFacility);

      setRte(!!s.rte);
      setStudentType(s.studentType || "New");
      setStudentFeesDate(s.studentFeesDate ? String(s.studentFeesDate).slice(0, 10) : "");
      setCreatedDate(s.createdDate ? String(s.createdDate).slice(0, 10) : "");
      setAdmissionDate(s.admissionDate ? String(s.admissionDate).slice(0, 10) : "");
      setAdmissionStandard(s.admissionStandard || "");
      setAdmissionYear(s.admissionYear || "");
      setPreviousSchoolName(s.previousSchoolName || "");
      setPreviousSchoolCategory(s.previousSchoolCategory || "");
      setPreviousSchoolCityVillage(s.previousSchoolCityVillage || "");
      setPreviousSchoolType(s.previousSchoolType || "");
      setLastPercentage(String(s.lastSemesterYearPercentage || ""));
      setStatus(s.status || "Active");
      setReference(s.referenceSource || "");
      setSiblingInfo(s.siblingInfo || "");
      setRemarks(s.remarks || "");
      setStudentShift(s.studentShift || "Morning");
      setHallTicketNo(s.hallTicketNo || "");
      setAdmissionFormNo(s.admissionFormNo || "");
    }
  }, [studentResponse]);

  const handleSubmit = async () => {
    if (!firstName || !lastName || !dob || !fatherName || !fatherNumber || !studentNumber) {
      Alert.alert("Missing Fields", "Please complete all required fields (*).");
      return;
    }

    const payload = {
      schoolID: userData?.schoolID,
      academicYearID: academicYearId,
      classID: classId,
      batchID: batchId,
      sectionID: sectionId,
      mediumID: mediumId,
      studentGRNo,
      uidNo,
      rollNo,
      firstName,
      middleName,
      lastName,
      firstNameSecondary,
      middleNameSecondary,
      lastNameSecondary,
      studentDisplayName,
      gender,
      studentNumber,
      studentWhatsappNo,
      studentEmail: studentEmail || `${firstName.toLowerCase()}${lastName.toLowerCase()}@school.com`,
      dob: dob || null,
      age: parseInt(age) || 0,
      bloodGroupID: bloodGroupId,
      birthPlace,
      birthPlaceTaluka,
      birthPlaceDistrict,
      religionID: religionId,
      nationality,
      categoryID: categoryId,
      caste,
      subCaste,
      aadhaarNo,
      aparID,
      penNo,
      weight: parseFloat(weight) || 0,
      height: parseFloat(height) || 0,
      studentPhoto,
      ews,
      fatherName,
      fatherNumber,
      fatherOccupation,
      fatherEducation,
      fatherEmail,
      motherName,
      motherNumber,
      motherOccupation,
      motherEducation,
      motherEmail,
      fatherPhoto,
      motherPhoto,
      whatsappNumber,
      sendSMSNotification,
      currentAddress,
      currentCity,
      sameAsCurrentAddress,
      permanentAddress,
      permanentCity,
      transportFacility,
      rte,
      studentType,
      studentFeesDate: studentFeesDate || null,
      createdDate: createdDate || null,
      admissionDate: admissionDate || null,
      admissionStandard,
      admissionYear,
      previousSchoolName,
      previousSchoolCategory,
      previousSchoolCityVillage,
      previousSchoolType,
      lastSemesterYearPercentage: parseFloat(lastPercentage) || 0,
      studentShift: studentShift,
      hallTicketNo: hallTicketNo,
      admissionFormNo: admissionFormNo,
      status: status,
      referenceSource: reference,
      siblingInfo,
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
    <View className="flex-1 min-w-[280px]">
      <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">{label}</Text>
      <View className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-[48px]">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', paddingHorizontal: 10 }}>
          {options.map((opt) => {
            const id =
              opt.mediumID ??
              opt.bloodGroupID ??
              opt.religionID ??
              opt.categoryID ??
              opt.batchID ??
              opt.classID ??
              opt.academicYearID ??
              opt.sectionID ??
              opt.id;
            const name =
              opt.mediumName ??
              opt.bloodGroupName ??
              opt.religionName ??
              opt.categoryName ??
              opt.batchName ??
              opt.className ??
              opt.academicYearName ??
              opt.sectionName ??
              opt.name;
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

  const renderTextInput = (label: string, value: string, onChange: (t: string) => void, placeholder: string, options?: { multiline?: boolean, keyboard?: any, maxLength?: number, editable?: boolean }) => (
    <View className="flex-1 min-w-[280px]">
      <Text className="text-[12px] font-black text-gray-455 mb-1.5 uppercase">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        multiline={options?.multiline}
        keyboardType={options?.keyboard || "default"}
        maxLength={options?.maxLength}
        editable={options?.editable}
        className={`${options?.multiline ? "min-h-[80px] py-2" : "h-[48px]"} bg-gray-50 border border-gray-200 rounded-xl px-4 text-sm font-semibold text-gray-800`}
      />
    </View>
  );

  const renderDatePicker = (label: string, value: string, onChange: (t: string) => void) => (
    <View className="flex-1 min-w-[280px]">
      <PremiumDatePicker
        label={label}
        value={value}
        onChange={onChange}
      />
    </View>
  );

  const renderToggle = (label: string, value: string | boolean, options: string[], onSelect: (v: any) => void) => (
    <View className="flex-1 min-w-[280px]">
      <Text className="text-[12px] font-black text-gray-450 mb-1.5 uppercase">{label}</Text>
      <View className="flex-row bg-gray-50 border border-gray-200 rounded-xl overflow-hidden h-[48px] p-0.5">
        {options.map((opt) => {
          const isActive = typeof value === 'boolean' ? (opt === 'Yes' ? value === true : value === false) : value === opt;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => onSelect(opt === 'Yes' ? true : opt === 'No' ? false : opt)}
              className={`flex-1 items-center justify-center rounded-lg ${isActive ? "bg-[#1A3C6E]" : ""}`}
            >
              <Text className={`text-xs font-black uppercase ${isActive ? "text-white" : "text-gray-500"}`}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderSectionHeader = (title: string, icon: any, color: string, bgColor: string, borderColor: string, sectionKey: string) => (
    <TouchableOpacity 
      onPress={() => toggleSection(sectionKey)}
      activeOpacity={0.7}
      className="flex-row items-center justify-between py-2"
    >
      <View className="flex-row items-center gap-3">
        <View className={`w-10 h-10 ${bgColor} rounded-xl items-center justify-center border ${borderColor}`}>
          <AppIcon name={icon} size={22} color={color} active />
        </View>
        <Text className="text-[16px] font-black text-gray-900 uppercase tracking-wide">{title}</Text>
      </View>
      <View className={`transform ${expandedSections[sectionKey] ? "rotate-180" : "rotate-0"}`}>
        <AppIcon name="chevronDown" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const pickImage = async (setter: (uri: string) => void) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled && result.assets && result.assets[0].uri) {
      const asset = result.assets[0];
      let name = asset.uri.split("/").pop() || `photo-${Date.now()}.jpg`;
      if (!name.match(/\.(jpg|jpeg|png|gif)$/i)) {
        name = `${name}.jpg`;
      }
      const type = asset.mimeType || "image/jpeg";
      
      try {
        setLoading(true);
        const photoUrl = await uploadProfileImage({ uri: asset.uri, name, type });
        setter(photoUrl);
      } catch (error: any) {
        Alert.alert("Upload Failed", error.message || "Could not upload image");
      } finally {
        setLoading(false);
      }
    }
  };

  const renderImagePicker = (label: string, photoUri: string | null, setter: (uri: string) => void) => (
    <View className="flex-1 min-w-[280px] items-center">
      <Text className="text-[12px] font-black text-gray-450 mb-2 uppercase">{label}</Text>
      <TouchableOpacity 
        onPress={() => pickImage(setter)}
        className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 items-center justify-center bg-gray-50 overflow-hidden"
      >
        {photoUri ? (
          <Image source={{ uri: photoUri }} className="w-full h-full" />
        ) : (
          <AppIcon name="camera" size={24} color="#9CA3AF" />
        )}
      </TouchableOpacity>
      {photoUri && (
        <TouchableOpacity onPress={() => setter('')} className="mt-2">
          <Text className="text-red-500 text-xs font-bold">Remove</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const formContent = (
    <View className="flex-1 w-full max-w-full">
      {/* SECTION 1: Academic Details */}
      <Card className="bg-white border border-gray-150 p-6 mb-4 overflow-hidden">
        {renderSectionHeader("Academic Details", "subjects", "#15803D", "bg-emerald-50", "border-emerald-100", "academic")}
        {expandedSections.academic && (
          <View className="mt-6 pt-6 border-t border-gray-100">
            <View className={`flex-row flex-wrap gap-5 ${isMobile ? "flex-col" : ""}`}>
              {renderDropdown("Academic Year", academicYearId, academicYears, setAcademicYearId, "Select Year")}
              {renderDropdown("Class", classId, classes, setClassId, "Select Class")}
              {renderDropdown("Batch", batchId, batches, setBatchId, "Select Batch")}
              {renderDropdown("Section", sectionId, sections, setSectionId, "Select Section")}
              {renderDropdown("Medium", mediumId, mediums, setMediumId, "Select Medium")}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("Student Id / GR No.", studentGRNo, setStudentGRNo, "GR Number", { editable: !isEditing })}
              {renderTextInput("UID No", uidNo, setUidNo, "UID Number")}
              {renderTextInput("Roll No", rollNo, setRollNo, "Roll Number")}
            </View>
          </View>
        )}
      </Card>

      {/* SECTION 2: Personal Details */}
      <Card className="bg-white border border-gray-150 p-6 mb-4 overflow-hidden">
        {renderSectionHeader("Personal Details", gender.toLowerCase() === "female" ? "female" : "male", "#0369A1", "bg-blue-50", "border-blue-100", "personal")}
        {expandedSections.personal && (
          <View className="mt-6 pt-6 border-t border-gray-100">
            <View className={`flex-row flex-wrap gap-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("First Name *", firstName, setFirstName, "Student Name")}
              {renderTextInput("Middle Name", middleName, setMiddleName, "Father's Name")}
              {renderTextInput("Last Name *", lastName, setLastName, "Surname")}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("First Name (Secondary)", firstNameSecondary, setFirstNameSecondary, "Secondary Language")}
              {renderTextInput("Middle Name (Secondary)", middleNameSecondary, setMiddleNameSecondary, "Secondary Language")}
              {renderTextInput("Last Name (Secondary)", lastNameSecondary, setLastNameSecondary, "Secondary Language")}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("Student Display Name", studentDisplayName, setStudentDisplayName, "Full Name for Records")}
              {renderToggle("Gender *", gender, ["Male", "Female", "Other"], setGender)}
              {renderDatePicker("Date of Birth *", dob, setDob)}
              {renderTextInput("Age", age, setAge, "Calculated Age", { keyboard: "number-pad" })}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("Phone Number *", studentNumber, setStudentNumber, "10 Digit Mobile", { keyboard: "phone-pad", maxLength: 10 })}
              {renderTextInput("Whatsapp No", studentWhatsappNo, setStudentWhatsappNo, "Whatsapp Number", { keyboard: "phone-pad", maxLength: 10 })}
              {renderTextInput("Student Email", studentEmail, setStudentEmail, "email@example.com", { keyboard: "email-address" })}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderDropdown("Blood Group", bloodGroupId, bloodGroups, setBloodGroupId, "Select")}
              {renderTextInput("Birth Place", birthPlace, setBirthPlace, "City/Village")}
              {renderTextInput("Birth Place Taluka", birthPlaceTaluka, setBirthPlaceTaluka, "Taluka")}
              {renderTextInput("Birth Place District", birthPlaceDistrict, setBirthPlaceDistrict, "District")}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderDropdown("Religion", religionId, religions, setReligionId, "Select")}
              {renderTextInput("Nationality", nationality, setNationality, "e.g. Indian")}
              {renderDropdown("Category", categoryId, categories, setCategoryId, "Select")}
              {renderTextInput("Caste", caste, setCaste, "Caste Name")}
              {renderTextInput("Sub Caste", subCaste, setSubCaste, "Sub Caste Name")}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("Aadhaar Number", aadhaarNo, setAadhaarNo, "12 Digit Aadhaar", { keyboard: "number-pad", maxLength: 12 })}
              {renderTextInput("Apaar ID", aparID, setAparID, "APAAR ID")}
              {renderTextInput("PEN Number", penNo, setPenNo, "PEN ID")}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("Weight (KG)", weight, setWeight, "0.00", { keyboard: "decimal-pad" })}
              {renderTextInput("Height (CM)", height, setHeight, "0.00", { keyboard: "decimal-pad" })}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderToggle("EWS", ews, ["Yes", "No"], setEws)}
              {renderImagePicker("Student Photo", studentPhoto, setStudentPhoto)}
            </View>
          </View>
        )}
      </Card>

      {/* SECTION 3: Guardian Details */}
      <Card className="bg-white border border-gray-150 p-6 mb-4 overflow-hidden">
        {renderSectionHeader("Guardian Details", "parents", "#B45309", "bg-amber-50", "border-amber-100", "guardian")}
        {expandedSections.guardian && (
          <View className="mt-6 pt-6 border-t border-gray-100">
            <Text className="text-[14px] font-bold text-gray-700 mb-3">Father's Information</Text>
            <View className={`flex-row flex-wrap gap-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("Father Name *", fatherName, setFatherName, "Full Name")}
              {renderTextInput("Father Phone", fatherNumber, setFatherNumber, "Mobile No", { keyboard: "phone-pad" })}
              {renderTextInput("Father Occupation", fatherOccupation, setFatherOccupation, "Occupation")}
              {renderTextInput("Father Education", fatherEducation, setFatherEducation, "Education")}
              {renderTextInput("Father Email", fatherEmail, setFatherEmail, "email@example.com", { keyboard: "email-address" })}
            </View>
            <Text className="text-[14px] font-bold text-gray-700 mt-8 mb-3">Mother's Information</Text>
            <View className={`flex-row flex-wrap gap-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("Mother Name", motherName, setMotherName, "Full Name")}
              {renderTextInput("Mother Phone", motherNumber, setMotherNumber, "Mobile No", { keyboard: "phone-pad" })}
              {renderTextInput("Mother Occupation", motherOccupation, setMotherOccupation, "Occupation")}
              {renderTextInput("Mother Education", motherEducation, setMotherEducation, "Education")}
              {renderTextInput("Mother Email", motherEmail, setMotherEmail, "email@example.com", { keyboard: "email-address" })}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-8 ${isMobile ? "flex-col" : ""}`}>
              {renderToggle("Send SMS Notification", sendSMSNotification, ["Yes", "No"], setSendSMSNotification)}
              {renderTextInput("Whatsapp Number", whatsappNumber, setWhatsappNumber, "Default for Whatsapp", { keyboard: "phone-pad" })}
            </View>
            <View className={`flex-row flex-wrap justify-around gap-5 mt-8 ${isMobile ? "flex-col" : ""}`}>
              {renderImagePicker("Father Photo", fatherPhoto, setFatherPhoto)}
              {renderImagePicker("Mother Photo", motherPhoto, setMotherPhoto)}
            </View>
          </View>
        )}
      </Card>

      {/* SECTION 4: Address Details */}
      <Card className="bg-white border border-gray-150 p-6 mb-4 overflow-hidden">
        {renderSectionHeader("Address Details", "notifications", "#059669", "bg-emerald-50", "border-emerald-100", "address")}
        {expandedSections.address && (
          <View className="mt-6 pt-6 border-t border-gray-100">
            <View className={`flex-row flex-wrap gap-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("Current Address", currentAddress, setCurrentAddress, "Full Address", { multiline: true })}
              {renderTextInput("Current City", currentCity, setCurrentCity, "City/Village")}
            </View>
            <View className="mt-5 mb-5">
              {renderToggle("Permanent Address Same As Current?", sameAsCurrentAddress, ["Yes", "No"], (v) => {
                setSameAsCurrentAddress(v);
                if (v) {
                  setPermanentAddress(currentAddress);
                  setPermanentCity(currentCity);
                }
              })}
            </View>
            <View className={`flex-row flex-wrap gap-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("Permanent Address", permanentAddress, setPermanentAddress, "Full Address", { multiline: true, editable: !sameAsCurrentAddress })}
              {renderTextInput("Permanent City", permanentCity, setPermanentCity, "City/Village", { editable: !sameAsCurrentAddress })}
            </View>
            <View className="mt-5">
              {renderToggle("Transport Facility", transportFacility, ["Yes", "No"], setTransportFacility)}
            </View>
          </View>
        )}
      </Card>

      {/* SECTION 5: Admission Details */}
      <Card className="bg-white border border-gray-150 p-6 mb-10 overflow-hidden">
        {renderSectionHeader("Admission Details", "reports", "#DB2777", "bg-pink-50", "border-pink-100", "admission")}
        {expandedSections.admission && (
          <View className="mt-6 pt-6 border-t border-gray-100">
            <View className={`flex-row flex-wrap gap-5 ${isMobile ? "flex-col" : ""}`}>
              {renderToggle("Right to Education (RTE)", rte, ["Yes", "No"], (v) => setRte(v === "Yes"))}
              {renderToggle("Student Type", studentType, ["New", "Regular"], setStudentType)}
              {renderDropdown("Student Shift", ["Morning", "Afternoon"].indexOf(studentShift), [{ id: 0, name: "Morning" }, { id: 1, name: "Afternoon" }], (id) => setStudentShift(id === 0 ? "Morning" : "Afternoon"), "Select Shift")}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("Hall Ticket No", hallTicketNo, setHallTicketNo, "Hall Ticket Number")}
              {renderTextInput("Admission Form No", admissionFormNo, setAdmissionFormNo, "Form Number")}
              {renderDatePicker("Student Fees Date", studentFeesDate, setStudentFeesDate)}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderDatePicker("Created Date", createdDate, setCreatedDate)}
              {renderDatePicker("Admission Date", admissionDate, setAdmissionDate)}
              {renderDropdown("Admission Standard", (classes.find(c => (c as any).className === admissionStandard) as any)?.classID, classes, (id) => {
                const cls = classes.find(c => (c as any).classID === id) as any;
                if (cls) setAdmissionStandard(cls.className);
              }, "Select Standard")}
              {renderDropdown("Admission Year", (academicYears.find(y => (y as any).academicYearName === admissionYear) as any)?.academicYearID, academicYears, (id) => {
                const yr = academicYears.find(y => (y as any).academicYearID === id) as any;
                if (yr) setAdmissionYear(yr.academicYearName);
              }, "Select Year")}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("Previous School Name", previousSchoolName, setPreviousSchoolName, "School Name")}
              {renderTextInput("Previous School Category", previousSchoolCategory, setPreviousSchoolCategory, "Category")}
              {renderTextInput("Previous School City/Village", previousSchoolCityVillage, setPreviousSchoolCityVillage, "City/Village")}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("Previous School Type", previousSchoolType, setPreviousSchoolType, "e.g. Co-Ed")}
              {renderTextInput("Last Semester/Year %", lastPercentage, setLastPercentage, "0.00", { keyboard: "decimal-pad" })}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderToggle("Status", status, ["Active", "In-Active"], setStatus)}
              {renderTextInput("Reference / Source", reference, setReference, "How did you hear about us?")}
              {renderTextInput("Sibling Info", siblingInfo, setSiblingInfo, "Sibling Details")}
            </View>
            <View className="mt-5">
              {renderTextInput("Remarks", remarks, setRemarks, "Additional Notes", { multiline: true })}
            </View>
          </View>
        )}
      </Card>
    </View>
  );

  return (
    <PremiumScreenLayout
      title={isEditing ? "Edit Admission" : "Admission Form"}
      subtitle={isEditing ? "Modify existing student records" : "Register a new student into the school ledger"}
      onBack={() => router.back()}
      keyboard
      fullWidth
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
