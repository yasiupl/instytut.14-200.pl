// Polish hackerspaces shown on /spejsy/ and on the home page.
// List and calendars: https://hakerzy.info (calendars: https://hakerzy.info/calendars.json).
// `name` must be the same as in calendars.json: api/kalendarze.js joins the two lists by name.
// `fediverse`: the space's account ({ host, user }); its posts are read in the browser
// from the Mastodon API (https://<host>/api/v1/...), which allows requests from any site.
// To add a space: add a line here. Its calendar comes from calendars.json automatically.
export default [
  { name: "Warszawski Hackerspace", city: "Warszawa", url: "https://hackerspace.pl", fediverse: { host: "social.hackerspace.pl", user: "hswaw" } },
  { name: "Hackerspace Kraków", city: "Kraków", url: "https://hackerspace-krk.pl", fediverse: { host: "social.hackerspace.pl", user: "hskrk" } },
  { name: "Hackerspace Wrocław", city: "Wrocław", url: "https://www.hswro.org", fediverse: { host: "mastodon.radio", user: "SP6HACK" } },
  { name: "Hackerspace Pomorze", city: "Gdańsk", url: "https://hsp.sh", fediverse: { host: "0x3c.pl", user: "hspsh" } },
  { name: "Hakierspejs Łódź", city: "Łódź", url: "https://lodz.hackerspace.pl", fediverse: { host: "mas.to", user: "hslodz" } },
  { name: "Knyfyrtel Hackerspace Poznań", city: "Poznań", url: "https://hspoz.pl", fediverse: { host: "fosstodon.org", user: "hspoz" } },
  { name: "Hackerspace Trójmiasto", city: "Trójmiasto", url: "https://hs3.pl", fediverse: { host: "0x3c.pl", user: "hs3" } },
  { name: "Hackerspace Grudziądz", city: "Grudziądz", url: "https://hsgru.pl", fediverse: { host: "mastodon.com.pl", user: "hsgru" } },
  { name: "Hackerspace Bydgoszcz", city: "Bydgoszcz", url: "https://hsbdg.pl", fediverse: { host: "mastodon.social", user: "hsbdg" } },
  { name: "Hackerspace Toruń", city: "Toruń", url: "https://www.hstor.pl" },
  { name: "Hackerspace HaSzcze Szczecin", city: "Szczecin", url: "https://haszcze.eu" },
];
