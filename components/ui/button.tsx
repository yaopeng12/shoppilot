import * as React from "react";
import { cn } from "./cn";

type Variant = "primary" | "secondary" | "ghost" | "gradient";
type Size = "sm" | "md" | "lg";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 select-none",
        "rounded-xl",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:ring-offset-2 focus:ring-offset-black",
        "active:scale-[0.97]",
        size === "sm" && "px-4 py-2 text-sm",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "lg" && "px-7 py-3.5 text-base",
        variant === "primary" &&
          "text-black bg-white hover:bg-white/90 shadow-lg shadow-white/10 hover:shadow-white/20",
        variant === "secondary" &&
          "text-white/90 border border-white/[0.12] bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 backdrop-blur-sm",
        variant === "ghost" &&
          "text-white/70 hover:text-white hover:bg-white/[0.06]",
        variant === "gradient" &&
          "text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30",
        className
      )}
      {...props}
    />
  );
}
