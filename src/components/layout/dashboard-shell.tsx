"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  FileText,
  Layers,
  LayoutDashboard,
  Receipt,
  ScrollText,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import { dashboardNavItems } from "../../lib/dashboard-nav";
import { cn } from "../../lib/utils";
import { LogoutButton } from "../auth/logout-button";
import { inputFieldClass } from "../ui/field-classes";
import { LocaleToggle } from "./locale-toggle";
import { PageTransition } from "./page-transition";
import { ThemeToggle } from "./theme-toggle";

const navIcons = {
  layout: LayoutDashboard,
  invoice: FileText,
  receipt: Receipt,
  users: Users,
  journal: ScrollText,
  accounts: Layers,
  chart: BarChart3,
  settings: Settings,
} as const;

type DashboardShellProps = {
  userName: string | null | undefined;
  locale: "en" | "ar";
  children: ReactNode;
};

function initials(name: string | null | undefined) {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

function NavLinks({
  onNavigate,
  pathname,
  locale,
}: {
  onNavigate?: () => void;
  pathname: string | null;
  locale: "en" | "ar";
}) {
  return (
    <>
      {dashboardNavItems.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname?.startsWith(item.href));

        const Icon = navIcons[item.icon];
        const label = locale === "ar" ? item.labelAr : item.label;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "relative flex h-10 items-center gap-3 rounded-md px-3 text-sm transition-colors",
              active
                ? "border-s-2 border-primary bg-primary/10 font-medium text-primary"
                : "border-s-2 border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0 opacity-80" aria-hidden />
            <span className="min-w-0 truncate">{label}</span>
          </Link>
        );
      })}
    </>
  );
}

export function DashboardShell({
  userName,
  locale,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const searchPlaceholder =
    locale === "ar" ? "ابحث عن فاتورة، عميل، أو حركة…" : "Search invoices, customers, entries…";

  const brandTitle = locale === "ar" ? "محاسبي Cloud" : "Muhasabi Cloud";

  const slideX = locale === "ar" ? "100%" : "-100%";

  return (
    <div className="flex min-h-screen bg-muted">
      <aside className="hidden w-60 shrink-0 flex-col border-e border-border bg-card py-6 ps-3 pe-2 shadow-sm lg:flex">
        <div className="flex items-center gap-3 px-3 pb-6">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground"
            aria-hidden
          >
            م
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold tracking-tight text-foreground">
              {brandTitle}
            </p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-0.5 pe-1">
          <NavLinks pathname={pathname} locale={locale} />
        </nav>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-background">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card px-4 shadow-sm md:px-6">
          <div className="flex min-w-0 shrink-0 items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-border bg-card px-3 text-sm font-medium text-foreground lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="dashboard-mobile-nav"
              onClick={() => setMobileOpen((o) => !o)}
            >
              {locale === "ar" ? "القائمة" : "Menu"}
            </button>
            <div className="hidden min-w-0 sm:block">
              <p className="text-xs text-muted-foreground">
                {locale === "ar" ? "مسجّل الدخول كـ" : "Signed in as"}
              </p>
              <p className="truncate text-sm font-medium text-foreground">
                {userName}
              </p>
            </div>
          </div>

          <div className="mx-auto hidden min-w-0 max-w-xl flex-1 md:block">
            <label className="sr-only" htmlFor="global-search">
              {locale === "ar" ? "بحث" : "Search"}
            </label>
            <div className="relative">
              <input
                id="global-search"
                type="search"
                placeholder={searchPlaceholder}
                className={cn(inputFieldClass, "h-9 w-full pe-3 ps-9")}
                readOnly
                aria-readonly="true"
              />
              <span className="pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                ⌘K
              </span>
            </div>
          </div>

          <div className="ms-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-md border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={locale === "ar" ? "الإشعارات" : "Notifications"}
            >
              <Bell className="size-4" />
            </button>
            <div
              className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-foreground"
              title={userName ?? ""}
            >
              {initials(userName)}
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <LocaleToggle locale={locale} />
              <ThemeToggle />
              <LogoutButton />
            </div>
          </div>
        </header>

        <div className="flex items-center justify-end gap-2 border-b border-border bg-card px-4 py-2 sm:hidden">
          <LocaleToggle locale={locale} />
          <ThemeToggle />
          <LogoutButton />
        </div>

        <AnimatePresence>
          {mobileOpen ? (
            <motion.div
              key="mobile-drawer"
              id="dashboard-mobile-nav"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
              role="presentation"
              onClick={() => setMobileOpen(false)}
            >
              <motion.aside
                initial={{ x: slideX }}
                animate={{ x: 0 }}
                exit={{ x: slideX }}
                transition={{ type: "spring", stiffness: 380, damping: 36 }}
                className="absolute inset-y-0 start-0 flex w-60 max-w-[85vw] flex-col border-e border-border bg-card p-4 shadow-md"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-semibold text-foreground">
                    {brandTitle}
                  </span>
                  <button
                    type="button"
                    className="shrink-0 rounded-md px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                    onClick={() => setMobileOpen(false)}
                  >
                    {locale === "ar" ? "إغلاق" : "Close"}
                  </button>
                </div>
                <nav className="flex flex-col gap-0.5">
                  <NavLinks
                    pathname={pathname}
                    locale={locale}
                    onNavigate={() => setMobileOpen(false)}
                  />
                </nav>
              </motion.aside>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
    </div>
  );
}
