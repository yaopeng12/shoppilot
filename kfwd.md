# TikTok Script Factory — 产品需求文档 (PRD)

> **版本**：v1.0
> **日期**：2026-05-20
> **定位**：TikTok带货视频脚本智能生成工具
> **目标用户**：TikTok Shop卖家 / Shopify独立站卖家 / 跨境电商个人创业者
> **一句话**：输入产品 → 输出可直接拍摄的爆款脚本

---

## 一、市场背景与机会

### 1.1 用户画像

| 维度 | 描述 |
|------|------|
| **核心用户** | 中国跨境电商卖家（个人/小团队，1-5人） |
| **次核心用户** | TikTok带货达人/MCN机构 |
| **典型场景** | 一个人做TikTok Shop，每天需要产出3-5条带货视频，不会写英文脚本，不知道什么结构能火 |
| **付费能力** | 月均工具预算 ¥200-500（$30-70） |
| **分布渠道** | 小红书、TT123卖家社区、雨果跨境、抖音跨境圈、独立站圈子 |

### 1.2 竞品空白

| 现有方案 | 缺陷 |
|---------|------|
| ChatGPT/Claude直接写 | 不懂TikTok爆款结构，输出通用文案，没有"原生感" |
| CreatOK.ai / Sora | 重视频生成，轻脚本，且AI视频完播率低 |
| 请写手/外包 | 贵（50-200元/条）、慢（1-3天）、不懂产品 |
| 妙手/Kalodata | 选品工具，不做内容生成 |
| **本产品** | **专注脚本层，打通"爆款分析→脚本生成→A/B变体"全链路，市场空白** |

### 1.3 核心价值主张

```
传统路径：想idea → 写脚本 → 改脚本 → 拍摄 → 剪辑 → 发布 → 看数据（7天+）
本产品 ：输入产品 → 10条脚本 → 选最优 → 拍摄 → 发布 → 看数据（1天）
                                                      ↑ 效率提升 7倍
```

---

## 二、产品架构

### 2.1 系统总览

```
┌─────────────────────────────────────────────────────────────┐
│                    TikTok Script Factory                     │
│                                                              │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐ │
│  │ 爆款拆解  │ → │ 脚本生成  │ → │ A/B变体  │ → │ 效果追踪 │ │
│  │  引擎     │   │  引擎     │   │  工厂     │   │  面板     │ │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘ │
│       ↑               ↑              ↑              ↑       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              爆款视频知识库（持续更新）                   │   │
│  │  · 结构模板库  · Hook库  · 品类词库  · 本地化语料库    │   │
│  └──────────────────────────────────────────────────────┘   │
│       ↑               ↑              ↑              ↑       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    LLM 推理层                         │   │
│  │         GPT-4o / Claude / MiMo（可切换）              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 数据流

```
用户输入                        系统处理                        用户输出
────────                        ────────                        ────────
产品链接/关键词    ──→    产品信息提取 + 品类识别    ──→    产品画像
       ↓                                                      ↓
竞品视频URL(可选)  ──→    视频结构拆解             ──→    结构模板
       ↓                                                      ↓
选择风格/语言      ──→    LLM脚本生成              ──→    10条脚本
       ↓                                                      ↓
选择脚本           ──→    A/B变体生成              ──→    5个变体
       ↓                                                      ↓
发布后填写数据      ──→    效果分析 + 优化建议       ──→    迭代脚本
```

---

## 三、功能模块详细设计

---

## 🔄 开发周期一（Cycle 1）：核心引擎 + MVP

> **目标**：跑通"输入产品 → 输出脚本"的最小闭环
> **周期**：4周
> **交付物**：可用的Web端MVP，支持中英文

### 3.1 爆款拆解引擎

#### 3.1.1 功能描述

用户输入一个TikTok带货视频URL，系统自动拆解出该视频的脚本结构、hook类型、节奏模式、CTA方式，形成可复用的结构模板。

#### 3.1.2 输入

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| video_url | string | ✅ | TikTok视频链接 |
| product_category | string | ❌ | 产品品类（如"美妆""3C""家居"），不填则自动识别 |

#### 3.1.3 输出

```json
{
  "video_info": {
    "title": "视频标题",
    "views": 1200000,
    "likes": 89000,
    "comments": 3400,
    "engagement_rate": "7.8%",
    "duration_seconds": 23
  },
  "structure_analysis": {
    "hook": {
      "type": "痛点共鸣型",
      "text": "I spent $300 on skincare and my skin got WORSE...",
      "duration_seconds": 3,
      "technique": "反常识 + 金额锚定 + 悬念"
    },
    "body": {
      "structure": "问题→尝试→转折→展示",
      "segments": [
        {"time": "0-3s", "content": "痛点陈述", "emotion": "焦虑"},
        {"time": "3-8s", "content": "尝试其他方案失败", "emotion": "失望"},
        {"time": "8-15s", "content": "发现产品 + 使用过程", "emotion": "惊喜"},
        {"time": "15-20s", "content": "效果展示 + 对比", "emotion": "满足"}
      ]
    },
    "cta": {
      "type": "软引导",
      "text": "Link in bio if you want to try it",
      "placement": "结尾自然带出"
    },
    "tone": "朋友分享、口语化、有情绪起伏",
    "language_style": "casual American English, Gen-Z slang"
  },
  "reusable_template": {
    "template_id": "pain_point_turn_001",
    "template_name": "痛点共鸣-转折展示型",
    "applicable_categories": ["美妆", "护肤", "个护"],
    "structure": "[痛点hook] → [失败尝试] → [产品转折] → [效果展示] → [软CTA]"
  }
}
```

#### 3.1.4 技术方案

| 步骤 | 实现方式 |
|------|---------|
| 视频信息抓取 | TikTok页面解析 / 第三方API（如EchoTik）获取标题、播放量、点赞数 |
| 字幕/口播提取 | 视频音频 → Whisper转录 → 文本 |
| 结构分析 | LLM分析转录文本，提取hook/结构/CTA/tone |
| 模板生成 | LLM将分析结果抽象为可复用模板，存入模板库 |

#### 3.1.5 数据结构

```sql
-- 爆款视频库
CREATE TABLE viral_videos (
    id UUID PRIMARY KEY,
    video_url TEXT NOT NULL,
    platform VARCHAR(20) DEFAULT 'tiktok',
    title TEXT,
    views BIGINT,
    likes INT,
    comments INT,
    shares INT,
    duration_seconds INT,
    category VARCHAR(50),
    transcript TEXT,
    hook_type VARCHAR(50),
    structure_type VARCHAR(50),
    cta_type VARCHAR(50),
    tone VARCHAR(100),
    language VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

-- 结构模板库
CREATE TABLE script_templates (
    id UUID PRIMARY KEY,
    template_name VARCHAR(100),
    template_code VARCHAR(50) UNIQUE,  -- e.g. "pain_point_turn_001"
    structure TEXT,                      -- 结构描述
    hook_pattern TEXT,                   -- hook模式
    body_pattern TEXT,                   -- 正文模式
    cta_pattern TEXT,                    -- CTA模式
    applicable_categories JSONB,         -- 适用品类
    avg_engagement_rate DECIMAL(5,2),   -- 该模板平均互动率
    sample_count INT DEFAULT 0,         -- 样本数量
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 品类知识库
CREATE TABLE category_knowledge (
    id UUID PRIMARY KEY,
    category VARCHAR(50),
    sub_category VARCHAR(50),
    top_hooks JSONB,                    -- 该品类最有效的hook类型
    pain_points JSONB,                  -- 该品类用户常见痛点
    keywords JSONB,                     -- 高频关键词
    language_style JSONB,               -- 语言风格指南
    updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 3.2 脚本生成引擎

#### 3.2.1 功能描述

用户输入产品信息（链接/关键词/描述），系统结合爆款模板库和品类知识库，批量生成多条不同风格的带货脚本。

#### 3.2.2 输入

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| product_url | string | ❌ | 产品链接（Shopify/1688/Amazon） |
| product_name | string | ✅ | 产品名称 |
| product_desc | string | ❌ | 产品描述 |
| product_price | string | ❌ | 价格 |
| target_market | enum | ✅ | 目标市场：us / uk / th / id / ph / vn / my / jp / mx / br |
| script_style | enum[] | ❌ | 脚本风格（可多选），默认全部 |
| script_count | int | ❌ | 生成数量，默认10 |
| competitor_video_url | string | ❌ | 竞品视频URL（用于参考结构） |

#### 3.2.3 脚本风格枚举

| 风格 | 代号 | 描述 | 适用场景 |
|------|------|------|---------|
| 痛点共鸣 | pain_point | 从用户痛点切入，引发共鸣 | 美妆/护肤/个护 |
| 测评对比 | review_compare | "试了X个，只有这个..." | 3C/工具/家居 |
| 场景种草 | scene_seed | 在具体生活场景中自然展示 | 家居/厨房/户外 |
| 反转型 | plot_twist | "差点退货，结果..." | 全品类通用 |
| 开箱惊喜 | unboxing | 开箱过程 + 惊喜反应 | 礼品/潮玩/数码 |
| 教程教学 | tutorial | "教你3步搞定..." | 工具/美妆/烹饪 |
| 痛点吐槽 | rant_then_fix | 先吐槽问题再给方案 | 全品类通用 |
| 社交证明 | social_proof | "100万人买的..." / "朋友推荐" | 全品类通用 |

#### 3.2.4 输出示例

```json
{
  "product": {
    "name": "折叠硅胶沥水篮",
    "category": "厨房家居",
    "price": "$12.99",
    "target_market": "us"
  },
  "scripts": [
    {
      "script_id": "scr_001",
      "style": "pain_point",
      "language": "en",
      "target_market": "us",
      "duration_target": "20-25s",
      "hook": {
        "text": "If your kitchen is the size of a closet like mine, you NEED to see this",
        "type": "痛点共鸣 + 身份认同",
        "duration": "0-3s"
      },
      "body": [
        {
          "time": "3-7s",
          "action": "展示小厨房的拥挤场景",
          "narration": "I literally have zero counter space. Drying dishes? Forget about it."
        },
        {
          "time": "7-12s",
          "action": "拿出折叠沥水篮，展开过程",
          "narration": "Then I found THIS. It folds flat — like, flat flat. Slides right next to the sink."
        },
        {
          "time": "12-18s",
          "action": "使用演示：放碗碟、沥水、然后折叠收起",
          "narration": "Unfolds in one second, holds all my dishes, and when I'm done? Gone. Literally disappears."
        },
        {
          "time": "18-22s",
          "action": "对比：有vs没有的空间差异",
          "narration": "My counter went from disaster zone to actually usable. Twelve bucks. That's it."
        }
      ],
      "cta": {
        "text": "Link's in my bio if your kitchen hates you too",
        "type": "共鸣式软引导"
      },
      "tone_notes": "口语化、有情绪起伏、像跟朋友吐槽",
      "filming_tips": "手持拍摄，保留厨房自然光线，不需要专业打光",
      "bgm_suggestion": "轻快lo-fi beat，音量低于口播"
    },
    {
      "script_id": "scr_002",
      "style": "plot_twist",
      "language": "en",
      "target_market": "us",
      "duration_target": "18-22s",
      "hook": {
        "text": "I almost returned this $12 thing... then it saved my entire kitchen",
        "type": "反转悬念",
        "duration": "0-3s"
      },
      "body": [
        {
          "time": "3-6s",
          "action": "展示收到快递，表情嫌弃",
          "narration": "Opened the package, saw this flat piece of silicone, and thought — I got scammed."
        },
        {
          "time": "6-10s",
          "action": "展开沥水篮，表情从怀疑到意外",
          "narration": "But then I unfolded it and... wait, this actually fits over my sink?"
        },
        {
          "time": "10-16s",
          "action": "实际使用，碗碟沥水过程",
          "narration": "Holds everything. Plates, cups, even my giant wok. Water goes straight into the sink."
        },
        {
          "time": "16-20s",
          "action": "折叠收起，竖起大拇指",
          "narration": "And when I'm done? Folds into nothing. Best twelve dollars I've ever spent. Period."
        }
      ],
      "cta": {
        "text": "Check the link before it sells out",
        "type": "紧迫感引导"
      },
      "tone_notes": "从怀疑到惊喜的情绪弧线，有反转感",
      "filming_tips": "前半段故意拍得随意，后半段展示效果时可以稍微精致一点，形成反差"
    }
  ],
  "generation_meta": {
    "templates_used": ["pain_point_turn_001", "plot_twist_002"],
    "category_pain_points_used": ["厨房空间小", "沥水收纳麻烦"],
    "generated_at": "2026-05-20T01:45:00Z"
  }
}
```

#### 3.2.5 LLM Prompt 设计框架

```
System Prompt 结构：
┌─────────────────────────────────────────────┐
│ 角色定义                                     │
│ "你是一个TikTok带货视频脚本专家，               │
│  擅长写出高完播率、高转化的原生感脚本"             │
├─────────────────────────────────────────────┤
│ 核心规则                                     │
│ 1. 前3秒必须有强hook（痛点/悬念/反常识）         │
│ 2. 语言必须口语化，像朋友聊天，禁止广告腔          │
│ 3. 总时长控制在15-30秒                         │
│ 4. 包含具体使用场景，不要抽象描述                 │
│ 5. CTA要自然，不要硬广                         │
│ 6. 适配目标市场的本地化表达                      │
├─────────────────────────────────────────────┤
│ 品类知识注入                                   │
│ {category_pain_points}                       │
│ {top_hooks_for_category}                     │
│ {language_style_guide}                       │
├─────────────────────────────────────────────┤
│ 参考模板注入                                   │
│ {template_structure}                         │
│ {sample_scripts}                             │
├─────────────────────────────────────────────┤
│ 用户输入                                       │
│ 产品信息：{product_info}                       │
│ 目标市场：{target_market}                      │
│ 风格偏好：{script_style}                       │
└─────────────────────────────────────────────┘
```

#### 3.2.6 API 设计

```
POST /api/v1/scripts/generate

Request:
{
  "product": {
    "name": "折叠硅胶沥水篮",
    "url": "https://shop.example.com/product/123",  // optional
    "description": "可折叠硅胶材质...",               // optional
    "price": "$12.99",
    "images": ["url1", "url2"]                       // optional
  },
  "target_market": "us",
  "styles": ["pain_point", "plot_twist", "scene_seed"],
  "count": 10,
  "competitor_video_url": "https://tiktok.com/...",   // optional
  "language": "en"
}

Response:
{
  "request_id": "req_abc123",
  "product_category": "厨房家居",
  "auto_detected_pain_points": ["厨房空间小", "收纳困难"],
  "scripts": [ ... ],
  "generation_meta": { ... }
}
```

---

### 3.3 用户界面（Cycle 1 最简版）

#### 3.3.1 页面结构

```
┌─────────────────────────────────────────────────────┐
│  🎬 TikTok Script Factory                    [登录]  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  📦 产品信息                                  │   │
│  │  产品名称：[折叠硅胶沥水篮          ]          │   │
│  │  产品链接：[https://...             ] (选填)   │   │
│  │  产品价格：[$12.99                  ] (选填)   │   │
│  │  目标市场：[🇺🇸 美国 ▼]                        │   │
│  │                                               │   │
│  │  🎯 脚本风格（可多选）                          │   │
│  │  [✓] 痛点共鸣  [✓] 反转型  [ ] 测评对比       │   │
│  │  [ ] 场景种草  [ ] 开箱惊喜  [ ] 教程教学      │   │
│  │                                               │   │
│  │  📹 竞品参考（选填）                            │   │
│  │  [粘贴TikTok视频链接，用于拆解结构    ]         │   │
│  │                                               │   │
│  │  生成数量：[10] 条                             │   │
│  │                                               │   │
│  │  [ 🚀 生成脚本 ]                               │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ─ ─ ─ ─ ─ ─ ─ 生成结果 ─ ─ ─ ─ ─ ─ ─             │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  脚本 #1  [痛点共鸣] [🇺🇸] [20-25s]          │   │
│  │  ─────────────────────────────────────────── │   │
│  │  🎣 Hook:                                    │   │
│  │  "If your kitchen is the size of a closet    │   │
│  │   like mine, you NEED to see this"           │   │
│  │                                               │   │
│  │  📝 完整脚本：                                │   │
│  │  [展开查看]                                   │   │
│  │                                               │   │
│  │  🎬 拍摄建议：手持拍摄，保留自然光线             │   │
│  │  🎵 BGM建议：轻快lo-fi beat                   │   │
│  │                                               │   │
│  │  [📋 复制] [✏️ 编辑] [🔄 生成变体] [⭐ 收藏]  │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  ┌─────────────────────────────────────────────┐   │
│  │  脚本 #2  [反转型] [🇺🇸] [18-22s]            │   │
│  │  ...                                         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└─────────────────────────────────────────────────────┘
```

#### 3.3.2 页面清单（Cycle 1）

| 页面 | 路由 | 功能 |
|------|------|------|
| 首页/Landing | `/` | 产品介绍 + 免费试用入口 |
| 脚本生成 | `/generate` | 核心功能页 |
| 脚本详情 | `/script/:id` | 单条脚本详情 + 编辑 |
| 我的脚本 | `/my-scripts` | 历史脚本列表 |
| 爆款拆解 | `/analyze` | 输入视频URL，输出结构分析 |
| 登录/注册 | `/auth` | 邮箱 + Google OAuth |

---

### 3.4 技术栈（Cycle 1）

| 层级 | 技术选型 | 理由 |
|------|---------|------|
| 前端 | Next.js 14 + Tailwind | 快速开发，SEO友好 |
| 后端 | Node.js + Express | 轻量，快速迭代 |
| 数据库 | PostgreSQL | 结构化数据，支持JSONB |
| LLM | GPT-4o（主）+ Claude 3.5（备） | 多语言能力强，脚本质量高 |
| 部署 | Vercel（前端）+ Railway（后端） | 零运维，快速上线 |
| 认证 | NextAuth.js | 快速接入Google/邮箱登录 |
| 支付 | Stripe | 国际化支付，支持订阅 |

### 3.5 Cycle 1 里程碑

| 周 | 任务 | 交付物 |
|---|------|--------|
| W1 | 爆款拆解引擎核心逻辑 | 视频URL → 结构分析 的API |
| W2 | 脚本生成引擎 + Prompt工程 | 产品信息 → 10条脚本 的API |
| W3 | 前端页面 + 联调 | 可用的Web端MVP |
| W4 | 内测 + 修bug + 获客准备 | 20个种子用户测试 |

**Cycle 1 验证指标**：
- [ ] 20个种子用户完成注册
- [ ] 10个用户生成过至少1次脚本
- [ ] 5个用户用脚本实际拍摄并发布
- [ ] 收集3个"用了脚本后的视频数据"案例

---

## 🔄 开发周期二（Cycle 2）：A/B变体 + 本地化 + 付费

> **目标**：提升产品粘性，打通付费闭环
> **周期**：3周
> **前置条件**：Cycle 1 验证通过（用户付费意愿确认）

### 3.6 A/B变体工厂

#### 3.6.1 功能描述

用户选定一条脚本后，系统自动生成多个变体，用于TikTok投流测试，快速找到最优版本。

#### 3.6.2 变体维度

| 维度 | 变量 | 示例 |
|------|------|------|
| Hook替换 | 保持正文，换不同开头 | 痛点型 → 悬念型 → 数字型 |
| 语气切换 | 同内容不同语气 | 朋友分享 → 专业测评 → 吐槽 |
| 时长调整 | 压缩/扩展 | 20s → 15s（快节奏）/ 30s（详细版） |
| CTA变体 | 换结尾引导方式 | 软引导 → 紧迫感 → 社交证明 |
| 开场方式 | 前3秒不同切入 | 直接展示 → 提问 → 数字冲击 |

#### 3.6.3 输出示例

```json
{
  "original_script_id": "scr_001",
  "variants": [
    {
      "variant_id": "var_001_a",
      "change_dimension": "hook替换",
      "changes": {
        "hook": {
          "text": "POV: Your kitchen is 50 sqft and you just found the PERFECT dish rack",
          "type": "POV叙事 + 数字锚定"
        }
      },
      "rest_of_script": "同原脚本",
      "diff_summary": "仅hook从痛点共鸣改为POV叙事，正文不变"
    },
    {
      "variant_id": "var_001_b",
      "change_dimension": "hook替换",
      "changes": {
        "hook": {
          "text": "$12 fix for the most annoying part of my kitchen",
          "type": "价格锚定 + 痛点暗示"
        }
      },
      "rest_of_script": "同原脚本",
      "diff_summary": "hook改为价格锚定型，适合价格敏感用户"
    },
    {
      "variant_id": "var_001_c",
      "change_dimension": "时长调整",
      "changes": {
        "target_duration": "12-15s",
        "body": [
          {"time": "0-3s", "content": "痛点hook"},
          {"time": "3-8s", "content": "产品展示+使用（快剪）"},
          {"time": "8-12s", "content": "效果+CTA"}
        ]
      },
      "diff_summary": "精简版，适合TikTok短视频节奏"
    }
  ]
}
```

#### 3.6.4 API

```
POST /api/v1/scripts/:script_id/variants

Request:
{
  "dimensions": ["hook", "duration", "cta"],
  "variant_count": 5
}

Response:
{
  "original": { ... },
  "variants": [ ... ]
}
```

---

### 3.7 多语言本地化

#### 3.7.1 支持语言

| 语言 | 代号 | 目标市场 | 本地化程度 |
|------|------|---------|-----------|
| English (US) | en-US | 美国 | 口语化 + Gen-Z slang |
| English (UK) | en-GB | 英国 | 英式表达 |
| Thai | th | 泰国 | 泰语口语 + 网络用语 |
| Indonesian | id | 印尼 | 印尼语口语 |
| Vietnamese | vi | 越南 | 越南语口语 |
| Malay | ms | 马来西亚 | 马来语口语 |
| Japanese | ja | 日本 | 敬体/常体 自动选择 |
| Spanish | es | 墨西哥/拉美 | 拉美西语 |
| Portuguese (BR) | pt-BR | 巴西 | 巴葡口语 |

#### 3.7.2 本地化策略

不是简单翻译，而是**文化适配**：

```
原文（中文思维）：
"这个沥水篮质量很好，推荐给大家"

❌ 机器翻译：
"This dish rack has good quality, recommend to everyone"

✅ 本地化口语：
"Okay this thing is actually insane — where has it been all my life?"
（美式，口语化，有情绪）

"เจ้านี้ดีมากแม่ ใช้แล้วไม่ผิดหวังเลย"
（泰语，"姐妹这个超好用，用了不后悔"，符合泰国TikTok语气）
```

#### 3.7.3 实现方式

```
LLM Prompt 中注入本地化指令：

"生成 {target_market} 市场的TikTok带货脚本：
- 语言：{language}
- 语气：像 {target_market} 的普通年轻人在TikTok上分享好物
- 禁止：翻译腔、书面语、广告腔
- 必须：使用当地流行的口语表达、网络用语
- 参考：{target_market} TikTok热门视频的说话方式
- 文化注意事项：{cultural_notes}"
```

---

### 3.8 付费系统

#### 3.8.1 定价方案

| 套餐 | 价格 | 脚本额度 | 功能 |
|------|------|---------|------|
| **Free** | $0 | 5条/月 | 基础脚本生成（无A/B变体） |
| **Starter** | $29/月 | 100条/月 | 脚本生成 + A/B变体 + 3种语言 |
| **Pro** | $59/月 | 500条/月 | 全功能 + 爆款拆解 + 全部语言 + 优先生成 |
| **Team** | $99/月 | 2000条/月 | 全功能 + 3个席位 + API访问 + 白标 |

#### 3.8.2 免费试用策略

```
新用户注册 → 免费获得 5 条脚本额度（无需绑定信用卡）
→ 用完后展示"升级解锁更多"弹窗
→ 首月订阅享 50% 折扣（Starter $14.5, Pro $29.5）
```

#### 3.8.3 技术实现

| 组件 | 方案 |
|------|------|
| 支付 | Stripe Checkout + Stripe Billing |
| 订阅管理 | 用户自助升降级/取消 |
| 额度控制 | 每月初重置，API调用时扣减 |
| 发票 | Stripe自动生成 |

---

### 3.9 Cycle 2 里程碑

| 周 | 任务 | 交付物 |
|---|------|--------|
| W1 | A/B变体引擎 + 本地化增强 | 变体生成API + 9语言支持 |
| W2 | 付费系统 + Stripe集成 | 订阅页面 + 支付流程 |
| W3 | 增长功能 + 数据埋点 | 邀请奖励 + 使用数据面板 |

**Cycle 2 验证指标**：
- [ ] 首月付费用户 ≥ 30
- [ ] MRR ≥ $1,000
- [ ] 免费→付费转化率 ≥ 8%
- [ ] 月活用户留存率 ≥ 40%

---

## 🔄 开发周期三（Cycle 3）：生态闭环 + 增长飞轮

> **目标**：构建数据壁垒，实现自增长
> **周期**：4周
> **前置条件**：Cycle 2 MRR ≥ $3,000

### 3.10 效果追踪面板

#### 3.10.1 功能描述

用户发布视频后，回填实际数据（播放量、完播率、点击率、转化率），系统分析哪条脚本效果最好，并自动优化后续生成。

#### 3.10.2 数据回填

```
用户发布视频后，在"我的脚本"页面点击"记录效果"：

┌─────────────────────────────────────────┐
│  📊 脚本效果记录                          │
│                                          │
│  脚本：scr_001（痛点共鸣型）               │
│  发布时间：[2026-05-20 14:00  ]          │
│                                          │
│  播放量：[  12,500  ]                    │
│  完播率：[  35  ]%                       │
│  点赞数：[  890  ]                       │
│  评论数：[  45  ]                        │
│  商品点击：[  120  ]                     │
│  成交单数：[  8  ]                       │
│                                          │
│  [保存]                                  │
└─────────────────────────────────────────┘
```

#### 3.10.3 智能分析

```json
{
  "analysis": {
    "script_id": "scr_001",
    "performance": {
      "views": 12500,
      "completion_rate": 0.35,
      "click_rate": 0.096,
      "conversion_rate": 0.067
    },
    "benchmark": {
      "category_avg_completion": 0.25,
      "category_avg_click": 0.05,
      "category_avg_conversion": 0.03
    },
    "verdict": "完播率高于品类均值40%，hook有效；转化率高于均值123%，CTA有效",
    "recommendation": "此脚本结构表现优异，建议生成同结构变体扩大测试"
  }
}
```

---

### 3.11 爆款视频库（社区化）

#### 3.11.1 功能描述

开放一个"爆款视频灵感库"，用户可以浏览按品类/市场/风格分类的热门带货视频，一键查看结构分析并生成同结构脚本。

#### 3.11.2 核心交互

```
┌─────────────────────────────────────────────────────┐
│  🔥 爆款灵感库                            [筛选 ▼]   │
│                                                      │
│  品类：[全部 ▼]  市场：[🇺🇸 ▼]  风格：[全部 ▼]       │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ ▶️ 视频缩略图  │  │ ▶️ 视频缩略图  │  │ ▶️ 缩略图  │ │
│  │              │  │              │  │            │ │
│  │ 折叠沥水篮    │  │ 美容仪       │  │ 车载香薰   │ │
│  │ 120万播放    │  │ 89万播放     │  │ 230万播放  │ │
│  │ 痛点共鸣型    │  │ 测评对比型    │  │ 反转型     │ │
│  │              │  │              │  │            │ │
│  │ [查看拆解]   │  │ [查看拆解]   │  │ [查看拆解] │ │
│  │ [生成同款脚本]│  │ [生成同款脚本]│  │[生成同款脚本]│ │
│  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

### 3.12 邀请裂变机制

#### 3.12.1 规则

```
邀请者获得：每成功邀请1人注册 → +10条脚本额度
被邀请者获得：注册即送 10条脚本额度（比普通注册多5条）

升级奖励：
邀请 3 人 → 解锁"爆款拆解"功能（Free用户 normally 不可用）
邀请 10 人 → 获得 1 个月 Starter 套餐
邀请 30 人 → 获得 1 个月 Pro 套餐
```

#### 3.12.2 分享机制

```
用户生成一条满意脚本后，底部展示：

┌─────────────────────────────────────────┐
│  🎉 这条脚本看起来不错！                   │
│                                          │
│  分享给朋友，ta 获得 10 条免费额度，         │
│  你也获得 10 条                            │
│                                          │
│  [📤 复制邀请链接]  [📱 分享到微信]         │
└─────────────────────────────────────────┘
```

---

### 3.13 数据飞轮

```
用户生成脚本
    ↓
拍摄发布视频
    ↓
回填效果数据
    ↓
系统学习：哪种 hook/结构/品类 组合效果最好
    ↓
优化生成模型（更新模板库 + 调整prompt权重）
    ↓
新用户获得更好的脚本
    ↓
更多用户 → 更多数据 → 更好的脚本
    ↓
              🔄 飞轮转起来
```

#### 3.13.1 数据反馈闭环实现

```sql
-- 效果数据表
CREATE TABLE script_performance (
    id UUID PRIMARY KEY,
    script_id UUID REFERENCES generated_scripts(id),
    user_id UUID REFERENCES users(id),
    views BIGINT,
    completion_rate DECIMAL(5,4),
    likes INT,
    comments INT,
    shares INT,
    product_clicks INT,
    orders INT,
    gmv DECIMAL(10,2),
    recorded_at TIMESTAMP DEFAULT NOW()
);

-- 定期分析任务（每周运行）
-- 统计每种模板/hook/品类组合的平均表现
-- 更新 category_knowledge 表中的 top_hooks
-- 更新 script_templates 表中的 avg_engagement_rate
```

---

### 3.14 Cycle 3 里程碑

| 周 | 任务 | 交付物 |
|---|------|--------|
| W1 | 效果追踪面板 + 数据回填 | 效果记录页面 + 分析API |
| W2 | 爆款灵感库 | 视频浏览 + 一键生成同款 |
| W3 | 邀请裂变 + 分享机制 | 邀请系统 + 微信分享 |
| W4 | 数据飞轮 + 模型优化 | 反馈闭环 + 模板库自动更新 |

**Cycle 3 验证指标**：
- [ ] MRR ≥ $5,000
- [ ] 邀请带来的新用户占比 ≥ 20%
- [ ] 有效果数据的脚本占比 ≥ 15%
- [ ] 模板库自动更新后，新脚本平均效果提升 ≥ 10%

---

## 四、商业模型

### 4.1 收入预测（保守估计）

| 时间 | 总用户 | 付费用户 | MRR | 年化ARR |
|------|--------|---------|-----|---------|
| Cycle 1 结束（M1） | 200 | 0 | $0 | $0 |
| Cycle 2 结束（M2.5） | 800 | 50 | $2,000 | $24,000 |
| Cycle 3 结束（M4） | 2,500 | 180 | $7,500 | $90,000 |
| M6 | 6,000 | 500 | $22,000 | $264,000 |
| M12 | 20,000 | 1,800 | $80,000 | $960,000 |

### 4.2 成本结构

| 项目 | Cycle 1 | Cycle 2 | Cycle 3 | 稳定期(M6+) |
|------|---------|---------|---------|------------|
| LLM API | $50/月 | $300/月 | $800/月 | $3,000/月 |
| 服务器 | $20/月 | $50/月 | $100/月 | $300/月 |
| 域名/CDN | $10/月 | $10/月 | $20/月 | $50/月 |
| 人力 | 1人 | 1-2人 | 2-3人 | 3-5人 |
| 获客 | $0 | $200/月 | $500/月 | $2,000/月 |

### 4.3 单位经济模型

```
ARPU（月均每付费用户收入）：$45
LLM成本/付费用户/月：$6（平均每月生成100条脚本，每条$0.06）
毛利率：87%
CAC（预计）：$30-50
LTV（12个月留存）：$300-400
LTV/CAC：6-8x ✅
```

---

## 五、风险与应对

| 风险 | 概率 | 影响 | 应对策略 |
|------|------|------|---------|
| TikTok政策变化（限制脚本类工具） | 低 | 高 | 产品定位为"创意辅助"而非"自动化"，不触碰平台红线 |
| LLM生成质量不稳定 | 中 | 中 | 多模型切换 + 人工标注高质量样本做few-shot |
| 大厂入场（TikTok官方做脚本工具） | 中 | 高 | 先发优势 + 垂直深耕 + 数据飞轮壁垒 |
| 用户不愿回填效果数据 | 高 | 中 | 简化回填流程（3个字段即可）+ 回填奖励额度 |
| 获客成本过高 | 中 | 中 | 社区运营（小红书/TT123）为主，内容获客为辅 |

---

## 六、成功标准

### Cycle 1（MVP）
- ✅ 20个种子用户完成测试
- ✅ ≥5个用户用脚本实际发布视频
- ✅ 用户反馈："比我自己写的强"

### Cycle 2（商业化）
- ✅ MRR ≥ $1,000
- ✅ 免费→付费转化率 ≥ 8%
- ✅ 用户NPS ≥ 40

### Cycle 3（增长）
- ✅ MRR ≥ $5,000
- ✅ 自然增长占比 ≥ 30%
- ✅ 月留存率 ≥ 45%

### 长期（12个月）
- ✅ ARR ≥ $500,000
- ✅ 成为TikTok卖家圈"写脚本"的第一联想
- ✅ 模板库积累 ≥ 10,000条经过验证的爆款结构

---

## 七、附录

### A. 用户旅程地图

```
认知 → 兴趣 → 注册 → 首次使用 → 付费 → 留存 → 推荐
 │      │      │       │        │      │      │
 │      │      │       │        │      │      └─ 邀请奖励
 │      │      │       │        │      └─ 持续生成 + 数据反馈
 │      │      │       │        └─ 5条免费额度用完
 │      │      │       └─ 输入产品 → "哇这脚本真的能用"
 │      │      └─ 30秒注册，无需信用卡
 │      └─ 小红书看到案例："用这个工具写的脚本播放量10万+"
 └─ 社群口碑 / 内容营销 / KOL推荐
```

### B. 关键术语

| 术语 | 定义 |
|------|------|
| Hook | 视频前3秒的开场内容，决定用户是否继续观看 |
| 原生感 | 视频看起来像普通人随手拍的，而非专业广告 |
| CTA | Call To Action，引导用户行动的语句 |
| 完播率 | 用户看完整个视频的比例 |
| GMV | Gross Merchandise Volume，成交总额 |
| MRR | Monthly Recurring Revenue，月度经常性收入 |

---

> **文档维护**：本文档随产品迭代持续更新
> **下一步**：Cycle 1 Sprint 1 技术方案设计
