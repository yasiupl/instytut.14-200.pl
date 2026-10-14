// Theme toggle: system → dark → light → system. Works without JS (follows the OS).
(() => {
  const root = document.documentElement;
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  const order = ["system", "dark", "light"];
  const labels = { system: "systemowy", dark: "ciemny", light: "jasny" };
  const icons = { system: "auto", dark: "ciemny", light: "jasny" };
  let cur = root.dataset.theme || "system";
  const apply = () => {
    if (cur === "system") delete root.dataset.theme; else root.dataset.theme = cur;
    btn.textContent = icons[cur];
    btn.setAttribute("aria-label", "Motyw: " + labels[cur]);
    try { cur === "system" ? localStorage.removeItem("theme") : localStorage.setItem("theme", cur); } catch (e) {}
  };
  btn.addEventListener("click", () => { cur = order[(order.indexOf(cur) + 1) % order.length]; apply(); });
  apply();
})();

// Webmentions (likes, reposts, replies from the fediverse via Bridgy, and from other IndieWeb sites).
(() => {
  const box = document.querySelector(".webmentions[data-target]");
  if (!box || !("fetch" in window)) return;
  const target = box.dataset.target;
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const safeUrl = (u) => (/^https?:\/\//.test(u || "") ? u : "#");
  const verbs = { "like-of": "polubił(a)", "repost-of": "udostępnił(a)", "in-reply-to": "odpowiedział(a)", "mention-of": "wspomniał(a)", "bookmark-of": "zapisał(a)" };
  fetch("https://webmention.io/api/mentions.jf2?per-page=100&target=" + encodeURIComponent(target))
    .then((r) => (r.ok ? r.json() : { children: [] }))
    .then(({ children = [] }) => {
      if (!children.length) { box.innerHTML = '<p class="small">Brak reakcji. Bądź pierwszy!</p>'; return; }
      box.innerHTML = "<ul>" + children.map((m) => {
        const a = m.author || {};
        const photo = a.photo ? `<img src="${esc(safeUrl(a.photo))}" alt="" loading="lazy">` : "";
        const text = m.content && m.content.text ? `: ${esc(m.content.text.slice(0, 280))}` : "";
        return `<li class="h-cite">${photo}<a class="p-author h-card" href="${esc(safeUrl(a.url))}">${esc(a.name || "ktoś")}</a> <a class="u-url" href="${esc(safeUrl(m.url))}">${verbs[m["wm-property"]] || "wspomniał(a)"}</a>${text}</li>`;
      }).join("") + "</ul>";
    })
    .catch(() => {});
})();
