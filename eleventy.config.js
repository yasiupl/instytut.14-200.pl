import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import { createHash } from "node:crypto";
import { access, mkdir, stat } from "node:fs/promises";
import path from "node:path";
import { OG, makeOgImage } from "./scripts/og-image.mjs";
import site from "./src/_data/site.js";

const escapeAttr = (s = "") =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// Entrance to the building (south side of 18B); the same point is in src/assets/map/dojazd.geojson.
const ENTRANCE = { lat: 53.592988, lon: 19.565722 };

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/static": "/" });
  // src/static is copied as is (e.g. the CMS in /admin/), never rendered as a template.
  eleventyConfig.ignores.add("src/static/**");

  eleventyConfig.addPlugin(feedPlugin, {
    type: "atom",
    outputPath: "/feed.xml",
    collection: { name: "news", limit: 20 },
    metadata: {
      language: site.lang,
      title: site.title,
      subtitle: site.description,
      base: site.url + "/",
      author: { name: site.title, email: site.email },
    },
  });

  // Privacy-friendly YouTube embed (no cookies until played), with a plain link fallback.
  eleventyConfig.addShortcode("youtube", (id, title = "Wideo YouTube") => {
    const t = escapeAttr(title);
    return `<figure class="embed video">
<iframe src="https://www.youtube-nocookie.com/embed/${id}" title="${t}" loading="lazy" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
<figcaption>▶ <a href="https://www.youtube.com/watch?v=${id}">${t}</a></figcaption>
</figure>`;
  });

  // Google Forms are linked instead of embedded: lighter, and accessible without third-party iframes.
  eleventyConfig.addShortcode("form", (url, title = "Formularz") =>
    `<p class="cta"><a class="button" href="${escapeAttr(url)}">→ ${escapeAttr(title || "Otwórz formularz")}</a></p>`
  );

  // Walking-directions map for the contact page (Leaflet + OSM, data in assets/map/dojazd.geojson).
  eleventyConfig.addShortcode("mapaDojazdu", () => `<figure class="map-figure">
<div id="map" class="map" data-src="/assets/map/dojazd.geojson" role="region" aria-label="Mapa dojścia do Iławskiego Instytutu Idei"></div>
<figcaption>
<span class="legend"><span class="swatch lab" aria-hidden="true"></span>od ul. Królowej Jadwigi (220–260 m)</span>
<span class="legend"><span class="swatch workshop" aria-hidden="true"></span>od ul. Sobieskiego (ok. 140 m, dwa wejścia)</span>
<span class="legend"><span class="swatch entrance" aria-hidden="true"></span>wejście</span>
</figcaption>
<p class="map-links">
<a class="button" href="geo:${ENTRANCE.lat},${ENTRANCE.lon}?q=${ENTRANCE.lat},${ENTRANCE.lon}(${encodeURIComponent(site.title)})">Otwórz w aplikacji map</a>
<a href="https://www.openstreetmap.org/?mlat=${ENTRANCE.lat}&amp;mlon=${ENTRANCE.lon}#map=19/${ENTRANCE.lat}/${ENTRANCE.lon}" target="_blank" rel="noopener">OpenStreetMap w przeglądarce</a>
</p>
</figure>`);

  // AI use labels (see site.ai and /polityka-ai/). The notice is part of the content, so feeds carry it too.
  const aiNotice = (level, note) => {
    const l = site.ai.levels[level];
    if (!l) throw new Error(`Unknown ai level "${level}", expected one of: ${Object.keys(site.ai.levels).join(", ")}`);
    return `<aside class="ai-note" aria-label="Wykorzystanie AI"><p><strong>${l.label}.</strong> ${escapeAttr(note || l.text)}
<a href="${site.url}${site.ai.policy}">Jak korzystamy z AI</a></p></aside>\n\n`;
  };
  eleventyConfig.addPreprocessor("ai-notice", "md", (data, content) =>
    data.ai ? aiNotice(data.ai, data.ai_note) + content : content
  );
  // A single AI-assisted fragment inside a human-written text. Blank lines keep the inner Markdown rendered.
  eleventyConfig.addPairedShortcode("ai", (content, note = "") => `<div class="ai-content">
<p class="ai-label">Fragment przygotowany z pomocą AI${note ? ": " + escapeAttr(note) : ""}</p>

${content.trim()}

</div>`);

  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("plDate", (d) =>
    new Date(d).toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric" })
  );
  eleventyConfig.addFilter("head", (arr = [], n) => arr.slice(0, n));
  eleventyConfig.addFilter("pluck", (arr = [], key) => arr.map((o) => o[key]));
  // Link previews (og:image): a 1200×630 JPEG per page, made after the build (scripts/og-image.mjs).
  // Photo: front matter `image`, else the first local image in the page content, else none (plain background).
  // The page title is written over the photo. Pages without their own title (home) get the photo only,
  // or `site.ogImage` when they have no photo either.
  const OG_VERSION = 3; // change it when the look changes, to make all images again
  const ogQueue = new Map();
  const firstImage = (html = "") =>
    (String(html).match(/<img\b[^>]*\bsrc="(\/assets\/[^"]+\.(?:webp|jpe?g|png))"/i) || [])[1];
  eleventyConfig.addFilter("ogImage", function (image, title, html) {
    const src = image || firstImage(html) || (title ? "" : site.ogImage);
    const slug = (this.page?.url || "/").replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/gi, "-") || "index";
    const hash = createHash("sha1").update(JSON.stringify([OG_VERSION, src, title])).digest("hex").slice(0, 8);
    const out = `/og/${slug}-${hash}.jpg`;
    ogQueue.set(out, { src: src && path.join("src", src), title });
    return out;
  });
  eleventyConfig.addGlobalData("og", OG);
  eleventyConfig.on("eleventy.after", async ({ dir }) => {
    await mkdir(path.join(dir.output, "og"), { recursive: true });
    await Promise.all([...ogQueue].map(async ([out, { src, title }]) => {
      const file = path.join(dir.output, out);
      const done = await stat(file).catch(() => null);
      if (done && (!src || done.mtimeMs >= (await stat(src)).mtimeMs)) return;
      if (src) await access(src); // a missing photo fails the build instead of making a broken preview
      await makeOgImage({ src, title, label: title && site.title, out: file });
    }));
  });

  eleventyConfig.addFilter("absUrl", (p) => new URL(p || "/", site.url).href);

  // Every old Google Sites path (front matter `redirect_from`) gets a redirect to its new URL.
  eleventyConfig.addCollection("redirects", (api) =>
    api.getAll().flatMap((page) =>
      (page.data.redirect_from || []).map((from) => ({ from, to: page.url, title: page.data.title }))
    )
  );

  // Make Markdown images lazy and give empty-alt images an explicit decorative role.
  eleventyConfig.amendLibrary("md", (md) => {
    const img = md.renderer.rules.image;
    md.renderer.rules.image = (tokens, idx, options, env, self) => {
      tokens[idx].attrSet("loading", "lazy");
      tokens[idx].attrSet("decoding", "async");
      return img(tokens, idx, options, env, self);
    };
    const link = md.renderer.rules.link_open || ((t, i, o, e, s) => s.renderToken(t, i, o));
    md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
      const href = tokens[idx].attrGet("href") || "";
      if (/^https?:\/\//.test(href) && !href.startsWith(site.url)) tokens[idx].attrSet("rel", "noopener");
      // Pages with `linksNewTab: true` (e.g. Kontakt) open every link in a new tab, except in-page anchors.
      if (env.linksNewTab && !href.startsWith("#")) {
        tokens[idx].attrSet("target", "_blank");
        tokens[idx].attrSet("rel", "noopener");
      }
      return link(tokens, idx, options, env, self);
    };
  });

  return {
    dir: { input: "src", includes: "_includes", data: "_data", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
