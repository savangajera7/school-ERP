import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Image } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/colors";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { AppIcon } from "@/components/icons/AppIcon";
import { useDialog } from "@/components/ui/AppDialog";
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
import { parseApiData, parseApiList, toCamelCaseRow } from "@/utils/apiResponse";
import { PremiumDatePicker } from "@/components/ui/PremiumDatePicker";
import * as ImagePicker from 'expo-image-picker';
import { useAuthStore } from "@/store/authStore";
import { useAdmissionStore } from "@/store/admissionStore";
import { FormLayout } from "@/components/layout/FormLayout";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { uploadProfileImage } from "@/services/upload/uploadService";

export default function AdmissionFormScreen() {
  const dialog = useDialog();
  const { id } = useLocalSearchParams();
  const studentID = id ? parseInt(typeof id === "string" ? id : id[0]) : null;
  const isEditing = !!studentID;

  const { canManageStudents } = usePermissions();
  if (!canManageStudents) {
    return <AccessDenied message="New admissions are handled by school administrators." />;
  }

  const { isMobile } = useResponsive();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const [loading, setLoading] = useState(false);
  const { userData } = useAuthStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Form State ---
  
  
  const { formData, updateFormData, currentStep, setCurrentStep, resetForm } = useAdmissionStore();
  
  // Extract all fields from formData with fallbacks
  const academicYearId = formData.academicYearId ?? undefined;
  const classId = formData.classId ?? undefined;
  const batchId = formData.batchId ?? undefined;
  const sectionId = formData.sectionId ?? undefined;
  const studentGRNo = formData.studentGRNo ?? "";
  const uidNo = formData.uidNo ?? "";
  const rollNo = formData.rollNo ?? "";
  const firstName = formData.firstName ?? "";
  const middleName = formData.middleName ?? "";
  const lastName = formData.lastName ?? "";
  const firstNameSecondary = formData.firstNameSecondary ?? "";
  const middleNameSecondary = formData.middleNameSecondary ?? "";
  const lastNameSecondary = formData.lastNameSecondary ?? "";
  const studentDisplayName = formData.studentDisplayName ?? "";
  const gender = formData.gender ?? "Male";
  const studentNumber = formData.studentNumber ?? "";
  const studentWhatsappNo = formData.studentWhatsappNo ?? "";
  const studentEmail = formData.studentEmail ?? "";
  const dob = formData.dob ?? "";
  const age = formData.age ?? "";
  const bloodGroupId = formData.bloodGroupId ?? undefined;
  const birthPlace = formData.birthPlace ?? "";
  const birthPlaceTaluka = formData.birthPlaceTaluka ?? "";
  const birthPlaceDistrict = formData.birthPlaceDistrict ?? "";
  const religionId = formData.religionId ?? undefined;
  const nationality = formData.nationality ?? "Indian";
  const categoryId = formData.categoryId ?? undefined;
  const caste = formData.caste ?? "";
  const subCaste = formData.subCaste ?? "";
  const aadhaarNo = formData.aadhaarNo ?? "";
  const aparID = formData.aparID ?? undefined;
  const penNo = formData.penNo ?? "";
  const weight = formData.weight ?? "";
  const height = formData.height ?? "";
  const studentPhoto = formData.studentPhoto ?? "";
  const ews = formData.ews ?? false;
  const fatherName = formData.fatherName ?? "";
  const fatherNumber = formData.fatherNumber ?? "";
  const fatherOccupation = formData.fatherOccupation ?? "";
  const fatherEducation = formData.fatherEducation ?? "";
  const fatherEmail = formData.fatherEmail ?? "";
  const motherName = formData.motherName ?? "";
  const motherNumber = formData.motherNumber ?? "";
  const motherOccupation = formData.motherOccupation ?? "";
  const motherEducation = formData.motherEducation ?? "";
  const motherEmail = formData.motherEmail ?? "";
  const fatherPhoto = formData.fatherPhoto ?? "";
  const motherPhoto = formData.motherPhoto ?? "";
  const whatsappNumber = formData.whatsappNumber ?? "";
  const sendSMSNotification = formData.sendSMSNotification ?? false;
  const currentAddress = formData.currentAddress ?? "";
  const currentCity = formData.currentCity ?? "";
  const sameAsCurrentAddress = formData.sameAsCurrentAddress ?? false;
  const permanentAddress = formData.permanentAddress ?? "";
  const permanentCity = formData.permanentCity ?? "";
  const transportFacility = formData.transportFacility ?? false;
  const rte = formData.rte ?? false;
  const studentType = formData.studentType ?? "New";
  const studentFeesDate = formData.studentFeesDate ?? "";
  const createdDate = formData.createdDate ?? new Date().toISOString().split("T")[0];
  const admissionDate = formData.admissionDate ?? new Date().toISOString().split("T")[0];
  const previousSchoolName = formData.previousSchoolName ?? "";
  const previousSchoolCategory = formData.previousSchoolCategory ?? "";
  const previousSchoolCityVillage = formData.previousSchoolCityVillage ?? "";
  const previousSchoolType = formData.previousSchoolType ?? "";
  const lastPercentage = formData.lastPercentage ?? "";
  const status = formData.status ?? "Active";
  const reference = formData.reference ?? "";
  const siblingInfo = formData.siblingInfo ?? "";
  const remarks = formData.remarks ?? "";
  const studentShift = formData.studentShift ?? "Morning";
  const hallTicketNo = formData.hallTicketNo ?? "";
  const admissionFormNo = formData.admissionFormNo ?? "";
  const mediumId = formData.mediumId ?? undefined;

  // Helper setters for the components
  const setAcademicYearId = (val: any) => updateFormData({ academicYearId: val });
  const setClassId = (val: any) => updateFormData({ classId: val });
  const setBatchId = (val: any) => updateFormData({ batchId: val });
  const setSectionId = (val: any) => updateFormData({ sectionId: val });
  const setStudentGRNo = (val: any) => updateFormData({ studentGRNo: val });
  const setUidNo = (val: any) => updateFormData({ uidNo: val });
  const setRollNo = (val: any) => updateFormData({ rollNo: val });
  const setFirstName = (val: any) => updateFormData({ firstName: val });
  const setMiddleName = (val: any) => updateFormData({ middleName: val });
  const setLastName = (val: any) => updateFormData({ lastName: val });
  const setFirstNameSecondary = (val: any) => updateFormData({ firstNameSecondary: val });
  const setMiddleNameSecondary = (val: any) => updateFormData({ middleNameSecondary: val });
  const setLastNameSecondary = (val: any) => updateFormData({ lastNameSecondary: val });
  const setStudentDisplayName = (val: any) => updateFormData({ studentDisplayName: val });
  const setGender = (val: any) => updateFormData({ gender: val });
  const setStudentNumber = (val: any) => updateFormData({ studentNumber: val });
  const setStudentWhatsappNo = (val: any) => updateFormData({ studentWhatsappNo: val });
  const setStudentEmail = (val: any) => updateFormData({ studentEmail: val });
  const setDob = (val: any) => updateFormData({ dob: val });
  const setAge = (val: any) => updateFormData({ age: val });
  const setBloodGroupId = (val: any) => updateFormData({ bloodGroupId: val });
  const setBirthPlace = (val: any) => updateFormData({ birthPlace: val });
  const setBirthPlaceTaluka = (val: any) => updateFormData({ birthPlaceTaluka: val });
  const setBirthPlaceDistrict = (val: any) => updateFormData({ birthPlaceDistrict: val });
  const setReligionId = (val: any) => updateFormData({ religionId: val });
  const setNationality = (val: any) => updateFormData({ nationality: val });
  const setCategoryId = (val: any) => updateFormData({ categoryId: val });
  const setCaste = (val: any) => updateFormData({ caste: val });
  const setSubCaste = (val: any) => updateFormData({ subCaste: val });
  const setAadhaarNo = (val: any) => updateFormData({ aadhaarNo: val });
  const setAparID = (val: any) => updateFormData({ aparID: val });
  const setPenNo = (val: any) => updateFormData({ penNo: val });
  const setWeight = (val: any) => updateFormData({ weight: val });
  const setHeight = (val: any) => updateFormData({ height: val });
  const setStudentPhoto = (val: any) => updateFormData({ studentPhoto: val });
  const setEws = (val: any) => updateFormData({ ews: val });
  const setFatherName = (val: any) => updateFormData({ fatherName: val });
  const setFatherNumber = (val: any) => updateFormData({ fatherNumber: val });
  const setFatherOccupation = (val: any) => updateFormData({ fatherOccupation: val });
  const setFatherEducation = (val: any) => updateFormData({ fatherEducation: val });
  const setFatherEmail = (val: any) => updateFormData({ fatherEmail: val });
  const setMotherName = (val: any) => updateFormData({ motherName: val });
  const setMotherNumber = (val: any) => updateFormData({ motherNumber: val });
  const setMotherOccupation = (val: any) => updateFormData({ motherOccupation: val });
  const setMotherEducation = (val: any) => updateFormData({ motherEducation: val });
  const setMotherEmail = (val: any) => updateFormData({ motherEmail: val });
  const setFatherPhoto = (val: any) => updateFormData({ fatherPhoto: val });
  const setMotherPhoto = (val: any) => updateFormData({ motherPhoto: val });
  const setWhatsappNumber = (val: any) => updateFormData({ whatsappNumber: val });
  const setSendSMSNotification = (val: any) => updateFormData({ sendSMSNotification: val });
  const setCurrentAddress = (val: any) => updateFormData({ currentAddress: val });
  const setCurrentCity = (val: any) => updateFormData({ currentCity: val });
  const setSameAsCurrentAddress = (val: any) => updateFormData({ sameAsCurrentAddress: val });
  const setPermanentAddress = (val: any) => updateFormData({ permanentAddress: val });
  const setPermanentCity = (val: any) => updateFormData({ permanentCity: val });
  const setTransportFacility = (val: any) => updateFormData({ transportFacility: val });
  const setRte = (val: any) => updateFormData({ rte: val });
  const setStudentType = (val: any) => updateFormData({ studentType: val });
  const setStudentFeesDate = (val: any) => updateFormData({ studentFeesDate: val });
  const setCreatedDate = (val: any) => updateFormData({ createdDate: val });
  const setAdmissionDate = (val: any) => updateFormData({ admissionDate: val });
  const setPreviousSchoolName = (val: any) => updateFormData({ previousSchoolName: val });
  const setPreviousSchoolCategory = (val: any) => updateFormData({ previousSchoolCategory: val });
  const setPreviousSchoolCityVillage = (val: any) => updateFormData({ previousSchoolCityVillage: val });
  const setPreviousSchoolType = (val: any) => updateFormData({ previousSchoolType: val });
  const setLastPercentage = (val: any) => updateFormData({ lastPercentage: val });
  const setStatus = (val: any) => updateFormData({ status: val });
  const setReference = (val: any) => updateFormData({ reference: val });
  const setSiblingInfo = (val: any) => updateFormData({ siblingInfo: val });
  const setRemarks = (val: any) => updateFormData({ remarks: val });
  const setStudentShift = (val: any) => updateFormData({ studentShift: val });
  const setHallTicketNo = (val: any) => updateFormData({ hallTicketNo: val });
  const setAdmissionFormNo = (val: any) => updateFormData({ admissionFormNo: val });
  const setMediumId = (val: any) => updateFormData({ mediumId: val });
// --- Accordion State ---
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    academic: true,
    personal: false,
    guardian: false,
    address: false,
    admission: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      if (prev[section]) return { ...prev, [section]: false };
      const next = { ...prev };
      for (const k in next) next[k] = false;
      next[section] = true;
      return next;
    });
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
      const parsed = parseApiData(studentResponse.data) as any;
      const s = parsed ? toCamelCaseRow(parsed) as any : {};
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
    const newErrors: Record<string, string> = {};
    if (!academicYearId) newErrors.academicYearId = "Required";
    if (!classId) newErrors.classId = "Required";
    if (!firstName) newErrors.firstName = "Required";
    if (!lastName) newErrors.lastName = "Required";
    if (!dob) newErrors.dob = "Required";
    if (!gender) newErrors.gender = "Required";
    if (!studentNumber) newErrors.studentNumber = "Required";
    if (!fatherName) newErrors.fatherName = "Required";
    if (!fatherNumber) newErrors.fatherNumber = "Required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setExpandedSections(prev => ({
        ...prev,
        academic: prev.academic || !!newErrors.academicYearId || !!newErrors.classId,
        personal: prev.personal || !!newErrors.firstName || !!newErrors.lastName || !!newErrors.dob || !!newErrors.gender || !!newErrors.studentNumber,
        guardian: prev.guardian || !!newErrors.fatherName || !!newErrors.fatherNumber,
      }));
      dialog.alert("Missing Fields", "Please complete all required fields highlighted in red.", "warning");
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }
    setErrors({});

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
          data: { ...payload, studentID: studentID as number } as any
        });
        dialog.alert("Success", "Student Records Updated Successfully!", "success");
      } else {
        await studentAddMutation.mutateAsync({
          data: payload as any
        });
        dialog.alert("Success", "Student Admission Registered Successfully!", "success");
      }
      setLoading(false);
      router.back();
    } catch (error: any) {
      setLoading(false);
      dialog.alert("Error", error.message || `Failed to ${isEditing ? "update" : "register"} student`, "error");
    }
  };

  if (loadingStudent) {
    return (
      <PremiumScreenLayout title="Loading..." subtitle="Fetching student details">
        <ActivityIndicator size="large" color={Colors.primary} className="mt-20" />
      </PremiumScreenLayout>
    );
  }

  const renderDropdown = (label: string, value: number | undefined, options: any[], onSelect: (id: number) => void, placeholder: string, errorKey?: string) => {
    const hasError = errorKey ? !!errors[errorKey] : false;
    return (
    <View className="flex-1 min-w-[280px]">
      <Text className={`text-[12px] font-black ${hasError ? 'text-red-500 dark:text-red-400' : 'text-gray-450 dark:text-slate-400'} mb-1.5 uppercase`}>{label}</Text>
      <View className={`${hasError ? 'bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-800' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'} border rounded-xl overflow-hidden h-[48px]`}>
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
                className={`px-3 py-1.5 rounded-lg mr-2 ${value === id ? "bg-[#1A3C6E] dark:bg-blue-600" : "bg-gray-200 dark:bg-slate-700"}`}
              >
                <Text className={`text-[11px] font-bold ${value === id ? "text-white" : "text-gray-600 dark:text-slate-300"}`}>
                  {name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
      {hasError && <Text className="text-red-500 dark:text-red-400 text-[10px] font-bold mt-1">{errors[errorKey!]}</Text>}
    </View>
  );
  };

  const renderTextInput = (label: string, value: string, onChange: (t: string) => void, placeholder: string, options?: { multiline?: boolean, keyboard?: any, maxLength?: number, editable?: boolean }, errorKey?: string) => {
    const hasError = errorKey ? !!errors[errorKey] : false;
    return (
    <View className="flex-1 min-w-[280px]">
      <Text className={`text-[12px] font-black ${hasError ? 'text-red-500 dark:text-red-400' : 'text-gray-455 dark:text-slate-400'} mb-1.5 uppercase`}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={hasError ? "#FCA5A5" : "#9CA3AF"}
        multiline={options?.multiline}
        keyboardType={options?.keyboard || "default"}
        maxLength={options?.maxLength}
        editable={options?.editable}
        className={`${options?.multiline ? "min-h-[80px] py-2" : "h-[48px]"} ${hasError ? 'bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-800 text-red-900 dark:text-red-200' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-800 dark:text-slate-200'} border rounded-xl px-4 text-sm font-semibold`}
      />
      {hasError && <Text className="text-red-500 dark:text-red-400 text-[10px] font-bold mt-1">{errors[errorKey!]}</Text>}
    </View>
  );
  };

  const renderDatePicker = (label: string, value: string, onChange: (t: string) => void, errorKey?: string) => {
    const hasError = errorKey ? !!errors[errorKey] : false;
    return (
    <View className={`flex-1 min-w-[280px] ${hasError ? 'border border-red-500 rounded-xl p-2 bg-red-50' : ''}`}>
      <PremiumDatePicker
        label={label}
        value={value}
        onChange={onChange}
      />
      {hasError && <Text className="text-red-500 text-[10px] font-bold mt-[-10px] ml-1">{errors[errorKey!]}</Text>}
    </View>
  );
  };

  const renderToggle = (label: string, value: string | boolean, options: string[], onSelect: (v: any) => void, errorKey?: string) => {
    const hasError = errorKey ? !!errors[errorKey] : false;
    return (
    <View className="flex-1 min-w-[280px]">
      <Text className={`text-[12px] font-black ${hasError ? 'text-red-500 dark:text-red-400' : 'text-gray-450 dark:text-slate-400'} mb-1.5 uppercase`}>{label}</Text>
      <View className={`flex-row ${hasError ? 'bg-red-50 dark:bg-red-950/30 border-red-400 dark:border-red-800' : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'} border rounded-xl overflow-hidden h-[48px] p-0.5`}>
        {options.map((opt) => {
          const isActive = typeof value === 'boolean' ? (opt === 'Yes' ? value === true : value === false) : value === opt;
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => onSelect(opt === 'Yes' ? true : opt === 'No' ? false : opt)}
              className={`flex-1 items-center justify-center rounded-lg ${isActive ? "bg-[#1A3C6E] dark:bg-blue-600" : ""}`}
            >
              <Text className={`text-xs font-black uppercase ${isActive ? "text-white" : "text-gray-500 dark:text-slate-400"}`}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {hasError && <Text className="text-red-500 dark:text-red-400 text-[10px] font-bold mt-1">{errors[errorKey!]}</Text>}
    </View>
  );
  };

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
        <Text className="text-[16px] font-black text-gray-900 dark:text-slate-100 uppercase tracking-wide">{title}</Text>
      </View>
      <View className={`transform ${expandedSections[sectionKey] ? "rotate-180" : "rotate-0"}`}>
        <AppIcon name="chevronDown" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const pickImage = async (setter: (uri: string) => void) => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.status !== 'granted') {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to upload a profile picture.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Open Settings", onPress: () => Linking.openSettings() }
        ]
      );
      return;
    }

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
        dialog.alert("Upload Failed", error.message || "Could not upload image", "error");
      } finally {
        setLoading(false);
      }
    }
  };

  const renderImagePicker = (label: string, photoUri: string | null, setter: (uri: string) => void) => (
    <View className="flex-1 min-w-[280px] items-center">
      <Text className="text-[12px] font-black text-gray-450 dark:text-slate-400 mb-2 uppercase">{label}</Text>
      <TouchableOpacity 
        onPress={() => pickImage(setter)}
        className="w-[100px] h-[100px] rounded-full border-2 border-dashed border-gray-300 dark:border-slate-600 items-center justify-center bg-gray-50 dark:bg-slate-800 overflow-hidden"
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
      <Card className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 p-6 mb-4 overflow-hidden">
        {renderSectionHeader("Academic Details", "subjects", "#15803D", "bg-emerald-50 dark:bg-emerald-900/20", "border-emerald-100 dark:border-emerald-800", "academic")}
        {expandedSections.academic && (
          <View className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
            <View className={`flex-row flex-wrap gap-5 ${isMobile ? "flex-col" : ""}`}>
              {renderDropdown("Academic Year *", academicYearId, academicYears, (val) => { setAcademicYearId(val); setErrors(prev => ({...prev, academicYearId: ""})); }, "Select Year", "academicYearId")}
              {renderDropdown("Class *", classId, classes, (val) => { setClassId(val); setErrors(prev => ({...prev, classId: ""})); }, "Select Class", "classId")}
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
      <Card className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 p-6 mb-4 overflow-hidden">
        {renderSectionHeader("Personal Details", gender.toLowerCase() === "female" ? "female" : "male", "#0369A1", "bg-blue-50", "border-blue-100", "personal")}
        {expandedSections.personal && (
          <View className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
            <View className={`flex-row flex-wrap gap-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("First Name *", firstName, (val) => { setFirstName(val); setErrors(prev => ({...prev, firstName: ""})); }, "Student Name", undefined, "firstName")}
              {renderTextInput("Middle Name", middleName, setMiddleName, "Father's Name")}
              {renderTextInput("Last Name *", lastName, (val) => { setLastName(val); setErrors(prev => ({...prev, lastName: ""})); }, "Surname", undefined, "lastName")}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("First Name (Secondary)", firstNameSecondary, setFirstNameSecondary, "Secondary Language")}
              {renderTextInput("Middle Name (Secondary)", middleNameSecondary, setMiddleNameSecondary, "Secondary Language")}
              {renderTextInput("Last Name (Secondary)", lastNameSecondary, setLastNameSecondary, "Secondary Language")}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("Student Display Name", studentDisplayName, setStudentDisplayName, "Full Name for Records")}
              {renderToggle("Gender *", gender, ["Male", "Female", "Other"], (val) => { setGender(val); setErrors(prev => ({...prev, gender: ""})); }, "gender")}
              {renderDatePicker("Date of Birth *", dob, (val) => { setDob(val); setErrors(prev => ({...prev, dob: ""})); }, "dob")}
              {renderTextInput("Age", age, setAge, "Calculated Age", { keyboard: "number-pad" })}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("Phone Number *", studentNumber, (val) => { setStudentNumber(val); setErrors(prev => ({...prev, studentNumber: ""})); }, "10 Digit Mobile", { keyboard: "phone-pad", maxLength: 10 }, "studentNumber")}
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
      <Card className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 p-6 mb-4 overflow-hidden">
        {renderSectionHeader("Guardian Details", "parents", "#B45309", "bg-amber-50 dark:bg-amber-900/20", "border-amber-100 dark:border-amber-800", "guardian")}
        {expandedSections.guardian && (
          <View className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
            <Text className="text-[14px] font-bold text-gray-700 dark:text-slate-300 mb-3">Father's Information</Text>
            <View className={`flex-row flex-wrap gap-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("Father Name *", fatherName, (val) => { setFatherName(val); setErrors(prev => ({...prev, fatherName: ""})); }, "Full Name", undefined, "fatherName")}
              {renderTextInput("Father Phone *", fatherNumber, (val) => { setFatherNumber(val); setErrors(prev => ({...prev, fatherNumber: ""})); }, "Mobile No", { keyboard: "phone-pad" }, "fatherNumber")}
              {renderTextInput("Father Occupation", fatherOccupation, setFatherOccupation, "Occupation")}
              {renderTextInput("Father Education", fatherEducation, setFatherEducation, "Education")}
              {renderTextInput("Father Email", fatherEmail, setFatherEmail, "email@example.com", { keyboard: "email-address" })}
            </View>
            <Text className="text-[14px] font-bold text-gray-700 dark:text-slate-300 mt-8 mb-3">Mother's Information</Text>
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
      <Card className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 p-6 mb-4 overflow-hidden">
        {renderSectionHeader("Address Details", "notifications", "#059669", "bg-emerald-50 dark:bg-emerald-900/20", "border-emerald-100 dark:border-emerald-800", "address")}
        {expandedSections.address && (
          <View className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
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
      <Card className="bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 p-6 mb-10 overflow-hidden">
        {renderSectionHeader("Admission Details", "reports", "#DB2777", "bg-pink-50 dark:bg-pink-900/20", "border-pink-100 dark:border-pink-800", "admission")}
        {expandedSections.admission && (
          <View className="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
            <View className={`flex-row flex-wrap gap-5 ${isMobile ? "flex-col" : ""}`}>
              {renderToggle("Right to Education (RTE)", rte, ["Yes", "No"], setRte)}
              {renderToggle("Student Type", studentType, ["New", "Regular"], setStudentType)}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderTextInput("Hall Ticket No", hallTicketNo, setHallTicketNo, "Hall Ticket Number")}
              {renderTextInput("Admission Form No", admissionFormNo, setAdmissionFormNo, "Form Number")}
              {renderDatePicker("Student Fees Date", studentFeesDate, setStudentFeesDate)}
            </View>
            <View className={`flex-row flex-wrap gap-5 mt-5 ${isMobile ? "flex-col" : ""}`}>
              {renderDatePicker("Admission Date", admissionDate, setAdmissionDate)}
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
      hideBack
      scrollable={false}
      rightAction={
        !isMobile ? (
                    <PrimaryButton 
            label={isEditing ? "Update" : "Register"}
            onPress={handleSubmit}
            isLoading={loading}
          />
        ) : undefined
      }
    >
      <FormLayout
        ref={scrollViewRef as any}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {formContent}
      </FormLayout>
      {isMobile && (
        <View className="mb-10 mt-2">
                    <PrimaryButton 
            label={isEditing ? "Update" : "Register"}
            onPress={handleSubmit}
            isLoading={loading}
          />
        </View>
      )}
    </PremiumScreenLayout>
  );
}
