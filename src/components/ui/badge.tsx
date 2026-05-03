import type { HTMLAttributes } from "react";

import { cn } from "../../lib/utils";

type BadgeVariant = "paid" | "due" | "overdue" | "draft";

const variants: Record<BadgeVariant, string> = {
  paid: "bg-success/10 text-success",
  due: "bg-warning/15 text-warning",
  overdue: "bg-destructive/10 text-destructive",
  draft: "bg-muted text-muted-foreground",
};

export function Badge({
  variant,
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
