# Pet Cleaning Template Research - 2026-05-27

## Scope

Expanded the cat-home cleaning and odor-control evidence set using approved public sources only.

## Sources Used

- Local seed CSV at `data/research/pet-cleaning/seed-videos.csv`
- Public TikTok Top Ads pages for cat litter, litter mats, and automatic litter boxes
- Public TikTok Shop search/product pages for adjacent market-signal checks on odor removers and pet hair tools

## Candidates Reviewed

- 6 total candidate ads in the queue
- 6 remained after URL dedupe
- 0 merged into approved templates

## What Changed

- Added two new automatic litter box candidates from public TikTok Top Ads pages:
  - PetPivot auto-scooper sale-led comparison
  - Litter-Robot "worth it" objection-handling / multi-cat cleanliness angle
- Refined the four existing candidates so they preserve only structural observations, not copied captions or scripts
- Rescored the full queue with the skill scorer
- Wrote an explicit empty approved-template file because today’s evidence does not meet the quality bar for a reusable storyboard template

## Top Emerging Pain Points

- `cleaning_time` for automatic litter boxes
- `litter_box_smell` for cat litter / odor-control positioning
- `litter_tracking` for litter mats
- `multi_pet_mess` for multi-cat litter automation

## Top Hook Patterns

- `routine_upgrade`: reframe the product as the fix for a repetitive cat-care task
- `product_comparison`: easier/better/best framing for accessories and automation
- `comment_reply`: answer a common owner objection directly

## Score Snapshot

- `cand_20260527_tiktok_litter_robot_cat_hack`: 30
- `cand_20260527_tiktok_tidy_cats_lightweight`: 25
- `cand_20260527_tiktok_double_layer_litter_mat`: 40
- `cand_20260527_tiktok_wagwise_litter_mat`: 40
- `cand_20260527_tiktok_petpivot_auto_scooper_sale`: 25
- `cand_20260527_tiktok_litter_robot_worth_it_multicat`: 25

## Why No Templates Were Approved

- Public Top Ads indexing exposes metadata, captions, landing pages, and some performance signals, but not enough reliable frame-level structure to support a compliant 4-6 step storyboard.
- The two strongest clusters are:
  - litter mats for `litter_tracking`
  - automatic litter boxes for `cleaning_time` / `multi_pet_mess`
- Both clusters still need direct video observation or an approved export before they can be promoted into reusable templates with evidence-backed shot lists.

## Compliance Guardrails

- Avoid absolute odor-removal claims such as "eliminates all odor."
- Avoid medical or health-monitoring claims for automatic litter box apps.
- Avoid exaggerated ranking or before/after claims unless the evidence is explicitly framed as owner opinion or demonstration.
- Keep any future scripts original; do not reuse creator wording, faces, handles, or captions.

## Adjacent Market Signals

- Public TikTok Shop result pages show active demand clusters for cat odor eliminators, automatic litter-box deodorizer accessories, couch/furniture pet-hair removers, and pee pads.
- Those pages are useful for seed expansion, but they were not converted into ad candidates because they are product listings rather than observable video creatives.

## Data Gaps

- Need approved video-level exports or authenticated access that lawfully exposes playback/creative structure.
- Need direct examples for:
  - cat urine odor remover sprays
  - pet hair on furniture
  - pee pads
  - multi-cat home smell beyond litter-box automation

## Next Seed Queries

- `site:ads.tiktok.com/business/creativecenter/topads/ "cat urine" odor remover`
- `site:ads.tiktok.com/business/creativecenter/topads/ "pet hair remover" couch`
- `site:ads.tiktok.com/business/creativecenter/topads/ "pee pad"`
- `site:ads.tiktok.com/business/creativecenter/topads/ "multi cat" litter`
- `site:shop.tiktok.com/us/k/cat-pee-odor-eliminator`
- `site:shop.tiktok.com/us/k/pet-hair-removal-sofa`
