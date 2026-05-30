import React from "react";
import { View, ScrollView, KeyboardAvoidingView, Platform, Text } from "react-native";
import { useDialog } from "@/components/ui/AppDialog";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Button } from "@/components/ui/Button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { usePostApiSchoolAdd } from "@/api/generated/0-schools-super-admin/0-schools-super-admin";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Card } from "@/components/ui/Card";

const addSchoolSchema = z.object({
  schoolCode: z.string().min(2, "School Code is required"),
  schoolName: z.string().min(2, "School Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  line1: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  adminFirstName: z.string().min(2, "Admin First Name is required"),
  adminLastName: z.string().min(2, "Admin Last Name is required"),
  adminEmail: z.string().email("Invalid Admin email"),
  adminPhone: z.string().min(10, "Admin Phone must be at least 10 digits"),
  adminPassword: z.string().min(6, "Password must be at least 6 characters")
});

type AddSchoolFormValues = z.infer<typeof addSchoolSchema>;

export default function AddSchoolScreen() {
  const dialog = useDialog();
  const queryClient = useQueryClient();
  const addSchoolMutation = usePostApiSchoolAdd();

  const { control, handleSubmit, formState: { errors } } = useForm<AddSchoolFormValues>({
    resolver: zodResolver(addSchoolSchema),
    defaultValues: {
      schoolCode: "", schoolName: "", email: "", phone: "",
      line1: "", city: "", state: "", postalCode: "", country: "",
      adminFirstName: "", adminLastName: "", adminEmail: "", adminPhone: "", adminPassword: ""
    }
  });

  const onSubmit = (data: AddSchoolFormValues) => {
    addSchoolMutation.mutate(
      { data },
      {
        onSuccess: (res: any) => {
          if (res?.data?.success === false || res?.data?.status === 0) {
            dialog.alert("Error", res?.data?.message || "Failed to add school.", "error");
            return;
          }
          dialog.alert("Success", "School added successfully.", "success");
          queryClient.invalidateQueries({ queryKey: ["/api/School/Get"] });
          router.back();
        },
        onError: (err: any) => {
          dialog.alert("Error", err?.response?.data?.message || "Failed to add school.", "error");
        }
      }
    );
  };

  return (
    <PremiumScreenLayout
      title="Add New School"
      subtitle="Register a new school in the system"
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView className="flex-1 px-4 py-2" showsVerticalScrollIndicator={false}>
          
          <Card className="p-4 mb-4">
            <Text className="text-lg font-bold text-gray-800 mb-4">School Details</Text>
            <Controller
              control={control}
              name="schoolCode"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="School Code" placeholder="e.g. SCH001" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.schoolCode?.message} />
              )}
            />
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
                <Input label="Address Line 1" placeholder="123 Main St" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.line1?.message} />
              )}
            />
            <View className="flex-row space-x-4">
              <View className="flex-1">
                <Controller
                  control={control}
                  name="city"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input label="City" placeholder="New York" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.city?.message} />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="state"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input label="State" placeholder="NY" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.state?.message} />
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
                    <Input label="First Name" placeholder="John" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.adminFirstName?.message} />
                  )}
                />
              </View>
              <View className="flex-1">
                <Controller
                  control={control}
                  name="adminLastName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <Input label="Last Name" placeholder="Doe" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.adminLastName?.message} />
                  )}
                />
              </View>
            </View>
            <Controller
              control={control}
              name="adminEmail"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Admin Email" placeholder="admin@school.com" keyboardType="email-address" autoCapitalize="none" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.adminEmail?.message} />
              )}
            />
            <Controller
              control={control}
              name="adminPhone"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Admin Phone" placeholder="+1234567890" keyboardType="phone-pad" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.adminPhone?.message} />
              )}
            />
            <Controller
              control={control}
              name="adminPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <PasswordInput label="Admin Password" placeholder="••••••••" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.adminPassword?.message} />
              )}
            />
          </Card>

          <View className="pb-8">
            <Button 
              label="Create School" 
              onPress={handleSubmit(onSubmit)} 
              loading={addSchoolMutation.isPending} 
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </PremiumScreenLayout>
  );
}
