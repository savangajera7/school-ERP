import React, { useMemo, useState } from "react";
import { FlatList, TextInput } from "react-native";
import { router } from "expo-router";
import { PremiumScreenLayout } from "@/components/layout/PremiumScreenLayout";
import { PremiumCard } from "@/components/ui/premium";
import { MobileDataCard } from "@/components/ui/MobileDataCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PremiumLoader } from "@/components/ui/PremiumLoader";
import { Button } from "@/components/ui/Button";
import {
  useGetApiSubjectGetSubjectList,
  usePostApiSubjectInsertSubject,
} from "@/api/generated/subject/subject";
import { parseApiList } from "@/utils/apiResponse";
import { recordLabel } from "@/utils/recordHelpers";
import { useToast } from "@/components/ui/Toast";
import { useAuthStore } from "@/store/authStore";
import { Colors } from "@/constants/colors";
import { usePermissions } from "@/hooks/usePermissions";

export default function SubjectsScreen() {
  const { canManageSubjects } = usePermissions();
  const { showToast } = useToast();
  const { userData } = useAuthStore();
  const [subjectName, setSubjectName] = useState("");
  const [subjectCode, setSubjectCode] = useState("");

  const { data, isLoading, refetch, isRefetching } = useGetApiSubjectGetSubjectList();
  const insertMutation = usePostApiSubjectInsertSubject();
  const subjects = useMemo(() => parseApiList<Record<string, unknown>>(data?.data), [data]);

  const handleAdd = async () => {
    if (!subjectName.trim()) {
      showToast("Subject name is required.", "error");
      return;
    }
    try {
      await insertMutation.mutateAsync({
        data: {
          subjectName: subjectName.trim(),
          subjectCode: subjectCode.trim() || undefined,
          createdBy: parseInt(userData?.id ?? "0", 10) || 0,
        },
      });
      showToast("Subject added.", "success");
      setSubjectName("");
      setSubjectCode("");
      refetch();
    } catch {
      showToast("Failed to add subject.", "error");
    }
  };

  return (
    <PremiumScreenLayout
      title="Subjects"
      subtitle="Curriculum subjects"
      onBack={() => router.back()}
      scrollable={false}
      bodyStyle={{ flex: 1, paddingHorizontal: 0, marginTop: -16 }}
    >
      {canManageSubjects && (
      <PremiumCard noAccent style={{ padding: 16, marginHorizontal: 16, marginBottom: 12, gap: 8 }}>
        <TextInput placeholder="Subject name *" value={subjectName} onChangeText={setSubjectName} className="border border-gray-200 rounded-xl px-4 py-2" />
        <TextInput placeholder="Code (optional)" value={subjectCode} onChangeText={setSubjectCode} className="border border-gray-200 rounded-xl px-4 py-2" />
        <Button label="Add subject" onPress={handleAdd} loading={insertMutation.isPending} />
      </PremiumCard>
      )}
      {isLoading ? (
        <PremiumLoader color={Colors.primary} />
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item, i) => String(item.subjectID ?? i)}
          contentContainerStyle={{ padding: 16, flexGrow: 1 }}
          onRefresh={refetch}
          refreshing={isRefetching}
          ListEmptyComponent={<EmptyState title="No subjects" />}
          renderItem={({ item }) => (
            <MobileDataCard
              title={recordLabel(item, "subjectName")}
              subtitle={recordLabel(item, "subjectCode")}
              fields={[]}
            />
          )}
        />
      )}
    </PremiumScreenLayout>
  );
}
