// Small iCalendar (RFC 5545) reader: enough for the public calendars of the Polish hackerspaces.
// No dependencies, so the Vercel function stays small and starts fast.
//
// What it does:
// - unfolds lines, reads properties with parameters, unescapes text;
// - reads DTSTART/DTEND/DURATION as UTC, floating, TZID (IANA names; unknown names → defaultTz) or all-day;
// - expands RRULE (FREQ DAILY/WEEKLY/MONTHLY/YEARLY, INTERVAL, COUNT, UNTIL, BYDAY with ordinals,
//   BYMONTHDAY, BYMONTH), removes EXDATE, and lets RECURRENCE-ID entries replace single instances;
// - skips STATUS:CANCELLED.
// What it does not do: BYSETPOS, BYWEEKNO, BYYEARDAY, BYHOUR/BYMINUTE, RDATE, VTIMEZONE definitions.

const DAY = 86400000;
const WEEKDAYS = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

// Windows zone names that some exporters (Outlook, Teams) write in TZID.
const WINDOWS_TZ = {
  "Central European Standard Time": "Europe/Warsaw",
  "Central Europe Standard Time": "Europe/Warsaw",
  "W. Europe Standard Time": "Europe/Berlin",
  "Romance Standard Time": "Europe/Paris",
  "GMT Standard Time": "Europe/London",
  "UTC": "UTC",
};

export function unfold(text) {
  return String(text).replace(/\r\n?/g, "\n").replace(/\n[ \t]/g, "").split("\n");
}

export function unescapeText(v = "") {
  return v.replace(/\\([\\;,nN])/g, (_, c) => (c === "n" || c === "N" ? "\n" : c));
}

// "DTSTART;TZID=Europe/Warsaw:20261103T190000" → { name, params, value }
export function parseLine(line) {
  let i = 0, inQuote = false;
  for (; i < line.length; i++) {
    const c = line[i];
    if (c === '"') inQuote = !inQuote;
    else if (c === ":" && !inQuote) break;
  }
  const head = line.slice(0, i), value = line.slice(i + 1);
  const [name, ...rawParams] = head.split(";");
  const params = {};
  for (const p of rawParams) {
    const eq = p.indexOf("=");
    if (eq > 0) params[p.slice(0, eq).toUpperCase()] = p.slice(eq + 1).replace(/^"|"$/g, "");
  }
  return { name: name.toUpperCase(), params, value };
}

// Returns the VEVENTs as arrays of { name, params, value } (nested VALARMs are left out).
export function readEvents(text) {
  const events = [];
  let cur = null, depth = 0;
  for (const raw of unfold(text)) {
    if (!raw) continue;
    const line = parseLine(raw);
    if (line.name === "BEGIN") {
      if (line.value.toUpperCase() === "VEVENT" && !cur) { cur = []; depth = 0; }
      else if (cur) depth++;
      continue;
    }
    if (line.name === "END") {
      if (cur && depth === 0 && line.value.toUpperCase() === "VEVENT") { events.push(cur); cur = null; }
      else if (cur) depth--;
      continue;
    }
    if (cur && depth === 0) cur.push(line);
  }
  return events;
}

// Offset of `tz` from UTC (ms) at the instant `ts`.
const fmtCache = new Map();
function tzOffset(ts, tz) {
  let f = fmtCache.get(tz);
  if (!f) {
    f = new Intl.DateTimeFormat("en-US", {
      timeZone: tz, hourCycle: "h23",
      year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
    });
    fmtCache.set(tz, f);
  }
  const p = Object.fromEntries(f.formatToParts(new Date(ts)).map((x) => [x.type, x.value]));
  return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ts;
}

export function resolveTz(name, defaultTz) {
  if (!name) return defaultTz;
  const n = WINDOWS_TZ[name] || name.replace(/^\/+/, "");
  try { new Intl.DateTimeFormat("en-US", { timeZone: n }); return n; } catch { return defaultTz; }
}

// Wall-clock time in `tz` → UTC timestamp. Two passes handle the DST change days.
export function zonedToUtc(wall, tz) {
  if (tz === "UTC") return wall;
  let ts = wall - tzOffset(wall, tz);
  ts = wall - tzOffset(ts, tz);
  return ts;
}

// Parses a DATE or DATE-TIME value.
// Returns { wall, tz, allDay } where `wall` is the wall-clock time as a UTC-based timestamp.
export function parseDate(value, params = {}, defaultTz = "Europe/Warsaw") {
  const m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/.exec(String(value).trim());
  if (!m) return null;
  const [, y, mo, d, h, mi, s, z] = m;
  const allDay = params.VALUE === "DATE" || h === undefined;
  const wall = Date.UTC(+y, +mo - 1, +d, +(h || 0), +(mi || 0), +(s || 0));
  const tz = allDay ? defaultTz : z ? "UTC" : resolveTz(params.TZID, defaultTz);
  return { wall, tz, allDay };
}

export function parseDuration(v = "") {
  const m = /^([+-])?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/.exec(v.trim());
  if (!m) return 0;
  const [, sign, w, d, h, mi, s] = m;
  const ms = ((+w || 0) * 7 * 86400 + (+d || 0) * 86400 + (+h || 0) * 3600 + (+mi || 0) * 60 + (+s || 0)) * 1000;
  return sign === "-" ? -ms : ms;
}

export function parseRule(v) {
  const r = {};
  for (const part of v.split(";")) {
    const [k, val] = part.split("=");
    if (k && val !== undefined) r[k.toUpperCase()] = val.toUpperCase();
  }
  return {
    freq: r.FREQ,
    interval: Math.max(1, parseInt(r.INTERVAL || "1", 10) || 1),
    count: r.COUNT ? parseInt(r.COUNT, 10) : Infinity,
    until: r.UNTIL || null,
    byday: r.BYDAY ? r.BYDAY.split(",").map((x) => {
      const m = /^([+-]?\d{1,2})?(SU|MO|TU|WE|TH|FR|SA)$/.exec(x);
      return m ? { n: m[1] ? parseInt(m[1], 10) : 0, wd: WEEKDAYS.indexOf(m[2]) } : null;
    }).filter(Boolean) : null,
    bymonthday: r.BYMONTHDAY ? r.BYMONTHDAY.split(",").map(Number) : null,
    bymonth: r.BYMONTH ? r.BYMONTH.split(",").map(Number) : null,
    wkst: WEEKDAYS.indexOf(r.WKST || "MO"),
    unsupported: ["BYSETPOS", "BYWEEKNO", "BYYEARDAY", "BYHOUR", "BYMINUTE", "BYSECOND"].some((k) => k in r),
  };
}

const daysInMonth = (y, m) => new Date(Date.UTC(y, m + 1, 0)).getUTCDate();

// Does the day `t` (UTC midnight of a wall-clock date) match the rule that started on `start`?
function matches(rule, start, t) {
  const s = new Date(start), d = new Date(t);
  const y = d.getUTCFullYear(), mo = d.getUTCMonth(), dom = d.getUTCDate(), wd = d.getUTCDay();
  if (rule.bymonth && !rule.bymonth.includes(mo + 1)) return false;
  const nthOk = (n) => {
    if (!n) return true;
    const dim = daysInMonth(y, mo);
    return n > 0 ? Math.ceil(dom / 7) === n : Math.ceil((dim - dom + 1) / 7) === -n;
  };
  const domOk = (list) => list.some((x) => (x > 0 ? x === dom : daysInMonth(y, mo) + x + 1 === dom));
  switch (rule.freq) {
    case "DAILY": {
      if (Math.round((t - start) / DAY) % rule.interval) return false;
      if (rule.byday && !rule.byday.some((b) => b.wd === wd)) return false;
      return !rule.bymonthday || domOk(rule.bymonthday);
    }
    case "WEEKLY": {
      const weekStart = (x) => x - ((new Date(x).getUTCDay() - rule.wkst + 7) % 7) * DAY;
      if (Math.round((weekStart(t) - weekStart(start)) / (7 * DAY)) % rule.interval) return false;
      const days = rule.byday ? rule.byday.map((b) => b.wd) : [s.getUTCDay()];
      return days.includes(wd);
    }
    case "MONTHLY": {
      const months = (y - s.getUTCFullYear()) * 12 + (mo - s.getUTCMonth());
      if (months % rule.interval) return false;
      if (rule.bymonthday) return domOk(rule.bymonthday) && (!rule.byday || rule.byday.some((b) => b.wd === wd));
      if (rule.byday) return rule.byday.some((b) => b.wd === wd && nthOk(b.n));
      return dom === s.getUTCDate();
    }
    case "YEARLY": {
      if ((y - s.getUTCFullYear()) % rule.interval) return false;
      if (!rule.bymonth && mo !== s.getUTCMonth()) return false;
      if (rule.bymonthday) return domOk(rule.bymonthday);
      if (rule.byday) return rule.byday.some((b) => b.wd === wd && nthOk(b.n));
      return dom === s.getUTCDate();
    }
    default:
      return false;
  }
}

// Start times (UTC) of a recurring event that begin in [from, to].
// `dt` is the parsed DTSTART, `exclude` holds the UTC starts to skip (EXDATE, RECURRENCE-ID).
export function expand(dt, rule, { from, to, exclude = new Set(), defaultTz = "Europe/Warsaw" }) {
  if (!rule.freq || rule.unsupported) return [zonedToUtc(dt.wall, dt.tz)];
  let until = Infinity;
  if (rule.until) {
    const u = parseDate(rule.until, {}, defaultTz);
    if (u) until = u.allDay ? zonedToUtc(u.wall + DAY - 1, dt.tz) : zonedToUtc(u.wall, u.tz);
  }
  const time = dt.wall % DAY;
  const startDay = dt.wall - time;
  // Walk the wall-clock calendar one day at a time. COUNT is counted from DTSTART, so with COUNT
  // the walk starts there. Without COUNT it starts two days before the window (time zone margin).
  const first = rule.count === Infinity ? Math.max(startDay, Math.floor(from / DAY) * DAY - 2 * DAY) : startDay;
  const last = to + 2 * DAY;
  const out = [];
  let n = 0;
  for (let day = first; day <= last; day += DAY) {
    if (!matches(rule, startDay, day)) continue;
    const ts = zonedToUtc(day + time, dt.tz);
    if (ts > until || ts > to || n >= rule.count) break;
    n++;
    if (ts >= from && !exclude.has(ts)) out.push(ts);
  }
  return out;
}

// All event instances that overlap [from, to] (UTC timestamps), sorted by start.
// Each instance: { uid, title, start, end, allDay, location, url, description, recurring }.
export function parseCalendar(text, { from, to, defaultTz = "Europe/Warsaw" } = {}) {
  const calTz = resolveTz((/^X-WR-TIMEZONE:(.+)$/m.exec(String(text)) || [])[1]?.trim(), defaultTz);
  const raw = readEvents(text).map((props) => {
    const get = (n) => props.find((p) => p.name === n);
    const all = (n) => props.filter((p) => p.name === n);
    return { get, all };
  });

  // RECURRENCE-ID entries replace one instance of the series with the same UID.
  const overrides = new Map();
  for (const ev of raw) {
    const rid = ev.get("RECURRENCE-ID"), uid = ev.get("UID")?.value;
    if (!rid || !uid) continue;
    const d = parseDate(rid.value, rid.params, calTz);
    if (!d) continue;
    if (!overrides.has(uid)) overrides.set(uid, new Set());
    overrides.get(uid).add(zonedToUtc(d.wall, d.tz));
  }

  const out = [];
  for (const ev of raw) {
    if ((ev.get("STATUS")?.value || "").toUpperCase() === "CANCELLED") continue;
    const ds = ev.get("DTSTART");
    if (!ds) continue;
    const dt = parseDate(ds.value, ds.params, calTz);
    if (!dt) continue;
    const startUtc = zonedToUtc(dt.wall, dt.tz);

    let length;
    const de = ev.get("DTEND"), dur = ev.get("DURATION");
    if (de) {
      const e = parseDate(de.value, de.params, calTz);
      length = e ? zonedToUtc(e.wall, e.tz) - startUtc : 0;
    } else if (dur) length = parseDuration(dur.value);
    else length = dt.allDay ? DAY : 0;
    if (!(length >= 0)) length = 0;

    const uid = ev.get("UID")?.value || "";
    const rr = ev.get("RRULE");
    const isOverride = !!ev.get("RECURRENCE-ID");
    let starts;
    if (rr && !isOverride) {
      const exclude = new Set(overrides.get(uid) || []);
      for (const ex of ev.all("EXDATE")) {
        for (const v of ex.value.split(",")) {
          const d = parseDate(v, ex.params, calTz);
          if (d) exclude.add(zonedToUtc(d.allDay ? d.wall + (dt.wall % DAY) : d.wall, d.allDay ? dt.tz : d.tz));
        }
      }
      starts = expand(dt, parseRule(rr.value), { from: from - length, to, exclude, defaultTz: calTz });
    } else {
      starts = [startUtc];
    }

    const text = (n) => (ev.get(n) ? unescapeText(ev.get(n).value).trim() : "");
    const url = ev.get("URL")?.value?.trim() || "";
    for (const start of starts) {
      const end = start + length;
      if (end < from || start > to) continue;
      out.push({
        uid,
        title: text("SUMMARY") || "(bez tytułu)",
        start, end,
        allDay: dt.allDay,
        location: text("LOCATION"),
        url: /^https?:\/\//i.test(url) ? url : "",
        description: text("DESCRIPTION"),
        recurring: !!rr || isOverride,
      });
    }
  }
  return out.sort((a, b) => a.start - b.start);
}
