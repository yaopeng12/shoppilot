#!/usr/bin/env node

import fs from "node:fs";

const input = fs.readFileSync(0, "utf8").trim();
if (!input) process.exit(0);

const rows = input.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));

function num(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function score(row) {
  const metrics = row.public_metrics || {};
  const views = num(metrics.views);
  const likes = num(metrics.likes);
  const comments = num(metrics.comments);
  const shares = num(metrics.shares);
  const saves = num(metrics.saves);

  const engagement = views > 0 ? (likes + comments * 3 + shares * 4 + saves * 4) / views : 0;
  let value = Math.min(40, Math.round(engagement * 1000));

  if (row.first_three_seconds && row.first_three_seconds.length >= 20) value += 10;
  if (Array.isArray(row.shot_sequence) && row.shot_sequence.length >= 4) value += 15;
  if (row.pet_behavior && row.pet_behavior !== "no_pet_shown") value += 10;
  if (row.proof_type) value += 10;
  if (Array.isArray(row.comment_insights) && row.comment_insights.length > 0) value += 5;
  if (Array.isArray(row.compliance_risks) && row.compliance_risks.includes("none_observed")) value += 5;

  return Math.max(0, Math.min(100, value));
}

for (const row of rows) {
  row.score = score(row);
  process.stdout.write(`${JSON.stringify(row)}\n`);
}
