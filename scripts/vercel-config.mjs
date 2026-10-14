// Writes vercel.json from the redirects that Eleventy generated in _site/_redirects.
// Vercel reads vercel.json from the repository, not from the build output, so commit the result.
// Run: npm run build (this script runs as "postbuild").
import { readFileSync, writeFileSync } from "node:fs";

const lines = readFileSync("_site/_redirects", "utf8").split("\n");
const seen = new Set();
const redirects = [];
for (const line of lines) {
  const [from, to, status] = line.trim().split(/\s+/);
  if (!from || from.startsWith("#") || from.includes("*") || !status) continue;
  const source = from.replace(/\/$/, "") || "/";   // trailingSlash below handles the "/" variants
  if (seen.has(source)) continue;
  seen.add(source);
  redirects.push({ source, destination: to, permanent: status === "301" });
}

const config = {
  $schema: "https://openapi.vercel.sh/vercel.json",
  framework: null,
  installCommand: "npm ci",
  buildCommand: "npm run build",
  outputDirectory: "_site",
  trailingSlash: true,
  redirects,
  headers: [
    {
      // Image names are content hashes, so they never change.
      source: "/assets/img/(.*)",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    },
    {
      source: "/(feed.xml|feed.json)",
      headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
    },
  ],
};

const json = JSON.stringify(config, null, 2) + "\n";
let old = "";
try { old = readFileSync("vercel.json", "utf8"); } catch {}
if (old !== json) {
  writeFileSync("vercel.json", json);
  console.log(`vercel.json: ${redirects.length} redirects (updated – commit it)`);
} else {
  console.log(`vercel.json: ${redirects.length} redirects (up to date)`);
}
