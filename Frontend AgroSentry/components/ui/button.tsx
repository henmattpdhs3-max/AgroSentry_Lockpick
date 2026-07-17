import { clsx } from "clsx";
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "escalate" | "ghost" | "hero" | "hero-outline";
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        "rounded-md px-4 py-2 font-body font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variant === "primary" && "bg-asp-primary text-white hover:bg-asp-primary/90",
        variant === "secondary" &&
          "border border-asp-primary text-asp-primary hover:bg-asp-primary/5",
        variant === "escalate" && "bg-asp-escalate text-white hover:bg-asp-escalate/90",
        variant === "ghost" && "text-asp-ink hover:bg-asp-bg",
        variant === "hero" && "bg-asp-bg text-asp-ink hover:bg-asp-bg/90",
        variant === "hero-outline" &&
          "border border-white/30 bg-white/10 text-asp-bg hover:bg-white/20",
        className
      )}
      {...props}
    />
  );
}
