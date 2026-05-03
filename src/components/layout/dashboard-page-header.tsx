import type { ReactNode } from "react";

type DashboardPageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function DashboardPageHeader({
  title,
  subtitle,
  action,
}: DashboardPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {action ? (
        <div className="flex shrink-0 items-center gap-2 sm:pt-0.5">
          {action}
        </div>
      ) : null}
    </div>
  );
}
