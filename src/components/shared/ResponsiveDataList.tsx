import React, { useState } from "react";
import { View, FlatList, RefreshControl, Text, TextInput, TouchableOpacity } from "react-native";
import { useResponsive } from "@/hooks/useResponsive";
import { DataTable, type TableColumn } from "./DataTable";
import { SkeletonLoader } from "@/components/ui/SkeletonLoader";
import { AppIcon, IconCircle } from "@/components/icons/AppIcon";
import type { AppIconName } from "@/constants/appIcons";
import { useTranslation } from "@/hooks/useTranslation";

export interface ResponsiveDataListProps<T> {
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  error?: any;
  onRefresh?: () => void;
  
  /** Card renderer for Mobile view */
  renderCard: (item: T, index: number) => React.ReactElement | null;
  
  /** Column definitions for Tablet/Desktop Table view */
  tableColumns: TableColumn<T>[];
  
  keyExtractor: (item: T, index: number) => string;
  onRowPress?: (item: T) => void;
  
  emptyIcon?: AppIconName;
  emptyTitle?: string;
  emptyMessage?: string;
  
  /** Optional search query - if provided, renders a unified search bar */
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;
  headerComponent?: React.ReactNode;
}

export function ResponsiveDataList<T>({
  data,
  isLoading,
  isError,
  error,
  onRefresh,
  renderCard,
  tableColumns,
  keyExtractor,
  onRowPress,
  emptyIcon = "empty",
  emptyTitle = "No Data Found",
  emptyMessage = "There are no records to display at this time.",
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  headerComponent,
}: ResponsiveDataListProps<T>) {
  const { listMode } = useResponsive();
  const { t } = useTranslation();

  const handleRefresh = () => {
    if (onRefresh) onRefresh();
  };

  const renderEmptyState = () => {
    if (isLoading) return null;
    
    if (isError) {
      return (
        <View className="flex-1 items-center justify-center p-8 min-h-[300px]">
          <View className="mb-4">
            <IconCircle name="warning" size={64} iconSize={32} />
          </View>
          <Text className="text-gray-800 text-lg font-black mb-2 text-center">
            Error Loading Data
          </Text>
          <Text className="text-gray-500 text-sm text-center font-semibold">
            {error?.message || "An unexpected error occurred while fetching the data."}
          </Text>
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center p-8 min-h-[300px]">
        <View className="mb-4">
          <IconCircle name={emptyIcon} size={64} iconSize={32} />
        </View>
        <Text className="text-gray-800 text-lg font-black mb-2 text-center">
          {emptyTitle}
        </Text>
        <Text className="text-gray-500 text-sm text-center font-semibold">
          {emptyMessage}
        </Text>
      </View>
    );
  };

  const searchBar = onSearchChange !== undefined ? (
    <View className="bg-white border border-gray-100 rounded-xl flex-row items-center h-12 px-4 mt-2 mb-4 shadow-sm">
      <AppIcon name="search" size={20} color="#9CA3AF" />
      <TextInput
        value={searchQuery}
        onChangeText={onSearchChange}
        placeholder={searchPlaceholder || t.searchPlaceholder || "Search..."}
        className="flex-1 ml-2 text-[15px] text-gray-800 font-semibold h-full"
        placeholderTextColor="#9CA3AF"
        style={{ outlineWidth: 0 } as any}
      />
      {searchQuery && searchQuery.length > 0 && (
        <TouchableOpacity onPress={() => onSearchChange("")} activeOpacity={0.7}>
          <AppIcon name="close" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  ) : null;

  const headerContent = (
    <View>
      {headerComponent}
      {searchBar}
    </View>
  );

  if (listMode === "table") {
    return (
      <View className="flex-1">
        {headerContent}
        {isLoading && (!data || data.length === 0) ? (
          <View className="p-4">
            <SkeletonLoader rows={3} />
          </View>
        ) : data && data.length > 0 ? (
          <DataTable
            columns={tableColumns}
            data={data}
            keyExtractor={keyExtractor}
            onRowPress={onRowPress}
            isLoading={isLoading}
          />
        ) : (
          renderEmptyState()
        )}
      </View>
    );
  }

  // Mobile list mode
  return (
    <FlatList
      data={data}
      keyExtractor={keyExtractor}
      renderItem={({ item, index }) => renderCard(item, index)}
      contentContainerStyle={{ paddingBottom: 100, flexGrow: 1 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={headerContent}
      ListEmptyComponent={
        isLoading ? (
          <View className="p-4">
            <SkeletonLoader rows={4} />
          </View>
        ) : (
          renderEmptyState()
        )
      }
      refreshControl={
        <RefreshControl refreshing={!!isLoading} onRefresh={handleRefresh} />
      }
    />
  );
}
