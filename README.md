# ShopPilot

> [shoppilot.help](https://shoppilot.help)

AI Copilot for Shopify Sellers — 用 AI 自动化电商内容生产。

## What We Do

ShopPilot 帮助 Shopify 卖家通过 AI 代理自动化以下工作流：

- **商品文案生成** — 自动生成高转化的产品标题、描述和 SEO 元数据
- **TikTok 广告创意** — 输入商品链接，一键生成 Hooks、脚本、配音文案和字幕
- **营销自动化** — AI 驱动的客户回复和营销工作流优化

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + Tailwind CSS 4
- **Language**: TypeScript
- **Auth**: Session-based (HttpOnly cookie)
- **Database**: JSON file (demo mode)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  page.tsx              # Landing page
  tiktok-adgen/page.tsx # TikTok Ad Generator
  api/                  # REST API routes
components/
  tiktok-adgen/         # Feature components
  ui/                   # Reusable UI primitives
lib/
  tiktok-adgen/         # Server-side logic (auth, db, shopify scraper, generator)
data/
  db.json               # Local JSON database (gitignored)
```

## Demo

Visit [/tiktok-adgen](http://localhost:3000/tiktok-adgen) and paste any Shopify product URL to generate ad creatives instantly.
