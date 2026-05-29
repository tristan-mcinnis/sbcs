#!/usr/bin/env node
/**
 * ingest.mjs — turn a "rating" GitHub issue into a ledger entry.
 *
 * Reads the issue body from env (ISSUE_BODY), pulls the first ```json fenced
 * block, validates it against data/rubric.json, dedupes, appends/updates
 * data/ratings.json, and writes comment.md + step outputs for the workflow.
 *
 * Local dry run:
 *   ISSUE_BODY="$(cat some-issue.md)" node scripts/ingest.mjs
 */
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const RATINGS = join(ROOT, "data", "ratings.json");

const rubric = JSON.parse(readFileSync(join(ROOT, "data", "rubric.json"), "utf8"));
const { min, max } = rubric.scale;

const ISSUE_BODY = process.env.ISSUE_BODY || "";
const ISSUE_NUMBER = process.env.ISSUE_NUMBER || "";
const ISSUE_AUTHOR = process.env.ISSUE_AUTHOR || "";

const out = { status: "error", changed: "false", commitmsg: "" };
let comment = "";

function setOutputs() {
  writeFileSync(join(ROOT, "comment.md"), comment || "Nothing to report.");
  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `status=${out.status}\nchanged=${out.changed}\ncommitmsg=${out.commitmsg}\n`);
  }
  console.log("status:", out.status, "| changed:", out.changed, "|", out.commitmsg);
}

function fail(reason) {
  out.status = "error";
  comment =
    `🍔 **The club bot couldn't log this one.**\n\n${reason}\n\n` +
    `Fix the issue body and the bot will retry on edit. Your rating must contain a single \`\`\`json code block in the SBCS card shape — the easiest way is to refill it on the [Score a Burger](../../blob/main/score.html) page.`;
  setOutputs();
  process.exit(0);
}

function extractJSON(body) {
  const re = /```(?:json|jsonc)?\s*([\s\S]*?)```/gi;
  let m;
  while ((m = re.exec(body))) {
    try { return JSON.parse(m[1].trim()); } catch { /* try next fence */ }
  }
  return null;
}

function isISODate(s) { return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s); }
function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
const toBool = (v) => (v === true || v === false ? v : v == null ? null : /^(y|yes|true|1)$/i.test(String(v)));
const num = (v) => { const n = Number(v); return Number.isFinite(n) ? n : null; };

// ---- parse
if (!ISSUE_BODY.trim()) fail("The issue body was empty.");
const raw = extractJSON(ISSUE_BODY);
if (!raw) fail("No valid `json` code block was found in the issue.");

// ---- pick the category's rubric (burger, sushi, …)
const catKey = rubric.categories[raw.category] ? raw.category : "burger";
const cat = rubric.categories[catKey];
const KEYS = Object.keys(cat.criteria);

// ---- validate & normalise
const problems = [];
const rec = {
  date: isISODate(raw.date) ? raw.date : todayISO(),
  rater: String(raw.rater || ISSUE_AUTHOR || "").trim(),
  restaurant: String(raw.restaurant || "").trim(),
  burger: String(raw.burger || "").trim(),
  category: catKey,
  price: num(raw.price),
  type: String(raw.type || "Other").trim() || "Other",
  pattyWeight: catKey === "burger" ? num(raw.pattyWeight) : null,
  scores: {},
  again: toBool(raw.again),
  recommend: toBool(raw.recommend),
  notes: String(raw.notes || "").trim(),
};

if (!rec.rater) problems.push("missing `rater`");
if (!rec.restaurant) problems.push("missing `restaurant`");
if (!rec.burger) problems.push("missing `burger`");

const scores = raw.scores && typeof raw.scores === "object" ? raw.scores : {};
for (const k of KEYS) {
  const v = num(scores[k]);
  if (v == null) { problems.push(`missing score \`${k}\``); continue; }
  if (!Number.isInteger(v) || v < min || v > max) { problems.push(`\`${k}\` must be an integer ${min}–${max} (got ${scores[k]})`); continue; }
  rec.scores[k] = v;
}
const unknown = Object.keys(scores).filter((k) => !KEYS.includes(k));
if (unknown.length) problems.push(`unknown score keys: ${unknown.map((k) => "`" + k + "`").join(", ")}`);

if (problems.length) fail("The card had problems:\n\n- " + problems.join("\n- "));

// ---- merge into the ledger
const slug = (s) => String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
const idOf = (r) => [slug(r.date), slug(r.rater), slug(r.restaurant), slug(r.burger)].join("|");

const ledger = JSON.parse(readFileSync(RATINGS, "utf8"));
const existingIdx = ledger.findIndex((r) => idOf(r) === idOf(rec));
const isUpdate = existingIdx >= 0;
if (isUpdate) ledger[existingIdx] = rec; else ledger.push(rec);
ledger.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.rater.localeCompare(b.rater)));
writeFileSync(RATINGS, JSON.stringify(ledger, null, 2) + "\n");

const total = KEYS.reduce((a, k) => a + rec.scores[k], 0);
const pct = Math.round((total / cat.max) * 100);
out.status = "ok";
out.changed = "true";
out.commitmsg = `${isUpdate ? "update" : "add"} ${rec.restaurant} — ${rec.burger} by ${rec.rater}`;

const groupLines = cat.groups.map((g) => {
  const avg = (g.criteria.reduce((a, k) => a + rec.scores[k], 0) / g.criteria.length).toFixed(1);
  return `| ${g.label} | ${avg} / 4 |`;
}).join("\n");

const catEmoji = { burger: "🍔", sushi: "🍣" }[catKey] || "🍽️";
comment =
  `${catEmoji} **Logged to the ledger${isUpdate ? " (updated)" : ""}.**\n\n` +
  `**${rec.restaurant} — ${rec.burger}** · rated by ${rec.rater} on ${rec.date}\n\n` +
  `### ${total} / ${cat.max}  ·  ${pct}%\n\n` +
  `| Category | Club score |\n| --- | --- |\n${groupLines}\n\n` +
  `${rec.again != null ? `Order again: **${rec.again ? "yes" : "no"}** · ` : ""}` +
  `${rec.recommend != null ? `Recommends: **${rec.recommend ? "yes" : "no"}**` : ""}\n\n` +
  `It'll appear on [the ledger](../../#leaderboard) once Pages rebuilds. Closing this out — thanks for feeding the spreadsheet.`;

setOutputs();
