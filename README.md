<div align="center">

# 🍔 Sushi Burger Club Shanghai

### A Pro-Carb Collective · Est 2025

*Your culinary guide to the dark arts of dining. No plate too big or small.*

[**The Ledger**](https://tristan-mcinnis.github.io/sbcs/) ·
[**Methodology**](https://tristan-mcinnis.github.io/sbcs/methodology.html) ·
[**Score a Burger**](https://tristan-mcinnis.github.io/sbcs/score.html) ·
[**Instagram**](https://www.instagram.com/sushi.burger.club/)

</div>

---

We are a small Shanghai supper club that takes burgers a normal amount seriously
(i.e. far too seriously). We eat the burger, we fill in a 20-column scorecard, and
we publish every number. This repo **is** the club: the website, the rubric, and
the full public ledger of every rating.

## How a burger is scored

Every burger is judged on **20 criteria**, each from **1 (Poor)** to **4 (Elite)**,
for a maximum of **80 points**. The criteria roll up into six families that form the
radar on every scorecard:

| Family | What it covers |
| --- | --- |
| **The Patty** | Doneness · Seasoning · Crust · Texture · Ratio |
| **The Build** | Bun · Integrity · Distribution |
| **The Flavor** | Flavor · Sauce · Cheese · Toppings |
| **The Craft** | Craveability · Originality · Presentation · Concept |
| **The Honesty** | Value · Accuracy (did it match the menu?) |
| **The X-Factor** | Post-Burger feeling · that intangible something |

**Totals are always recomputed from the sub-scores — the sum is the truth.** Full
details, including the tie-break rules, live on the [methodology page](https://tristan-mcinnis.github.io/sbcs/methodology.html).

## Add a rating

The whole "backend" is GitHub. Pick whichever is easiest:

1. **Use the site** — open **Score a Burger**, fill the card, hit **Log to the Ledger**.
   It opens a pre-filled issue; submit it and the club bot adds it for you. ✅
2. **Open an issue** — use the *🍔 New burger rating* template and edit the JSON.
3. **Edit directly** — add a record to [`data/ratings.json`](data/ratings.json) and
   commit.

Either way a GitHub Action validates the card, appends it to the ledger as a commit,
replies with the breakdown, and closes the issue. Nothing is added in the dark.

## Run it locally

No build step. The pages fetch JSON, so serve over http (not `file://`):

```bash
git clone https://github.com/tristan-mcinnis/sbcs.git
cd sbcs
python3 -m http.server 8000   # then open http://localhost:8000
```

Re-import from a spreadsheet export any time:

```bash
node scripts/csv-to-json.mjs path/to/burger_club_scores.csv
```

## Project layout

```
index.html · methodology.html · score.html   the three pages
assets/   styles.css · app.js · score.js · config.js · logo.svg · cover.png
data/     rubric.json (source of truth) · ratings.json (the ledger)
scripts/  csv-to-json.mjs · ingest.mjs
.github/  issue template + ingest workflow
```

## Tech

Hand-written HTML/CSS/JS — no framework, no dependencies. Fonts: Fraunces, Archivo,
DM Mono. Hosted on GitHub Pages. The design follows the club's house style: cream
paper, crimson, warm ink, retro-editorial.

## License

Code is released under the [MIT License](LICENSE). The ratings, words, and artwork
belong to the Sushi Burger Club Shanghai.

<div align="center"><sub>S·B ✕ C·S — Nori · Maki · Burger · Bun</sub></div>
