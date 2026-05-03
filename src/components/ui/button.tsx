import { forwardRef, type ButtonHTMLAttributes } from "react";

import { cn } from "../../lib/utils";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "brand" | "outline" | "ghost" | "destructive";
};

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  brand:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50",
  outline:
    "border border-border bg-card hover:bg-muted text-foreground disabled:opacity-50",
  ghost:
    "text-foreground hover:bg-muted disabled:opacity-50",
  destructive:
    "bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50",
};

const buttonBaseClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Use on `<Link>` when it should match a Button variant (avoids invalid nested interactive). */
export function buttonClassName(
  variant: NonNullable<ButtonProps["variant"]> = "brand",
  className?: string
) {
  return cn(buttonBaseClass, variants[variant], className);
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant = "brand", type = "button", ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(buttonBaseClass, variants[variant], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
