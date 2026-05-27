# Schema

Use JSON Lines for raw candidate analysis and JSON arrays for final templates.

## CandidateVideo

```ts
interface CandidateVideo {
  source_id: string;
  platform: "tiktok" | "instagram" | "youtube" | "douyin" | "xiaohongshu" | "other";
  url: string;
  collected_at: string;
  public_metrics?: {
    views?: number;
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
  };
  product_category: ProductCategory;
  pet_context: PetContext;
  pain_point: PainPoint;
  use_scene: UseScene;
  video_length_seconds?: number;
  hook_type: HookType;
  first_three_seconds: string;
  owner_emotion: OwnerEmotion;
  pet_behavior: PetBehavior;
  proof_type: ProofType;
  shot_sequence: string[];
  caption_pattern: string[];
  cta_type: CTAType;
  comment_insights: string[];
  compliance_risks: ComplianceRisk[];
  originality_notes: string;
  score?: number;
}
```

## AdTemplate

```ts
interface AdTemplate {
  template_id: string;
  name: string;
  product_category: ProductCategory;
  pet_context: PetContext;
  pain_point: PainPoint;
  use_scene: UseScene;
  best_for: Array<"cold_test" | "tiktok_shop_conversion" | "retargeting" | "ugc_brief" | "landing_page_video">;
  hook_pattern: {
    type: HookType;
    structure: string;
    example_lines: string[];
  };
  creative_strategy: {
    target_owner: string;
    emotional_trigger: string;
    core_claim_boundary: string;
  };
  storyboard: Array<{
    time_range: string;
    visual: string;
    pet_behavior: string;
    owner_action: string;
    overlay_text: string;
    narration: string;
  }>;
  shot_list: {
    required: string[];
    optional: string[];
    props: string[];
    setup_notes: string[];
  };
  caption_patterns: string[];
  cta_options: string[];
  compliance_guardrails: string[];
  testing_plan: string[];
  evidence: {
    based_on_candidate_ids: string[];
    common_pattern_summary: string;
  };
  status: "draft" | "reviewed" | "approved";
  created_at: string;
  updated_at: string;
}
```

Use stable ids:

- candidates: `cand_YYYYMMDD_platform_slug`
- templates: `tpl_petclean_category_pain_hook_vNN`

