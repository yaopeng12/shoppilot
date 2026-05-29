"use client";

import { Modal } from "@/components/ui/modal";
import { cn } from "@/components/ui/cn";
import { PLANS, type PlanId, type PublicUser } from "@/lib/tiktok-adgen/types";

type Plans = typeof PLANS;

export function PricingModal({
  open,
  plans,
  user,
  onClose,
  onUpgrade,
}: {
  open: boolean;
  plans: Plans | null;
  user: PublicUser | null;
  onClose: () => void;
  onUpgrade: (plan: PlanId) => void;
}) {
  return (
    <Modal
      open={open}
      title="选择方案"
      onClose={onClose}
      className="max-w-4xl"
    >
      <div className="grid md:grid-cols-2 gap-3">
        {(
          Object.entries(plans || {}) as Array<
            [PlanId, (typeof PLANS)[PlanId]]
          >
        ).map(([pid, p]) => {
          const isCurrent = user?.plan === pid;
          const isPopular = pid === "pro";
          return (
            <div
              key={pid}
              className={cn(
                "rounded-2xl border p-5 transition-all duration-300 relative",
                isCurrent
                  ? "border-violet-500/40 bg-violet-500/[0.05]"
                  : isPopular
                    ? "border-white/[0.14] bg-white/[0.04]"
                    : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
              )}
            >
              {isPopular ? (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-[10px] font-medium tracking-wide">
                  POPULAR
                </div>
              ) : null}
              <div className="text-sm font-semibold">{p.name}</div>
              <div className="mt-2 text-3xl font-bold tracking-tight">
                ${p.price}
              </div>
              <div className="text-xs text-white/35">
                {pid === "free" ? "免费开始" : "演示升级"}
              </div>
              <ul className="mt-4 space-y-2">
                {p.features.map((f, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-xs text-white/50"
                  >
                    <span className="text-emerald-400 mt-px">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M3 8.5l3.5 3.5 6.5-8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-5">
                {isCurrent ? (
                  <div className="w-full py-2 rounded-xl bg-white/[0.06] text-white/40 text-xs text-center cursor-default border border-white/[0.06]">
                    当前方案
                  </div>
                ) : (
                  <button
                    type="button"
                    className={cn(
                      "w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.97]",
                      isPopular
                        ? "bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg shadow-violet-500/20 hover:from-violet-500 hover:to-blue-500"
                        : "bg-white text-black hover:bg-white/90 shadow-lg shadow-white/10"
                    )}
                    onClick={() => onUpgrade(pid)}
                  >
                    升级到 {p.name}
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {!plans ? (
          <div className="text-white/30 text-sm col-span-3 text-center py-8">
            加载中...
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
