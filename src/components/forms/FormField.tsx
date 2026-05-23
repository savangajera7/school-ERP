import React from "react";
import { Controller, type Control, type FieldValues, type Path } from "react-hook-form";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import type { TextInputProps } from "react-native";

interface FormFieldProps<T extends FieldValues> extends Omit<TextInputProps, "value" | "onChangeText"> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  isPassword?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function FormField<T extends FieldValues>({
  control,
  name,
  label,
  isPassword = false,
  leftIcon,
  rightIcon,
  ...props
}: FormFieldProps<T>) {
  const InputComponent = isPassword ? PasswordInput : Input;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <InputComponent
          label={label}
          value={value}
          onChangeText={onChange}
          onBlur={onBlur}
          error={error?.message}
          leftIcon={leftIcon}
          rightIcon={rightIcon}
          {...props}
        />
      )}
    />
  );
}
