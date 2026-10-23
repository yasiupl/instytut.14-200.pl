// Link preview image (og:image): a 1200×630 JPEG made from a photo and the page title.
// Fonts come from scripts/fonts, so the result does not depend on the fonts of the build machine.
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const FONTS = path.join(path.dirname(fileURLToPath(import.meta.url)), "fonts");
const BOLD = { file: path.join(FONTS, "Inter-Bold.otf"), name: "Inter Bold" };
const MEDIUM = { file: path.join(FONTS, "Inter-Medium.otf"), name: "Inter Medium" };

export const OG = { width: 1200, height: 630 };
const PAD = 72;
const MAX_LINES = 3;
const COLORS = { bg: "#0b0f0c", fg: "#ffffff", accent: "#4ade80" };

const escape = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const text = (markup, font, size, width) =>
  sharp({
    text: {
      text: markup,
      font: `${font.name} ${size}`,
      fontfile: font.file,
      width,
      dpi: 72,
      rgba: true,
      wrap: "word",
      spacing: Math.round(size * 0.12),
    },
  }).png().toBuffer({ resolveWithObject: true });

// The largest font size at which the title fits in MAX_LINES lines.
async function titleBlock(title, width) {
  for (let size = 68; ; size -= 4) {
    const r = await text(`<span foreground="${COLORS.fg}">${escape(title)}</span>`, BOLD, size, width);
    if (r.info.height <= Math.ceil(size * 1.32) * MAX_LINES || size <= 36) return r;
  }
}

// Dark gradient under the text, so that white letters stay legible on any photo.
const shade = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${OG.width}" height="${OG.height}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#000" stop-opacity=".1"/>
<stop offset=".35" stop-color="#000" stop-opacity=".35"/>
<stop offset=".7" stop-color="#000" stop-opacity=".75"/>
<stop offset="1" stop-color="#000" stop-opacity=".92"/>
</linearGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/></svg>`);

/**
 * @param {object} o
 * @param {string} [o.src]   photo on disk; without it the background is a plain colour
 * @param {string} [o.title] page title; without it the photo is only cropped
 * @param {string} [o.label] small line above the title (site name)
 * @param {string} o.out     output .jpg path
 */
export async function makeOgImage({ src, title, label, out }) {
  const base = src
    ? sharp(src).resize(OG.width, OG.height, { fit: "cover", position: sharp.strategy.attention })
    : sharp({ create: { width: OG.width, height: OG.height, channels: 3, background: COLORS.bg } });

  const layers = [];
  if (title) {
    const width = OG.width - 2 * PAD;
    const t = await titleBlock(title, width);
    const top = OG.height - PAD - t.info.height;
    if (src) layers.push({ input: shade });
    layers.push({ input: t.data, left: PAD, top });
    if (label) {
      const l = await text(`<span foreground="${COLORS.accent}">${escape(label)}</span>`, MEDIUM, 28, width);
      layers.push({ input: l.data, left: PAD, top: Math.max(PAD, top - l.info.height - 20) });
    }
  }

  // Composite in a second pass: sharp applies resize after composite in a single pipeline.
  const photo = await base.flatten({ background: COLORS.bg }).png().toBuffer();
  await sharp(photo).composite(layers).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
}
