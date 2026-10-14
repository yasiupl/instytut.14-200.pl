import { feedPlugin } from "@11ty/eleventy-plugin-rss";
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

  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("plDate", (d) =>
    new Date(d).toLocaleDateString("pl-PL", { year: "numeric", month: "long", day: "numeric" })
  );
  eleventyConfig.addFilter("head", (arr = [], n) => arr.slice(0, n));
  eleventyConfig.addFilter("pluck", (arr = [], key) => arr.map((o) => o[key]));
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
