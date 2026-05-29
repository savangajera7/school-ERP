/**
 * AppDialog — cross-platform in-app dialog that replaces Alert.alert on all platforms.
 * Supports: info / success / error / warning / confirm / input dialogs.
 *
 * Usage (imperative, drop-in for Alert.alert):
 *   const { showDialog, confirm, alert } = useDialog();
 *
 *   // Simple message (replaces Alert.alert("Title", "Message"))
 *   alert("Success", "Record saved successfully!", "success");
 *
 *   // Confirmation (replaces Alert.alert("Delete", "...", [{Cancel}, {Delete, destructive}]))
 *   const ok = await confirm("Delete", "Are you sure?", { confirmLabel: "Delete", destructive: true });
 *   if (ok) { ... }
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Colors } from "@/constants/colors";
import { premiumCardShadow } from "@/constants/premiumStyles";

// ─── Types ────────────────────────────────────────────────────────────────────

export type DialogVariant = "info" | "success" | "error" | "warning" | "confirm" | "input";

export interface DialogButton {
  label: string;
  onPress?: () => void | Promise<void>;
  /** Makes the button red */
  destructive?: boolean;
  /** Makes the button the primary (filled) action */
  primary?: boolean;
  /** Closes the dialog without calling onPress */
  cancel?: boolean;
}

export interface DialogOptions {
  title: string;
  message?: string;
  variant?: DialogVariant;
  buttons?: DialogButton[];
  /** For input dialogs */
  inputPlaceholder?: string;
  inputDefaultValue?: string;
  inputMultiline?: boolean;
}

interface DialogState extends DialogOptions {
  visible: boolean;
  inputValue: string;
  loading: boolean;
}

interface DialogContextValue {
  showDialog: (options: DialogOptions) => Promise<{ confirmed: boolean; inputValue?: string }>;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const DialogContext = createContext<DialogContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AppDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<DialogState>({
    visible: false,
    title: "",
    message: "",
    variant: "info",
    buttons: [],
    inputValue: "",
    loading: false,
  });

  const resolveRef = useRef<((result: { confirmed: boolean; inputValue?: string }) => void) | null>(null);

  const showDialog = useCallback(
    (options: DialogOptions): Promise<{ confirmed: boolean; inputValue?: string }> => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;
        setState({
          visible: true,
          title: options.title,
          message: options.message,
          variant: options.variant ?? "info",
          buttons: options.buttons ?? [{ label: "OK", primary: true }],
          inputPlaceholder: options.inputPlaceholder,
          inputDefaultValue: options.inputDefaultValue ?? "",
          inputMultiline: options.inputMultiline,
          inputValue: options.inputDefaultValue ?? "",
          loading: false,
        });
      });
    },
    []
  );

  const handleButton = useCallback(
    async (btn: DialogButton) => {
      if (btn.cancel) {
        setState((s) => ({ ...s, visible: false }));
        resolveRef.current?.({ confirmed: false });
        return;
      }

      if (btn.onPress) {
        setState((s) => ({ ...s, loading: true }));
        try {
          await btn.onPress();
        } finally {
          setState((s) => ({ ...s, loading: false, visible: false }));
        }
      } else {
        setState((s) => ({ ...s, visible: false }));
      }

      resolveRef.current?.({
        confirmed: !btn.cancel,
        inputValue: state.inputValue,
      });
    },
    [state.inputValue]
  );

  const dismiss = useCallback(() => {
    setState((s) => ({ ...s, visible: false }));
    resolveRef.current?.({ confirmed: false });
  }, []);

  const variantColor = {
    info: Colors.primary,
    success: "#059669",
    error: "#DC2626",
    warning: "#D97706",
    confirm: Colors.primary,
    input: Colors.primary,
  }[state.variant ?? "info"];

  const variantIcon = {
    info: "ℹ",
    success: "✓",
    error: "✕",
    warning: "⚠",
    confirm: "?",
    input: "✎",
  }[state.variant ?? "info"];

  const variantBg = {
    info: "#EFF6FF",
    success: "#ECFDF5",
    error: "#FEF2F2",
    warning: "#FFFBEB",
    confirm: "#EFF6FF",
    input: "#EFF6FF",
  }[state.variant ?? "info"];

  return (
    <DialogContext.Provider value={{ showDialog }}>
      {children}

      <Modal
        visible={state.visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={dismiss}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={dismiss}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.card, premiumCardShadow as any]}
            onPress={() => {}}
          >
            {/* Icon circle */}
            <View style={[styles.iconCircle, { backgroundColor: variantBg }]}>
              <Text style={[styles.iconText, { color: variantColor }]}>
                {variantIcon}
              </Text>
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: variantColor }]}>
              {state.title}
            </Text>

            {/* Message */}
            {!!state.message && (
              <Text style={styles.message}>{state.message}</Text>
            )}

            {/* Input field */}
            {(state.variant === "input" || state.inputPlaceholder) && (
              <TextInput
                value={state.inputValue}
                onChangeText={(t) => setState((s) => ({ ...s, inputValue: t }))}
                placeholder={state.inputPlaceholder ?? "Enter value..."}
                placeholderTextColor="#9CA3AF"
                multiline={state.inputMultiline}
                style={[
                  styles.input,
                  state.inputMultiline && styles.inputMultiline,
                ]}
                autoFocus
              />
            )}

            {/* Buttons */}
            <View
              style={[
                styles.buttonRow,
                (state.buttons?.length ?? 0) === 1 && styles.buttonRowSingle,
              ]}
            >
              {state.loading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                state.buttons?.map((btn, i) => {
                  const isPrimary = btn.primary;
                  const isDestructive = btn.destructive;
                  const isCancel = btn.cancel;

                  return (
                    <TouchableOpacity
                      key={i}
                      onPress={() => handleButton(btn)}
                      style={[
                        styles.btn,
                        isPrimary && !isDestructive && {
                          backgroundColor: Colors.primary,
                        },
                        isDestructive && { backgroundColor: "#DC2626" },
                        isCancel && styles.btnCancel,
                        (state.buttons?.length ?? 0) === 1 && styles.btnFull,
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.btnText,
                          (isPrimary || isDestructive) && styles.btnTextPrimary,
                          isCancel && styles.btnTextCancel,
                        ]}
                      >
                        {btn.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </DialogContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("useDialog must be used within AppDialogProvider");

  const { showDialog } = ctx;

  /** Simple message dialog — replaces Alert.alert(title, message) */
  const alert = useCallback(
    (
      title: string,
      message?: string,
      variant: DialogVariant = "info"
    ) =>
      showDialog({
        title,
        message,
        variant,
        buttons: [{ label: "OK", primary: true }],
      }),
    [showDialog]
  );

  /** Confirmation dialog — replaces Alert.alert(title, msg, [{Cancel}, {Action, destructive}]) */
  const confirm = useCallback(
    (
      title: string,
      message?: string,
      options?: {
        confirmLabel?: string;
        cancelLabel?: string;
        destructive?: boolean;
        onConfirm?: () => void | Promise<void>;
      }
    ): Promise<boolean> =>
      showDialog({
        title,
        message,
        variant: options?.destructive ? "error" : "confirm",
        buttons: [
          { label: options?.cancelLabel ?? "Cancel", cancel: true },
          {
            label: options?.confirmLabel ?? "Confirm",
            primary: true,
            destructive: options?.destructive,
            onPress: options?.onConfirm,
          },
        ],
      }).then((r) => r.confirmed),
    [showDialog]
  );

  return { showDialog, alert, confirm };
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  iconText: {
    fontSize: 24,
    fontWeight: "900",
  },
  title: {
    fontSize: 17,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  message: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 4,
    fontWeight: "500",
  },
  input: {
    width: "100%",
    height: 48,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 12,
  },
  inputMultiline: {
    height: 88,
    paddingTop: 12,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
    width: "100%",
  },
  buttonRowSingle: {
    justifyContent: "center",
  },
  btn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  btnFull: {
    flex: 1,
  },
  btnCancel: {
    backgroundColor: "#F9FAFB",
    borderColor: "#E5E7EB",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  btnTextPrimary: {
    color: "#fff",
  },
  btnTextCancel: {
    color: "#6B7280",
  },
});
