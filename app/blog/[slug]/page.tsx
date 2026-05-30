"use client";

import { ReactNode } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/tiktok-adgen/navbar";
import { useI18n } from "@/lib/i18n/context";
import { useSession } from "next-auth/react";
import blogPosts from "@/data/blog-posts.json";

const pageI18n = {
  en: {
    backToKnowledge: "← Back to Knowledge Base",
    relatedPosts: "Related Articles",
    tryShopPilot: "Try ShopPilot Free",
    tryShopPilotDesc: "Paste any product link and get a complete TikTok ad pack in 60 seconds.",
    startNow: "Start Now",
  },
  zh: {
    backToKnowledge: "← 返回知识库",
    relatedPosts: "相关文章",
    tryShopPilot: "免费试用 ShopPilot",
    tryShopPilotDesc: "粘贴任意产品链接，60 秒内获得完整的 TikTok 广告包。",
    startNow: "立即开始",
  },
};

function renderMarkdown(content: string) {
  const lines = content.split("\n");
  const elements: ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="mb-6 ml-6 list-disc space-y-2 text-sm leading-7 text-white/60">
          {listItems.map((item, i) => (
            <li key={i}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i} className="font-semibold text-white/80">{part.slice(2, -2)}</strong>;
      }
      const linkMatch = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
      if (linkMatch) {
        const isInternal = linkMatch[2].startsWith("/");
        if (isInternal) {
          return (
            <Link key={i} href={linkMatch[2]} className="text-emerald-300/80 hover:text-emerald-300 underline underline-offset-2">
              {linkMatch[1]}
            </Link>
          );
        }
        return (
          <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-emerald-300/80 hover:text-emerald-300 underline underline-offset-2">
            {linkMatch[1]}
          </a>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushList();
      return;
    }

    if (trimmed.startsWith("# ")) {
      flushList();
      elements.push(
        <h1 key={index} className="mb-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {renderInlineMarkdown(trimmed.slice(2))}
        </h1>
      );
      return;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={index} className="mb-4 mt-10 text-2xl font-bold tracking-tight text-white">
          {renderInlineMarkdown(trimmed.slice(3))}
        </h2>
      );
      return;
    }
    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h3 key={index} className="mb-3 mt-8 text-xl font-semibold text-white">
          {renderInlineMarkdown(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("> ")) {
      flushList();
      elements.push(
        <blockquote key={index} className="mb-4 border-l-2 border-emerald-400/40 pl-4 text-sm leading-7 text-white/55 italic">
          {renderInlineMarkdown(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2));
      return;
    }

    flushList();
    elements.push(
      <p key={index} className="mb-4 text-sm leading-7 text-white/60">
        {renderInlineMarkdown(trimmed)}
      </p>
    );
  });

  flushList();
  return <>{elements}</>;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const { locale } = useI18n();
  const t = pageI18n[locale];
  const user = session?.user;

  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen text-white">
        <Navbar isSignedIn={!!user} user={user} />
        <main className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <Link href="/knowledge" className="mt-4 inline-block text-emerald-300/80 hover:text-emerald-300">
            {t.backToKnowledge}
          </Link>
        </main>
      </div>
    );
  }

  const relatedPosts = blogPosts
    .filter((p) => p.slug !== slug)
    .slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title[locale],
    description: post.excerpt[locale],
    datePublished: post.publishDate,
    author: {
      "@type": "Organization",
      name: "ShopPilot",
    },
    publisher: {
      "@type": "Organization",
      name: "ShopPilot",
      url: "https://shoppilot.help",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://shoppilot.help/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />
      <Navbar isSignedIn={!!user} user={user} />

      <main>
        {/* Article Header */}
        <section className="mx-auto max-w-3xl px-5 pb-8 pt-10 sm:px-6 sm:pt-14">
          <Link href="/knowledge" className="mb-6 inline-block text-sm text-white/40 hover:text-white/60 transition-colors">
            {t.backToKnowledge}
          </Link>

          <div className="mb-4 flex items-center gap-3">
            <span className="rounded-full border border-blue-300/20 bg-blue-300/[0.08] px-2.5 py-1 text-[11px] text-blue-100/70">
              {post.category}
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {post.title[locale]}
          </h1>

          <p className="mt-5 text-lg leading-8 text-white/50">
            {post.excerpt[locale]}
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/[0.08] bg-white/[0.035] px-2.5 py-1 text-xs text-white/45"
              >
                {tag}
              </span>
            ))}
          </div>
        </section>

        {/* Article Content */}
        <article className="mx-auto max-w-3xl px-5 pb-16 sm:px-6">
          <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 sm:p-8">
            {renderMarkdown(post.content[locale])}
          </div>
        </article>

        {/* CTA Section */}
        <section className="mx-auto max-w-3xl px-5 pb-16 sm:px-6">
          <div className="rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.06] p-6 sm:p-8 text-center">
            <h3 className="text-xl font-semibold text-white">{t.tryShopPilot}</h3>
            <p className="mt-2 text-sm text-white/50">{t.tryShopPilotDesc}</p>
            <Link
              href="/storyboard"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-white px-6 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              {t.startNow}
            </Link>
          </div>
        </section>

        {/* Related Posts */}
        <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-6">
          <h2 className="mb-8 text-2xl font-bold tracking-tight">{t.relatedPosts}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.map((related) => (
              <Link
                key={related.slug}
                href={`/blog/${related.slug}`}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.06]"
              >
                <span className="mb-3 inline-block rounded-full border border-blue-300/20 bg-blue-300/[0.08] px-2.5 py-1 text-[11px] text-blue-100/70">
                  {related.category}
                </span>
                <h3 className="mb-2 text-base font-semibold text-white group-hover:text-emerald-100 transition-colors">
                  {related.title[locale]}
                </h3>
                <p className="text-sm text-white/45 line-clamp-2">{related.excerpt[locale]}</p>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Link href="/" className="hover:text-white/50 transition-colors">
            ShopPilot
          </Link>
          <div>Pet product marketing blog</div>
          <div>2026 ShopPilot.help</div>
        </div>
      </footer>
    </div>
  );
}
