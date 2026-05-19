import * as React from "react";
import { cn } from "./cn";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl px-4 py-3.5 text-sm",
        "bg-white/[0.04] border border-white/[0.1]",
        "text-white placeholder:text-white/30",
        "transition-all duration-200",
        "focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20",
        "hover:border-white/20",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "w-full rounded-xl px-4 py-3.5 text-sm",
        "bg-white/[0.04] border border-white/[0.1]",
        "text-white placeholder:text-white/30",
        "transition-all duration-200",
        "focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-500/20",
        "hover:border-white/20",
        "resize-none",
        className
      )}
      {...props}
    />
  );
}
