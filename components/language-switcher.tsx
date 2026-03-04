"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import { useLocale } from "@/lib/locale-context";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const switchLanguage = () => {
    const next = locale === "en" ? "ko" : locale === "ko" ? "zh" : "en";
    setLocale(next);
  };

  const titleMap: Record<string, string> = { en: "한국어", ko: "中文", zh: "English" };
  const title = mounted ? titleMap[locale] : "한국어";

  return (
    <Button variant="ghost" size="icon" onClick={switchLanguage} title={title}>
      <Languages className="h-5 w-5" />
      <span className="sr-only">Switch language</span>
    </Button>
  );
}
