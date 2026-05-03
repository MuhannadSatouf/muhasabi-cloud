"use client";

import { useCallback, useSyncExternalStore } from "react";

import { Button } from "../ui/button";

function readDark() {
  return document.documentElement.classList.contains("dark");
}

function subscribeDark(onStoreChange: () => void) {
  const el = document.documentElement;
  const obs = new MutationObserver(onStoreChange);
  obs.observe(el, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribeDark, readDark, () => false);

  const toggle = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
  }, []);

  return (
    <Button
      type="button"
      variant="outline"
      className="h-9 px-3 text-xs"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {dark ? "Light" : "Dark"}
    </Button>
  );
}
