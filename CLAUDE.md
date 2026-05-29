# CLAUDE.md — Sushi Burger Club Shanghai (SBCS)

Guidance for Claude Code (and humans) working in this repo.

## What this is

A small public website for the **Sushi Burger Club Shanghai** — a 7-person supper
club ("A Pro-Carb Collective") that scores Shanghai's burgers across **20 criteria**
and keeps a transparent, public ledger of every rating.

It is a **zero-build static site** hosted on **GitHub Pages**. There is no server.
The "backend" for adding ratings is **Git itself**: a rating is filed as a GitHub
Issue, a GitHub Action parses it and commits it to `data/ratings.json`, and Pages
redeploys. Every score is therefore an auditable commit.

If the project grows, the obvious next steps are a WeChat Official Account or a
Vercel deployment — but nothing here should require leaving plain static files.

## Architecture at a glance

```
index.html         Landing page + the leaderboard ("The Ledger")
methodology.html   Transparent rubric — generated from data/rubric.json
score.html         The scoring instrument (the official scorecard)
assets/
  styles.css       The whole design system (no framework)
  app.js           Powers index + methodology (aggregation, leaderboard, radar)
  score.js         Powers the scorecard (live total, JSON output, issue link)
  config.js        Site config — set `repo` to "owner/name" (used by score.js)
  logo.svg         The crossed-chopsticks SBCS monogram
  cover.png        The club cover art (the mascot poster)
data/
  rubric.json      SINGLE SOURCE OF TRUTH: criteria, groups, scale, types, members
  ratings.json     The ledger — an array of rating records
scripts/
  csv-to-json.mjs  One-off importer from the original spreadsheet export
  ingest.mjs       Parses a rating issue → appends to ratings.json (used by CI)
.github/
  ISSUE_TEMPLATE/new-rating.md   The manual rating template (JSON scaffold)
  workflows/ingest-rating.yml    The Action that runs ingest.mjs on rating issues
```

## The scoring model (don't reinvent it elsewhere)

- **Two categories**, each its own rubric under `categories` in `rubric.json`:
  - **burger** — groups: Patty, Build, Flavor, Craft, Honesty, X-Factor.
  - **sushi** — groups: Rice, Fish, Balance, Craft, Honesty, Experience.
- Each category has **20 criteria**, each scored an integer **1–4** (`scale`), max **80**.
  The 6 groups per category are the axes on that item's scorecard radar.
- Every rating carries a `category`; the ledger, radar, score form and methodology
  are all category-aware. Adding a third category = add a sibling under `categories`
  (+ an emoji in `CAT_EMOJI` in app.js/score.js) — nothing else needs touching.
- **Totals are always recomputed from the 20 sub-scores. The sum is the truth.**
  Any "Total" written by hand is ignored. (The first imported card said 70 but
  sums to 68 — the ledger shows 68.)
- When several members rate the same burger, scores are **averaged per criterion**;
  the headline is the mean of everyone's totals.
- Leaderboard ranks by mean total /80. Tie-break order lives in `rubric.ranking`
  and is mirrored by `cmpScore()` in `app.js` — **keep those two in sync.**

## Data model — a rating record

`data/ratings.json` is an array of:

```json
{
  "date": "2026-05-28",
  "rater": "Tristan",
  "restaurant": "Shake Shack",
  "burger": "ShackBurger, double",
  "category": "burger",
  "price": 68,
  "type": "Smash",
  "pattyWeight": 160,
  "scores": { "doneness": 4, "seasoning": 3, "...": "all 20 keys" },
  "again": true,
  "recommend": true,
  "notes": ""
}
```

Burgers are de-duplicated by `slug(restaurant) + "--" + slug(burger)`.

## How a rating gets added (three paths, one format)

All three produce the **same JSON record** and end up in `data/ratings.json`.

1. **Website (recommended).** `score.html` → fill the card → **Log to the Ledger**.
   This opens a pre-filled GitHub Issue (label `rating`) containing a ```json block.
   On submit, the Action ingests it, comments the breakdown, and closes the issue.
2. **GitHub Issue template.** New Issue → "🍔 New burger rating" → edit the JSON.
3. **Direct edit.** Append a record to `data/ratings.json` and commit. Re-import
   from a spreadsheet with `node scripts/csv-to-json.mjs path/to/export.csv`.

The Action (`ingest.mjs`) validates against `rubric.json`, rejects malformed cards
with a helpful comment, and updates-in-place if the same date+rater+burger is re-filed.

## Common edits

- **Add a club member** → add to `members` in `rubric.json` (feeds the rater
  autocomplete on the scorecard).
- **Change a criterion / its description** → edit `rubric.json`. The methodology
  page and scorecard regenerate from it; do not hardcode criteria in HTML.
- **Re-group the radar** → edit `categories.burger.groups` in `rubric.json`. Every
  criterion key must appear in exactly one group (the importer test checks this).
- **Add another category** (beyond burger + sushi) → add a sibling under
  `categories` and an emoji in `CAT_EMOJI` (app.js + score.js). The ledger,
  score form, methodology tabs and Hall of Fame pick it up automatically.

## Conventions & gotchas

- **No framework, no build step.** Plain HTML/CSS/JS. Keep it that way unless there's
  a strong reason. Fonts: Fraunces (display), Archivo (UI), DM Mono (figures).
- **Serve over http when testing** — the pages `fetch()` JSON, which fails on
  `file://`. Use `python3 -m http.server` (or `npx serve`) from the repo root.
- **`.nojekyll` is required** so Pages serves `assets/` and `data/` untouched.
- **GitHub Pages source = "Deploy from a branch" → `main` / root.** Branch-based
  Pages redeploys even after the bot's token commit (an Actions-based Pages workflow
  would NOT, because token pushes don't trigger `on: push`). Don't switch to an
  Actions Pages deploy without solving that.
- **Set `assets/config.js` `repo`** to the real `owner/name` so the scorecard's
  "Log to the Ledger" button targets the right repository.
- After changing the rubric grouping, sanity-check with:
  `node -e "..."` style check (see git history) — every group key must resolve.

## Verifying your work (house rule)

Don't declare a UI change done from a diff. Serve the site, open the actual page,
and look at it (screenshot across desktop + mobile widths). "It loaded" is not
"it's right."
