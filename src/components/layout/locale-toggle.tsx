"use client";

import { useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";

import { cn } from "../../lib/utils";

const COOKIE = "muhasabi-locale";

export function LocaleToggle({ locale }: { locale: "en" | "ar" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const switchLocale = useCallback(
    (next: "en" | "ar") => {
      if (next === locale) return;
      document.cookie = `${COOKIE}=${next};path=/;max-age=31536000;SameSite=Lax`;
      startTransition(() => router.refresh());
    },
    [locale, router]
  );

  return (
    <div
      className="flex rounded-md border border-border bg-muted/50 p-0.5 text-xs font-medium"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => switchLocale("en")}
        disabled={pending}
        className={cn(
          "rounded px-2 py-1 transition-colors focus-visible:ring-offset-1",
          locale === "en"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => switchLocale("ar")}
        disabled={pending}
        className={cn(
          "rounded px-2 py-1 transition-colors focus-visible:ring-offset-1",
          locale === "ar"
            ? "bg-card text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        عربي
      </button>
    </div>
  );
}
