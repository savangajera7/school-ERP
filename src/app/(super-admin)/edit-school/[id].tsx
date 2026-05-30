import React, { useEffect } from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, Text } from "react-native";
import { useDialog } from "@/components/ui/AppDialog";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useGetApiSchoolGetByIDId, usePutApiSchoolUpdate } from "@/api/generated/0-schools-super-admin/0-schools-super-admin";
import { useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Card } from "@/components/ui/Card";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";

const editSchoolSchema = z.object({
  schoolID: z.number(),
  schoolName: z.string().min(2, "School Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(10, "Phone must be at least 10 digits").optional().or(z.literal("")),
  line1: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),
  adminFirstName: z.string().optional().nullable(),
  adminLastName: z.string().optional().nullable(),
  adminPhone: z.string().optional().nullable(),
  adminPassword: z.string().optional().nullable(),
});

type EditSchoolFormValues = z.infer<typeof editSchoolSchema>;

export default function EditSchoolScreen() {
  const dialog = useDialog();
  const { id } = useLocalSearchParams<{ id: string }>();
  const schoolId = parseInt(id, 10);
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useGetApiSchoolGetByIDId(schoolId);
  const updateSchoolMutation = usePutApiSchoolUpdate();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<EditSchoolFormValues>({
    resolver: zodResolver(editSchoolSchema),
    defaultValues: {
      schoolID: schoolId, schoolName: "", email: "", phone: "",
      line1: "", city: "", state: "", postalCode: "", country: "",
      adminFirstName: "", adminLastName: "", adminPhone: "", adminPassword: ""
    }
  });

  useEffect(() => {
    if (data?.data?.data) {
      const school = data.data as any;
      reset({
        schoolID: school.schoolID,
        schoolName: school.schoolName || "",
        email: school.email || "",
        phone: school.phone || "",
        line1: school.line1 || "",
        city: school.city || "",
        state: school.state || "",
        postalCode: school.postalCode || "",
        country: school.country || "",
        adminFirstName: school.adminFirstName || "",
        adminLastName: school.adminLastName || "",
        adminPhone: school.adminPhone || ""
      });
    }
  }, [data, reset]);

  const onSubmit = (formData: EditSchoolFormValues) => {
    updateSchoolMutation.mutate(
      { data: formData as any },
      {
        onSuccess: (res: any) => {
          if (res?.data?.success === false || res?.data?.status === 0) {
            dialog.alert("Error", res?.data?.message || "Failed to update school.", "error");
            return;
          }
          dialog.alert("Success", "School updated successfully.", "success");
          queryClient.invalidateQueries({ queryKey: ["/api/School/Get"] });
          queryClient.invalidateQueries({ queryKey: [`/api/School/GetByID/${schoolId}`] });
          router.back();
        },
        onError: (err: any) => {
          dialog.alert("Error", err?.response?.data?.message || "Failed to update school.", "error");
        }
      }
    );
  };

  return (
    <PremiumScreenLayout
      title="Edit School"
      subtitle="Manage school information"
    >
      {isLoading ? (
        <SkeletonLoader rows={5} />
      ) : (
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
            
            <Card className="p-4 mb-4">
              <Text className="text-lg font-bold text-gray-800 mb-4">School Details</Text>
              <Controller
                control={control}
                name="schoolName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="School Name" placeholder="Little Angels School" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.schoolName?.message} />
                )}
              />
              <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="School Email" placeholder="info@school.com" keyboardType="email-address" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.email?.message} />
                )}
              />
              <Controller
                control={control}
                name="phone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="School Phone" placeholder="+1234567890" keyboardType="phone-pad" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.phone?.message} />
                )}
              />
            </Card>

            <Card className="p-4 mb-4">
              <Text className="text-lg font-bold text-gray-800 mb-4">Address Details</Text>
              <Controller
                control={control}
                name="line1"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Address Line 1" placeholder="123 Main St" onBlur={onBlur} onChangeText={onChange} value={value ?? ""} error={errors.line1?.message} />
                )}
              />
              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="city"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input label="City" placeholder="New York" onBlur={onBlur} onChangeText={onChange} value={value ?? ""} error={errors.city?.message} />
                    )}
                  />
                </View>
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="state"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input label="State" placeholder="NY" onBlur={onBlur} onChangeText={onChange} value={value ?? ""} error={errors.state?.message} />
                    )}
                  />
                </View>
              </View>
            </Card>

            <Card className="p-4 mb-4">
              <Text className="text-lg font-bold text-gray-800 mb-4">Primary Admin Details</Text>
              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="adminFirstName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input label="First Name" placeholder="John" onBlur={onBlur} onChangeText={onChange} value={value ?? ""} error={errors.adminFirstName?.message} />
                    )}
                  />
                </View>
                <View className="flex-1">
                  <Controller
                    control={control}
                    name="adminLastName"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <Input label="Last Name" placeholder="Doe" onBlur={onBlur} onChangeText={onChange} value={value ?? ""} error={errors.adminLastName?.message} />
                    )}
                  />
                </View>
              </View>
              <Controller
                control={control}
                name="adminPhone"
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input label="Admin Phone" placeholder="+1234567890" keyboardType="phone-pad" onBlur={onBlur} onChangeText={onChange} value={value ?? ""} error={errors.adminPhone?.message} />
                )}
              />
              <Controller
                control={control}
                name="adminPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                  <PasswordInput label="Admin Password (leave blank to keep current)" placeholder="••••••••" onBlur={onBlur} onChangeText={onChange} value={value ?? ""} error={errors.adminPassword?.message} />
                )}
              />
            </Card>

            <View className="pb-8">
              <Button 
                label="Update School" 
                onPress={handleSubmit(onSubmit)} 
                loading={updateSchoolMutation.isPending} 
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </PremiumScreenLayout>
  );
}
