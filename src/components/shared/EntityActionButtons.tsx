import React from "react";
import { View, TouchableOpacity } from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";

export interface EntityActionButtonsProps {
  /** Called when the edit button is pressed */
  onEdit?: () => void;
  /** Called when the delete button is pressed */
  onDelete?: () => void;
  /** Show the edit button (default: true if onEdit is provided) */
  showEdit?: boolean;
  /** Show the delete button (default: true if onDelete is provided) */
  showDelete?: boolean;
}

/**
 * Reusable edit/delete action button pair for entity cards and table rows.
 * Used across 15+ CRUD screens.
 */
export function EntityActionButtons({
  onEdit,
  onDelete,
  showEdit,
  showDelete,
}: EntityActionButtonsProps) {
  const editVisible = showEdit ?? !!onEdit;
  const deleteVisible = showDelete ?? !!onDelete;

  if (!editVisible && !deleteVisible) return null;

  return (
    <View className="flex-row gap-2 ml-auto">
      {editVisible && (
        <TouchableOpacity
          onPress={onEdit}
          className="bg-blue-50 p-2 rounded-lg"
          activeOpacity={0.7}
        >
          <AppIcon name="edit" size={18} color="#3B82F6" />
        </TouchableOpacity>
      )}
      {deleteVisible && (
        <TouchableOpacity
          onPress={onDelete}
          className="bg-red-50 p-2 rounded-lg"
          activeOpacity={0.7}
        >
          <AppIcon name="delete" size={18} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );
}
