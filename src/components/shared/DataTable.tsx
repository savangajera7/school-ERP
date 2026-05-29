import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, type DimensionValue } from "react-native";
import { useColorScheme } from "nativewind";
import { premiumCardShadow } from "@/constants/premiumStyles";
import { SchoolTheme } from "@/constants/theme";

export interface TableColumn<T> {
  key: string;
  header: string;
  width?: DimensionValue;
  flex?: number;
  align?: "left" | "center" | "right";
  render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  onRowPress?: (item: T) => void;
  isLoading?: boolean;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  onRowPress,
  isLoading,
}: DataTableProps<T>) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  if (isLoading) {
    return (
      <View 
        className="rounded-2xl p-6 border overflow-hidden flex-1" 
        style={[
          premiumCardShadow,
          {
            backgroundColor: isDark ? SchoolTheme.cardDark : "#FFFFFF",
            borderColor: isDark ? SchoolTheme.borderDark : "#F3F4F6"
          }
        ]}
      >
        <Text className="text-center font-bold" style={{ color: isDark ? SchoolTheme.textSecondaryDark : "#9CA3AF" }}>
          Loading table data...
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View 
        className="rounded-2xl p-6 border overflow-hidden flex-1" 
        style={[
          premiumCardShadow,
          {
            backgroundColor: isDark ? SchoolTheme.cardDark : "#FFFFFF",
            borderColor: isDark ? SchoolTheme.borderDark : "#F3F4F6"
          }
        ]}
      >
        <Text className="text-center font-bold" style={{ color: isDark ? SchoolTheme.textSecondaryDark : "#9CA3AF" }}>
          No data available.
        </Text>
      </View>
    );
  }

  return (
    <View 
      className="rounded-2xl border overflow-hidden flex-1" 
      style={[
        premiumCardShadow,
        {
          backgroundColor: isDark ? SchoolTheme.cardDark : "#FFFFFF",
          borderColor: isDark ? SchoolTheme.borderDark : "#F3F4F6"
        }
      ]}
    >
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ minWidth: '100%' }}>
        <View style={styles.tableContainer}>
          {/* Header Row */}
          <View style={[styles.headerRow, { backgroundColor: isDark ? "#1E293B" : "#F4F8FC", borderBottomColor: isDark ? SchoolTheme.borderDark : "#F3F4F6" }]}>
            {columns.map((col, idx) => (
              <View
                key={`header-${col.key}-${idx}`}
                style={[
                  styles.cell,
                  col.width ? { width: col.width } : {},
                  col.flex ? { flex: col.flex } : !col.width ? { flex: 1 } : {},
                  { alignItems: col.align === "right" ? "flex-end" : col.align === "center" ? "center" : "flex-start" }
                ]}
              >
                <Text className="font-black text-[11px] uppercase tracking-wider" style={{ color: isDark ? SchoolTheme.textSecondaryDark : "#9CA3AF" }}>
                  {col.header}
                </Text>
              </View>
            ))}
          </View>

          {/* Data Rows */}
          {data.map((rowItem, rowIndex) => {
            const isEven = rowIndex % 2 === 0;
            const rowContent = (
              <View
                style={[
                  styles.row, 
                  isEven ? styles.rowEven : styles.rowOdd,
                  { 
                    borderBottomColor: isDark ? SchoolTheme.borderDark : "#F3F4F6",
                    backgroundColor: isEven 
                      ? (isDark ? SchoolTheme.cardDark : "#FFFFFF") 
                      : (isDark ? "rgba(30, 41, 59, 0.5)" : "rgba(249, 250, 251, 0.5)")
                  }
                ]}
              >
                {columns.map((col, colIndex) => {
                  return (
                    <View
                      key={`cell-${col.key}-${colIndex}`}
                      style={[
                        styles.cell,
                        col.width ? { width: col.width } : {},
                        col.flex ? { flex: col.flex } : !col.width ? { flex: 1 } : {},
                        { alignItems: col.align === "right" ? "flex-end" : col.align === "center" ? "center" : "flex-start" }
                      ]}
                    >
                      {col.render ? (
                        col.render(rowItem, rowIndex)
                      ) : (
                        <Text className="text-sm font-semibold" numberOfLines={1} style={{ color: isDark ? SchoolTheme.textDark : "#374151" }}>
                          {String((rowItem as any)[col.key] || "-")}
                        </Text>
                      )}
                    </View>
                  );
                })}
              </View>
            );

            if (onRowPress) {
              return (
                <TouchableOpacity
                  key={keyExtractor(rowItem, rowIndex)}
                  activeOpacity={0.7}
                  onPress={() => onRowPress(rowItem)}
                >
                  {rowContent}
                </TouchableOpacity>
              );
            }

            return <React.Fragment key={keyExtractor(rowItem, rowIndex)}>{rowContent}</React.Fragment>;
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tableContainer: {
    minWidth: "100%",
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  rowEven: {
    backgroundColor: "#FFFFFF",
  },
  rowOdd: {
    backgroundColor: "rgba(249, 250, 251, 0.5)",
  },
  cell: {
    justifyContent: "center",
    paddingHorizontal: 6,
    minWidth: 0,
    overflow: "hidden",
  },
});
