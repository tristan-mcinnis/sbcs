/* ============================================================================
   SBCS — i18n.js
   EN / ZH translations. Load before app.js and score.js.
   Usage: window.t('key') → string in current lang
          window.applyLang() → update all [data-i18n] elements
          window.setLang('en'|'zh') → switch + persist + re-render
   ========================================================================== */
(function () {
  "use strict";

  var S = {
    en: {
      /* nav */
      "nav.ledger": "The Ledger",
      "nav.methodology": "Methodology",
      "nav.charter": "Charter",
      "nav.score": "Score",
      "brand.sub": "Shanghai · Est 2025",

      /* footer */
      "footer.tagline": "A Pro-Carb Collective. We eat with our eyes, our stomachs, and a 20-column spreadsheet. Est 2025.",
      "footer.club": "The Club",
      "footer.findus": "Find Us",
      "footer.score.link": "Score a Burger",
      "footer.copy": "No plate too big or small.",

      /* index hero */
      "hero.kicker": "A Pro-Carb Collective",
      "hero.est": "Est 2025",
      "hero.tagline": "Your culinary guide to the dark arts of dining.",
      "hero.blurb": "Seven appetites, one spreadsheet. We eat Shanghai’s burgers so you don’t have to guess — every patty judged across <strong>20 criteria</strong>, every score on the public record. No plate too big or small.",
      "hero.cta.rank": "See the Rankings",
      "hero.cta.how": "How We Score",
      "hero.starburst": "No Plate<br />Too Big<br />Or Small",
      "hero.foot.nori": "Nori",
      "hero.foot.maki": "Maki",
      "hero.foot.burger": "Burger",
      "hero.foot.bun": "Bun",

      /* leaderboard */
      "lb.eyebrow": "The Ledger",
      "lb.title": "The Standings",
      "lb.lead": "Ranked by mean club score out of 80. Tap any burger to open its full scorecard.",
      "lb.search": "Search a burger, roll or restaurant…",
      "lb.plate": "Plate",
      "lb.type": "Type",
      "lb.rater": "Rater",
      "lb.everyone": "Everyone",
      "lb.sort": "Sort",
      "lb.sort.score": "Top score",
      "lb.sort.recent": "Most recent",
      "lb.sort.value": "Best value",
      "lb.sort.ratings": "Most rated",
      "lb.ratified": "Ratified only",
      "lb.all": "All",
      "lb.loading": "Loading the ledger…",
      "lb.empty": "No plates match.",
      "lb.empty.sub": "Try clearing the filters.",

      /* hall of fame */
      "hall.eyebrow": "Club Honours",
      "hall.title": "The Hall of Fame",
      "hall.lead": "Awarded automatically by the ledger — they’ll shuffle as the cards roll in.",
      "hall.awaiting": "Awaiting cards",

      /* charter */
      "charter.eyebrow": "The Fine Print",
      "charter.title": "Club Charter",
      "charter.premise.title": "The Premise",
      "charter.premise.blurb": "Why a spreadsheet exists for burgers.",
      "charter.premise.text": "SBCS is a small, serious-but-not-that-serious supper club in Shanghai. We meet, we order the burger, and we fill in the card. The point isn’t to be right — it’s to be <em>consistent</em>, so that “an 8” means the same thing in Jing’an as it does in Xuhui.",
      "charter.constitution.title": "The Constitution",
      "charter.constitution.blurb": "Six clauses. Short enough to remember mid-bite.",
      "charter.tasters": "The Tasters · A Pro-Carb Collective of Seven",

      /* methodology */
      "meth.eyebrow": "The Dark Arts of Dining",
      "meth.title": "The Methodology",
      "meth.lead": "Two rubrics, one club. We score every burger — and every plate of sushi — across <strong id=\"critTotal\">20</strong> criteria, each on a four-point scale, for a maximum of <strong id=\"maxTotal\">80</strong> points. No secret weighting. No vibes-only verdicts. Here is exactly how the sausage — and the sashimi — gets made.",
      "scale.eyebrow": "Step One",
      "scale.title": "The Four-Point Scale",
      "scale.lead": "Every criterion gets a whole number from 1 to 4. We keep it tight on purpose — a narrow scale forces a decision and stops everyone defaulting to a polite “7 out of 10.”",
      "criteria.eyebrow": "Step Two",
      "criteria.title": "The Twenty Criteria",
      "criteria.lead": "Grouped into six families. Each family rolls up into the radar you see on every scorecard.",
      "maths.eyebrow": "Step Three",
      "maths.title": "The Maths",
      "maths.h3.computed": "Totals are computed, never trusted",
      "maths.body.computed": "A burger’s total is the sum of its 20 sub-scores, full stop. If an old paper card says “70” but the columns add up to 68, the ledger records <strong>68</strong>. The sum is the truth — it keeps everyone honest and makes every score reproducible.",
      "maths.callout.title": "Worked example — the first entry",
      "maths.callout.body": "Shake Shack’s double ShackBurger scored <code>4·3·4·3·4 / 4·3·3 / 3·4·3·3 / 3·3·4·3 / 3·4 / 3·4</code> across the six families. That sums to <strong>68 / 80</strong> — which is the number on the ledger, regardless of what was scribbled in the “Total” box on the night.",
      "maths.h3.multi": "When more than one of us scores the same burger",
      "maths.body.multi": "Each criterion is averaged across everyone who rated that exact burger at that restaurant. The radar plots those per-family averages; the headline number is the average of everyone’s totals. One person’s hot take can’t run the table.",
      "maths.h3.ranking": "How the rankings are ordered",
      "maths.body.ranking": "The leaderboard sorts by mean total out of 80. When two burgers tie, we break it in this order:",
      "maths.ranking.1": "Higher average on <strong>The Patty</strong> — the part you cannot fake.",
      "maths.ranking.2": "Higher average on <strong>Craveability</strong> — would you go back tomorrow?",
      "maths.ranking.3": "More club ratings on record — consensus beats a single voice.",
      "maths.ranking.4": "The most recent rating wins, because momentum counts.",
      "maths.h3.honest": "The two honest questions",
      "maths.body.honest": "Beyond the 80 points, every card answers two yes/no questions that the score alone can miss:",
      "maths.honest.1": "<strong>Order again?</strong> — Would <em>you</em> personally order this exact burger next time?",
      "maths.honest.2": "<strong>Club recommends?</strong> — Would you send a friend across town for it?",
      "maths.h3.governance": "Governance",
      "maths.body.governance": "The rubric lives in one file — <code>data/rubric.json</code> — and this page is generated from it, so the methodology can never quietly drift from what we actually score. Changing a criterion is a visible edit on the public record. Every rating arrives as its own entry in <code>data/ratings.json</code>; nothing is added in the dark.",
      "quorum.eyebrow": "Step Four",
      "quorum.title": "Quorum &amp; Consensus",
      "quorum.lead": "We average independent cards — but we never average away a good argument.",
      "quorum.card.title": "Quorum",
      "quorum.card.count": "2+ cards = Ratified",
      "quorum.card.desc": "On the ledger, a single tasting is badged <strong>Provisional</strong>; two or more becomes <strong>Ratified</strong> — an official Club Verdict. Filter the leaderboard to “Ratified only” to see what the club has actually stood behind.",
      "consensus.card.title": "Consensus",
      "constitution.eyebrow": "The Fine Print",
      "constitution.title": "The Burger Constitution",
      "constitution.lead": "The whole rulebook, fits on a napkin.",
      "constitution.cta": "Score a Burger",

      /* score page */
      "score.eyebrow": "The Official Scorecard",
      "score.title": "Score a Burger",
      "score.lead": "Score first, discuss later. Fill the card across all 20 criteria — the running total updates live. When you’re done, log it to the public ledger and the club bot files it for you.",
      "form.plate": "Plate",
      "form.rater": "Rater",
      "form.restaurant": "Restaurant",
      "form.burger.label": "Burger / Item",
      "form.sushi.label": "Item / set",
      "form.date": "Date",
      "form.price": "Price (¥)",
      "form.type": "Type",
      "form.weight": "Patty Weight (g)",
      "verdict.title": "The Verdict",
      "verdict.blurb": "two honest questions",
      "verdict.again": "Order again?",
      "verdict.again.desc": "Would you personally order this exact burger next time?",
      "verdict.rec": "Club recommends?",
      "verdict.rec.desc": "Would you send a friend across town for it?",
      "verdict.yes": "Yes",
      "verdict.no": "No",
      "notes.label": "Tasting notes",
      "notes.optional": "(optional)",
      "notes.placeholder": "The one line you’d tell a friend…",
      "outpanel.title": "YOUR CARD",
      "btn.copy": "Copy JSON",
      "btn.download": "Download .json",
      "sb.eyebrow": "Running Total",
      "sb.log": "Log to the Ledger",
      "sb.share": "Copy for the group chat",
      "sb.preview": "Preview JSON",
      "share.note": "No GitHub account? Tap <b>Copy for the group chat</b>, paste it into the SBCS WeChat, and the scorekeeper drops it into the ledger. Your card still lands on the public record — same as everyone’s.",

      /* JS-generated (app.js / score.js) */
      "js.orderAgain": "Order again",
      "js.clubRec": "Club recommends",
      "js.ratedBy": "Rated by",
      "js.generous": "Most generous",
      "js.harsh": "Harshest",
      "js.patty": "g patty",
      "js.stats.scored.lbl": "Scores Logged",
      "js.stats.scored.sub": "and counting",
      "js.stats.plates.lbl": "Plates Judged",
      "js.stats.plates.sub": "burgers & sushi",
      "js.stats.kitchens.lbl": "Kitchens Visited",
      "js.stats.kitchens.sub": "no plate too small",
      "js.stats.top.lbl": "Top Score",
      "js.awaiting": "Awaiting cards",
      "js.clubAvgLegend": "Club average per category · max 4.0",
      "js.spread": "spread",
      "js.provisionalAwaiting": "one card so far, awaiting quorum",
      "js.prov": "prov.",
      "js.consensus": "Consensus",
      "js.rating": "rating",
      "js.ratings": "ratings"
    },

    zh: {
      /* nav */
      "nav.ledger": "评分榜",
      "nav.methodology": "评分标准",
      "nav.charter": "信条与章程",
      "nav.score": "评分",
      "brand.sub": "上海 · 成立于2025",

      /* footer */
      "footer.tagline": "碳水集团。我们用眼睛、用胃、用一张20列的表格来品味美食。成立于2025年。",
      "footer.club": "俱乐部",
      "footer.findus": "找到我们",
      "footer.score.link": "为汉堡评分",
      "footer.copy": "无论大盘小盘。",

      /* index hero */
      "hero.kicker": "碳水集团",
      "hero.est": "成立于2025",
      "hero.tagline": "饮食黑暗艺术指南。",
      "hero.blurb": "七个胃，一张表格。我们代你品尝上海的汉堡，免你猜测——每块肉饼经过 <strong>20项标准</strong> 的评判，每个分数公开记录在案。无论大盘小盘，皆在评定之列。",
      "hero.cta.rank": "查看排名",
      "hero.cta.how": "评分方法",
      "hero.starburst": "无论<br />大盘小盘",
      "hero.foot.nori": "紫菜",
      "hero.foot.maki": "卷",
      "hero.foot.burger": "汉堡",
      "hero.foot.bun": "面包",

      /* leaderboard */
      "lb.eyebrow": "评分榜",
      "lb.title": "排名榜",
      "lb.lead": "按俱乐部平均分（满分80）排名。点击任意条目查看完整评分卡。",
      "lb.search": "搜索汉堡、寿司或餐厅……",
      "lb.plate": "类别",
      "lb.type": "类型",
      "lb.rater": "评分者",
      "lb.everyone": "全部",
      "lb.sort": "排序",
      "lb.sort.score": "最高分",
      "lb.sort.recent": "最新",
      "lb.sort.value": "最佳性价比",
      "lb.sort.ratings": "最多评分",
      "lb.ratified": "仅显示已认定",
      "lb.all": "全部",
      "lb.loading": "加载评分榜中……",
      "lb.empty": "没有匹配的菜品。",
      "lb.empty.sub": "请尝试清除筛选条件。",

      /* hall of fame */
      "hall.eyebrow": "俱乐部荣誉",
      "hall.title": "名人堂",
      "hall.lead": "由评分榜自动授予——随着评分卡持续增加而更新。",
      "hall.awaiting": "等待评分卡",

      /* charter */
      "charter.eyebrow": "细则",
      "charter.title": "俱乐部章程",
      "charter.premise.title": "宗旨",
      "charter.premise.blurb": "为何为汉堡建立评分表格。",
      "charter.premise.text": "SBCS是一个认真但不过于认真的小型晚餐信乐部，坐落于上海。我们相聚，点上汉堡，填写评分卡。重点不在于「谁对」——而在于<em>一致性</em>，让「8分」在静安和徐汇意味相同。",
      "charter.constitution.title": "信条与章程",
      "charter.constitution.blurb": "六条规则，一口之间便可记住。",
      "charter.tasters": "品鉴者 · 七人碳水集团",

      /* methodology */
      "meth.eyebrow": "饮食黑暗艺术",
      "meth.title": "评分方法",
      "meth.lead": "两套评分标准，一个俱乐部。我们对每一份汉堡和每一盘寿司进行 <strong id=\"critTotal\">20</strong> 项评分，每项采用四分制，满分 <strong id=\"maxTotal\">80</strong> 分。没有秘密权重，没有仅凭感觉的裁定。以下是我们完整的评分流程。",
      "scale.eyebrow": "第一步",
      "scale.title": "四分制",
      "scale.lead": "每项标准评以1致4的整数。我们刻意保持评分范围狭小——这迫使评分者做出明确判断，避免所有人默认给出“10分中的7分”这类模糊回答。",
      "criteria.eyebrow": "第二步",
      "criteria.title": "二十项评分标准",
      "criteria.lead": "分为六大类。每大类汇总为每张评分卡雷达图中的一个轴。",
      "maths.eyebrow": "第三步",
      "maths.title": "计算方法",
      "maths.h3.computed": "总分由计算得出，不接受手写",
      "maths.body.computed": "汉堡的总分等于其20项子分之和，仅此而已。如果旧纸质评分卡写着“70”，但各列相加为68，评分榜则记录 <strong>68</strong>。计算之和才是真相——这让所有人保持诚实，并使每个分数可复现。",
      "maths.callout.title": "示例——第一条记录",
      "maths.callout.body": "Shake Shack双层ShackBurger在六大类的得分为 <code>4·3·4·3·4 / 4·3·3 / 3·4·3·3 / 3·3·4·3 / 3·4 / 3·4</code>，合计 <strong>68 / 80</strong>——这就是评分榜上的数字，无论当晚在“总分”框里潦草写下的是什么。",
      "maths.h3.multi": "当多位成员为同一汉堡评分时",
      "maths.body.multi": "每项标准取所有对该餐厅同一汉堡评分的成员的平均值。雷达图展示各大类的平均分；总分则是所有人得分的平均值。一个人的一时冲动无法左右最终结果。",
      "maths.h3.ranking": "如何排名",
      "maths.body.ranking": "排行榜按满分80分的平均总分排序。若两份汉堡得分相同，则按以下顺序打破平局：",
      "maths.ranking.1": "<strong>肉饼</strong>平均分更高——这是无法伪造的部分。",
      "maths.ranking.2": "<strong>回购欲</strong>平均分更高——明天你还会去吗？",
      "maths.ranking.3": "俱乐部评分记录更多——共识胜于一家之言。",
      "maths.ranking.4": "最近的评分获胜，因为势头很重要。",
      "maths.h3.honest": "两个诚实问题",
      "maths.body.honest": "除80分之外，每张评分卡还回答两个是否问题，这些是单靠分数无法捕捉到的：",
      "maths.honest.1": "<strong>再次点单？</strong> — <em>你</em>个人下次还会点这个汉堡吗？",
      "maths.honest.2": "<strong>俱乐部推荐？</strong> — 你会特意推荐朋友来尝吗？",
      "maths.h3.governance": "管理",
      "maths.body.governance": "评分标准存储于单一文件——<code>data/rubric.json</code>——本页由该文件生成，因此评分方法永远不会悄悄偏离我们实际评分的内容。修改任何标准将在公开记录上留下可见的编辑痕迹。每条评分均作为独立条目进入<code>data/ratings.json</code>；没有任何内容是在暗处添加的。",
      "quorum.eyebrow": "第四步",
      "quorum.title": "定额与共识",
      "quorum.lead": "我们对独立评分卡取平均值——但绝不因此抹消有价值的分歧。",
      "quorum.card.title": "定额",
      "quorum.card.count": "2张以上 = 已认定",
      "quorum.card.desc": "在评分榜上，单次品鉴标记为<strong>暂定</strong>；两次或以上则成为<strong>已认定</strong>——即官方俱乐部裁定。筛选”仅显示已认定”可查看俱乐部真正认可的评价。",
      "consensus.card.title": "共识",
      "constitution.eyebrow": "细则",
      "constitution.title": "汉堡章程",
      "constitution.lead": "完整规则，一张餐巾纸便可写尽。",
      "constitution.cta": "为汉堡评分",

      /* score page */
      "score.eyebrow": "官方评分卡",
      "score.title": "为汉堡评分",
      "score.lead": "先评分，后讨论。填写全部20项标准——实时总分将即时更新。完成后，将其记录到公开评分榜，俱乐部机器人将自动处理。",
      "form.plate": "类别",
      "form.rater": "评分者",
      "form.restaurant": "餐厅",
      "form.burger.label": "汉堡/菜品",
      "form.sushi.label": "菜品/套餐",
      "form.date": "日期",
      "form.price": "价格（¥）",
      "form.type": "类型",
      "form.weight": "肉饼重量（克）",
      "verdict.title": "终裁",
      "verdict.blurb": "两个诚实问题",
      "verdict.again": "再次点单？",
      "verdict.again.desc": "你个人下次还会点这个汉堡吗？",
      "verdict.rec": "俱乐部推荐？",
      "verdict.rec.desc": "你会特意推荐朋友来尝吗？",
      "verdict.yes": "是",
      "verdict.no": "否",
      "notes.label": "品鉴笔记",
      "notes.optional": "（可选）",
      "notes.placeholder": "你会告诉朋友的那句话……",
      "outpanel.title": "你的评分卡",
      "btn.copy": "复制JSON",
      "btn.download": "下载.json",
      "sb.eyebrow": "实时总分",
      "sb.log": "记录到评分榜",
      "sb.share": "复制到群聊",
      "sb.preview": "预览JSON",
      "share.note": "没有GitHub账号？点击<b>复制到群聊</b>，粘贴到SBCS微信群，记分员会将其录入评分榜。你的评分卡同样会出现在公开记录上——与其他人的一样。",

      /* JS-generated */
      "js.orderAgain": "再次点单",
      "js.clubRec": "俱乐部推荐",
      "js.ratedBy": "评分者",
      "js.generous": "最高分者",
      "js.harsh": "最严苛",
      "js.patty": "克肉饼",
      "js.stats.scored.lbl": "已记录评分",
      "js.stats.scored.sub": "持续增加中",
      "js.stats.plates.lbl": "已评菜品",
      "js.stats.plates.sub": "汉堡与寿司",
      "js.stats.kitchens.lbl": "已访餐厅",
      "js.stats.kitchens.sub": "无论大盘小盘",
      "js.stats.top.lbl": "最高分",
      "js.awaiting": "等待评分卡",
      "js.clubAvgLegend": "俱乐部各类别平均分 · 满分 4.0",
      "js.spread": "差值",
      "js.provisionalAwaiting": "仅有一张评分卡，等待达到定额",
      "js.prov": "暂定",
      "js.consensus": "共识",
      "js.rating": "份评分",
      "js.ratings": "份评分"
    }
  };

  window.SBCS_LANG = localStorage.getItem("sbcs-lang") || "en";

  window.t = function (key) {
    var lang = window.SBCS_LANG;
    return (S[lang] && S[lang][key] !== undefined ? S[lang][key] : S.en[key]) || key;
  };

  window.applyLang = function () {
    document.documentElement.lang = window.SBCS_LANG === "zh" ? "zh-CN" : "en";
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (key) el.innerHTML = window.t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-placeholder");
      if (key) el.setAttribute("placeholder", window.t(key));
    });
    var btn = document.getElementById("langBtn");
    if (btn) btn.textContent = window.SBCS_LANG === "zh" ? "EN" : "中文";
  };

  window.setLang = function (lang) {
    localStorage.setItem("sbcs-lang", lang);
    window.SBCS_LANG = lang;
    window.applyLang();
    window.dispatchEvent(new CustomEvent("langchange"));
  };

  document.addEventListener("DOMContentLoaded", function () {
    window.applyLang();
    var btn = document.getElementById("langBtn");
    if (btn) {
      btn.addEventListener("click", function () {
        window.setLang(window.SBCS_LANG === "zh" ? "en" : "zh");
      });
    }
  });
})();
