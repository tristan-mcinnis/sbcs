<div align="center">

# 🍔 Sushi Burger Club Shanghai · 上海寿司汉堡俱乐部

### A Pro-Carb Collective · Est 2025 · 碳水集团 · 成立于2025

*Your culinary guide to the dark arts of dining. No plate too big or small.*
*饮食黑暗艺术指南。无论大盘小盘，皆在评定之列。*

[**The Ledger · 评分榜**](https://tristan-mcinnis.github.io/sbcs/) ·
[**Methodology · 评分标准**](https://tristan-mcinnis.github.io/sbcs/methodology.html) ·
[**Score · 评分**](https://tristan-mcinnis.github.io/sbcs/score.html) ·
[**Instagram**](https://www.instagram.com/sushi.burger.club/)

</div>

---

We are a small Shanghai supper club that takes burgers a normal amount seriously
(i.e. far too seriously). We eat the burger, we fill in a 20-column scorecard, and
we publish every number. This repo **is** the club: the website, the rubric, and
the full public ledger of every rating.

我们是一个在上海认真对待汉堡（即：过于认真）的小型晚餐俱乐部。我们吃汉堡、填写20列评分卡，并公开每一个数字。这个代码库**就是**俱乐部本身：网站、评分标准，以及所有评分的完整公开记录。

## How a burger is scored · 如何评分

Every burger is judged on **20 criteria**, each from **1 (Poor)** to **4 (Elite)**,
for a maximum of **80 points**. The criteria roll up into six families that form the
radar on every scorecard:

每份汉堡按 **20项标准** 评分，每项从 **1（差）** 到 **4（精）**，满分 **80分**。标准归纳为六大类，构成每张评分卡上的雷达图：

| Family · 大类 | What it covers · 评分内容 |
| --- | --- |
| **The Patty · 肉饼** | Doneness · Seasoning · Crust · Texture · Ratio |
| **The Build · 构成** | Bun · Integrity · Distribution |
| **The Flavor · 风味** | Flavor · Sauce · Cheese · Toppings |
| **The Craft · 工艺** | Craveability · Originality · Presentation · Concept |
| **The Honesty · 诚意** | Value · Accuracy (did it match the menu?) |
| **The X-Factor · X因子** | Post-Burger feeling · that intangible something |

It's the **Sushi** Burger Club, so sushi gets its own 20-criterion rubric too
(Rice · Fish · Balance · Craft · Honesty · Experience). Pick the plate when you
score; the ledger, radar and Hall of Fame are category-aware.

毕竟我们是**寿司**汉堡俱乐部，寿司也有自己的20项评分标准（米饭 · 鱼料 · 平衡 · 工艺 · 诚意 · 体验）。评分时选择类别，评分榜、雷达图和名人堂均支持分类显示。

**Totals are always recomputed from the sub-scores — the sum is the truth.** Full
details for both rubrics, including the tie-break rules, live on the [methodology page](https://tristan-mcinnis.github.io/sbcs/methodology.html).

**总分始终由子分重新计算——计算之和才是真相。** 两套评分标准的完整细节（含并列排名规则）请见[评分标准页面](https://tristan-mcinnis.github.io/sbcs/methodology.html)。

## Add a rating · 提交评分

The whole "backend" is GitHub. Pick whichever is easiest · 整个"后端"就是GitHub，选择最方便的方式：

1. **Use the site · 使用网站** — open **Score**, fill the card, hit **Log to the Ledger**.
   It opens a pre-filled issue; submit it and the club bot adds it for you. ✅
2. **Open an issue · 提交Issue** — use the *🍔 New burger rating* template and edit the JSON.
3. **Edit directly · 直接编辑** — add a record to [`data/ratings.json`](data/ratings.json) and commit.

Either way a GitHub Action validates the card, appends it to the ledger as a commit,
replies with the breakdown, and closes the issue. Nothing is added in the dark.

无论哪种方式，GitHub Action都会验证评分卡，将其作为提交添加到评分榜，回复明细，并关闭Issue。没有任何内容在暗处添加。

## Run it locally · 本地运行

No build step. The pages fetch JSON, so serve over http (not `file://`):
无需构建步骤。页面通过fetch获取JSON，须通过http（而非`file://`）访问：

```bash
git clone https://github.com/tristan-mcinnis/sbcs.git
cd sbcs
python3 -m http.server 8000   # then open · 然后访问 http://localhost:8000
```

Re-import from a spreadsheet export any time · 随时从电子表格导出文件重新导入：

```bash
node scripts/csv-to-json.mjs path/to/burger_club_scores.csv
```

## Bilingual · 双语

The site ships with an **EN / 中文** toggle in the nav. All UI strings live in
`assets/i18n.js`. Static HTML uses `data-i18n="key"` attributes; JS-generated
strings call `window.t("key")`. Language is persisted to `localStorage`.

网站导航栏内置 **EN / 中文** 切换按钮。所有界面文字存储于`assets/i18n.js`。静态HTML使用`data-i18n="key"`属性；JS生成的字符串通过`window.t("key")`调用。语言偏好保存于`localStorage`。

## Project layout · 项目结构

```
index.html · methodology.html · score.html   the three pages · 三个页面
assets/   styles.css · app.js · score.js · i18n.js · config.js · logo.svg · cover.png
data/     rubric.json (source of truth · 唯一数据源) · ratings.json (the ledger · 评分榜)
scripts/  csv-to-json.mjs · ingest.mjs
.github/  issue template + ingest workflow
```

## Tech · 技术栈

Hand-written HTML/CSS/JS — no framework, no dependencies. Fonts: Fraunces, Archivo,
DM Mono. Hosted on GitHub Pages. The design follows the club's house style: cream
paper, crimson, warm ink, retro-editorial.

纯手写HTML/CSS/JS，无框架，无依赖。字体：Fraunces、Archivo、DM Mono。托管于GitHub Pages。设计遵循俱乐部风格：奶油纸张、深红色、暖墨水、复古编辑风。

## License · 许可

Code is released under the [MIT License](LICENSE). The ratings, words, and artwork
belong to the Sushi Burger Club Shanghai.

代码采用[MIT许可证](LICENSE)。评分数据、文字和艺术作品归上海寿司汉堡俱乐部所有。

<div align="center"><sub>S·B ✕ C·S — Nori · Maki · Burger · Bun · 紫菜 · 卷 · 汉堡 · 面包</sub></div>
