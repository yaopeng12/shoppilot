---
name: pet-cleaning-template-builder
description: Build and maintain a template library for cat-home cleaning and odor-control video ads. Use when an agent needs to research TikTok/Reels/Shorts/Xiaohongshu/Douyin ecommerce videos, analyze public or user-provided links, extract reusable ad structures, cluster patterns, and create compliant templates for pet litter, odor remover, pee pad, hair removal, and home hygiene products.
---

# Pet Cleaning Template Builder

Use this skill to turn public short-video commerce examples into an original template library for cat-home cleaning and odor-control ads.

Do not copy creators, captions, exact scripts, music, or video assets. Extract structure, angle, proof pattern, shot sequence, and compliance lessons only.

## Daily Workflow

1. Load `references/schema.md` for the exact fields to produce.
2. Load `references/taxonomy.md` for category, pain point, hook, proof, scene, and compliance labels.
3. Collect inputs from approved sources:
   - user-provided URLs or CSV exports
   - official platform APIs when available
   - manual research notes
   - public pages that do not require bypassing login, anti-bot controls, or platform restrictions
4. For each candidate video, record only public metadata and structural observations:
   - URL, platform, date collected
   - visible engagement metrics if public
   - product category
   - first 3-second hook structure
   - pain point
   - pet behavior moment
   - owner emotion
   - proof method
   - shot sequence
   - CTA style
   - comment insight summary when legally available
   - compliance risks
5. Deduplicate by canonical URL and near-identical hook/shot pattern.
6. Score each candidate with `scripts/score_candidate.mjs`.
7. Cluster high-scoring candidates into reusable templates.
8. Write new templates as original abstractions, not paraphrases of any single video.
9. Save outputs in the project template library or database target requested by the user.

## Source Rules

- Prefer official APIs, exported CSVs, and user-supplied research files.
- Never download, re-upload, or reuse creator video files without authorization.
- Never preserve creator names, faces, handles, or personal details as template data unless the user explicitly has rights to use them.
- Never copy captions or exact wording. Summarize the observed structure.
- If a source appears restricted by login, CAPTCHA, paywall, robots rules, or terms, stop and ask for an approved export or seed data.

## Template Quality Bar

A template is usable only if it contains:

- one precise product subcategory
- one primary pain point
- one opening hook pattern
- one pet behavior shot
- one owner emotion
- a 4-6 step shot sequence
- caption/subtitle pattern
- proof method
- CTA style
- compliance guardrails
- testing suggestions

Reject generic templates like "show the product and explain benefits."

## Output Modes

### Candidate Analysis

Use this when reviewing individual videos. Output JSON lines matching `CandidateVideo` in `references/schema.md`.

### Template Library

Use this when creating reusable templates. Output JSON matching `AdTemplate` in `references/schema.md`.

### Daily Report

Use this for scheduled runs. Include:

- candidates reviewed
- candidates accepted
- templates created
- templates updated
- top emerging pain points
- top hook patterns
- compliance concerns
- data gaps and next seed queries

## Recommended Seed Queries

Use these as starting points, then localize for each platform:

- cat litter odor
- cat litter box smell
- cat pee smell remover
- cat litter tracking
- cat litter mat
- automatic litter box odor
- multi cat home smell
- cat urine odor carpet
- pet odor remover sofa
- pet hair remover couch

Chinese seed terms:

- 猫砂盆 异味
- 养猫 家里有味
- 猫砂 带出
- 猫尿味 清理
- 多猫家庭 除味
- 宠物除臭喷雾
- 粘毛器 沙发 猫毛
- 自动猫砂盆 除臭

