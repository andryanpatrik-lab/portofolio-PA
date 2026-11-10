import type { ComponentProps } from "react";

type Variant = "primary" | "ghost";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: { variant?: Variant } & ComponentProps<"a">) {
  const base =
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-base font-medium";
  const styles =
    variant === "primary"
      ? "bg-accent text-bg-deep btn-primary"
      : "border border-border text-text btn-ghost";
  return <a className={`${base} ${styles} ${className}`} {...props} />;
}
