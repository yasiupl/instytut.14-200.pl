// HTML of the webmentions list under a page (data: src/_data/webmentions.json, made by scripts/webmentions.mjs).
// The markup matches the list that src/assets/site.js adds for mentions newer than the last build.
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const safeUrl = (u) => (/^https?:\/\//.test(u || "") ? u : "#");
const MAX = 280; // characters of a mention's text shown before "Czytaj dalej"
const VERBS = { "like-of": "polubił(a)", "repost-of": "udostępnił(a)", "in-reply-to": "odpowiedział(a)", "mention-of": "wspomniał(a)", "bookmark-of": "zapisał(a)" };

const cutAtWord = (s, max) => {
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  return cut.slice(0, Math.max(cut.lastIndexOf(" "), max * 0.6)).replace(/[\s,.;:–-]+$/, "") + "…";
};
// og:description is often cut by the source in mid-sentence.
const ellipsis = (s) => (/[.!?…"”]$/.test(s) ? s : s.replace(/[\s,;:–-]+$/, "") + "…");

function item(m) {
  const url = esc(safeUrl(m.url));
  let host = "";
  try { host = new URL(m.url).hostname.replace(/^www\./, ""); } catch {}
  const a = m.author || {};
  // Sources without an h-card author (e.g. news portals) are labelled with their site name or domain.
  const who = a.name || m.preview?.siteName || host || "ktoś";
  const whoUrl = a.url || (host ? new URL(m.url).origin : "");
  const photo = a.photo ? `<img src="${esc(safeUrl(a.photo))}" alt="" loading="lazy">` : "";
  const when = m.date
    ? ` <time class="dt-published" datetime="${esc(m.date)}">${new Date(m.date).toLocaleDateString("pl-PL", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Warsaw" })}</time>`
    : "";
  const head = `<p class="wm-head">${photo}<a class="p-author h-card" href="${esc(safeUrl(whoUrl))}">${esc(who)}</a> <a class="u-url" href="${url}">${VERBS[m.type] || "wspomniał(a)"}</a>${when}</p>`;

  const p = m.preview;
  if (p && p.title) {
    const img = p.image ? `<img class="u-photo" src="${esc(p.image)}" alt="" loading="lazy">` : "";
    const desc = p.description ? `<p class="p-summary">${esc(ellipsis(cutAtWord(p.description, MAX)))}</p>` : "";
    return `<li class="h-cite" data-wm-id="${m.id}">${head}<a class="wm-card" href="${url}">${img}<div><strong class="p-name">${esc(p.title)}</strong>${desc}</div></a></li>`;
  }
  // Long texts (a blog post that mentions this page) are cut at a word, with a link to the whole text.
  const full = m.text || "";
  if (!full) return `<li class="h-cite" data-wm-id="${m.id}">${head}</li>`;
  const title = m.name && !full.startsWith(m.name.trim()) ? `<strong class="p-name">${esc(m.name)}</strong> ` : "";
  const text = cutAtWord(full, MAX);
  const more = text !== full ? ` <a class="wm-more" href="${url}">Czytaj dalej →</a>` : "";
  return `<li class="h-cite" data-wm-id="${m.id}">${head}<blockquote class="p-content">${title}${esc(text)}${more}</blockquote></li>`;
}

export default function webmentionsHtml(list = []) {
  return list.length ? `<ul>${list.map(item).join("")}</ul>` : "";
}
