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
    $$("[data-reveal]").forEach((el) => el.classList.add("in"));
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
    const cat = rubric.categories.burger;
    const sc = rubric.scale;
    const keys = Object.keys(cat.criteria);
    const MAX = cat.max;
    $("#sbMax").textContent = MAX;

    // ---- populate static selects/lists
    const typeSel = $("#f-type");
    rubric.types.forEach((t) => typeSel.add(new Option(t, t)));
    const dl = $("#memberList");
    (rubric.members || []).forEach((m) => dl.appendChild(new Option(m, m)));
    const dateEl = $("#f-date");
    const today = new Date();
    dateEl.value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // ---- build the score groups from the rubric
    const groupsHost = $("#scoreGroups");
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

    // ---- build scoreboard group mini-bars
    $("#sbGroups").innerHTML = cat.groups.map((g) =>
      `<div class="sb-grp" data-g="${g.key}"><span>${g.label.replace(/^The\s+/i, "")}</span>
        <div class="gmini"><i></i></div><span class="gv">–</span></div>`
    ).join("");

    const form = $("#scoreForm");

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
      // per-group
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
    update();

    // ---- build a rating record from the form
    function buildRecord() {
      const val = (id) => $(id).value.trim();
      const num = (id) => { const v = $(id).value.trim(); return v === "" ? null : Number(v); };
      const radio = (name) => { const el = form.querySelector(`input[name="${name}"]:checked`); return el ? el.value : null; };
      const again = radio("again"), rec = radio("recommend");
      return {
        date: val("#f-date"),
        rater: val("#f-rater"),
        restaurant: val("#f-restaurant"),
        burger: val("#f-burger"),
        category: "burger",
        price: num("#f-price"),
        type: $("#f-type").value,
        pattyWeight: num("#f-weight"),
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
        `New burger rating from the SBCS scorecard 🍔\n\n` +
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
