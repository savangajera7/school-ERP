import React, { createContext, useCallback, useContext, useState } from "react";
import { View, Text, Platform } from "react-native";
import { Colors } from "@/constants/colors";

type ToastType = "success" | "error" | "info";

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: Platform.OS === "web" ? 16 : 48,
          left: 16,
          right: 16,
          zIndex: 9999,
          alignItems: "center",
          gap: 8,
        }}
      >
        {toasts.map((t) => (
          <View
            key={t.id}
            style={{
              backgroundColor:
                t.type === "error"
                  ? "#fef2f2"
                  : t.type === "success"
                    ? "#ecfdf5"
                    : "#eff6ff",
              borderWidth: 1,
              borderColor:
                t.type === "error"
                  ? "#fecaca"
                  : t.type === "success"
                    ? "#a7f3d0"
                    : "#bfdbfe",
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 12,
              maxWidth: 400,
              width: "100%",
            }}
          >
            <Text
              style={{
                color:
                  t.type === "error"
                    ? "#dc2626"
                    : t.type === "success"
                      ? "#059669"
                      : Colors.primary,
                fontWeight: "600",
                textAlign: "center",
              }}
            >
              {t.message}
            </Text>
          </View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
