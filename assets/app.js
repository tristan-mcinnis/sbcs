/* ============================================================================
   SBCS — app.js
   Powers the ledger (index) and the methodology page. Pure vanilla, no deps.
   Source of truth: data/rubric.json + data/ratings.json.
   ========================================================================== */
(function () {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const slug = (s) => String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const sum = (arr) => arr.reduce((a, b) => a + b, 0);
  const mean = (arr) => (arr.length ? sum(arr) / arr.length : 0);
  const mode = (arr) => {
    const m = {}; let best = "", bestN = 0;
    for (const v of arr) { if (!v) continue; m[v] = (m[v] || 0) + 1; if (m[v] > bestN) { bestN = m[v]; best = v; } }
    return best;
  };
  const fmt = (n, d = 1) => Number(n).toFixed(d);

  /* ----------------------------------------------------- chrome (all pages) */
  function initChrome() {
    const y = $("#year"); if (y) y.textContent = String(new Date().getFullYear());
    const toggle = $(".nav-toggle"), links = $("#navLinks");
    if (toggle && links) {
      toggle.addEventListener("click", () => {
        const open = links.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(open));
      });
      $$("#navLinks a").forEach((a) => a.addEventListener("click", () => links.classList.remove("open")));
    }
    const io = "IntersectionObserver" in window
      ? new IntersectionObserver((entries) => {
          entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
        }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" })
      : null;
    $$("[data-reveal]").forEach((el, i) => {
      el.style.transitionDelay = (Math.min(i, 6) * 60) + "ms";
      if (io) io.observe(el); else el.classList.add("in");
    });
  }

  async function loadJSON(path) {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error(`${path}: ${res.status}`);
    return res.json();
  }

  /* ----------------------------------------------------------- aggregation */
  function criteriaKeys(rubric) { return Object.keys(rubric.categories.burger.criteria); }

  function aggregate(ratings, rubric) {
    const cat = rubric.categories.burger;
    const keys = criteriaKeys(rubric);
    const byBurger = new Map();
    for (const r of ratings) {
      const id = slug(r.restaurant) + "--" + slug(r.burger);
      if (!byBurger.has(id)) byBurger.set(id, { id, restaurant: r.restaurant, burger: r.burger, ratings: [] });
      byBurger.get(id).ratings.push(r);
    }
    const burgers = [];
    for (const b of byBurger.values()) {
      const totals = b.ratings.map((r) => sum(keys.map((k) => r.scores[k] || 0)));
      const critMean = {};
      for (const k of keys) {
        const vals = b.ratings.map((r) => r.scores[k]).filter((v) => typeof v === "number");
        critMean[k] = vals.length ? mean(vals) : 0;
      }
      const groupMean = {};
      for (const g of cat.groups) groupMean[g.key] = mean(g.criteria.map((k) => critMean[k]));
      const prices = b.ratings.map((r) => r.price).filter((p) => typeof p === "number" && p > 0);
      const weights = b.ratings.map((r) => r.pattyWeight).filter((p) => typeof p === "number" && p > 0);
      const againYes = b.ratings.filter((r) => r.again === true).length;
      const againTot = b.ratings.filter((r) => r.again === true || r.again === false).length;
      const recYes = b.ratings.filter((r) => r.recommend === true).length;
      const recTot = b.ratings.filter((r) => r.recommend === true || r.recommend === false).length;
      const quorumMin = (rubric.quorum && rubric.quorum.min) || 2;
      const cards = b.ratings.map((r) => ({ rater: r.rater, total: sum(keys.map((k) => r.scores[k] || 0)) }));
      cards.sort((a, c) => c.total - a.total);
      burgers.push({
        ...b,
        total: mean(totals),
        critMean, groupMean,
        raters: Array.from(new Set(b.ratings.map((r) => r.rater))),
        count: b.ratings.length,
        ratified: b.ratings.length >= quorumMin,
        spread: totals.length > 1 ? Math.max(...totals) - Math.min(...totals) : 0,
        generous: cards.length > 1 ? cards[0] : null,
        harsh: cards.length > 1 ? cards[cards.length - 1] : null,
        price: prices.length ? mean(prices) : null,
        weight: weights.length ? Math.round(mean(weights)) : null,
        type: mode(b.ratings.map((r) => r.type)) || "—",
        recent: b.ratings.map((r) => r.date).sort().slice(-1)[0] || "",
        again: { yes: againYes, total: againTot },
        recommend: { yes: recYes, total: recTot },
      });
    }
    return burgers;
  }

  const cmpScore = (a, b) =>
    b.total - a.total ||
    b.groupMean.patty - a.groupMean.patty ||
    b.critMean.craveability - a.critMean.craveability ||
    b.count - a.count ||
    (b.recent > a.recent ? 1 : -1);

  /* --------------------------------------------------------------- ledger */
  async function initLedger(rubric) {
    const listEl = $("#lbList");
    let ratings;
    try { ratings = await loadJSON("data/ratings.json"); }
    catch (err) {
      listEl.innerHTML = `<div class="empty-state"><div class="big">The ledger can't load over <code>file://</code>.</div>
        <p>Run a local server (e.g. <code>python3 -m http.server</code>) or view the live site. <br/><small>${err.message}</small></p></div>`;
      return;
    }
    const cat = rubric.categories.burger;
    const MAX = cat.max;
    const keys = criteriaKeys(rubric);
    const Q = rubric.quorum || { min: 2, provisionalLabel: "Provisional", ratifiedLabel: "Ratified" };
    const consensusOf = (spread) => {
      for (const band of (rubric.consensus && rubric.consensus.bands) || []) if (spread <= band.maxSpread) return band;
      return null;
    };

    // populate filters
    const typeSel = $("#lbType"), raterSel = $("#lbRater");
    Array.from(new Set(ratings.map((r) => r.type).filter(Boolean))).sort()
      .forEach((t) => typeSel.add(new Option(t, t)));
    Array.from(new Set(ratings.map((r) => r.rater).filter(Boolean))).sort()
      .forEach((r) => raterSel.add(new Option(r, r)));

    const ui = { search: $("#lbSearch"), type: typeSel, rater: raterSel, sort: $("#lbSort"), ratified: $("#lbRatified") };
    let openId = null;

    function compute() {
      let rows = ratings.slice();
      if (ui.rater.value) rows = rows.filter((r) => r.rater === ui.rater.value);
      let burgers = aggregate(rows, rubric);
      if (ui.type.value) burgers = burgers.filter((b) => b.type === ui.type.value);
      if (ui.ratified && ui.ratified.checked) burgers = burgers.filter((b) => b.ratified);
      const q = ui.search.value.trim().toLowerCase();
      if (q) burgers = burgers.filter((b) => (b.burger + " " + b.restaurant).toLowerCase().includes(q));
      switch (ui.sort.value) {
        case "recent": burgers.sort((a, b) => (b.recent > a.recent ? 1 : a.recent > b.recent ? -1 : cmpScore(a, b))); break;
        case "ratings": burgers.sort((a, b) => b.count - a.count || cmpScore(a, b)); break;
        case "value":
          burgers.sort((a, b) => {
            const va = a.price ? a.total / a.price : -1, vb = b.price ? b.total / b.price : -1;
            return vb - va || cmpScore(a, b);
          }); break;
        default: burgers.sort(cmpScore);
      }
      return burgers;
    }

    function pips(val) {
      let s = '<span class="pips" title="' + fmt(val) + ' / 4">';
      const on = Math.round(val);
      for (let i = 1; i <= 4; i++) s += `<span class="pip${i <= on ? " on" : ""}"></span>`;
      return s + "</span>";
    }

    function radarSVG(b) {
      const groups = cat.groups;
      const n = groups.length, cx = 120, cy = 116, R = 82;
      const ang = (i) => (-90 + (i * 360) / n) * Math.PI / 180;
      const pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
      let grid = "";
      for (const f of [0.25, 0.5, 0.75, 1]) {
        const p = groups.map((_, i) => pt(i, R * f).map((x) => x.toFixed(1)).join(",")).join(" ");
        grid += `<polygon points="${p}" fill="none" stroke="rgba(33,27,22,.14)" stroke-width="1"/>`;
      }
      let axes = "", labels = "";
      groups.forEach((g, i) => {
        const [x, y] = pt(i, R);
        axes += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="rgba(33,27,22,.14)" stroke-width="1"/>`;
        const [lx, ly] = pt(i, R + 17);
        const anchor = Math.abs(lx - cx) < 8 ? "middle" : lx > cx ? "start" : "end";
        const short = g.label.replace(/^The\s+/i, "");
        labels += `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}" dominant-baseline="middle"
          font-family="Archivo, sans-serif" font-size="9.5" font-weight="700" fill="#6a5f51" letter-spacing=".04em">${short.toUpperCase()}</text>`;
      });
      const dataPts = groups.map((g, i) => pt(i, R * clamp(b.groupMean[g.key] / 4, 0, 1)));
      const poly = dataPts.map((p) => p.map((x) => x.toFixed(1)).join(",")).join(" ");
      const dots = dataPts.map((p) => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3" fill="#c02b45"/>`).join("");
      return `<svg viewBox="-32 -8 304 250" role="img" aria-label="Score radar across six categories">
        ${grid}${axes}
        <polygon points="${poly}" fill="rgba(192,43,69,.16)" stroke="#c02b45" stroke-width="2" stroke-linejoin="round"/>
        ${dots}${labels}</svg>`;
    }

    function detailHTML(b) {
      const groupBlocks = cat.groups.map((g) => {
        const crits = g.criteria.map((k) => {
          const c = cat.criteria[k];
          return `<div class="crit"><span class="c-label">${c.label}</span>${pips(b.critMean[k])}</div>`;
        }).join("");
        return `<div class="group-block"><div class="group-head"><h4>${g.label}</h4>
          <span class="g-avg">${fmt(b.groupMean[g.key])} / 4</span></div>
          <div class="crit-grid">${crits}</div></div>`;
      }).join("");

      const notes = b.ratings.filter((r) => r.notes && r.notes.trim());
      const noteCards = notes.map((r) =>
        `<div class="note-card"><div class="who">${r.rater} <span class="date">· ${r.date}</span></div><p>${escapeHTML(r.notes)}</p></div>`
      ).join("");
      const yn = (o) => o.total ? `<span class="yn ${o.yes >= o.total - o.yes ? "yes" : "no"}">${o.yes}/${o.total}</span>` : '<span class="yn">—</span>';

      const band = b.ratified ? consensusOf(b.spread) : null;
      const status = b.ratified
        ? `<span class="verdict"><span class="yn yes">✓ ${Q.ratifiedLabel}</span></span>` +
          (band ? `<span class="verdict">Consensus <span class="yn">${band.label}</span> <span style="color:var(--ink-faint)">· spread ${b.spread}</span></span>` : "")
        : `<span class="verdict"><span class="yn">${Q.provisionalLabel}</span> <span style="color:var(--ink-faint)">· one card so far, awaiting quorum</span></span>`;
      const critics = b.count > 1
        ? `<span class="verdict">Most generous: ${escapeHTML(b.generous.rater)} (${b.generous.total}) · Harshest: ${escapeHTML(b.harsh.rater)} (${b.harsh.total})</span>`
        : "";

      return `<div class="lb-detail">
        <div class="detail-radar">${radarSVG(b)}<div class="legend">Club average per category · max 4.0</div></div>
        <div class="detail-bars">${groupBlocks}
          <div class="verdicts">
            ${status}
            <span class="verdict">Order again ${yn(b.again)}</span>
            <span class="verdict">Club recommends ${yn(b.recommend)}</span>
            <span class="verdict">Rated by ${escapeHTML(b.raters.join(", "))}</span>
            ${critics}
          </div>
        </div>
        ${noteCards ? `<div class="detail-notes">${noteCards}</div>` : ""}
      </div>`;
    }

    function render() {
      const burgers = compute();
      if (!burgers.length) {
        listEl.innerHTML = `<div class="empty-state"><div class="big">No burgers match.</div><p>Try clearing the filters.</p></div>`;
        return;
      }
      listEl.innerHTML = burgers.map((b, i) => {
        const pct = clamp((b.total / MAX) * 100, 0, 100);
        const metaTags = [
          `<span class="tag">${b.type}</span>`,
          b.price ? `<span class="tag tag--gold">¥${Math.round(b.price)}</span>` : "",
          `<span class="tag tag--teal">${b.count} rating${b.count > 1 ? "s" : ""}</span>`,
          b.ratified ? `<span class="tag tag--solid">✓ ${Q.ratifiedLabel}</span>` : `<span class="tag">${Q.provisionalLabel}</span>`,
        ].join("");
        const row = `<div class="lb-row" role="button" tabindex="0" data-id="${b.id}" aria-expanded="false">
          <div class="lb-rank${i === 0 ? " is-top" : ""}">${i + 1}</div>
          <div class="lb-main">
            <div class="name">${escapeHTML(b.burger)}</div>
            <div class="sub">${escapeHTML(b.restaurant)}${b.weight ? " · " + b.weight + "g patty" : ""}</div>
            <div class="meta">${metaTags}</div>
          </div>
          <div class="lb-score">
            <div class="val"><b>${fmt(b.total)}</b><span style="color:var(--ink-faint);font-size:1rem"> /${MAX}</span></div>
            <div class="score-bar"><i style="width:${pct}%"></i></div>
            <div class="of">${Math.round(pct)}%</div>
          </div>
        </div>`;
        const detail = b.id === openId ? detailHTML(b) : "";
        return row + detail;
      }).join("");

      $$(".lb-row", listEl).forEach((el) => {
        const toggle = () => {
          openId = openId === el.dataset.id ? null : el.dataset.id;
          render();
          if (openId) { const t = $(`.lb-row[data-id="${openId}"]`, listEl); if (t) t.setAttribute("aria-expanded", "true"); }
        };
        el.addEventListener("click", toggle);
        el.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); } });
        if (el.dataset.id === openId) el.setAttribute("aria-expanded", "true");
      });
    }

    Object.values(ui).filter(Boolean).forEach((el) => el.addEventListener(el.tagName === "INPUT" ? "input" : "change", () => { openId = null; render(); }));
    render();
    renderStats(ratings, rubric);
    renderHall(ratings, rubric);
  }

  function renderHall(ratings, rubric) {
    const host = $("#hallOfFame"); if (!host) return;
    const cat = rubric.categories.burger;
    const all = aggregate(ratings, rubric);
    const awards = rubric.awards || [];
    const pick = (a) => {
      if (!all.length) return null;
      let pool = all.slice();
      if (a.metric === "top") {
        if (a.ratifiedPreferred && pool.some((b) => b.ratified)) pool = pool.filter((b) => b.ratified);
        pool.sort((x, y) => y.total - x.total);
        return { b: pool[0], val: `${fmt(pool[0].total)} /${cat.max}`, prov: !pool[0].ratified };
      }
      if (a.metric === "bottom") {
        pool.sort((x, y) => x.total - y.total);
        return { b: pool[0], val: `${fmt(pool[0].total)} /${cat.max}`, prov: !pool[0].ratified };
      }
      pool.sort((x, y) => (y.critMean[a.metric] || 0) - (x.critMean[a.metric] || 0));
      return { b: pool[0], val: `${fmt(pool[0].critMean[a.metric] || 0)} /4`, prov: !pool[0].ratified };
    };
    host.innerHTML = awards.map((a) => {
      const w = pick(a);
      const body = w
        ? `<div class="honour-burger">${escapeHTML(w.b.burger)}</div>
           <div class="honour-where">${escapeHTML(w.b.restaurant)}</div>
           <div class="honour-val">${w.val}${w.prov ? ' <span class="prov">prov.</span>' : ""}</div>`
        : `<div class="honour-burger" style="color:var(--ink-faint)">Awaiting cards</div>`;
      return `<article class="honour" data-reveal>
        <div class="honour-emoji" aria-hidden="true">${a.emoji || "🏅"}</div>
        <div class="honour-name">${a.label}</div>
        <div class="honour-desc">${a.desc}</div>${body}</article>`;
    }).join("");
    $$("[data-reveal]", host).forEach((el) => el.classList.add("in"));
  }

  // shared across index + methodology: render constitution / quorum / consensus copy
  function renderRubricDocs(rubric) {
    const cn = $("#constitutionList");
    if (cn && rubric.constitution) {
      cn.innerHTML = rubric.constitution.map((c) =>
        `<div class="clause"><dt>${c.clause}</dt><dd>${c.text}</dd></div>`).join("");
    }
    const qb = $("#quorumBlurb"); if (qb && rubric.quorum) qb.textContent = rubric.quorum.blurb;
    const cbl = $("#consensusBlurb"); if (cbl && rubric.consensus) cbl.textContent = rubric.consensus.blurb;
    const cb = $("#consensusBands");
    if (cb && rubric.consensus) {
      let prev = -1;
      cb.innerHTML = rubric.consensus.bands.map((b) => {
        const lo = prev + 1;
        const isLast = b.maxSpread >= 999;
        const range = isLast ? `${lo}+` : lo === b.maxSpread ? `${lo}` : `${lo}–${b.maxSpread}`;
        prev = b.maxSpread;
        return `<div class="band-cell"><div class="bl">${b.label}</div><div class="bn">spread ${range}</div><div class="bnote">${b.note}</div></div>`;
      }).join("");
    }
  }

  function renderStats(ratings, rubric) {
    const el = $("#stats"); if (!el) return;
    const burgers = aggregate(ratings, rubric).sort(cmpScore);
    const top = burgers[0];
    const restaurants = new Set(ratings.map((r) => r.restaurant)).size;
    const cards = [
      { num: ratings.length, lbl: "Scores Logged", sub: "and counting" },
      { num: burgers.length, lbl: "Burgers Judged", sub: "across the city" },
      { num: restaurants, lbl: "Kitchens Visited", sub: "no plate too small" },
      { num: top ? fmt(top.total) : "—", lbl: "Top Score", sub: top ? top.burger : "—", raw: true },
    ];
    el.innerHTML = cards.map((c) =>
      `<div class="stat"><span class="num" data-count="${c.raw ? "" : c.num}">${c.num}</span>
        <span class="lbl">${c.lbl}</span><span class="sub">${escapeHTML(String(c.sub))}</span></div>`
    ).join("");
    // count-up
    $$(".stat .num[data-count]", el).forEach((n) => {
      const target = Number(n.dataset.count); if (!target || target < 2) return;
      let cur = 0; const step = Math.max(1, Math.round(target / 24));
      n.textContent = "0";
      const t = setInterval(() => { cur = Math.min(target, cur + step); n.textContent = String(cur); if (cur >= target) clearInterval(t); }, 28);
    });
  }

  /* ---------------------------------------------------------- methodology */
  function initMethodology(rubric) {
    const root = $("#rubricRoot"); if (!root) return;
    const cat = rubric.categories.burger, sc = rubric.scale;

    const legend = $("#scaleLegend");
    if (legend) {
      legend.innerHTML = [1, 2, 3, 4].map((n) =>
        `<div class="scale-cell"><div class="n">${n}</div><div class="nm">${sc.labels[n]}</div>
          <div class="gd">${sc.guidance[n]}</div></div>`
      ).join("");
    }

    root.innerHTML = cat.groups.map((g) => {
      const dl = g.criteria.map((k) => {
        const c = cat.criteria[k];
        return `<div><dt><span class="crit-n">${String(c.n).padStart(2, "0")}</span>${c.label}</dt><dd>${c.desc}</dd></div>`;
      }).join("");
      return `<article class="rubric-card" data-reveal>
        <div class="rc-head"><h3>${g.label}</h3><span class="count">${g.criteria.length} criteria · ${g.criteria.length * sc.max} pts</span></div>
        <p class="rc-blurb">${g.blurb}</p>
        ${g.doctrine ? `<p class="doctrine">“${g.doctrine}”</p>` : ""}
        <dl>${dl}</dl></article>`;
    }).join("");

    $$("[data-reveal]", root).forEach((el) => el.classList.add("in"));
    const tot = $("#critTotal"); if (tot) tot.textContent = Object.keys(cat.criteria).length;
    const max = $("#maxTotal"); if (max) max.textContent = cat.max;
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  /* ------------------------------------------------------------------ boot */
  document.addEventListener("DOMContentLoaded", async () => {
    initChrome();
    let rubric;
    try { rubric = await loadJSON("data/rubric.json"); }
    catch (e) {
      const l = $("#lbList"); if (l) l.innerHTML = `<div class="empty-state"><div class="big">Couldn't load the rubric.</div><p>Serve the site over http (e.g. <code>python3 -m http.server</code>).</p></div>`;
      return;
    }
    renderRubricDocs(rubric);
    if ($("#lbList")) await initLedger(rubric);
    if ($("#rubricRoot")) initMethodology(rubric);
  });
})();
