// Downloads webmentions from webmention.io into src/_data/webmentions.json, so Eleventy renders them
// into the HTML (search engines see them; no request to webmention.io is needed to show them).
// Runs every day in .github/workflows/webmentions.yml; the commit it makes triggers a normal deploy.
//
// Many sources (e.g. news portals) have no microformats, so webmention.io knows neither the title
// nor a picture. For those the script reads Open Graph / Twitter / <title> tags of the source page.
// The picture is saved as a small WebP in src/assets/webmentions/, so visitors load nothing from other sites.
//
// Mentions:  WEBMENTION_IO_TOKEN set (webmention.io → Settings → API key) → all mentions of the account;
//            not set → one request per page listed in the live sitemap.
// Run:       node scripts/webmentions.mjs
import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import sharp from "sharp";
import site from "../src/_data/site.js";

const DATA = "src/_data/webmentions.json";
const IMG_DIR = "src/assets/webmentions";
const API = "https://webmention.io/api/mentions.jf2";
const UA = `${new URL(site.url).host} webmentions (+${site.url}/)`;
const TIMEOUT = 15000;
const hosts = new Set([new URL(site.url).host, ...(site.aliases || [])]);

const get = (url, accept = "*/*") =>
  fetch(url, { headers: { "user-agent": UA, accept }, redirect: "follow", signal: AbortSignal.timeout(TIMEOUT) });

// --- mentions -------------------------------------------------------------------------------

async function fetchAll(query) {
  const all = [];
  for (let page = 0; ; page++) {
    const r = await get(`${API}?per-page=100&page=${page}&${query}`, "application/json");
    if (!r.ok) throw new Error(`webmention.io ${r.status} for ${query}`);
    const { children = [] } = await r.json();
    all.push(...children);
    if (children.length < 100) return all;
  }
}

async function fetchMentions() {
  const token = process.env.WEBMENTION_IO_TOKEN;
  if (token) return fetchAll(`token=${encodeURIComponent(token)}`);
  const xml = await (await get(`${site.url}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const all = [];
  for (const u of urls) all.push(...(await fetchAll(`target=${encodeURIComponent(u)}`)));
  return all;
}

// --- Open Graph -----------------------------------------------------------------------------

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", oacute: "ó", Oacute: "Ó", ndash: "–", mdash: "—", hellip: "…", bdquo: "„", rdquo: "”", ldquo: "“", laquo: "«", raquo: "»" };
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, e) =>
    e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : +e.slice(1)) : ENTITIES[e] ?? all);
const clean = (s) => (s ? decode(s).replace(/\s+/g, " ").trim() : "");

async function readPreview(url) {
  const r = await get(url, "text/html");
  if (!r.ok) throw new Error(`${r.status}`);
  const buf = new Uint8Array(await r.arrayBuffer());
  let charset = (r.headers.get("content-type") || "").match(/charset=([\w-]+)/i)?.[1];
  let html = new TextDecoder(charset || "utf-8").decode(buf);
  const metaCharset = html.match(/<meta[^>]+charset=["']?([\w-]+)/i)?.[1];
  if (!charset && metaCharset && !/utf-?8/i.test(metaCharset)) html = new TextDecoder(metaCharset).decode(buf);

  const meta = {};
  for (const [tag] of html.matchAll(/<meta\b[^>]*>/gi)) {
    const key = tag.match(/\b(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
    const content = tag.match(/\bcontent\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
    if (key && content && !(key in meta)) meta[key] = content[1] ?? content[2];
  }
  const pick = (...keys) => clean(keys.map((k) => meta[k]).find(Boolean));
  const image = pick("og:image:secure_url", "og:image", "twitter:image", "twitter:image:src");
  return {
    title: pick("og:title", "twitter:title") || clean(html.match(/<title[^>]*>([^<]*)/i)?.[1]),
    description: pick("og:description", "twitter:description", "description"),
    siteName: pick("og:site_name", "application-name"),
    image: image ? new URL(image, url).href : "",
  };
}

// Small WebP thumbnail; http:// pictures are tried over https:// first.
async function saveImage(src, id) {
  const tries = src.startsWith("http://") ? [src.replace(/^http:/, "https:"), src] : [src];
  for (const u of tries) {
    try {
      const r = await get(u, "image/*");
      if (!r.ok || !/^image\//.test(r.headers.get("content-type") || "")) continue;
      const file = `${IMG_DIR}/${id}.webp`;
      await sharp(Buffer.from(await r.arrayBuffer())).resize({ width: 480, withoutEnlargement: true }).webp({ quality: 75 }).toFile(file);
      return "/" + file.replace(/^src\//, "");
    } catch {}
  }
  return "";
}

// --- main -----------------------------------------------------------------------------------

const exists = (p) => access(p).then(() => true, () => false);
const old = (await exists(DATA)) ? JSON.parse(await readFile(DATA, "utf8")) : {};
const known = new Map(Object.values(old).flat().map((m) => [m.id, m]));
await mkdir(IMG_DIR, { recursive: true });

const out = {};
for (const m of await fetchMentions()) {
  const target = new URL(m["wm-target"]);
  if (!hosts.has(target.host) || m["wm-private"]) continue;
  const id = m["wm-id"];
  const a = m.author || {};
  const entry = known.get(id) || {
    id,
    type: m["wm-property"],
    url: m.url || m["wm-source"],
    date: m.published || m["wm-received"],
    author: { name: a.name || "", url: a.url || "", photo: a.photo || "" },
    name: m.name || "",
    text: ((m.content && m.content.text) || "").replace(/\s+/g, " ").trim(),
  };
  // Replies and likes carry their own content; mentions without a title get the source's preview.
  if (!known.has(id) && entry.type === "mention-of" && !entry.name) {
    try {
      const p = await readPreview(entry.url);
      entry.preview = { title: p.title, description: p.description, siteName: p.siteName, image: p.image ? await saveImage(p.image, id) : "" };
      console.log(`preview ${entry.url}: ${p.title}`);
    } catch (e) {
      console.warn(`no preview for ${entry.url}: ${e.message}`);
    }
  }
  const path = target.pathname.replace(/\/?$/, "/");
  (out[path] ||= []).push(entry);
}

const sorted = Object.fromEntries(
  Object.keys(out).sort().map((k) => [k, out[k].sort((x, y) => String(x.date).localeCompare(String(y.date)) || x.id - y.id)]),
);
await writeFile(DATA, JSON.stringify(sorted, null, 2) + "\n");
console.log(`${Object.values(sorted).flat().length} mentions on ${Object.keys(sorted).length} pages`);
