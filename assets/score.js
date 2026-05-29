/* ============================================================================
   SBCS — score.js
   Builds the official scorecard from data/rubric.json, drives the live
   scoreboard, and produces a rating record three ways: file a pre-filled
   GitHub issue (the club bot ingests it), copy JSON, or download JSON.
   ========================================================================== */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const slug = (s) => String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const CFG = window.SBCS_CONFIG || { repo: "" };

  function chrome() {
    const y = $("#year"); if (y) y.textContent = String(new Date().getFullYear());
    const t = $(".nav-toggle"), l = $("#navLinks");
    if (t && l) {
      t.addEventListener("click", () => { const o = l.classList.toggle("open"); t.setAttribute("aria-expanded", String(o)); });
      $$("#navLinks a").forEach((a) => a.addEventListener("click", () => l.classList.remove("open")));
    }
    $$("[data-reveal]").forEach((el, i) => { el.style.animationDelay = (Math.min(i, 8) * 70) + "ms"; });
  }

  async function boot() {
    chrome();
    let rubric;
    try {
      const res = await fetch("data/rubric.json", { cache: "no-cache" });
      rubric = await res.json();
    } catch (e) {
      $("#formMsg").className = "form-msg err show";
      $("#formMsg").textContent = "Couldn't load the rubric. Serve the site over http (python3 -m http.server).";
      return;
    }
    const sc = rubric.scale;
    const CAT_EMOJI = { burger: "🍔", sushi: "🍣" };
    let cat, keys, MAX; // current category state, set by renderCategory()

    // ---- category selector
    const catSel = $("#f-category");
    Object.keys(rubric.categories).forEach((k) =>
      catSel.add(new Option(`${CAT_EMOJI[k] || ""} ${rubric.categories[k].label}`.trim(), k)));

    // ---- rater dropdown (members + guest)
    const raterSel = $("#f-rater");
    (rubric.members || []).forEach((m) => raterSel.add(new Option(m, m)));
    raterSel.add(new Option("Other / guest…", "__other"));
    const raterOther = $("#f-rater-other");
    raterSel.addEventListener("change", () => {
      if (raterOther) { raterOther.style.display = raterSel.value === "__other" ? "" : "none"; if (raterSel.value === "__other") raterOther.focus(); }
    });

    const dateEl = $("#f-date");
    const today = new Date();
    dateEl.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    const form = $("#scoreForm");
    const groupsHost = $("#scoreGroups");
    const typeSel = $("#f-type");

    // ---- (re)build the card for a category
    function renderCategory(key) {
      cat = rubric.categories[key];
      keys = Object.keys(cat.criteria);
      MAX = cat.max;
      $("#sbMax").textContent = MAX;

      typeSel.innerHTML = "";
      (cat.types || rubric.types || []).forEach((t) => typeSel.add(new Option(t, t)));

      const weightField = $("#f-weight") ? $("#f-weight").closest(".field") : null;
      if (weightField) weightField.style.display = key === "burger" ? "" : "none";
      const burgerLabel = $("#f-burger-label");
      if (burgerLabel) burgerLabel.textContent = key === "sushi" ? "Item / set" : "Burger / Item";

      groupsHost.innerHTML = cat.groups.map((g) => {
        const items = g.criteria.map((k) => {
          const c = cat.criteria[k];
          const seg = [1, 2, 3, 4].map((v) =>
            `<input type="radio" name="s-${k}" id="s-${k}-${v}" value="${v}"><label for="s-${k}-${v}" title="${sc.labels[v]}">${v}</label>`
          ).join("");
          return `<div class="score-item" data-key="${k}">
            <div><div class="si-label">${c.label}</div><div class="si-desc">${c.desc}</div></div>
            <div class="segmented" role="radiogroup" aria-label="${c.label} score, 1 to 4">${seg}</div>
          </div>`;
        }).join("");
        return `<div class="score-group">
          <div class="sg-head"><h3>${g.label}</h3><span class="sg-blurb">${g.blurb}</span></div>${items}</div>`;
      }).join("");

      $("#sbGroups").innerHTML = cat.groups.map((g) =>
        `<div class="sb-grp" data-g="${g.key}"><span>${g.label.replace(/^The\s+/i, "")}</span>
          <div class="gmini"><i></i></div><span class="gv">–</span></div>`
      ).join("");

      update();
    }

    function readScores() {
      const scores = {};
      for (const k of keys) {
        const sel = form.querySelector(`input[name="s-${k}"]:checked`);
        if (sel) scores[k] = Number(sel.value);
      }
      return scores;
    }

    function update() {
      const scores = readScores();
      const got = Object.keys(scores);
      const total = got.reduce((a, k) => a + scores[k], 0);
      $("#sbTotal").textContent = total;
      $("#sbBar").style.width = clamp((total / MAX) * 100, 0, 100) + "%";
      $("#sbProgress").textContent = `${got.length} of ${keys.length} scored`;
      cat.groups.forEach((g) => {
        const vals = g.criteria.map((k) => scores[k]).filter((v) => typeof v === "number");
        const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
        const row = $(`.sb-grp[data-g="${g.key}"]`);
        row.querySelector("i").style.width = (avg / 4 * 100) + "%";
        row.querySelector(".gv").textContent = vals.length ? avg.toFixed(1) : "–";
      });
    }
    form.addEventListener("change", update);
    form.addEventListener("input", update);
    catSel.addEventListener("change", () => renderCategory(catSel.value));
    renderCategory(catSel.value || Object.keys(rubric.categories)[0]);

    // ---- build a rating record from the form
    function buildRecord() {
      const val = (id) => $(id).value.trim();
      const num = (id) => { const v = $(id).value.trim(); return v === "" ? null : Number(v); };
      const radio = (name) => { const el = form.querySelector(`input[name="${name}"]:checked`); return el ? el.value : null; };
      const again = radio("again"), rec = radio("recommend");
      const category = catSel.value;
      let rater = raterSel.value;
      if (rater === "__other") rater = (raterOther ? raterOther.value : "").trim();
      return {
        date: val("#f-date"),
        rater,
        restaurant: val("#f-restaurant"),
        burger: val("#f-burger"),
        category,
        price: num("#f-price"),
        type: typeSel.value,
        pattyWeight: category === "burger" ? num("#f-weight") : null,
        scores: readScores(),
        again: again === null ? null : again === "yes",
        recommend: rec === null ? null : rec === "yes",
        notes: val("#f-notes"),
      };
    }

    function validate(rec) {
      const missing = [];
      if (!rec.rater) missing.push("your name");
      if (!rec.restaurant) missing.push("the restaurant");
      if (!rec.burger) missing.push("the burger");
      const unscored = keys.filter((k) => !(k in rec.scores));
      $$(".score-item").forEach((el) => el.classList.toggle("invalid", unscored.includes(el.dataset.key)));
      if (unscored.length) missing.push(`${unscored.length} unscored criteria`);
      return missing;
    }

    function msg(type, text) {
      const m = $("#formMsg");
      m.className = `form-msg show ${type}`;
      m.innerHTML = text;
    }

    function showJSON(rec) {
      $("#outJson").textContent = JSON.stringify(rec, null, 2);
      $("#outPanel").classList.add("show");
    }

    // ---- actions
    $("#btnPreview").addEventListener("click", () => {
      const rec = buildRecord(); showJSON(rec);
      $("#outPanel").scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    $("#btnLog").addEventListener("click", () => {
      const rec = buildRecord();
      const missing = validate(rec);
      if (missing.length) {
        msg("err", `Almost there — still need: <strong>${missing.join(", ")}</strong>.`);
        $("#formMsg").scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
      showJSON(rec);
      if (!CFG.repo || CFG.repo.includes("OWNER")) {
        msg("ok", "Card complete. The repo isn't configured yet — use <strong>Copy JSON</strong> below and paste it into <code>data/ratings.json</code>, or add it as a <code>rating</code> issue.");
        return;
      }
      const title = `Rating: ${rec.restaurant} — ${rec.burger} (${rec.rater})`;
      const body =
        `New ${rec.category} rating from the SBCS scorecard ${CAT_EMOJI[rec.category] || "🍔"}\n\n` +
        `The club bot will add this to the ledger automatically once this issue has the **rating** label.\n\n` +
        "```json\n" + JSON.stringify(rec, null, 2) + "\n```\n";
      const url = `https://github.com/${CFG.repo}/issues/new?labels=rating&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
      window.open(url, "_blank", "noopener");
      msg("ok", "Opening GitHub… review your card and click <strong>Submit new issue</strong>. The bot does the rest.");
    });

    $("#btnCopy").addEventListener("click", async () => {
      const txt = JSON.stringify(buildRecord(), null, 2);
      try { await navigator.clipboard.writeText(txt); msg("ok", "Copied your card's JSON to the clipboard."); }
      catch { showJSON(buildRecord()); msg("ok", "Select the JSON below and copy it."); }
    });

    function shareText(rec) {
      const total = keys.reduce((a, k) => a + (rec.scores[k] || 0), 0);
      const got = Object.keys(rec.scores).length;
      const head =
        `${CAT_EMOJI[rec.category] || "🍔"} SBCS card — ${rec.restaurant || "?"}: ${rec.burger || "?"}\n` +
        `${total}/${MAX}  (${got}/${keys.length} scored) · by ${rec.rater || "?"}` +
        `${rec.again != null ? ` · again: ${rec.again ? "yes" : "no"}` : ""}` +
        `${rec.notes ? `\n“${rec.notes}”` : ""}`;
      return head + "\n\n```json\n" + JSON.stringify(rec, null, 2) + "\n```";
    }

    $("#btnShare").addEventListener("click", async () => {
      const rec = buildRecord();
      const txt = shareText(rec);
      try {
        await navigator.clipboard.writeText(txt);
        msg("ok", "Copied a tidy card for the group chat — paste it into WeChat. The scorekeeper drops it into a <strong>rating</strong> issue and the bot logs it.");
      } catch {
        showJSON(rec);
        msg("ok", "Copy the card below and paste it into the group chat.");
      }
    });

    $("#btnDownload").addEventListener("click", () => {
      const rec = buildRecord();
      const blob = new Blob([JSON.stringify(rec, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `sbcs-${slug(rec.restaurant) || "rating"}-${slug(rec.burger) || "card"}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
