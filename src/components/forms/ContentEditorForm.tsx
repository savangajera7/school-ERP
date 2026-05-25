import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from "react-native";
import { Button } from "@/components/ui/Button";
import { useResponsive } from "@/hooks/useResponsive";
import { SchoolTheme } from "@/constants/theme";
import type { ContentKind } from "@/services/classroom/contentService";

type Props = {
  kind: ContentKind;
  onSubmit: (title: string, body: string, date: string) => Promise<void>;
  loading?: boolean;
};

export function ContentEditorForm({ kind, onSubmit, loading }: Props) {
  const { bodySize } = useResponsive();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const label =
    kind === "HOMEWORK" ? "Homework" : kind === "CLASSWORK" ? "Classwork" : "Notebook";

  const handleSave = async () => {
    if (!title.trim()) return;
    await onSubmit(title.trim(), body.trim(), date);
    setTitle("");
    setBody("");
  };

  return (
    <View style={styles.card}>
      <Text style={[styles.heading, { fontSize: bodySize + 2 }]}>Add {label}</Text>
      <Text style={styles.fieldLabel}>Title</Text>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder={`${label} title`}
        style={styles.input}
        placeholderTextColor="#9CA3AF"
      />
      <Text style={styles.fieldLabel}>Date (YYYY-MM-DD)</Text>
      <TextInput
        value={date}
        onChangeText={setDate}
        placeholder="2026-05-25"
        style={styles.input}
      />
      <Text style={styles.fieldLabel}>Description</Text>
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Instructions, pages, links…"
        multiline
        style={[styles.input, styles.multiline]}
        textAlignVertical="top"
      />
      {loading ? (
        <ActivityIndicator color={SchoolTheme.primary} style={{ marginTop: 12 }} />
      ) : (
        <Button label={`Save ${label}`} onPress={handleSave} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: SchoolTheme.border,
    marginBottom: 16,
  },
  heading: { fontWeight: "800", color: SchoolTheme.primary, marginBottom: 12 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: SchoolTheme.textSecondary,
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: SchoolTheme.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: SchoolTheme.text,
    minHeight: 48,
  },
  multiline: { minHeight: 120 },
});
