import React from "react";
import { Slot } from "expo-router";
import { useAuthGuard } from "@/hooks/useAuth";

/** Wraps app tree — enforces login + role group routing */
export function AuthGate() {
  useAuthGuard();
  return <Slot />;
}
