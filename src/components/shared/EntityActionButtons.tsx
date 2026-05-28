import React from "react";
import { View, TouchableOpacity } from "react-native";
import { AppIcon } from "@/components/icons/AppIcon";

export interface EntityActionButtonsProps {
  /** Called when the edit button is pressed */
  onEdit?: () => void;
  /** Called when the delete button is pressed */
  onDelete?: () => void;
  /** Called when the view/profile button is pressed */
  onView?: () => void;
  /** Show the edit button (default: true if onEdit is provided) */
  showEdit?: boolean;
  /** Show the delete button (default: true if onDelete is provided) */
  showDelete?: boolean;
  /** Show the view button (default: true if onView is provided) */
  showView?: boolean;
}

/**
 * Reusable edit/delete action button pair for entity cards and table rows.
 * Used across 15+ CRUD screens.
 */
export function EntityActionButtons({
  onEdit,
  onDelete,
  onView,
  showEdit,
  showDelete,
  showView,
}: EntityActionButtonsProps) {
  const editVisible = showEdit ?? !!onEdit;
  const deleteVisible = showDelete ?? !!onDelete;
  const viewVisible = showView ?? !!onView;

  if (!editVisible && !deleteVisible && !viewVisible) return null;

  return (
    <View className="flex-row gap-2 ml-auto">
      {viewVisible && (
        <TouchableOpacity
          onPress={onView}
          className="bg-emerald-50 w-[30px] h-[30px] rounded-md items-center justify-center border border-emerald-100"
          activeOpacity={0.7}
        >
          <AppIcon name="profile" size={15} color="#10B981" />
        </TouchableOpacity>
      )}
      {editVisible && (
        <TouchableOpacity
          onPress={onEdit}
          className="bg-blue-50 w-[30px] h-[30px] rounded-md items-center justify-center border border-blue-100"
          activeOpacity={0.7}
        >
          <AppIcon name="edit" size={15} color="#3B82F6" />
        </TouchableOpacity>
      )}
      {deleteVisible && (
        <TouchableOpacity
          onPress={onDelete}
          className="bg-red-50 w-[30px] h-[30px] rounded-md items-center justify-center border border-red-100"
          activeOpacity={0.7}
        >
          <AppIcon name="delete" size={15} color="#EF4444" />
        </TouchableOpacity>
      )}
    </View>
  );
}
