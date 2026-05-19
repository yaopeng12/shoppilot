import type { Product } from "./types";

const hookTemplates = [
  (p: Product) => `POV: You just discovered ${p.title} and your life will never be the same`,
  (p: Product) => `Stop scrolling! This ${p.title} is going viral for a reason 👀`,
  (p: Product) => `I tested ${p.title} for 30 days and here's what happened...`,
  (p: Product) => `The internet is OBSESSED with ${p.title} — here's why`,
  (p: Product) => `I can't believe I lived without ${p.title} for this long 😱`,
  (p: Product) => `Wait for it... ${p.title} just changed everything 🔥`,
  (p: Product) => `Everyone's asking about my ${p.title} — here's the secret`,
  (p: Product) => `This ${p.title} hack is breaking the internet right now`,
  (p: Product) => `You NEED ${p.title} in your life. Here's proof 👇`,
  (p: Product) => `I bought ${p.title} and my friends won't stop asking about it`,
];

const scriptTemplates = [
  (p: Product) => ({
    scenes: [
      { text: `Open with: Show yourself unboxing ${p.title}`, duration: "0-3s" },
      { text: `Close-up of the product details — "${p.description?.slice(0, 80) || "Look at this quality"}"`, duration: "3-7s" },
      { text: `Show the product in action / being used`, duration: "7-12s" },
      { text: `Reaction shot: Express genuine excitement`, duration: "12-15s" },
      { text: `Before vs After comparison`, duration: "15-20s" },
      { text: `CTA: "Link in bio — grab yours before they sell out!"`, duration: "20-25s" },
    ],
  }),
  (p: Product) => ({
    scenes: [
      { text: `Hook: "You've been doing it wrong..." (text overlay)`, duration: "0-2s" },
      { text: `Show the old way / competitor product`, duration: "2-5s" },
      { text: `Introduce ${p.title} as the solution`, duration: "5-9s" },
      { text: `Demo the key feature that makes it better`, duration: "9-14s" },
      { text: `Show the result / outcome`, duration: "14-18s" },
      { text: `Price reveal: "${p.price || "Affordable price"}" + CTA`, duration: "18-22s" },
    ],
  }),
  (p: Product) => ({
    scenes: [
      { text: `"Things TikTok made me buy" trend opening`, duration: "0-3s" },
      { text: `Show ${p.title} arriving in the mail`, duration: "3-6s" },
      { text: `First impressions — genuine reaction`, duration: "6-10s" },
      { text: `Try it for the first time on camera`, duration: "10-16s" },
      { text: `Share your honest verdict`, duration: "16-20s" },
      { text: `Rating: ⭐⭐⭐⭐⭐ — "Worth every penny"`, duration: "20-25s" },
    ],
  }),
  (p: Product) => ({
    scenes: [
      { text: `"3 reasons you need ${p.title}" (numbered list style)`, duration: "0-3s" },
      { text: `Reason 1: Quality — zoom into details`, duration: "3-8s" },
      { text: `Reason 2: Effectiveness — show it working`, duration: "8-13s" },
      { text: `Reason 3: Value — "${p.price || "Great price"}"`, duration: "13-17s" },
      { text: `Bonus: Show multiple use cases`, duration: "17-21s" },
      { text: `"Don't miss out" urgency CTA`, duration: "21-25s" },
    ],
  }),
  (p: Product) => ({
    scenes: [
      { text: `"My honest review of ${p.title}" — sit-down format`, duration: "0-3s" },
      { text: `Talk about what you expected vs reality`, duration: "3-8s" },
      { text: `Show the product being used naturally`, duration: "8-14s" },
      { text: `Address common doubts / questions`, duration: "14-18s" },
      { text: `Show the results / benefits`, duration: "18-22s" },
      { text: `"10/10 would recommend" + link CTA`, duration: "22-25s" },
    ],
  }),
  (p: Product) => ({
    scenes: [
      { text: `GRWM (Get Ready With Me) format — start getting ready`, duration: "0-4s" },
      { text: `Incorporate ${p.title} into routine`, duration: "4-10s" },
      { text: `Talk about how it fits into your lifestyle`, duration: "10-15s" },
      { text: `Show the finished look / result`, duration: "15-19s" },
      { text: `Compliments reaction (text overlay)`, duration: "19-22s" },
      { text: `"Get yours" — direct CTA`, duration: "22-25s" },
    ],
  }),
  (p: Product) => ({
    scenes: [
      { text: `"Expectation vs Reality" with ${p.title}`, duration: "0-3s" },
      { text: `Expectation: Show the ad / marketing image`, duration: "3-6s" },
      { text: `Reality: Show the actual product (positive twist)`, duration: "6-11s" },
      { text: `"It's actually BETTER than the ad" reveal`, duration: "11-15s" },
      { text: `Show unique features up close`, duration: "15-19s" },
      { text: `"Surpassed expectations" + shop CTA`, duration: "19-23s" },
    ],
  }),
  (p: Product) => ({
    scenes: [
      { text: `"Things that just make sense" trend — relatable setup`, duration: "0-3s" },
      { text: `Show daily problem that ${p.title} solves`, duration: "3-7s" },
      { text: `The "aha" moment — introduce the product`, duration: "7-12s" },
      { text: `Satisfying usage montage`, duration: "12-17s" },
      { text: `Side-by-side: with vs without`, duration: "17-21s" },
      { text: `"Trust me on this one" + CTA`, duration: "21-25s" },
    ],
  }),
  (p: Product) => ({
    scenes: [
      { text: `"I asked 100 people about ${p.title}" — street interview style`, duration: "0-3s" },
      { text: `Show reactions / testimonials (or act them out)`, duration: "3-9s" },
      { text: `The overwhelming consensus: everyone loves it`, duration: "9-13s" },
      { text: `Show why — demo the best features`, duration: "13-18s" },
      { text: `Your personal take`, duration: "18-21s" },
      { text: `"Join the hype" — CTA with urgency`, duration: "21-25s" },
    ],
  }),
  (p: Product) => ({
    scenes: [
      { text: `"Storytime: How ${p.title} saved my ___"`, duration: "0-3s" },
      { text: `Set up the relatable problem`, duration: "3-7s" },
      { text: `The struggle montage`, duration: "7-10s" },
      { text: `Discovery moment — finding ${p.title}`, duration: "10-14s" },
      { text: `The transformation / solution`, duration: "14-19s" },
      { text: `"Life-changing" verdict + link in bio`, duration: "19-25s" },
    ],
  }),
];

function generateVoiceover(product: Product, scriptIdx: number) {
  const name = product.title || "this amazing product";
  const price = product.price || "an incredible price";
  const desc = product.description?.slice(0, 120) || "something truly special";
  const voiceovers = [
    `Have you seen ${name}? Honestly, I was skeptical at first. But ${desc.toLowerCase().replace(/\.$/, "")}. I'm not kidding — this is a game changer. And right now it's only ${price}. I've already bought three. You need to check this out before it sells out. Link is right there — go!`,
    `Okay so everyone keeps asking me about ${name}. Let me break it down for you. ${desc} And the price? ${price}. That's honestly a steal for what you're getting. I've been using it every single day since I got it. Don't sleep on this one — trust me.`,
    `Real talk — ${name} is the best purchase I've made this year. ${desc} It just works. No complicated setup, no learning curve. ${price} for something this good? I'm actually shook. Go grab yours before the price goes up. Link below!`,
    `I need to tell you about ${name}. ${desc} I've tried so many alternatives and nothing comes close. The quality is insane for ${price}. My friends keep borrowing mine and I'm like — get your own! Seriously though, you won't regret this one.`,
    `Stop what you're doing and listen. ${name} — ${desc.toLowerCase().replace(/\.$/, "")}. I know it sounds too good to be true, but I've been using it for weeks and I'm obsessed. ${price} well spent. Link in bio — you can thank me later!`,
  ];
  return voiceovers[scriptIdx % voiceovers.length];
}

function generateSubtitles(product: Product, hookIdx: number) {
  const hook = hookTemplates[hookIdx](product);
  const words = hook.split(" ");
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += 4) chunks.push(words.slice(i, i + 4).join(" "));
  return chunks.map((text, i) => ({ time: `${(i * 2).toFixed(1)}s - ${((i + 1) * 2).toFixed(1)}s`, text }));
}

export function generateAll(product: Product) {
  const hooks = hookTemplates.map((t) => t(product));
  const scripts = scriptTemplates.map((t, i) => ({ id: i + 1, ...t(product) }));
  const voiceovers = scripts.map((_, i) => generateVoiceover(product, i));
  const subtitles = hooks.map((_, i) => generateSubtitles(product, i));
  return { product, hooks, scripts, voiceovers, subtitles };
}

