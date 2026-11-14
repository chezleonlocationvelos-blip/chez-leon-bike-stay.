import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex min-h-12 items-center justify-center rounded-xl2 px-6 text-base font-semibold transition disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-forest text-white hover:bg-charcoal"
      : "border border-forest bg-white text-forest hover:bg-sage/20";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
