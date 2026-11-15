import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base =
    "inline-flex min-h-12 items-center justify-center rounded-xl2 px-6 font-button text-base font-bold transition disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "border border-forest/30 bg-accent text-forest hover:bg-[#dfc89f]"
      : "border border-forest bg-white text-forest hover:bg-sage/20";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
