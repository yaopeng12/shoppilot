"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { AuthModal } from "@/components/tiktok-adgen/auth-modal";
import { GenerateForm } from "@/components/tiktok-adgen/generate-form";
import { GenerationResults } from "@/components/tiktok-adgen/generation-results";
import { PageHeader } from "@/components/tiktok-adgen/page-header";
import { PricingModal } from "@/components/tiktok-adgen/pricing-modal";
import { TeamModal } from "@/components/tiktok-adgen/team-modal";
import { Toast } from "@/components/tiktok-adgen/toast";
import type { GeneratedData, GenerateErrorBody, TeamState } from "@/components/tiktok-adgen/types";
import { useToast } from "@/components/tiktok-adgen/use-toast";
import { normalizeUrl } from "@/components/tiktok-adgen/utils";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import { PLANS, type PlanId, type PublicUser } from "@/lib/tiktok-adgen/types";

type Plans = typeof PLANS;

export default function TikTokAdGenPage() {
  const { message: toast, showToast } = useToast();

  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const [data, setData] = useState<GeneratedData | null>(null);

  const [user, setUser] = useState<PublicUser | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const [pricingOpen, setPricingOpen] = useState(false);
  const [plans, setPlans] = useState<Plans | null>(null);

  const [teamOpen, setTeamOpen] = useState(false);
  const [teamState, setTeamState] = useState<TeamState>(null);

  const refreshMe = useCallback(async () => {
    const r = await apiFetch<PublicUser>("/api/auth/me", { method: "GET" });
    if (r.ok) setUser(r.data);
    else setUser(null);
  }, []);

  useEffect(() => {
    refreshMe().catch(() => {});
  }, [refreshMe]);

  const usagePill = useMemo(() => {
    const u = user?.usage;
    if (!u) return null;
    if (u.remaining === -1) return { text: "无限", color: "bg-emerald-500" };
    const pct = u.limit ? u.remaining / u.limit : 0;
    const color = pct > 0.5 ? "bg-emerald-500" : pct > 0.2 ? "bg-yellow-400" : "bg-rose-500";
    return { text: `${u.remaining}/${u.limit} 今日剩余`, color };
  }, [user?.usage]);

  const loadPlans = useCallback(async () => {
    const r = await apiFetch<Plans>("/api/plans", { method: "GET" });
    if (r.ok) setPlans(r.data);
  }, []);

  const openPricing = useCallback(() => {
    setPricingOpen(true);
    loadPlans().catch(() => {});
  }, [loadPlans]);

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    showToast("已退出");
  }

  async function upgradePlan(plan: PlanId) {
    const r = await apiFetch("/api/upgrade", { method: "POST", body: JSON.stringify({ plan }) });
    if (r.ok) {
      showToast("已升级（演示）");
      await refreshMe();
      setPricingOpen(false);
    } else {
      showToast("升级失败");
    }
  }

  const refreshTeam = useCallback(async () => {
    const r = await apiFetch<TeamState>("/api/team/info", { method: "GET" });
    setTeamState(r.ok ? r.data : { _empty: true });
    await refreshMe();
  }, [refreshMe]);

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
        setAuthMode("login");
        setAuthOpen(true);
        throw new Error("请先登录");
      }
      if (r.status === 429) {
        setLimitMsg(r.data.message || "今日次数已用完");
        throw new Error(r.data.message || "今日次数已用完");
      }
      if (!r.ok) throw new Error(r.data.error || "生成失败");
      setData(r.data);
      if (r.data._usage) {
        setUser((prev) => (prev ? { ...prev, usage: r.data._usage } : prev));
      } else {
        refreshMe().catch(() => {});
      }
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
    <div className="min-h-screen bg-black text-white">
      <PageHeader
        user={user}
        usagePill={usagePill}
        onOpenPricing={openPricing}
        onOpenTeam={openTeam}
        onOpenLogin={() => {
          setAuthMode("login");
          setAuthOpen(true);
        }}
        onLogout={logout}
      />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">

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

      <AuthModal
        open={authOpen}
        initialMode={authMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={async () => {
          await refreshMe();
          showToast("已登录");
        }}
      />

      <PricingModal open={pricingOpen} plans={plans} user={user} onClose={() => setPricingOpen(false)} onUpgrade={upgradePlan} />

      <TeamModal open={teamOpen} teamState={teamState} onClose={() => setTeamOpen(false)} onRefresh={refreshTeam} onToast={showToast} />
    </div>
  );
}
