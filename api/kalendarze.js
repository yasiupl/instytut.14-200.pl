// GET /api/kalendarze – upcoming events of the Polish hackerspaces as JSON.
//
// The calendars (.ics) come from https://hakerzy.info/calendars.json. Most calendar hosts
// (Meetup, Google, ownCloud…) do not allow requests from other sites (no CORS),
// so the browser cannot read them. This function reads them on the server instead.
//
// The Vercel CDN keeps the answer for an hour (s-maxage) and serves the old answer for up to a day
// while it gets a new one (stale-while-revalidate), so most visits do not run the function at all.
//
// Answer: { generated, from, to, sources: [{ name, ok, events, error? }], events: [...] }
// Each event: { space, city, site, title, start, end, allDay, location, url, recurring } (times in ISO 8601, UTC).
import { parseCalendar } from "./_lib/ics.js";
import spejsy from "../src/_data/spejsy.js";

const LIST = "https://hakerzy.info/calendars.json";
const DAYS_AHEAD = 60;
const TIMEOUT = 8000; // ms for each calendar; a slow calendar must not hold up the others
const UA = "instytut.ilawa.pl hackerspace calendar (+https://www.instytut.ilawa.pl/spejsy/)";

const get = (url) =>
  fetch(url, { headers: { "user-agent": UA, accept: "text/calendar, application/json;q=0.9, */*;q=0.5" }, signal: AbortSignal.timeout(TIMEOUT), redirect: "follow" })
    .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))));

export default async function handler(req, res) {
  const now = Date.now();
  const from = now - 6 * 3600 * 1000; // keep events that started in the last 6 hours (still going on)
  const to = now + DAYS_AHEAD * 86400 * 1000;
  const info = new Map(spejsy.map((s) => [s.name, s]));

  let list;
  try {
    list = JSON.parse(await get(LIST));
    if (!Array.isArray(list)) throw new Error("not a list");
  } catch (e) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(502).json({ error: `hakerzy.info: ${e.message}` });
  }

  const results = await Promise.all(list.map(async ({ name, url }) => {
    try {
      const text = await get(url);
      if (!/BEGIN:VCALENDAR/.test(text)) throw new Error("not an iCalendar file");
      return { name, events: parseCalendar(text, { from, to }) };
    } catch (e) {
      return { name, error: e.name === "TimeoutError" ? "timeout" : e.message };
    }
  }));

  const seen = new Set();
  const events = [];
  for (const r of results) {
    const s = info.get(r.name) || {};
    for (const e of r.events || []) {
      const key = `${r.name}|${e.title}|${e.start}`;
      if (seen.has(key)) continue;
      seen.add(key);
      events.push({
        space: r.name,
        city: s.city || "",
        site: s.url || "",
        title: e.title,
        start: new Date(e.start).toISOString(),
        end: new Date(e.end).toISOString(),
        allDay: e.allDay,
        location: e.location,
        url: e.url,
        recurring: e.recurring,
      });
    }
  }
  events.sort((a, b) => a.start.localeCompare(b.start));

  res.setHeader("Cache-Control", "public, max-age=300");
  res.setHeader("CDN-Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).json({
    generated: new Date(now).toISOString(),
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
    sources: results.map((r) => ({ name: r.name, ok: !r.error, events: r.events ? r.events.length : 0, ...(r.error ? { error: r.error } : {}) })),
    events,
  });
}
