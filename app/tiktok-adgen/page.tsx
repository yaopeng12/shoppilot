"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser, useAuth } from "@clerk/nextjs";

import { GenerateForm } from "@/components/tiktok-adgen/generate-form";
import { GenerationResults } from "@/components/tiktok-adgen/generation-results";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { PricingModal } from "@/components/tiktok-adgen/pricing-modal";
import { TeamModal } from "@/components/tiktok-adgen/team-modal";
import { Toast } from "@/components/tiktok-adgen/toast";
import type { GeneratedData, GenerateErrorBody, TeamState } from "@/components/tiktok-adgen/types";
import { useToast } from "@/components/tiktok-adgen/use-toast";
import { normalizeUrl } from "@/components/tiktok-adgen/utils";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import { cn } from "@/components/ui/cn";
import { PLANS, type PlanId, type PublicUser } from "@/lib/tiktok-adgen/types";

type Plans = typeof PLANS;

export default function TikTokAdGenPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const { getToken } = useAuth();
  const { message: toast, showToast } = useToast();

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const [data, setData] = useState<GeneratedData | null>(null);

  const [pricingOpen, setPricingOpen] = useState(false);
  const [plans, setPlans] = useState<Plans | null>(null);

  const [teamOpen, setTeamOpen] = useState(false);
  const [teamState, setTeamState] = useState<TeamState>(null);

  // Build PublicUser from Clerk user
  const user: PublicUser | null = useMemo(() => {
    if (!clerkUser) return null;
    return {
      id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || "",
      name: clerkUser.firstName || clerkUser.username || "",
      plan: (clerkUser.publicMetadata?.plan as PlanId) || "free",
    };
  }, [clerkUser]);

  const usagePill = useMemo(() => {
    const u = data?._usage;
    if (!u) return null;
    if (u.remaining === -1) return { text: "无限", color: "bg-emerald-500" };
    const pct = u.limit ? u.remaining / u.limit : 0;
    const color = pct > 0.5 ? "bg-emerald-500" : pct > 0.2 ? "bg-yellow-400" : "bg-rose-500";
    return { text: `${u.remaining}/${u.limit} 今日剩余`, color };
  }, [data?._usage]);

  const loadPlans = useCallback(async () => {
    const r = await apiFetch<Plans>("/api/plans", { method: "GET" });
    if (r.ok) setPlans(r.data);
  }, []);

  const openPricing = useCallback(() => {
    setPricingOpen(true);
    loadPlans().catch(() => {});
  }, [loadPlans]);

  async function upgradePlan(plan: PlanId) {
    const r = await apiFetch("/api/upgrade", { method: "POST", body: JSON.stringify({ plan }) });
    if (r.ok) {
      showToast("已升级（演示）");
      setPricingOpen(false);
    } else {
      showToast("升级失败");
    }
  }

  const refreshTeam = useCallback(async () => {
    const r = await apiFetch<TeamState>("/api/team/info", { method: "GET" });
    setTeamState(r.ok ? r.data : { _empty: true });
  }, []);

  async function openTeam() {
    setTeamOpen(true);
    const r = await apiFetch<TeamState>("/api/team/info", { method: "GET" });
    setTeamState(r.ok ? r.data : { _empty: true });
  }

  async function generate() {
    setErr(null);
    setLimitMsg(null);
    const u = normalizeUrl(url);
    if (!u) {
      setErr("请输入 Shopify 商品链接");
      return;
    }
    try {
      new URL(u);
    } catch {
      setErr("请输入有效的 URL");
      return;
    }

    setLoading(true);
    try {
      const r = await apiFetch<GeneratedData & GenerateErrorBody>("/api/generate", {
        method: "POST",
        body: JSON.stringify({ url: u }),
      });
      if (r.status === 401) {
        router.push("/sign-in");
        return;
      }
      if (r.status === 429) {
        setLimitMsg(r.data.message || "今日次数已用完");
        throw new Error(r.data.message || "今日次数已用完");
      }
      if (!r.ok) throw new Error(r.data.error || "生成失败");
      setData(r.data);
      showToast("已生成");
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "生成失败");
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast("已复制");
    } catch {
      showToast("复制失败");
    }
  }

  return (
    <div className="min-h-screen text-white">
      <Navbar isSignedIn={!!clerkUser} />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {usagePill && (
          <div className="flex items-center justify-end gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-white/60">
              <span className={cn("w-1.5 h-1.5 rounded-full", usagePill.color)} />
              <span className="whitespace-nowrap">{usagePill.text}</span>
            </div>
            {user?.plan === "team" && (
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg border border-white/[0.1] text-white/50 hover:text-white hover:bg-white/[0.05] text-xs transition-all"
                onClick={openTeam}
              >
                团队
              </button>
            )}
          </div>
        )}
        <GenerateForm
          url={url}
          loading={loading}
          err={err}
          limitMsg={limitMsg}
          onUrlChange={setUrl}
          onGenerate={generate}
          onUpgrade={openPricing}
          onExample={setUrl}
        />
        {data ? <GenerationResults data={data} onCopy={copyText} /> : null}
      </main>

      <Toast message={toast} />

      <PricingModal open={pricingOpen} plans={plans} user={user} onClose={() => setPricingOpen(false)} onUpgrade={upgradePlan} />

      <TeamModal open={teamOpen} teamState={teamState} onClose={() => setTeamOpen(false)} onRefresh={refreshTeam} onToast={showToast} />
    </div>
  );
}
