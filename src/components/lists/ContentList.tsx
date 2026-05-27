import React from "react";
import { FlatList, Text, View, StyleSheet } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { EmptyState } from "@/components/ui/EmptyState";
import { SchoolTheme } from "@/constants/theme";
type Item = {
  id: string;
  kind: "HOMEWORK" | "CLASSWORK" | "NOTEBOOK";
  title: string;
  body: string;
  date: string;
  raw?: any;
};

type Props = {
  items: Item[];
  readOnly?: boolean;
  loading?: boolean;
  onRefresh?: () => void;
};

export function ContentList({ items, readOnly, loading, onRefresh }: Props) {
  const { columns } = useResponsive();

  if (!loading && items.length === 0) {
    return (
      <EmptyState
        icon="homework"
        title="Nothing here yet"
        message={
          readOnly
            ? "Content will appear when teachers publish it."
            : "Add your first entry using the form above."
        }
      />
    );
  }

  return (
    <FlatList
      data={items}
      key={`cols-${columns}`}
      numColumns={columns}
      keyExtractor={(item) => item.id}
      onRefresh={onRefresh}
      refreshing={!!loading}
      contentContainerStyle={{ paddingBottom: 24, gap: 12 }}
      columnWrapperStyle={columns > 1 ? styles.row : undefined}
      renderItem={({ item }) => (
        <View style={[styles.card, columns > 1 && styles.cardMulti]}>
          <Text style={styles.kind}>{item.kind}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.date}>{item.date || "—"}</Text>
          {item.body ? (
            <Text style={styles.body} numberOfLines={4}>
              {item.body}
            </Text>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  row: { gap: 12 },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: SchoolTheme.border,
    marginBottom: 12,
  },
  cardMulti: { marginHorizontal: 4 },
  kind: {
    fontSize: 10,
    fontWeight: "800",
    color: SchoolTheme.accent,
    marginBottom: 4,
  },
  title: { fontSize: 16, fontWeight: "800", color: SchoolTheme.text },
  date: { fontSize: 12, color: SchoolTheme.textSecondary, marginTop: 4 },
  body: { fontSize: 13, color: SchoolTheme.textSecondary, marginTop: 8 },
});
