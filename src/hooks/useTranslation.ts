import { useCallback, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { translations, type TranslationKey } from "@/constants/translations";
import type { Language } from "@/types/auth.types";

export function useTranslation() {
  const language = useAuthStore((s) => s.language);
  const setLanguage = useAuthStore((s) => s.setLanguage);

  const t = useMemo(() => translations[language], [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "en" ? "gu" : "en");
  }, [language, setLanguage]);

  const tr = useCallback(
    (key: TranslationKey) => translations[language][key],
    [language]
  );

  return { t, tr, language, setLanguage, toggleLanguage };
}

export function getGreetingKey(): TranslationKey {
  const h = new Date().getHours();
  if (h < 12) return "goodMorning";
  if (h < 17) return "goodAfternoon";
  return "goodEvening";
}
