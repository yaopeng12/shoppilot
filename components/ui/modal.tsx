import * as React from "react";
import { cn } from "./cn";

export function Modal({
  open,
  title,
  onClose,
  children,
  className,
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4 py-6 animate-fade-in">
      <div
        className={cn(
          "w-full max-w-lg rounded-2xl border border-white/[0.1] bg-[#0c0c10]/95 backdrop-blur-xl shadow-2xl shadow-black/50",
          "animate-fade-in-up",
          className
        )}
      >
        <div className="px-6 pt-6 flex items-center justify-between gap-3">
          <div className="text-lg font-semibold">{title}</div>
          <button
            type="button"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
            onClick={onClose}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-6 pb-6 pt-4">{children}</div>
      </div>
    </div>
  );
}
