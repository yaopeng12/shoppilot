"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import { GenerateForm } from "@/components/storyboard/generate-form";
import { TimelineView } from "@/components/storyboard/timeline-view";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { Toast } from "@/components/tiktok-adgen/toast";
import { useToast } from "@/components/tiktok-adgen/use-toast";
import { normalizeUrl } from "@/components/tiktok-adgen/utils";
import { apiFetch } from "@/lib/tiktok-adgen/client";
import { cn } from "@/components/ui/cn";
import { useI18n } from "@/lib/i18n/context";
import type { StoryboardData, VerticalDomainId } from "@/lib/storyboard/types";

type StoryboardResponse = StoryboardData & {
  _usage?: {
    remaining: number;
    limit: number;
  };
};

const pageI18n = {
  en: {
    badge: "Shopify to vertical TikTok storyboard",
    title: "Vertical Video Storyboard Generator",
    desc: "Paste a Shopify product link, choose a niche, and get a scene-by-scene TikTok storyboard with domain-specific shots, proof patterns, narration, and production notes.",
    unlimited: "Unlimited",
    remaining: "remaining today",
    generated: "Storyboard generated!",
    enterUrl: "Please enter a Shopify product link",
    invalidUrl: "Please enter a valid URL",
    limitReached: "Daily limit reached.",
    signInRequired: "Please sign in to generate storyboards.",
    signIn: "Sign in",
    genFailed: "Generation failed",
    form: {
      verticalDomain: "Vertical domain",
      creativeAngle: "Creative angle",
      urlPlaceholder: "Paste Shopify product URL...",
      generate: "Generate Storyboard",
      generating: "Generating...",
      try: "Try:",
      upgrade: "Upgrade",
      verticalOptions: {
        general: "General ecommerce",
        beauty: "Beauty and skincare",
        fashion: "Fashion and accessories",
        home: "Home and lifestyle",
        pet: "Pet products",
        fitness: "Fitness and wellness",
        electronics: "Consumer electronics",
        parenting: "Baby and parenting",
      },
      creativePlaceholders: {
        general: "show the product solving one clear problem, then reinforce with a fast result or testimonial",
        beauty: "routine problem, application texture, immediate finish, realistic expectation, social proof",
        fashion: "show 3 ways to wear it, then zoom into fit and material proof",
        home: "messy problem, simple setup, satisfying transformation, everyday usage",
        pet: "owner problem, pet curiosity, product interaction, calm or happy result",
        fitness: "barrier to workout, quick demo, ease-of-use proof, motivating result",
        electronics: "annoying tech problem, one-tap setup, feature demo, measurable convenience",
        parenting: "parent stress, product setup, calmer routine, practical relief",
      },
    },
  },
  zh: {
    badge: "Shopify 到垂直领域 TikTok 分镜",
    title: "垂直领域视频分镜生成器",
    desc: "粘贴 Shopify 商品链接，选择细分领域，生成包含行业镜头语言、证明结构、旁白和拍摄提示的 TikTok 分镜。",
    unlimited: "无限",
    remaining: "今日剩余",
    generated: "分镜已生成！",
    enterUrl: "请输入 Shopify 商品链接",
    invalidUrl: "请输入有效的 URL",
    limitReached: "今日次数已用完。",
    signInRequired: "请先登录后再生成分镜。",
    signIn: "去登录",
    genFailed: "生成失败",
    form: {
      verticalDomain: "垂直领域",
      creativeAngle: "创意角度",
      urlPlaceholder: "粘贴 Shopify 商品链接...",
      generate: "生成分镜",
      generating: "生成中...",
      try: "试试：",
      upgrade: "升级",
      verticalOptions: {
        general: "通用电商",
        beauty: "美妆护肤",
        fashion: "服饰配件",
        home: "家居生活",
        pet: "宠物用品",
        fitness: "健身健康",
        electronics: "消费电子",
        parenting: "母婴亲子",
      },
      creativePlaceholders: {
        general: "展示产品解决一个明确问题，再用快速结果或用户证明强化信任",
        beauty: "日常痛点、上脸质地、即时妆效、真实预期、社交证明",
        fashion: "展示 3 种穿搭方式，再放大合身度和材质细节",
        home: "凌乱痛点、简单安装、爽感改造、日常使用",
        pet: "主人痛点、宠物好奇、产品互动、安心或开心结果",
        fitness: "运动阻碍、快速演示、易用证明、激励结果",
        electronics: "烦人的技术痛点、一键设置、功能演示、可感知便利",
        parenting: "父母压力、产品设置、更平静的流程、实际减负",
      },
    },
  },
} as const;

export default function StoryboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { locale } = useI18n();
  const t = pageI18n[locale];
  const { message: toast, showToast } = useToast();

  const [url, setUrl] = useState("");
  const [vertical, setVertical] = useState<VerticalDomainId>("beauty");
  const [creativeAngle, setCreativeAngle] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [limitMsg, setLimitMsg] = useState<string | null>(null);
  const [authMsg, setAuthMsg] = useState<string | null>(null);
  const [data, setData] = useState<StoryboardData | null>(null);

  const usage = (data as StoryboardResponse | null)?._usage;

  const usagePill = useMemo(() => {
    if (!usage) return null;
    if (usage.remaining === -1) return { text: t.unlimited, color: "bg-emerald-500" };
    const pct = usage.limit ? usage.remaining / usage.limit : 0;
    const color = pct > 0.5 ? "bg-emerald-500" : pct > 0.2 ? "bg-yellow-400" : "bg-rose-500";
    return { text: `${usage.remaining}/${usage.limit} ${t.remaining}`, color };
  }, [usage, t]);

  async function generate() {
    setErr(null);
    setLimitMsg(null);
    setAuthMsg(null);
    const u = normalizeUrl(url);
    if (!u) {
      setErr(t.enterUrl);
      return;
    }
    try {
      new URL(u);
    } catch {
      setErr(t.invalidUrl);
      return;
    }

    if (!session?.user) {
      router.push("/sign-in");
      return;
    }

    setLoading(true);
    try {
      const r = await apiFetch<StoryboardData & { error?: string; message?: string }>("/api/storyboard", {
        method: "POST",
        body: JSON.stringify({ url: u, vertical, creativeAngle }),
      });
      if (r.status === 429) {
        setLimitMsg(r.data.message || t.limitReached);
        throw new Error(r.data.message || t.limitReached);
      }
      if (!r.ok) throw new Error(r.data.error || t.genFailed);
      setData(r.data);
      showToast(t.generated);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : t.genFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen text-white">
      <Navbar isSignedIn={!!session?.user} user={session?.user} />

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-white/45 mb-4 tracking-wide">
            {t.badge}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
              {t.title}
            </span>
          </h1>
          <p className="text-sm text-white/35 mt-2 max-w-2xl">{t.desc}</p>
        </div>

        {usagePill && (
          <div className="flex items-center justify-end gap-3 mb-5">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-xs text-white/60">
              <span className={cn("w-1.5 h-1.5 rounded-full", usagePill.color)} />
              <span className="whitespace-nowrap">{usagePill.text}</span>
            </div>
          </div>
        )}

        <GenerateForm
          url={url}
          vertical={vertical}
          creativeAngle={creativeAngle}
          loading={loading}
          err={err}
          limitMsg={limitMsg}
          authMsg={authMsg}
          signInLabel={t.signIn}
          labels={t.form}
          onUrlChange={setUrl}
          onVerticalChange={setVertical}
          onCreativeAngleChange={setCreativeAngle}
          onGenerate={generate}
          onUpgrade={() => {}}
          onExample={setUrl}
        />

        {data && (
          <div className="mt-8 animate-fade-in-up">
            <TimelineView data={data} />
          </div>
        )}
      </main>

      <Toast message={toast} />
    </div>
  );
}
