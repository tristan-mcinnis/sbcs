#!/usr/bin/env node
/**
 * csv-to-json.mjs — import the club's spreadsheet export into data/ratings.json
 *
 * Usage:
 *   node scripts/csv-to-json.mjs [path/to/burger_club_scores.csv]
 *
 * The CSV header columns for the 20 criteria are expected to look like
 * "1-Doneness", "2-Seasoning" ... "20-X-Factor". We map them back to the
 * canonical rubric keys via the `n` field in data/rubric.json, so the
 * spreadsheet column order can change without breaking the import.
 *
 * Totals in the CSV are intentionally ignored — SBCS always recomputes a
 * total from the 20 sub-scores. The sum is the truth.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const csvPath =
  process.argv[2] ||
  join(process.env.HOME || "", "Downloads", "burger_club_scores.csv");

const rubric = JSON.parse(readFileSync(join(ROOT, "data", "rubric.json"), "utf8"));
const criteria = rubric.categories.burger.criteria;
// numeric prefix (1..20) -> canonical key (e.g. "doneness")
const numToKey = new Map(
  Object.entries(criteria).map(([key, def]) => [def.n, key])
);

/** Minimal RFC-4180-ish CSV parser (handles quotes, commas, escaped quotes). */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field); field = "";
    } else if (c === "\n") {
      row.push(field); rows.push(row); row = []; field = "";
    } else if (c === "\r") {
      // ignore — handled by the \n branch
    } else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((v) => v.trim() !== ""));
}

const toBool = (v) => /^(y|yes|true|1)$/i.test(String(v).trim());
const toNum = (v) => {
  const n = Number(String(v).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const raw = readFileSync(csvPath, "utf8");
const rows = parseCsv(raw);
const header = rows[0].map((h) => h.trim());

// Build a column index for the 20 scored criteria.
const scoreCols = []; // { col, key }
header.forEach((h, col) => {
  const m = h.match(/^(\d+)\s*[-–]\s*/); // "1-Doneness"
  if (m) {
    const key = numToKey.get(Number(m[1]));
    if (key) scoreCols.push({ col, key });
  }
});

const idx = (name) => header.findIndex((h) => h.toLowerCase().startsWith(name.toLowerCase()));
const cDate = idx("date");
const cRater = idx("rater");
const cRest = idx("restaurant");
const cBurger = idx("burger");
const cPrice = idx("price");
const cType = idx("type");
const cWeight = idx("patty weight");
const cAgain = idx("again");
const cRec = idx("recommend");
const cNotes = idx("notes");

const ratings = rows.slice(1).map((r) => {
  const scores = {};
  for (const { col, key } of scoreCols) {
    const v = toNum(r[col]);
    if (v != null) scores[key] = v;
  }
  return {
    date: (r[cDate] || "").trim(),
    rater: (r[cRater] || "").trim(),
    restaurant: (r[cRest] || "").trim(),
    burger: (r[cBurger] || "").trim(),
    category: "burger",
    price: cPrice >= 0 ? toNum(r[cPrice]) : null,
    type: cType >= 0 ? (r[cType] || "").trim() : "",
    pattyWeight: cWeight >= 0 ? toNum(r[cWeight]) : null,
    scores,
    again: cAgain >= 0 ? toBool(r[cAgain]) : null,
    recommend: cRec >= 0 ? toBool(r[cRec]) : null,
    notes: cNotes >= 0 ? (r[cNotes] || "").trim() : "",
  };
});

const outPath = join(ROOT, "data", "ratings.json");
writeFileSync(outPath, JSON.stringify(ratings, null, 2) + "\n");

const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0);
console.log(`Imported ${ratings.length} rating(s) from ${csvPath}`);
for (const r of ratings) {
  console.log(
    `  • ${r.rater} — ${r.restaurant} / ${r.burger}: ${sum(r.scores)}/${rubric.categories.burger.max}`
  );
}
console.log(`Wrote ${outPath}`);
