import { clsx } from "clsx";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "primary" | "grounded" | "escalate" | "reject" | "neutral";
}

export function Badge({ tone = "neutral", className, ...props }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone === "primary" && "bg-asp-primary/10 text-asp-primary",
        tone === "grounded" && "bg-asp-grounded/10 text-asp-grounded",
        tone === "escalate" && "bg-asp-escalate/10 text-asp-escalate",
        tone === "reject" && "bg-asp-reject/10 text-asp-reject",
        tone === "neutral" && "bg-asp-ink/5 text-asp-ink/70",
        className
      )}
      {...props}
    />
  );
}
