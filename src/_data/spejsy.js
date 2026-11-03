// Polish hackerspaces shown on /spejsy/ and on the home page.
// List and calendars: https://hakerzy.info (calendars: https://hakerzy.info/calendars.json).
// `name` must be the same as in calendars.json: api/kalendarze.js joins the two lists by name.
// `fediverse`: the space's account ({ host, user }); its posts are read in the browser
// from the Mastodon API (https://<host>/api/v1/...), which allows requests from any site.
// `calendar`: the calendar link shown in the list of spaces (copy of the address in calendars.json).
// The events themselves always come from calendars.json, so a new calendar there shows up without a change here.
// To add a space: add a line here.
export default [
  { name: "Warszawski Hackerspace", city: "Warszawa", url: "https://hackerspace.pl", fediverse: { host: "social.hackerspace.pl", user: "hswaw" }, calendar: "https://owncloud.hackerspace.pl/remote.php/dav/public-calendars/g8toktZrA9fyAHNi/?export" },
  { name: "Hackerspace Kraków", city: "Kraków", url: "https://hackerspace-krk.pl", fediverse: { host: "social.hackerspace.pl", user: "hskrk" }, calendar: "https://www.meetup.com/HackerspaceKrakow/events/ical" },
  { name: "Hackerspace Wrocław", city: "Wrocław", url: "https://www.hswro.org", fediverse: { host: "mastodon.radio", user: "SP6HACK" }, calendar: "https://forum.hswro.org/wydarzenia" },
  { name: "Hackerspace Pomorze", city: "Gdańsk", url: "https://hsp.sh", fediverse: { host: "0x3c.pl", user: "hspsh" }, calendar: "https://hsp.sh/calendar.ics" },
  { name: "Hakierspejs Łódź", city: "Łódź", url: "https://lodz.hackerspace.pl", fediverse: { host: "mas.to", user: "hslodz" }, calendar: "https://www.meetup.com/hakierspejs-łódź/events/ical" },
  { name: "Knyfyrtel Hackerspace Poznań", city: "Poznań", url: "https://hspoz.pl", fediverse: { host: "fosstodon.org", user: "hspoz" }, calendar: "https://wydarzenia.phub.pl/@hspoz_group/feed/ics" },
  { name: "Hackerspace Trójmiasto", city: "Trójmiasto", url: "https://hs3.pl", fediverse: { host: "0x3c.pl", user: "hs3" }, calendar: "https://hs3.pl/wydarzenia/index.ics" },
  { name: "Hackerspace Grudziądz", city: "Grudziądz", url: "https://hsgru.pl", fediverse: { host: "mastodon.com.pl", user: "hsgru" }, calendar: "https://wydarzenia.phub.pl/@hsgru_group/feed/ics" },
  { name: "Hackerspace Bydgoszcz", city: "Bydgoszcz", url: "https://hsbdg.pl", fediverse: { host: "mastodon.social", user: "hsbdg" }, calendar: "https://wydarzenia.phub.pl/@hsbyd/feed/ics" },
  { name: "Hackerspace Toruń", city: "Toruń", url: "https://www.hstor.pl" },
  { name: "Hackerspace HaSzcze Szczecin", city: "Szczecin", url: "https://haszcze.eu", calendar: "https://calendar.google.com/calendar/ical/b7b71a07561e6f14dafd3aef68d34ba76baa8a27b4150047114aae53a00cb486%40group.calendar.google.com/public/basic.ics" },
];
