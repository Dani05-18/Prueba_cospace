"use client";

import { useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";

export function ClientClock() {
  const { t, language } = useI18n();
  const [mounted, setMounted] = useState<boolean>(false);
  const [clientTime, setClientTime] = useState<string>("");
  const [timeZoneName, setTimeZoneName] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const updateTime = (): void => {
      const now = new Date();
      setClientTime(
        now.toLocaleTimeString(language === "es" ? "es-CO" : "en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
      setTimeZoneName(Intl.DateTimeFormat().resolvedOptions().timeZone);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [language]);

  if (!mounted) {
    return (
      <div className="text-xs text-slate-500 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
        <span>{t.clock.bogotaNotice}</span>
      </div>
    );
  }

  return (
    <div className="text-xs text-slate-600 flex items-center gap-2 bg-purple-50 px-3.5 py-1.5 rounded-full border border-purple-100 shadow-xs">
      <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
      <span className="font-bold text-purple-700">{clientTime}</span>
      <span className="text-slate-400">({timeZoneName})</span>
    </div>
  );
}
