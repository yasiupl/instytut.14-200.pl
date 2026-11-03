// "Co słychać w hakerspejsach": upcoming events and recent fediverse posts of the Polish hackerspaces.
// Markup: src/_includes/partials/spejsy.njk. Space list: src/_data/spejsy.js.
// - Events: /api/kalendarze (Vercel function that reads the calendars from hakerzy.info).
// - Posts: read here, in the browser, from each space's Mastodon API (it allows requests from any site).
// Remote text is never inserted as HTML: post content is reduced to plain text first.
(() => {
  const TZ = "Europe/Warsaw";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^https:\/\//.test(u || "") ? u : "");
  const fmt = (opts) => new Intl.DateTimeFormat("pl-PL", { timeZone: TZ, ...opts });
  const dayKey = fmt({ year: "numeric", month: "2-digit", day: "2-digit" });
  const dayName = fmt({ weekday: "long", day: "numeric", month: "long" });
  const hm = fmt({ hour: "2-digit", minute: "2-digit" });
  const shortDate = fmt({ day: "numeric", month: "short" });

  function label(d) {
    const k = dayKey.format(d);
    const today = Date.now();
    if (k === dayKey.format(today)) return "dziś, " + dayName.format(d);
    if (k === dayKey.format(today + 86400000)) return "jutro, " + dayName.format(d);
    return dayName.format(d);
  }

  // Events
  async function events(box) {
    const limit = +box.dataset.limit || 100;
    const status = box.querySelector(".feed-status");
    try {
      const r = await fetch("/api/kalendarze");
      if (!r.ok) throw new Error(r.status);
      const data = await r.json();
      const list = (data.events || []).filter((e) => Date.parse(e.end) > Date.now()).slice(0, limit);
      if (!list.length) { status.textContent = "Brak zaplanowanych wydarzeń."; return; }
      // data-collapse="N": only the first N events show on wide screens, the rest after "Pokaż więcej".
      // balance() changes N to fit the posts column, but never below data-min (default 3).
      // balance() can raise N later. On narrow screens (tabs) all events show.
      const collapse = +box.dataset.collapse || 0;
      let html = "", last = "";
      list.forEach((e, i) => {
        const start = new Date(e.start), end = new Date(e.end);
        const k = dayKey.format(start);
        if (k !== last) { html += `${last ? "</ul>" : ""}<h3 class="feed-day" data-i="${i}">${esc(label(start))}</h3><ul class="feed-list">`; last = k; }
        const when = e.allDay ? "cały dzień" : hm.format(start) + (end > start && dayKey.format(end) === k ? "–" + hm.format(end) : "");
        const href = safeUrl(e.url) || safeUrl(e.site);
        const title = href ? `<a href="${esc(href)}" rel="noopener">${esc(e.title)}</a>` : esc(e.title);
        html += `<li class="feed-event" data-i="${i}"><span class="feed-time">${esc(when)}</span>
<span class="feed-body"><span class="feed-title">${title}</span>
<span class="feed-meta">${esc(e.space)}${e.recurring ? ' · <span title="wydarzenie cykliczne">⟳</span>' : ""}${e.location ? " · " + esc(e.location) : ""}</span></span></li>`;
      });
      const items = box.querySelector(".feed-items");
      items.innerHTML = html + "</ul>";
      if (collapse && list.length > collapse) {
        items.classList.add("collapsed");
        items.insertAdjacentHTML("afterend", '<p class="feed-more-wrap"><button type="button" class="feed-more-btn" aria-expanded="false"></button></p>');
        const btn = box.querySelector(".feed-more-btn");
        let shown = collapse;
        // Shows the first n events (and the day headings they need) while the list is collapsed.
        box.show = (n) => {
          shown = Math.min(Math.max(n, +box.dataset.min || 3), list.length);
          for (const el of items.querySelectorAll("[data-i]")) el.classList.toggle("feed-extra", +el.dataset.i >= shown);
          btn.parentElement.hidden = shown >= list.length;
          if (items.classList.contains("collapsed")) btn.textContent = `Pokaż więcej (${list.length - shown})`;
        };
        box.show(collapse);
        btn.addEventListener("click", () => {
          const open = items.classList.toggle("collapsed") === false;
          btn.setAttribute("aria-expanded", open);
          btn.textContent = open ? "Pokaż mniej" : `Pokaż więcej (${list.length - shown})`;
        });
      }
      status.remove();
      const missing = (data.sources || []).filter((s) => !s.ok).map((s) => s.name);
      if (missing.length && box.dataset.full !== undefined) {
        box.insertAdjacentHTML("beforeend", `<p class="small">Teraz nie udało się pobrać kalendarza: ${esc(missing.join(", "))}.</p>`);
      }
    } catch {
      status.innerHTML = 'Nie udało się pobrać kalendarzy. Zobacz wydarzenia na <a href="https://hakerzy.info">hakerzy.info</a>.';
    }
  }

  // Posts
  const text = (html) => {
    const doc = new DOMParser().parseFromString(String(html).replace(/<br\s*\/?>/gi, "\n").replace(/<\/p>\s*<p>/gi, "\n\n"), "text/html");
    return (doc.body.textContent || "").replace(/\n{3,}/g, "\n\n").trim();
  };
  const cut = (s, max) => {
    if (s.length <= max) return s;
    const c = s.slice(0, max);
    return c.slice(0, Math.max(c.lastIndexOf(" "), max * 0.6)).replace(/[\s,.;:–-]+$/, "") + "…";
  };

  // Width and height of a photo preview, so its space is kept before it loads (lazy photos below the fold
  // would otherwise have no height, and the events column would be measured against a too short posts column).
  const size = (m) => {
    const w = m.meta?.small?.width, h = m.meta?.small?.height;
    return w > 0 && h > 0 ? ` width="${Math.round(w)}" height="${Math.round(h)}"` : "";
  };

  async function accountId(host, user) {
    const key = `spejsy:${host}:${user}`;
    try { const id = localStorage.getItem(key); if (id) return id; } catch {}
    const r = await fetch(`https://${host}/api/v1/accounts/lookup?acct=${encodeURIComponent(user)}`);
    if (!r.ok) throw new Error(r.status);
    const { id } = await r.json();
    try { localStorage.setItem(key, id); } catch {}
    return id;
  }

  async function statuses(a, per) {
    const id = await accountId(a.host, a.user);
    const r = await fetch(`https://${a.host}/api/v1/accounts/${id}/statuses?limit=${per}&exclude_replies=true&exclude_reblogs=true`);
    if (!r.ok) throw new Error(r.status);
    return (await r.json()).map((s) => ({ ...s, space: a.name }));
  }

  async function posts(box) {
    const limit = +box.dataset.limit || 20;
    const images = box.dataset.images !== undefined;
    const max = +box.dataset.chars || 300;
    const status = box.querySelector(".feed-status");
    let accounts = [];
    try { accounts = JSON.parse(box.dataset.accounts || "[]"); } catch {}
    const per = Math.min(10, Math.max(3, Math.ceil(limit / 2)));
    const results = await Promise.allSettled(accounts.map((a) => statuses(a, per)));
    const list = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []))
      .filter((s) => s.visibility === "public" || s.visibility === "unlisted")
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      .slice(0, limit);
    if (!list.length) { status.innerHTML = 'Nie udało się pobrać wpisów.'; return; }
    box.querySelector(".feed-items").innerHTML = '<ul class="feed-list">' + list.map((s) => {
      const a = s.account || {};
      const url = safeUrl(s.url) || safeUrl(a.url);
      const avatar = safeUrl(a.avatar_static) ? `<img class="feed-avatar" src="${esc(a.avatar_static)}" alt="" width="32" height="32" loading="lazy">` : "";
      const body = s.spoiler_text ? `⚠ ${s.spoiler_text}` : text(s.content);
      const img = images && !s.sensitive && !s.spoiler_text && (s.media_attachments || []).find((m) => m.type === "image" && safeUrl(m.preview_url));
      return `<li class="feed-post">
<p class="feed-post-head">${avatar}<a href="${esc(safeUrl(a.url))}" rel="noopener">${esc(a.display_name || s.space)}</a>
<a class="feed-date" href="${esc(url)}" rel="noopener"><time datetime="${esc(s.created_at)}">${esc(shortDate.format(new Date(s.created_at)))}</time></a></p>
<p class="feed-text">${esc(cut(body, max))} <a class="feed-more" href="${esc(url)}" rel="noopener">wpis →</a></p>
${img ? `<img class="feed-image" src="${esc(img.preview_url)}" alt="${esc(img.description || "")}"${size(img)} loading="lazy" decoding="async">` : ""}</li>`;
    }).join("") + "</ul>";
    status.remove();
  }

  // Tabs (full page only). CSS shows them on narrow screens only; on wide screens all panels stay visible.
  function tabs(root) {
    const list = [...root.querySelectorAll('[role="tab"]')];
    const select = (tab, focus) => {
      for (const t of list) {
        const on = t === tab;
        t.setAttribute("aria-selected", on);
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute("aria-controls"))?.classList.toggle("active", on);
      }
      if (focus) tab.focus();
    };
    list.forEach((t, i) => {
      document.getElementById(t.getAttribute("aria-controls"))?.setAttribute("role", "tabpanel");
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", (e) => {
        const k = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: list.length - 1 - i }[e.key];
        if (k === undefined) return;
        e.preventDefault();
        select(list[(i + k + list.length) % list.length], true);
      });
    });
    // A link to a panel (e.g. /spejsy/#spejsy-spaces-panel-full) opens its tab.
    const fromHash = list.find((t) => location.hash === "#" + t.getAttribute("aria-controls"));
    select(fromHash || list[0]);
    root.classList.add("tabs-ready");
  }

  // Rule for the full page on wide screens (two columns): the events column is as long as the posts column.
  // It shows as many events as fit next to the posts (at least data-min, default 3), the rest after "Pokaż więcej".
  // The posts column is short on purpose (data-limit, data-chars, small photos), so the page stays short.
  const wide = matchMedia("(min-width: 44rem)");
  function balance(root) {
    const ev = root.querySelector("[data-spejsy-events]"), po = root.querySelector("[data-spejsy-posts]");
    if (!ev?.show || !po) return;
    const items = ev.querySelector(".feed-items");
    const fit = () => {
      if (!wide.matches || !items.classList.contains("collapsed")) return;
      // Measure the content, not the sections: grid cells stretch to the height of the row.
      const target = po.querySelector(".feed-items").getBoundingClientRect().bottom;
      // The last visible part of the events column: the button, a note about missing calendars, or the list.
      const end = () => Math.max(...[...ev.children].filter((el) => el.offsetParent).map((el) => el.getBoundingClientRect().bottom));
      const all = items.querySelectorAll(".feed-event").length;
      let n = +ev.dataset.min || 3;
      ev.show(n);
      // Add events while the events column stays above the bottom of the posts column.
      while (n < all) {
        ev.show(n + 1);
        if (end() > target) { ev.show(n); break; }
        n++;
      }
    };
    fit();
    // Photos in posts load later and make the posts column longer.
    let t;
    new ResizeObserver(() => { clearTimeout(t); t = setTimeout(fit, 150); }).observe(po);
    wide.addEventListener("change", fit);
  }

  document.querySelectorAll("[data-spejsy-tabs]").forEach(tabs);
  document.querySelectorAll(".spejsy-feed.full").forEach((root) => {
    const ev = root.querySelector("[data-spejsy-events]"), po = root.querySelector("[data-spejsy-posts]");
    Promise.allSettled([ev && events(ev), po && posts(po)]).then(() => balance(root));
  });
  document.querySelectorAll(".spejsy-feed:not(.full) [data-spejsy-events]").forEach(events);
  document.querySelectorAll(".spejsy-feed:not(.full) [data-spejsy-posts]").forEach(posts);
})();
