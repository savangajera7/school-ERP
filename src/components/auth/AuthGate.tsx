import React, { useState, useEffect } from "react";
import { Slot } from "expo-router";
import { useAuthGuard } from "@/hooks/useAuth";

/** Wraps app tree — enforces login + role group routing */
export function AuthGate() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <AuthGuardContent />;
}

function AuthGuardContent() {
  useAuthGuard();
  return <Slot />;
}
